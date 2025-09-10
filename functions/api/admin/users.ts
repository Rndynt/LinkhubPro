import { Handler } from '@netlify/functions';
import { UserService } from '../../../domains/users/application/UserService';
import { DrizzleUserRepository } from '../../../domains/users/infrastructure/DrizzleUserRepository';
import { AdminService } from '../../../domains/admin/application/AdminService';
import { DrizzleBillingRepository } from '../../../domains/billing/infrastructure/DrizzleBillingRepository';
import { DrizzleAnalyticsRepository } from '../../../domains/analytics/infrastructure/DrizzleAnalyticsRepository';

const userRepository = new DrizzleUserRepository();
const userService = new UserService(userRepository);
const billingRepository = new DrizzleBillingRepository();
const analyticsRepository = new DrizzleAnalyticsRepository();
const adminService = new AdminService(userRepository, billingRepository, analyticsRepository);

export const handler: Handler = async (event) => {
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

    // Check admin permission
    if (user.role !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Admin access required' }),
      };
    }

    if (event.httpMethod === 'GET') {
      // Get all users
      const offset = parseInt(event.queryStringParameters?.offset || '0');
      const limit = parseInt(event.queryStringParameters?.limit || '50');
      
      const { users, total } = await adminService.getAllUsers(offset, limit);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ users, total }),
      };
    }

    // Handle user-specific operations
    const pathParts = event.path.split('/');
    const userId = pathParts[pathParts.length - 1];

    if (event.httpMethod === 'PUT' && userId) {
      // Update user
      const { plan } = JSON.parse(event.body || '{}');
      
      if (plan) {
        await adminService.updateUserPlan(user.id, userId, plan);
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ success: true }),
      };
    }

    if (event.httpMethod === 'DELETE' && userId) {
      // Delete user
      await adminService.deleteUser(user.id, userId);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error: any) {
    console.error('Admin users API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
    };
  }
};
