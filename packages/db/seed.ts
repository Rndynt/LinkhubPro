import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
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

    // Insert packages
    await db.insert(schema.packages).values(starterData.packages);
    console.log("✅ Inserted packages");

    // Insert users with hashed passwords
    const usersWithHashedPasswords = await Promise.all(
      starterData.users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash("password123", 10), // Default password for all test users
      }))
    );
    await db.insert(schema.users).values(usersWithHashedPasswords);
    console.log("✅ Inserted users");

    // Insert subscriptions (for pro user)
    const proSubscription = {
      id: "sub-1",
      userId: "22222222-2222-2222-2222-222222222222", // shop@example.com
      packageId: "pkg-pro",
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };
    await db.insert(schema.subscriptions).values([proSubscription]);
    console.log("✅ Inserted subscriptions");

    // Insert pages
    await db.insert(schema.pages).values(starterData.pages);
    console.log("✅ Inserted pages");

    // Insert blocks
    await db.insert(schema.blocks).values(starterData.blocks);
    console.log("✅ Inserted blocks");

    // Insert shortlinks
    await db.insert(schema.shortlinks).values(starterData.shortlinks);
    console.log("✅ Inserted shortlinks");

    // Insert sample analytics events
    const sampleEvents = [
      {
        pageId: "page-1",
        type: "view" as const,
        metadata: { userAgent: "Mozilla/5.0", country: "ID" },
        ipAddress: "127.0.0.1",
      },
      {
        pageId: "page-1",
        blockId: "blk-1",
        type: "click" as const,
        metadata: { linkUrl: "https://jessica.blog" },
        ipAddress: "127.0.0.1",
      },
      {
        shortlinkId: "s1",
        type: "click" as const,
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
if (require.main === module) {
  seed();
}

export default seed;
