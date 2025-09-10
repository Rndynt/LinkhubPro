import { users, pages, blocks, subscriptions, packages, payments, domains, shortlinks, analyticsEvents, adminAudit } from "@shared/schema";
import type { 
  User, 
  InsertUser, 
  UpsertUser, 
  Page, 
  InsertPage, 
  Block, 
  InsertBlock,
  Package,
  Subscription,
  InsertSubscription,
  Payment,
  Domain,
  Shortlink,
  AnalyticsEvent,
  InsertAnalyticsEvent,
  AdminAudit
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPlan(userId: string, plan: 'free' | 'pro'): Promise<User>;

  // Page operations
  getUserPages(userId: string): Promise<Page[]>;
  getPageById(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, updates: Partial<Page>): Promise<Page>;
  deletePage(id: string): Promise<void>;

  // Block operations
  getPageBlocks(pageId: string): Promise<Block[]>;
  getBlockById(id: string): Promise<Block | undefined>;
  createBlock(block: InsertBlock): Promise<Block>;
  updateBlock(id: string, updates: Partial<Block>): Promise<Block>;
  deleteBlock(id: string): Promise<void>;

  // Package operations
  getAllPackages(): Promise<Package[]>;
  getPackageById(id: string): Promise<Package | undefined>;

  // Subscription operations
  getUserActiveSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription>;

  // Payment operations
  createPayment(payment: Partial<Payment>): Promise<Payment>;
  getPaymentById(id: string): Promise<Payment | undefined>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;

  // Domain operations
  getUserDomains(userId: string): Promise<Domain[]>;
  getDomainByName(domain: string): Promise<Domain | undefined>;
  createDomain(domain: Partial<Domain>): Promise<Domain>;
  updateDomain(id: string, updates: Partial<Domain>): Promise<Domain>;

  // Shortlink operations
  getShortlinkByCode(code: string): Promise<Shortlink | undefined>;
  createShortlink(shortlink: Partial<Shortlink>): Promise<Shortlink>;
  incrementShortlinkClicks(id: string): Promise<void>;

  // Analytics operations
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getPageAnalytics(pageId: string, days: number): Promise<any[]>;
  getUserAnalytics(userId: string, selectedPageId?: string, timeRange?: string): Promise<{
    totalViews: number;
    totalClicks: number;
    conversionRate: number;
    topPages: Array<{ id: string; title: string; slug: string; views: number; clicks: number; }>;
    topLinks: Array<{ label: string; url: string; clicks: number; }>;
    chartData: Array<{ date: string; views: number; clicks: number; }>;
  }>;
  getUserDashboardStats(userId: string): Promise<{
    totalViews: number;
    totalClicks: number;
    activePages: number;
    conversionRate: number;
    viewsChange: number;
    clicksChange: number;
  }>;
  getAdminStats(): Promise<{
    totalUsers: number;
    proUsers: number;
    totalPages: number;
    monthlyRevenue: number;
    usersChange: number;
    revenueChange: number;
  }>;

  // Admin operations
  getAllUsers(limit?: number, offset?: number): Promise<{users: User[], total: number}>;
  getAllSubscriptions(limit?: number, offset?: number): Promise<{subscriptions: (Subscription & {user: User, package: Package})[], total: number}>;
  createAdminAuditLog(log: Partial<AdminAudit>): Promise<AdminAudit>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUserPlan(userId: string, plan: 'free' | 'pro'): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ plan, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserPages(userId: string): Promise<Page[]> {
    return await db.select().from(pages).where(eq(pages.userId, userId)).orderBy(desc(pages.createdAt));
  }

  async getPageById(id: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }

  async createPage(pageData: InsertPage): Promise<Page> {
    const [page] = await db
      .insert(pages)
      .values({
        ...pageData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return page;
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<Page> {
    const [page] = await db
      .update(pages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return page;
  }

  async deletePage(id: string): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id));
  }

  async getPageBlocks(pageId: string): Promise<Block[]> {
    return await db.select().from(blocks).where(eq(blocks.pageId, pageId)).orderBy(asc(blocks.position));
  }

  async getBlockById(id: string): Promise<Block | undefined> {
    const [block] = await db.select().from(blocks).where(eq(blocks.id, id));
    return block;
  }

  async createBlock(blockData: InsertBlock): Promise<Block> {
    const [block] = await db
      .insert(blocks)
      .values({
        ...blockData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return block;
  }

  async updateBlock(id: string, updates: Partial<Block>): Promise<Block> {
    const [block] = await db
      .update(blocks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blocks.id, id))
      .returning();
    return block;
  }

  async deleteBlock(id: string): Promise<void> {
    await db.delete(blocks).where(eq(blocks.id, id));
  }

  async getAllPackages(): Promise<Package[]> {
    return await db.select().from(packages).where(eq(packages.isActive, true));
  }

  async getPackageById(id: string): Promise<Package | undefined> {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
    return pkg;
  }

  async getUserActiveSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')));
    return subscription;
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        ...subscriptionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values({
        ...paymentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      .returning();
    return payment;
  }

  async getPaymentById(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async getUserDomains(userId: string): Promise<Domain[]> {
    return await db.select().from(domains).where(eq(domains.userId, userId));
  }

  async getDomainByName(domain: string): Promise<Domain | undefined> {
    const [domainRecord] = await db.select().from(domains).where(eq(domains.domain, domain));
    return domainRecord;
  }

  async createDomain(domainData: Partial<Domain>): Promise<Domain> {
    const [domain] = await db
      .insert(domains)
      .values({
        ...domainData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      .returning();
    return domain;
  }

  async updateDomain(id: string, updates: Partial<Domain>): Promise<Domain> {
    const [domain] = await db
      .update(domains)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(domains.id, id))
      .returning();
    return domain;
  }

  async getShortlinkByCode(code: string): Promise<Shortlink | undefined> {
    const [shortlink] = await db.select().from(shortlinks).where(eq(shortlinks.code, code));
    return shortlink;
  }

  async createShortlink(shortlinkData: Partial<Shortlink>): Promise<Shortlink> {
    const [shortlink] = await db
      .insert(shortlinks)
      .values({
        ...shortlinkData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      .returning();
    return shortlink;
  }

  async incrementShortlinkClicks(id: string): Promise<void> {
    await db
      .update(shortlinks)
      .set({ 
        clicks: sql`${shortlinks.clicks} + 1`,
        updatedAt: new Date()
      })
      .where(eq(shortlinks.id, id));
  }

  async createAnalyticsEvent(eventData: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [event] = await db
      .insert(analyticsEvents)
      .values({
        ...eventData,
        createdAt: new Date(),
      })
      .returning();
    return event;
  }

  async getPageAnalytics(pageId: string, days: number): Promise<any[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    
    return await db
      .select({
        date: sql`DATE(${analyticsEvents.createdAt})`.as('date'),
        eventType: analyticsEvents.eventType,
        count: count(),
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.pageId, pageId),
          sql`${analyticsEvents.createdAt} >= ${sinceDate}`
        )
      )
      .groupBy(sql`DATE(${analyticsEvents.createdAt})`, analyticsEvents.eventType)
      .orderBy(sql`DATE(${analyticsEvents.createdAt})`);
  }

  async getUserAnalytics(userId: string, selectedPageId?: string, timeRange = '7d'): Promise<{
    totalViews: number;
    totalClicks: number;
    conversionRate: number;
    topPages: Array<{ id: string; title: string; slug: string; views: number; clicks: number; }>;
    topLinks: Array<{ label: string; url: string; clicks: number; }>;
    chartData: Array<{ date: string; views: number; clicks: number; }>;
  }> {
    const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // Build where condition
    let whereConditions = [
      eq(pages.userId, userId),
      sql`${analyticsEvents.createdAt} >= ${sinceDate}`
    ];

    if (selectedPageId && selectedPageId !== 'all') {
      whereConditions.push(eq(analyticsEvents.pageId, selectedPageId));
    }

    // Get total views and clicks
    const eventStats = await db
      .select({
        eventType: analyticsEvents.eventType,
        count: count(),
      })
      .from(analyticsEvents)
      .innerJoin(pages, eq(analyticsEvents.pageId, pages.id))
      .where(and(...whereConditions))
      .groupBy(analyticsEvents.eventType);

    const totalViews = eventStats.find(stat => stat.eventType === 'view')?.count || 0;
    const totalClicks = eventStats.find(stat => stat.eventType === 'click')?.count || 0;
    const conversionRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

    // Get top pages
    const topPagesData = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        eventType: analyticsEvents.eventType,
        count: count(),
      })
      .from(analyticsEvents)
      .innerJoin(pages, eq(analyticsEvents.pageId, pages.id))
      .where(and(...whereConditions))
      .groupBy(pages.id, pages.title, pages.slug, analyticsEvents.eventType)
      .orderBy(desc(count()));

    // Process top pages
    const pageStatsMap = new Map();
    topPagesData.forEach(row => {
      if (!pageStatsMap.has(row.id)) {
        pageStatsMap.set(row.id, { 
          id: row.id, 
          title: row.title, 
          slug: row.slug, 
          views: 0, 
          clicks: 0 
        });
      }
      const pageStats = pageStatsMap.get(row.id);
      if (row.eventType === 'view') pageStats.views = Number(row.count);
      if (row.eventType === 'click') pageStats.clicks = Number(row.count);
    });

    const topPages = Array.from(pageStatsMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Get chart data
    const chartRawData = await db
      .select({
        date: sql`DATE(${analyticsEvents.createdAt})`.as('date'),
        eventType: analyticsEvents.eventType,
        count: count(),
      })
      .from(analyticsEvents)
      .innerJoin(pages, eq(analyticsEvents.pageId, pages.id))
      .where(and(...whereConditions))
      .groupBy(sql`DATE(${analyticsEvents.createdAt})`, analyticsEvents.eventType)
      .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

    // Process chart data
    const chartDataMap = new Map();
    chartRawData.forEach(row => {
      const date = row.date;
      if (!chartDataMap.has(date)) {
        chartDataMap.set(date, { date, views: 0, clicks: 0 });
      }
      const dayStats = chartDataMap.get(date);
      if (row.eventType === 'view') dayStats.views = Number(row.count);
      if (row.eventType === 'click') dayStats.clicks = Number(row.count);
    });

    const chartData = Array.from(chartDataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get top links (from blocks config)
    const topLinksData = await db
      .select({
        config: blocks.config,
        eventType: analyticsEvents.eventType,
        count: count(),
      })
      .from(analyticsEvents)
      .innerJoin(blocks, eq(analyticsEvents.blockId, blocks.id))
      .innerJoin(pages, eq(blocks.pageId, pages.id))
      .where(and(
        eq(pages.userId, userId),
        eq(analyticsEvents.eventType, 'click'),
        sql`${analyticsEvents.createdAt} >= ${sinceDate}`
      ))
      .groupBy(blocks.config, analyticsEvents.eventType)
      .orderBy(desc(count()))
      .limit(5);

    // Process top links (simplified - would need more complex parsing in real scenario)
    const topLinks = topLinksData.map((row, index) => ({
      label: `Link ${index + 1}`,
      url: `https://example.com/link${index + 1}`,
      clicks: Number(row.count)
    }));

    return {
      totalViews: Number(totalViews),
      totalClicks: Number(totalClicks),
      conversionRate,
      topPages,
      topLinks,
      chartData,
    };
  }

  async getUserDashboardStats(userId: string): Promise<{
    totalViews: number;
    totalClicks: number;
    activePages: number;
    conversionRate: number;
    viewsChange: number;
    clicksChange: number;
  }> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get user's pages count
    const userPages = await db.select().from(pages).where(eq(pages.userId, userId));
    const activePages = userPages.length;

    // Get current week stats
    const currentWeekStats = await db
      .select({
        eventType: analyticsEvents.eventType,
        count: count(),
      })
      .from(analyticsEvents)
      .innerJoin(pages, eq(analyticsEvents.pageId, pages.id))
      .where(and(
        eq(pages.userId, userId),
        sql`${analyticsEvents.createdAt} >= ${oneWeekAgo}`
      ))
      .groupBy(analyticsEvents.eventType);

    // Get previous week stats
    const previousWeekStats = await db
      .select({
        eventType: analyticsEvents.eventType,
        count: count(),
      })
      .from(analyticsEvents)
      .innerJoin(pages, eq(analyticsEvents.pageId, pages.id))
      .where(and(
        eq(pages.userId, userId),
        sql`${analyticsEvents.createdAt} >= ${twoWeeksAgo}`,
        sql`${analyticsEvents.createdAt} < ${oneWeekAgo}`
      ))
      .groupBy(analyticsEvents.eventType);

    const currentViews = Number(currentWeekStats.find(stat => stat.eventType === 'view')?.count || 0);
    const currentClicks = Number(currentWeekStats.find(stat => stat.eventType === 'click')?.count || 0);
    const previousViews = Number(previousWeekStats.find(stat => stat.eventType === 'view')?.count || 0);
    const previousClicks = Number(previousWeekStats.find(stat => stat.eventType === 'click')?.count || 0);

    const viewsChange = previousViews > 0 ? Math.round(((currentViews - previousViews) / previousViews) * 100) : 0;
    const clicksChange = previousClicks > 0 ? Math.round(((currentClicks - previousClicks) / previousClicks) * 100) : 0;
    const conversionRate = currentViews > 0 ? Math.round((currentClicks / currentViews) * 100) : 0;

    return {
      totalViews: currentViews,
      totalClicks: currentClicks,
      activePages,
      conversionRate,
      viewsChange,
      clicksChange,
    };
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    proUsers: number;
    totalPages: number;
    monthlyRevenue: number;
    usersChange: number;
    revenueChange: number;
  }> {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get user counts
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [proUsersResult] = await db.select({ count: count() }).from(users).where(eq(users.plan, 'pro'));
    const [totalPagesResult] = await db.select({ count: count() }).from(pages);

    // Get current month users
    const [currentMonthUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${oneMonthAgo}`);

    // Get previous month users
    const [previousMonthUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        sql`${users.createdAt} >= ${twoMonthsAgo}`,
        sql`${users.createdAt} < ${oneMonthAgo}`
      ));

    // Get revenue data (from payments)
    const currentMonthRevenue = await db
      .select({
        total: sql`COALESCE(SUM(${payments.amountCents}), 0)`.as('total')
      })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        sql`${payments.createdAt} >= ${oneMonthAgo}`
      ));

    const previousMonthRevenue = await db
      .select({
        total: sql`COALESCE(SUM(${payments.amountCents}), 0)`.as('total')
      })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        sql`${payments.createdAt} >= ${twoMonthsAgo}`,
        sql`${payments.createdAt} < ${oneMonthAgo}`
      ));

    const totalUsers = Number(totalUsersResult.count);
    const proUsers = Number(proUsersResult.count);
    const totalPages = Number(totalPagesResult.count);
    const monthlyRevenue = Number(currentMonthRevenue[0]?.total || 0);
    const previousRevenue = Number(previousMonthRevenue[0]?.total || 0);

    const currentMonthUsers = Number(currentMonthUsersResult.count);
    const previousMonthUsers = Number(previousMonthUsersResult.count);

    const usersChange = previousMonthUsers > 0 ? Math.round(((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100) : 0;
    const revenueChange = previousRevenue > 0 ? Math.round(((monthlyRevenue - previousRevenue) / previousRevenue) * 100) : 0;

    return {
      totalUsers,
      proUsers,
      totalPages,
      monthlyRevenue,
      usersChange,
      revenueChange,
    };
  }

  async getAllUsers(limit = 50, offset = 0): Promise<{users: User[], total: number}> {
    const [totalResult] = await db.select({ count: count() }).from(users);
    const usersList = await db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
    
    return {
      users: usersList,
      total: totalResult.count
    };
  }

  async getAllSubscriptions(limit = 50, offset = 0): Promise<{subscriptions: (Subscription & {user: User, package: Package})[], total: number}> {
    const [totalResult] = await db.select({ count: count() }).from(subscriptions);
    
    const subscriptionsList = await db
      .select({
        subscription: subscriptions,
        user: users,
        package: packages,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .innerJoin(packages, eq(subscriptions.packageId, packages.id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(subscriptions.createdAt));
    
    return {
      subscriptions: subscriptionsList.map(row => ({
        ...row.subscription,
        user: row.user,
        package: row.package
      })) as any,
      total: totalResult.count
    };
  }

  async createAdminAuditLog(logData: Partial<AdminAudit>): Promise<AdminAudit> {
    const [log] = await db
      .insert(adminAudit)
      .values({
        ...logData,
        createdAt: new Date(),
      } as any)
      .returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
