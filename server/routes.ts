import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import session from "express-session";
import connectPg from "connect-pg-simple";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Session configuration
const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
const pgStore = connectPg(session);

// Auth middleware
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
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
export const requireAdmin = (req: any, res: any, next: any) => {
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

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Create user
      const user = await storage.createUser({
        email,
        username,
        name,
        password,
        role: 'tenant',
        plan: 'free',
      });

      // Create default page with 3 blocks for free user
      const defaultPage = await storage.createPage({
        userId: user.id,
        title: `${name} - Links`,
        slug: username,
        isPublished: true,
      });

      // Create default blocks
      await storage.createBlock({
        pageId: defaultPage.id,
        type: 'links_block',
        position: 1,
        config: {
          links: [
            { label: 'Blog', url: 'https://jessica.blog' },
            { label: 'Shop', url: 'https://shop.jessica' },
            { label: 'Spotify', url: 'https://spotify.example' }
          ]
        }
      });

      await storage.createBlock({
        pageId: defaultPage.id,
        type: 'social_block',
        position: 2,
        config: {
          socials: [
            { provider: 'instagram', url: 'https://instagram.com/jessica' },
            { provider: 'youtube', url: 'https://youtube.com/jessica' }
          ]
        }
      });

      await storage.createBlock({
        pageId: defaultPage.id,
        type: 'contact_block',
        position: 3,
        config: {
          phone: '+628123456789',
          whatsapp_prefilled: 'Halo, saya mau pesan'
        }
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          plan: user.plan,
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          plan: user.plan,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
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
      const pages = await storage.getUserPages(req.user.id);
      res.json(pages);
    } catch (error) {
      console.error('Get pages error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/pages', authenticateToken, async (req, res) => {
    try {
      const { title, slug } = req.body;

      // Check plan limits for free users
      if (req.user.plan === 'free') {
        const existingPages = await storage.getUserPages(req.user.id);
        if (existingPages.length >= 1) {
          return res.status(403).json({ error: 'upgrade_required', message: 'Free plan allows only 1 page' });
        }
      }

      const page = await storage.createPage({
        userId: req.user.id,
        title,
        slug,
        isPublished: false,
      });

      res.status(201).json(page);
    } catch (error) {
      console.error('Create page error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/pages/:id', authenticateToken, async (req, res) => {
    try {
      const page = await storage.getPageById(req.params.id);
      if (!page || page.userId !== req.user.id) {
        return res.status(404).json({ message: 'Page not found' });
      }

      const blocks = await storage.getPageBlocks(page.id);
      res.json({ ...page, blocks });
    } catch (error) {
      console.error('Get page error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/pages/:id', authenticateToken, async (req, res) => {
    try {
      const { title, description, isPublished } = req.body;
      const page = await storage.getPageById(req.params.id);
      
      if (!page || page.userId !== req.user.id) {
        return res.status(404).json({ message: 'Page not found' });
      }

      const updatedPage = await storage.updatePage(req.params.id, {
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
      const { type, position, config } = req.body;
      const page = await storage.getPageById(req.params.pageId);
      
      if (!page || page.userId !== req.user.id) {
        return res.status(404).json({ message: 'Page not found' });
      }

      // Check if block type requires Pro plan
      const proBlocks = ['product_card', 'dynamic_feed'];
      if (proBlocks.includes(type) && req.user.plan === 'free') {
        return res.status(403).json({ error: 'upgrade_required', message: 'This block requires Pro plan' });
      }

      const block = await storage.createBlock({
        pageId: req.params.pageId,
        type,
        position,
        config,
      });

      res.status(201).json(block);
    } catch (error) {
      console.error('Create block error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Shortlink redirect
  app.get('/s/:code', async (req, res) => {
    try {
      const shortlink = await storage.getShortlinkByCode(req.params.code);
      if (!shortlink || !shortlink.isActive) {
        return res.status(404).json({ message: 'Shortlink not found' });
      }

      // Increment clicks atomically
      await storage.incrementShortlinkClicks(shortlink.id);

      // Create analytics event
      await storage.createAnalyticsEvent({
        shortlinkId: shortlink.id,
        eventType: 'click',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        referrer: req.headers.referer,
      });

      // Redirect
      res.redirect(302, shortlink.targetUrl);
    } catch (error) {
      console.error('Shortlink redirect error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Public page view
  app.get('/api/page/:slug', async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page || !page.isPublished) {
        return res.status(404).json({ message: 'Page not found' });
      }

      const blocks = await storage.getPageBlocks(page.id);
      
      // Create view analytics event
      await storage.createAnalyticsEvent({
        pageId: page.id,
        eventType: 'view',
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
      
      await storage.createAnalyticsEvent({
        pageId,
        blockId,
        eventType,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        referrer: req.headers.referer,
        metadata,
      });

      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Create analytics event error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin routes
  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const result = await storage.getAllUsers(Number(limit), Number(offset));
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.user.id,
        action: 'view_users',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json(result);
    } catch (error) {
      console.error('Get admin users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
