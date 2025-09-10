import { sql, relations } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['admin', 'tenant']);
export const planEnum = pgEnum('plan', ['free', 'pro', 'admin']);
export const billingIntervalEnum = pgEnum('billing_interval', ['monthly', 'yearly']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'cancelled']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'inactive', 'cancelled', 'expired']);

// Session storage table (required for auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  password: text("password"),
  role: roleEnum("role").default('tenant').notNull(),
  plan: planEnum("plan").default('free').notNull(),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  googleId: varchar("google_id", { length: 100 }),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Packages table
export const packages = pgTable("packages", {
  id: varchar("id", { length: 50 }).primaryKey(),
  handle: varchar("handle", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: varchar("currency", { length: 3 }).default('IDR').notNull(),
  billingInterval: billingIntervalEnum("billing_interval").notNull(),
  features: jsonb("features").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  packageId: varchar("package_id", { length: 50 }).references(() => packages.id).notNull(),
  status: subscriptionStatusEnum("status").default('active').notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  midtransSubscriptionId: varchar("midtrans_subscription_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pages table
export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  isPublished: boolean("is_published").default(false).notNull(),
  customDomain: varchar("custom_domain", { length: 255 }),
  isDomainVerified: boolean("is_domain_verified").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Blocks table
export const blocks = pgTable("blocks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: 'cascade' }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  position: integer("position").notNull(),
  config: jsonb("config").notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shortlinks table
export const shortlinks = pgTable("shortlinks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).unique().notNull(),
  targetUrl: text("target_url").notNull(),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: 'cascade' }),
  blockId: uuid("block_id").references(() => blocks.id, { onDelete: 'cascade' }),
  clicks: integer("clicks").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics events table
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: 'cascade' }),
  blockId: uuid("block_id").references(() => blocks.id, { onDelete: 'cascade' }),
  shortlinkId: uuid("shortlink_id").references(() => shortlinks.id, { onDelete: 'cascade' }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'view', 'click', 'purchase'
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  referrer: text("referrer"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_analytics_events_page_id").on(table.pageId),
  index("idx_analytics_events_created_at").on(table.createdAt),
]);

// Domains table
export const domains = pgTable("domains", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  domain: varchar("domain", { length: 255 }).unique().notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: varchar("verification_token", { length: 255 }),
  sslEnabled: boolean("ssl_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: 'cascade' }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).default('IDR').notNull(),
  status: paymentStatusEnum("status").default('pending').notNull(),
  midtransTransactionId: varchar("midtrans_transaction_id", { length: 255 }),
  midtransOrderId: varchar("midtrans_order_id", { length: 255 }),
  paymentMethod: varchar("payment_method", { length: 100 }),
  paidAt: timestamp("paid_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admin audit table
export const adminAudit = pgTable("admin_audit", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: uuid("admin_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("target_type", { length: 50 }), // 'user', 'subscription', 'package'
  targetId: varchar("target_id", { length: 255 }),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_admin_audit_admin_id").on(table.adminId),
  index("idx_admin_audit_created_at").on(table.createdAt),
]);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  pages: many(pages),
  subscriptions: many(subscriptions),
  domains: many(domains),
  payments: many(payments),
  auditLogs: many(adminAudit),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  user: one(users, { fields: [pages.userId], references: [users.id] }),
  blocks: many(blocks),
  shortlinks: many(shortlinks),
  analyticsEvents: many(analyticsEvents),
}));

export const blocksRelations = relations(blocks, ({ one, many }) => ({
  page: one(pages, { fields: [blocks.pageId], references: [pages.id] }),
  shortlinks: many(shortlinks),
  analyticsEvents: many(analyticsEvents),
}));

export const shortlinksRelations = relations(shortlinks, ({ one, many }) => ({
  page: one(pages, { fields: [shortlinks.pageId], references: [pages.id] }),
  block: one(blocks, { fields: [shortlinks.blockId], references: [blocks.id] }),
  analyticsEvents: many(analyticsEvents),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  package: one(packages, { fields: [subscriptions.packageId], references: [packages.id] }),
  payments: many(payments),
}));

export const packagesRelations = relations(packages, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  subscription: one(subscriptions, { fields: [payments.subscriptionId], references: [subscriptions.id] }),
}));

export const domainsRelations = relations(domains, ({ one }) => ({
  user: one(users, { fields: [domains.userId], references: [users.id] }),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  page: one(pages, { fields: [analyticsEvents.pageId], references: [pages.id] }),
  block: one(blocks, { fields: [analyticsEvents.blockId], references: [blocks.id] }),
  shortlink: one(shortlinks, { fields: [analyticsEvents.shortlinkId], references: [shortlinks.id] }),
}));

export const adminAuditRelations = relations(adminAudit, ({ one }) => ({
  admin: one(users, { fields: [adminAudit.adminId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlockSchema = createInsertSchema(blocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;

export type Block = typeof blocks.$inferSelect;
export type InsertBlock = z.infer<typeof insertBlockSchema>;

export type Package = typeof packages.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Payment = typeof payments.$inferSelect;
export type Domain = typeof domains.$inferSelect;
export type Shortlink = typeof shortlinks.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AdminAudit = typeof adminAudit.$inferSelect;
