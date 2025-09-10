import { Handler } from '@netlify/functions';
import { UserService } from '../../../domains/users/application/UserService';
import { DrizzleUserRepository } from '../../../domains/users/infrastructure/DrizzleUserRepository';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../../../packages/db/schema';

const userRepository = new DrizzleUserRepository();
const userService = new UserService(userRepository);

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

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
      // Get user's domains
      const domains = await db.select()
        .from(schema.domains)
        .where(eq(schema.domains.userId, user.id));
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ domains }),
      };
    }

    if (event.httpMethod === 'POST') {
      // Add new domain
      const { domain } = JSON.parse(event.body || '{}');

      if (!domain) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Domain is required' }),
        };
      }

      // Check if user has pro plan for custom domains
      if (user.plan !== 'pro' && user.role !== 'admin') {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Custom domains require Pro plan' }),
        };
      }

      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid domain format' }),
        };
      }

      // Check if domain already exists
      const [existingDomain] = await db.select()
        .from(schema.domains)
        .where(eq(schema.domains.domain, domain));

      if (existingDomain) {
        return {
          statusCode: 409,
          body: JSON.stringify({ error: 'Domain already exists' }),
        };
      }

      // Generate verification token
      const verificationToken = Math.random().toString(36).substring(2, 15);

      const [newDomain] = await db.insert(schema.domains).values({
        userId: user.id,
        domain,
        verificationToken,
        dnsInstructions: `Add a CNAME record pointing ${domain} to linkhub.pro`,
      }).returning();

      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ domain: newDomain }),
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error: any) {
    console.error('Domains API error:', error);
    
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
