import { Handler } from '@netlify/functions';
import { AnalyticsService } from '../../../domains/analytics/application/AnalyticsService';
import { DrizzleAnalyticsRepository } from '../../../domains/analytics/infrastructure/DrizzleAnalyticsRepository';

const analyticsRepository = new DrizzleAnalyticsRepository();
const analyticsService = new AnalyticsService(analyticsRepository);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const code = event.path.split('/').pop();
    
    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Shortlink code is required' }),
      };
    }

    // Redirect shortlink and track analytics
    const targetUrl = await analyticsService.redirectShortlink(code);

    return {
      statusCode: 302,
      headers: {
        'Location': targetUrl,
        'Cache-Control': 'no-cache',
      },
      body: '',
    };
  } catch (error: any) {
    console.error('Shortlink redirect error:', error);
    
    if (error.message === 'Shortlink not found') {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/html',
        },
        body: `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Link Not Found</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
                .container { max-width: 400px; margin: 0 auto; }
                h1 { color: #ef4444; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Link Not Found</h1>
                <p>The short link you're looking for doesn't exist or has expired.</p>
                <a href="https://linkhub.pro">Return to Linkhub Pro</a>
              </div>
            </body>
          </html>
        `,
      };
    }
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Internal server error' 
      }),
    };
  }
};
