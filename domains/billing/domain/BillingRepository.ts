import { Subscription, Package, Payment, CreatePaymentData } from './Subscription';

export interface BillingRepository {
  // Package operations
  findAllPackages(): Promise<Package[]>;
  findPackageById(id: string): Promise<Package | null>;
  findPackageByHandle(handle: string): Promise<Package | null>;

  // Subscription operations
  findSubscriptionByUserId(userId: string): Promise<Subscription | null>;
  createSubscription(subscriptionData: any): Promise<Subscription>;
  updateSubscription(id: string, data: any): Promise<Subscription>;
  cancelSubscription(id: string): Promise<void>;

  // Payment operations
  findPaymentsByUserId(userId: string): Promise<Payment[]>;
  findPaymentByExternalId(externalId: string): Promise<Payment | null>;
  createPayment(paymentData: CreatePaymentData): Promise<Payment>;
  updatePayment(id: string, data: any): Promise<Payment>;
}
