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
