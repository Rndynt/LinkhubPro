import { Handler } from '@netlify/functions';
import { UserService } from '../../../domains/users/application/UserService';
import { DrizzleUserRepository } from '../../../domains/users/infrastructure/DrizzleUserRepository';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../../packages/db/schema';
import { promises as dns } from 'dns';

const userRepository = new DrizzleUserRepository();
const userService = new UserService(userRepository);

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function verifyDomain(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveCname(domain);
    return records.includes('linkhub.pro') || records.some(record => record.endsWith('linkhub.pro'));
  } catch (error) {
    console.error('DNS verification failed:', error);
    return false;
  }
}

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

    const { domainId } = JSON.parse(event.body || '{}');

    if (!domainId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Domain ID is required' }),
      };
    }

    // Get domain
    const [domain] = await db.select()
      .from(schema.domains)
      .where(and(
        eq(schema.domains.id, domainId),
        eq(schema.domains.userId, user.id)
      ));

    if (!domain) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Domain not found' }),
      };
    }

    if (domain.isVerified) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          verified: true,
          message: 'Domain is already verified' 
        }),
      };
    }

    // Verify DNS
    const isVerified = await verifyDomain(domain.domain);

    if (isVerified) {
      // Update domain as verified
      await db.update(schema.domains)
        .set({ 
          isVerified: true, 
          updatedAt: new Date() 
        })
        .where(eq(schema.domains.id, domainId));

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          verified: true,
          message: 'Domain verified successfully' 
        }),
      };
    } else {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          verified: false,
          error: 'DNS verification failed. Please check your DNS settings and try again.' 
        }),
      };
    }
  } catch (error: any) {
    console.error('Domain verification error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Verification failed' 
      }),
    };
  }
};
