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
  const blockId = pathParts[pathParts.length - 1];
  const pageId = pathParts[pathParts.length - 3];
  
  if (!pageId || !blockId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Page ID and Block ID are required' }),
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

    if (event.httpMethod === 'PUT') {
      // Update block
      const updateData = JSON.parse(event.body || '{}');
      const updatedBlock = await pageService.updateBlock(blockId, updateData);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ block: updatedBlock }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Delete block
      await pageService.deleteBlock(blockId);

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
    console.error('Block API error:', error);
    
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
