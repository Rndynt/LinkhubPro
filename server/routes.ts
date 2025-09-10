import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import session from "express-session";
import connectPg from "connect-pg-simple";
import "./types"; // Import type augmentations

// Domain Services
import { UserService } from '../domains/users/application/UserService';
import { DrizzleUserRepository } from '../domains/users/infrastructure/DrizzleUserRepository';
import { PageService } from '../domains/pages/application/PageService';
import { DrizzlePageRepository } from '../domains/pages/infrastructure/DrizzlePageRepository';
import { AnalyticsService } from '../domains/analytics/application/AnalyticsService';
import { DrizzleAnalyticsRepository } from '../domains/analytics/infrastructure/DrizzleAnalyticsRepository';
import { AdminService } from '../domains/admin/application/AdminService';
import { DrizzleBillingRepository } from '../domains/billing/infrastructure/DrizzleBillingRepository';

// Initialize repositories
const userRepository = new DrizzleUserRepository();
const pageRepository = new DrizzlePageRepository();
const analyticsRepository = new DrizzleAnalyticsRepository();
const billingRepository = new DrizzleBillingRepository();

// Initialize services
const userService = new UserService(userRepository);
const pageService = new PageService(pageRepository);
const analyticsService = new AnalyticsService(analyticsRepository);
const adminService = new AdminService(userRepository, billingRepository, analyticsRepository);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Session configuration
const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
const pgStore = connectPg(session);

// Auth middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = userService.verifyToken(token);
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    }),
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, username, name, password } = req.body;

      // Validation
      if (!email || !username || !name || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Register user using domain service
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

      res.status(201).json({
        token,
        user: userWithoutPassword
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      const statusCode = error.message === 'upgrade_required' ? 403 :
                         error.message.includes('already exists') || error.message.includes('already taken') ? 409 : 500;
      res.status(statusCode).json({ 
        message: error.message || 'Internal server error',
        error: error.message === 'upgrade_required' ? 'upgrade_required' : undefined
      });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Login using domain service
      const { user, token } = await userService.login(email, password);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user as any;

      res.json({
        token,
        user: userWithoutPassword
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ message: error.message || 'Invalid credentials' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    res.json({
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      name: req.user.name,
      role: req.user.role,
      plan: req.user.plan,
      profileImageUrl: req.user.profileImageUrl,
    });
  });

  // Pages routes
  app.get('/api/pages', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const pages = await pageService.getUserPages(req.user.id);
      res.json(pages);
    } catch (error) {
      console.error('Get pages error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/pages', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { title, slug, description } = req.body;

      // Validation
      if (!title || !slug) {
        return res.status(400).json({ message: 'Title and slug are required' });
      }

      const page = await pageService.createPage(req.user.id, {
        userId: req.user.id,
        title,
        slug,
        description,
      }, req.user.plan);

      res.status(201).json(page);
    } catch (error: any) {
      console.error('Create page error:', error);
      const statusCode = error.message === 'upgrade_required' ? 403 :
                         error.message.includes('Slug already exists') ? 409 : 500;
      res.status(statusCode).json({ 
        error: error.message === 'upgrade_required' ? 'upgrade_required' : undefined,
        message: error.message || 'Internal server error'
      });
    }
  });

  app.get('/api/pages/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const page = await pageService.getPageById(req.params.id);
      if (!page || page.userId !== req.user.id) {
        return res.status(404).json({ message: 'Page not found' });
      }

      const blocks = await pageService.getPageBlocks(page.id);
      res.json({ ...page, blocks });
    } catch (error) {
      console.error('Get page error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/pages/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { title, description, isPublished } = req.body;
      const page = await pageService.getPageById(req.params.id);
      
      if (!page || page.userId !== req.user.id) {
        return res.status(404).json({ message: 'Page not found' });
      }

      const updatedPage = await pageService.updatePage(req.params.id, {
        title,
        description,
        isPublished,
      });

      res.json(updatedPage);
    } catch (error) {
      console.error('Update page error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Blocks routes
  app.post('/api/pages/:pageId/blocks', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { type, position, config } = req.body;
      const page = await pageService.getPageById(req.params.pageId);
      
      if (!page || page.userId !== req.user.id) {
        return res.status(404).json({ message: 'Page not found' });
      }

      const block = await pageService.createBlock(req.params.pageId, {
        pageId: req.params.pageId,
        type,
        position,
        config,
      }, req.user.plan);

      res.status(201).json(block);
    } catch (error: any) {
      console.error('Create block error:', error);
      const statusCode = error.message === 'upgrade_required' ? 403 : 500;
      res.status(statusCode).json({
        error: error.message === 'upgrade_required' ? 'upgrade_required' : undefined, 
        message: error.message || 'Internal server error'
      });
    }
  });

  // Shortlink redirect
  app.get('/s/:code', async (req, res) => {
    try {
      const targetUrl = await analyticsService.redirectShortlink(req.params.code);
      res.redirect(302, targetUrl);
    } catch (error: any) {
      console.error('Shortlink redirect error:', error);
      if (error.message === 'Shortlink not found') {
        return res.status(404).json({ message: 'Shortlink not found' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Public page view
  app.get('/api/page/:slug', async (req, res) => {
    try {
      const result = await pageService.getPageBySlug(req.params.slug);
      if (!result || !result.page.isPublished) {
        return res.status(404).json({ message: 'Page not found' });
      }

      const { page, blocks } = result;
      
      // Create view analytics event
      await analyticsService.trackPageView(page.id, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        referrer: req.headers.referer,
      });

      res.json({ ...page, blocks });
    } catch (error) {
      console.error('Get public page error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Analytics events
  app.post('/api/events', async (req, res) => {
    try {
      const { pageId, blockId, eventType, metadata } = req.body;
      
      if (eventType === 'click') {
        await analyticsService.trackLinkClick(pageId, blockId, {
          ...metadata,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          referrer: req.headers.referer,
        });
      } else if (eventType === 'view') {
        await analyticsService.trackPageView(pageId, {
          ...metadata,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          referrer: req.headers.referer,
        });
      } else {
        await analyticsService.trackEvent({
          pageId,
          blockId,
          type: eventType,
          metadata: {
            ...metadata,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            referrer: req.headers.referer,
          },
        });
      }

      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Create analytics event error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get analytics data
  app.get('/api/analytics', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { selectedPage, timeRange } = req.query;
      const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
      
      const analytics = await analyticsService.getUserAnalytics(req.user.id, days);
      
      res.json(analytics);
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get dashboard stats
  app.get('/api/analytics/stats', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const analytics = await analyticsService.getUserAnalytics(req.user.id, 7);
      const pages = await pageService.getUserPages(req.user.id);
      
      const stats = {
        totalViews: analytics.totalViews,
        totalClicks: analytics.totalClicks,
        activePages: pages.length,
        conversionRate: analytics.conversionRate,
        viewsChange: 0, // Would need historical comparison
        clicksChange: 0, // Would need historical comparison
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const stats = await adminService.getAdminStats();
      
      res.json(stats);
    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { limit = 50, offset = 0 } = req.query;
      const result = await adminService.getAllUsers(Number(offset), Number(limit));
      
      res.json(result);
    } catch (error) {
      console.error('Get admin users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
