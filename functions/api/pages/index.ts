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
      // Get user's pages
      const pages = await pageService.getUserPages(user.id);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ pages }),
      };
    }

    if (event.httpMethod === 'POST') {
      // Create new page
      const { title, slug, description, metaTitle, metaDescription } = JSON.parse(event.body || '{}');

      if (!title || !slug) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Title and slug are required' }),
        };
      }

      const page = await pageService.createPage(user.id, {
        userId: user.id,
        title,
        slug,
        description,
        metaTitle,
        metaDescription,
      }, user.plan);

      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ page }),
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error: any) {
    console.error('Pages API error:', error);
    
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
