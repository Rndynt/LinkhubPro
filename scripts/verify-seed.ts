#!/usr/bin/env node

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { count } from 'drizzle-orm';
import * as schema from '../packages/db/schema';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function verifySeed(): Promise<boolean> {
  console.log('🔍 Verifying database seed data...\n');
  
  try {
    // Count records in each table
    const [userCount] = await db.select({ count: count() }).from(schema.users);
    const [pageCount] = await db.select({ count: count() }).from(schema.pages);
    const [packageCount] = await db.select({ count: count() }).from(schema.packages);
    const [blockCount] = await db.select({ count: count() }).from(schema.blocks);
    const [shortlinkCount] = await db.select({ count: count() }).from(schema.shortlinks);
    
    const results = {
      users: userCount.count,
      pages: pageCount.count,
      packages: packageCount.count,
      blocks: blockCount.count,
      shortlinks: shortlinkCount.count,
    };
    
    console.log('📊 Database counts:');
    console.log(JSON.stringify(results, null, 2));
    
    console.log('\n🔍 Checking minimum requirements:');
    
    let success = true;
    
    // Check minimum requirements
    if (results.users >= 3) {
      console.log('✅ Users count meets requirement (>=3)');
    } else {
      console.log('❌ Users count too low (<3)');
      success = false;
    }
    
    if (results.pages >= 2) {
      console.log('✅ Pages count meets requirement (>=2)');
    } else {
      console.log('❌ Pages count too low (<2)');
      success = false;
    }
    
    if (results.packages >= 2) {
      console.log('✅ Packages count meets requirement (>=2)');
    } else {
      console.log('❌ Packages count too low (<2)');
      success = false;
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (success) {
      console.log('🎉 Seed verification passed!');
      return true;
    } else {
      console.log('💥 Seed verification failed!');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Database connection or query failed:', error);
    return false;
  }
}

// Run verification
verifySeed().then(success => {
  process.exit(success ? 0 : 1);
});
