import { Handler } from '@netlify/functions';
import { UserService } from '../../../domains/users/application/UserService';
import { DrizzleUserRepository } from '../../../domains/users/infrastructure/DrizzleUserRepository';
import { PageService } from '../../../domains/pages/application/PageService';
import { DrizzlePageRepository } from '../../../domains/pages/infrastructure/DrizzlePageRepository';

const userRepository = new DrizzleUserRepository();
const userService = new UserService(userRepository);
const pageRepository = new DrizzlePageRepository();
const pageService = new PageService(pageRepository);

export const handler: Handler = async (event) => {
  const pageId = event.path.split('/').pop();
  
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

    if (event.httpMethod === 'GET') {
      // Get specific page
      const page = await pageService.getPageById(pageId);
      
      if (!page) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Page not found' }),
        };
      }

      // Check ownership
      if (page.userId !== user.id && user.role !== 'admin') {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Access denied' }),
        };
      }

      const blocks = await pageService.getPageBlocks(pageId);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ page, blocks }),
      };
    }

    if (event.httpMethod === 'PUT') {
      // Update page
      const page = await pageService.getPageById(pageId);
      
      if (!page) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Page not found' }),
        };
      }

      // Check ownership
      if (page.userId !== user.id && user.role !== 'admin') {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Access denied' }),
        };
      }

      const updateData = JSON.parse(event.body || '{}');
      const updatedPage = await pageService.updatePage(pageId, updateData);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ page: updatedPage }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Delete page
      const page = await pageService.getPageById(pageId);
      
      if (!page) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Page not found' }),
        };
      }

      // Check ownership
      if (page.userId !== user.id && user.role !== 'admin') {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Access denied' }),
        };
      }

      await pageService.deletePage(pageId);

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
    console.error('Page API error:', error);
    
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
