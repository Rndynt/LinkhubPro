import { Handler } from '@netlify/functions';
import crypto from 'crypto';
import { BillingService } from '../../../domains/billing/application/BillingService';
import { DrizzleBillingRepository } from '../../../domains/billing/infrastructure/DrizzleBillingRepository';
import { DrizzleUserRepository } from '../../../domains/users/infrastructure/DrizzleUserRepository';

const userRepository = new DrizzleUserRepository();
const billingRepository = new DrizzleBillingRepository();
const billingService = new BillingService(billingRepository, userRepository);

function verifyMidtransSignature(body: string, signature: string): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'default_key';
  const hash = crypto.createHash('sha512').update(body + serverKey).digest('hex');
  return hash === signature;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const signature = event.headers['x-signature'];
    const body = event.body || '';

    // Verify Midtrans signature
    if (!signature || !verifyMidtransSignature(body, signature)) {
      console.error('Invalid Midtrans signature');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid signature' }),
      };
    }

    const webhookData = JSON.parse(body);
    
    // Process the webhook
    await billingService.handleWebhook(webhookData);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error: any) {
    console.error('Midtrans webhook error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Webhook processing failed' 
      }),
    };
  }
};
