import { BillingRepository } from '../domain/BillingRepository';
import { UserRepository } from '../../users/domain/UserRepository';
import { Package, Payment, CreatePaymentData } from '../domain/Subscription';

export class BillingService {
  constructor(
    private billingRepository: BillingRepository,
    private userRepository: UserRepository
  ) {}

  async getPackages(): Promise<Package[]> {
    return this.billingRepository.findAllPackages();
  }

  async createCheckout(userId: string, packageId: string): Promise<{ snapToken: string; payment: Payment }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const packageData = await this.billingRepository.findPackageById(packageId);
    if (!packageData) {
      throw new Error('Package not found');
    }

    // Create payment record
    const payment = await this.billingRepository.createPayment({
      userId,
      amount: packageData.priceCents,
      currency: packageData.currency,
      metadata: { packageId, packageHandle: packageData.handle },
    });

    // Create Midtrans snap token
    const snapToken = await this.createMidtransSnapToken(payment, user, packageData);

    return { snapToken, payment };
  }

  async handleWebhook(webhookData: any): Promise<void> {
    const { order_id, transaction_status, fraud_status } = webhookData;

    const payment = await this.billingRepository.findPaymentByExternalId(order_id);
    if (!payment) {
      throw new Error('Payment not found');
    }

    let paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' = 'pending';

    if (transaction_status === 'capture' && fraud_status === 'accept') {
      paymentStatus = 'completed';
    } else if (['settlement', 'capture'].includes(transaction_status)) {
      paymentStatus = 'completed';
    } else if (['cancel', 'deny', 'expire', 'failure'].includes(transaction_status)) {
      paymentStatus = 'failed';
    } else if (transaction_status === 'refund') {
      paymentStatus = 'refunded';
    }

    // Update payment status
    await this.billingRepository.updatePayment(payment.id, {
      status: paymentStatus,
      metadata: { ...payment.metadata, webhookData },
    });

    // If payment is completed, upgrade user plan and create subscription
    if (paymentStatus === 'completed') {
      await this.processSuccessfulPayment(payment);
    }
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.billingRepository.findPaymentsByUserId(userId);
  }

  private async createMidtransSnapToken(payment: Payment, user: any, packageData: Package): Promise<string> {
    // This would integrate with actual Midtrans API
    // For now, return a mock token
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY || 'default_key';
    
    const parameter = {
      transaction_details: {
        order_id: payment.id,
        gross_amount: payment.amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
      item_details: [{
        id: packageData.id,
        price: packageData.priceCents,
        quantity: 1,
        name: `${packageData.name} Plan`,
      }],
    };

    // Mock implementation - replace with actual Midtrans SDK call
    const snapToken = `snap_token_${payment.id}`;
    
    return snapToken;
  }

  private async processSuccessfulPayment(payment: Payment): Promise<void> {
    const packageHandle = payment.metadata.packageHandle;
    if (packageHandle === 'pro') {
      // Upgrade user to pro plan
      await this.userRepository.update(payment.userId, { plan: 'pro' });

      // Create or update subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      await this.billingRepository.createSubscription({
        userId: payment.userId,
        packageId: payment.metadata.packageId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: endDate,
      });
    }
  }
}
