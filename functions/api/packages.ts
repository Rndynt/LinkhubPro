import { Handler } from '@netlify/functions';
import { BillingService } from '../../domains/billing/application/BillingService';
import { DrizzleBillingRepository } from '../../domains/billing/infrastructure/DrizzleBillingRepository';
import { DrizzleUserRepository } from '../../domains/users/infrastructure/DrizzleUserRepository';

const userRepository = new DrizzleUserRepository();
const billingRepository = new DrizzleBillingRepository();
const billingService = new BillingService(billingRepository, userRepository);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const packages = await billingService.getPackages();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ packages }),
    };
  } catch (error: any) {
    console.error('Packages API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch packages' 
      }),
    };
  }
};
