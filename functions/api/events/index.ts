import { Handler } from '@netlify/functions';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../../../packages/db/schema.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const handler: Handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const { pageId, blockId, shortlinkId, eventType, metadata } = JSON.parse(event.body || '{}');

    if (!eventType || (!pageId && !blockId && !shortlinkId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Event type and at least one ID (pageId, blockId, shortlinkId) are required' }),
      };
    }

    // Validate event type
    const validEventTypes = ['view', 'click', 'purchase', 'submit', 'download'];
    if (!validEventTypes.includes(eventType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid event type' }),
      };
    }

    // Extract client information
    const userAgent = event.headers['user-agent'] || '';
    const ipAddress = event.headers['client-ip'] || event.headers['x-forwarded-for'] || '';
    const referrer = event.headers.referer || event.headers.referrer || '';

    // Create analytics event
    await db.insert(schema.analyticsEvents).values({
      pageId: pageId || null,
      blockId: blockId || null,
      shortlinkId: shortlinkId || null,
      eventType,
      userAgent,
      ipAddress,
      referrer,
      metadata: metadata || null,
      createdAt: new Date(),
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error: any) {
    console.error('Analytics event error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

export { handler };
