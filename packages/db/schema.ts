import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["admin", "tenant"]);
export const planEnum = pgEnum("plan", ["admin", "free", "pro"]);
export const blockTypeEnum = pgEnum("block_type", [
  "title_subtitle",
  "link", 
  "button",
  "card",
  "image",
  "dynamic_feed",
  "countdown",
  "product_card",
  "contact_form",
  "newsletter_signup",
  "embed",
  "gallery",
  "map",
  "messenger_button",
  "shortlink_button",
  "video",
  "count_stats",
  "schedule_button",
  "password_protect",
  "links_block",
  "social_block",
  "contact_block"
]);
export const eventTypeEnum = pgEnum("event_type", ["view", "click", "purchase"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("tenant"),
  plan: planEnum("plan").notNull().default("free"),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Packages table
export const packages = pgTable("packages", {
  id: varchar("id", { length: 50 }).primaryKey(),
  handle: varchar("handle", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
  billingInterval: varchar("billing_interval", { length: 20 }).notNull(),
  features: jsonb("features").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  packageId: varchar("package_id", { length: 50 }).notNull().references(() => packages.id),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pages table
export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  isPublished: boolean("is_published").notNull().default(false),
  customDomain: varchar("custom_domain", { length: 255 }),
  metaTitle: varchar("meta_title", { length: 200 }),
  metaDescription: text("meta_description"),
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_pages_user_id").on(table.userId),
  index("idx_pages_slug").on(table.slug),
]);

// Blocks table
export const blocks = pgTable("blocks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: uuid("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
  type: blockTypeEnum("type").notNull(),
  position: integer("position").notNull(),
  config: jsonb("config").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_blocks_page_id").on(table.pageId),
  index("idx_blocks_page_position").on(table.pageId, table.position),
]);

// Shortlinks table
export const shortlinks = pgTable("shortlinks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  targetUrl: text("target_url").notNull(),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: "cascade" }),
  blockId: uuid("block_id").references(() => blocks.id, { onDelete: "cascade" }),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_shortlinks_code").on(table.code),
  index("idx_shortlinks_page_id").on(table.pageId),
]);

// Analytics events table
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: "cascade" }),
  blockId: uuid("block_id").references(() => blocks.id, { onDelete: "cascade" }),
  shortlinkId: uuid("shortlink_id").references(() => shortlinks.id, { onDelete: "cascade" }),
  type: eventTypeEnum("type").notNull(),
  metadata: jsonb("metadata").default({}),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_analytics_page_id").on(table.pageId),
  index("idx_analytics_created_at").on(table.createdAt),
  index("idx_analytics_type").on(table.type),
]);

// Domains table
export const domains = pgTable("domains", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: varchar("verification_token", { length: 100 }),
  dnsInstructions: text("dns_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_domains_user_id").on(table.userId),
  index("idx_domains_domain").on(table.domain),
]);

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  externalId: varchar("external_id", { length: 255 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_payments_user_id").on(table.userId),
  index("idx_payments_external_id").on(table.externalId),
]);

// Admin audit table
export const adminAudit = pgTable("admin_audit", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: uuid("admin_user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: varchar("resource_id", { length: 255 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_admin_audit_admin_id").on(table.adminUserId),
  index("idx_admin_audit_created_at").on(table.createdAt),
]);

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

export const insertShortlinkSchema = createInsertSchema(shortlinks).omit({
  id: true,
  clicks: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
});

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  isVerified: true,
  verificationToken: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminAuditSchema = createInsertSchema(adminAudit).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Package = typeof packages.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Block = typeof blocks.$inferSelect;
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type Shortlink = typeof shortlinks.$inferSelect;
export type InsertShortlink = z.infer<typeof insertShortlinkSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type Domain = typeof domains.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type AdminAudit = typeof adminAudit.$inferSelect;
export type InsertAdminAudit = z.infer<typeof insertAdminAuditSchema>;
