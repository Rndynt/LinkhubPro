import { Handler } from '@netlify/functions';
import { AnalyticsService } from '../../domains/analytics/application/AnalyticsService';
import { DrizzleAnalyticsRepository } from '../../domains/analytics/infrastructure/DrizzleAnalyticsRepository';

const analyticsRepository = new DrizzleAnalyticsRepository();
const analyticsService = new AnalyticsService(analyticsRepository);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { type, pageId, blockId, shortlinkId, metadata } = JSON.parse(event.body || '{}');

    if (!type || !['view', 'click', 'purchase'].includes(type)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Valid event type is required' }),
      };
    }

    // Get client information
    const userAgent = event.headers['user-agent'];
    const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || '127.0.0.1';

    await analyticsService.trackEvent({
      type: type as 'view' | 'click' | 'purchase',
      pageId,
      blockId,
      shortlinkId,
      metadata: {
        ...metadata,
        userAgent,
        clientIP: clientIP.split(',')[0].trim(), // Take first IP if multiple
      },
      userAgent,
      ipAddress: clientIP.split(',')[0].trim(),
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error: any) {
    console.error('Events API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to track event' 
      }),
    };
  }
};
