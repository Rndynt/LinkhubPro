import { Handler } from '@netlify/functions';
import { UserService } from '../../../domains/users/application/UserService';
import { DrizzleUserRepository } from '../../../domains/users/infrastructure/DrizzleUserRepository';
import { BillingService } from '../../../domains/billing/application/BillingService';
import { DrizzleBillingRepository } from '../../../domains/billing/infrastructure/DrizzleBillingRepository';

const userRepository = new DrizzleUserRepository();
const userService = new UserService(userRepository);
const billingRepository = new DrizzleBillingRepository();
const billingService = new BillingService(billingRepository, userRepository);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No authorization token provided' }),
    };
  }

  try {
    const token = authHeader.substring(7);
    const decoded = userService.verifyToken(token);
    
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    const { packageId } = JSON.parse(event.body || '{}');

    if (!packageId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Package ID is required' }),
      };
    }

    const { snapToken, payment } = await billingService.createCheckout(user.id, packageId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        snapToken,
        payment,
      }),
    };
  } catch (error: any) {
    console.error('Create checkout error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: error.message || 'Failed to create checkout' 
      }),
    };
  }
};
