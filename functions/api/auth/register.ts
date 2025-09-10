import { Handler } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { UserService } from '../../../domains/users/application/UserService';
import { DrizzleUserRepository } from '../../../domains/users/infrastructure/DrizzleUserRepository';
import { PageService } from '../../../domains/pages/application/PageService';
import { DrizzlePageRepository } from '../../../domains/pages/infrastructure/DrizzlePageRepository';

const userRepository = new DrizzleUserRepository();
const userService = new UserService(userRepository);
const pageRepository = new DrizzlePageRepository();
const pageService = new PageService(pageRepository);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, username, name, password } = JSON.parse(event.body || '{}');

    if (!email || !username || !name || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Register user
    const { user, token } = await userService.register({
      email,
      username,
      name,
      password,
      role: 'tenant',
      plan: 'free',
    });

    // Create default page for free users
    if (user.plan === 'free') {
      await pageService.createPage(user.id, {
        userId: user.id,
        title: `${name} - Links`,
        slug: username,
        description: 'Welcome to my link page!',
      }, user.plan);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any;

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        user: userWithoutPassword,
        token,
      }),
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    
    return {
      statusCode: error.message.includes('already exists') || error.message.includes('already taken') ? 409 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: error.message || 'Registration failed' 
      }),
    };
  }
};
