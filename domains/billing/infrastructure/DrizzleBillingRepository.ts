import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../../../packages/db/schema';
import { BillingRepository } from '../domain/BillingRepository';
import { Subscription, Package, Payment, CreatePaymentData } from '../domain/Subscription';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export class DrizzleBillingRepository implements BillingRepository {
  // Package operations
  async findAllPackages(): Promise<Package[]> {
    return db.select().from(schema.packages);
  }

  async findPackageById(id: string): Promise<Package | null> {
    const [pkg] = await db.select().from(schema.packages).where(eq(schema.packages.id, id));
    return pkg || null;
  }

  async findPackageByHandle(handle: string): Promise<Package | null> {
    const [pkg] = await db.select().from(schema.packages).where(eq(schema.packages.handle, handle));
    return pkg || null;
  }

  // Subscription operations
  async findSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const [subscription] = await db.select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, userId))
      .orderBy(desc(schema.subscriptions.createdAt));
    return subscription || null;
  }

  async createSubscription(subscriptionData: any): Promise<Subscription> {
    const [subscription] = await db.insert(schema.subscriptions).values(subscriptionData).returning();
    return subscription;
  }

  async updateSubscription(id: string, data: any): Promise<Subscription> {
    const [subscription] = await db.update(schema.subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.subscriptions.id, id))
      .returning();
    return subscription;
  }

  async cancelSubscription(id: string): Promise<void> {
    await db.update(schema.subscriptions)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(schema.subscriptions.id, id));
  }

  // Payment operations
  async findPaymentsByUserId(userId: string): Promise<Payment[]> {
    return db.select()
      .from(schema.payments)
      .where(eq(schema.payments.userId, userId))
      .orderBy(desc(schema.payments.createdAt));
  }

  async findPaymentByExternalId(externalId: string): Promise<Payment | null> {
    const [payment] = await db.select()
      .from(schema.payments)
      .where(eq(schema.payments.externalId, externalId));
    return payment || null;
  }

  async createPayment(paymentData: CreatePaymentData): Promise<Payment> {
    const [payment] = await db.insert(schema.payments).values(paymentData).returning();
    return payment;
  }

  async updatePayment(id: string, data: any): Promise<Payment> {
    const [payment] = await db.update(schema.payments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.payments.id, id))
      .returning();
    return payment;
  }
}
