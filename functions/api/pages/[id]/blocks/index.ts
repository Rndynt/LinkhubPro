import { Handler } from '@netlify/functions';
import { UserService } from '../../../../../domains/users/application/UserService';
import { DrizzleUserRepository } from '../../../../../domains/users/infrastructure/DrizzleUserRepository';
import { PageService } from '../../../../../domains/pages/application/PageService';
import { DrizzlePageRepository } from '../../../../../domains/pages/infrastructure/DrizzlePageRepository';

const userRepository = new DrizzleUserRepository();
const userService = new UserService(userRepository);
const pageRepository = new DrizzlePageRepository();
const pageService = new PageService(pageRepository);

export const handler: Handler = async (event) => {
  const pathParts = event.path.split('/');
  const pageId = pathParts[pathParts.length - 2]; // Get pageId from path
  
  if (!pageId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Page ID is required' }),
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

    // Verify page ownership
    const page = await pageService.getPageById(pageId);
    if (!page) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Page not found' }),
      };
    }

    if (page.userId !== user.id && user.role !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Access denied' }),
      };
    }

    if (event.httpMethod === 'GET') {
      // Get page blocks
      const blocks = await pageService.getPageBlocks(pageId);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ blocks }),
      };
    }

    if (event.httpMethod === 'POST') {
      // Create new block
      const { type, position, config } = JSON.parse(event.body || '{}');

      if (!type || position === undefined || !config) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Type, position, and config are required' }),
        };
      }

      const block = await pageService.createBlock(pageId, {
        pageId,
        type,
        position,
        config,
      }, user.plan);

      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ block }),
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error: any) {
    console.error('Blocks API error:', error);
    
    const statusCode = error.message === 'upgrade_required' ? 403 : 500;
    
    return {
      statusCode,
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
