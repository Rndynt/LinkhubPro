import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../shared/schema";
import starterData from "./seeds/starter.json";
import bcrypt from "bcrypt";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (in dependency order)
    await db.delete(schema.adminAudit);
    await db.delete(schema.payments);
    await db.delete(schema.analyticsEvents);
    await db.delete(schema.shortlinks);
    await db.delete(schema.blocks);
    await db.delete(schema.pages);
    await db.delete(schema.subscriptions);
    await db.delete(schema.domains);
    await db.delete(schema.users);
    await db.delete(schema.packages);

    console.log("✅ Cleared existing data");

    // Insert packages (transform snake_case to camelCase)
    const packagesData = starterData.packages.map(pkg => ({
      ...pkg,
      priceCents: pkg.price_cents,
      billingInterval: pkg.billing_interval as "monthly" | "yearly",
    }));
    await db.insert(schema.packages).values(packagesData);
    console.log("✅ Inserted packages");

    // Insert users with hashed passwords
    const usersWithHashedPasswords = await Promise.all(
      starterData.users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash("password123", 10), // Default password for all test users
        role: user.role as "admin" | "tenant",
        plan: user.plan as "admin" | "free" | "pro",
      }))
    );
    await db.insert(schema.users).values(usersWithHashedPasswords);
    console.log("✅ Inserted users");

    // Insert subscriptions (for pro user)
    const proSubscription = {
      id: "33333333-3333-3333-3333-333333333333", // Use proper UUID format
      userId: "22222222-2222-2222-2222-222222222222", // shop@example.com
      packageId: "pkg-pro",
      status: "active" as const,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };
    await db.insert(schema.subscriptions).values([proSubscription]);
    console.log("✅ Inserted subscriptions");

    // Insert pages (transform snake_case to camelCase)
    const pagesData = starterData.pages.map(page => ({
      ...page,
      userId: page.user_id,
      isPublished: page.is_published,
    }));
    await db.insert(schema.pages).values(pagesData);
    console.log("✅ Inserted pages");

    // Insert blocks (transform snake_case to camelCase)
    const blocksData = starterData.blocks.map(block => ({
      ...block,
      pageId: block.page_id,
      type: block.type, // No enum restriction in shared schema
    }));
    await db.insert(schema.blocks).values(blocksData);
    console.log("✅ Inserted blocks");

    // Insert shortlinks (transform snake_case to camelCase)
    const shortlinksData = starterData.shortlinks.map(link => ({
      ...link,
      targetUrl: link.target_url,
      pageId: link.page_id,
      blockId: link.block_id,
    }));
    await db.insert(schema.shortlinks).values(shortlinksData);
    console.log("✅ Inserted shortlinks");

    // Insert sample analytics events
    const sampleEvents = [
      {
        pageId: "55555555-5555-5555-5555-555555555555", // Jessica's page
        eventType: "view" as const,
        metadata: { userAgent: "Mozilla/5.0", country: "ID" },
        ipAddress: "127.0.0.1",
      },
      {
        pageId: "55555555-5555-5555-5555-555555555555", // Jessica's page
        blockId: "b0000001-0001-0001-0001-000000000002", // Jessica's links block
        eventType: "click" as const,
        metadata: { linkUrl: "https://jessica.blog" },
        ipAddress: "127.0.0.1",
      },
      {
        shortlinkId: "44444444-4444-4444-4444-444444444444", // Existing shortlink
        eventType: "click" as const,
        metadata: { code: "sp1" },
        ipAddress: "127.0.0.1",
      },
    ];
    await db.insert(schema.analyticsEvents).values(sampleEvents);
    console.log("✅ Inserted analytics events");

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed if called directly
seed();

export default seed;
