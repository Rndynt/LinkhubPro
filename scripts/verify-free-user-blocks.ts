#!/usr/bin/env node

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../packages/db/schema';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function verifyFreeUserBlocks(): Promise<boolean> {
  console.log('🔍 Verifying free user blocks...\n');
  
  try {
    // Find the free user (creator@example.com)
    const [freeUser] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, 'creator@example.com'));
    
    if (!freeUser) {
      console.log('❌ Free user (creator@example.com) not found');
      return false;
    }
    
    console.log(`✅ Found free user: ${freeUser.email} (plan: ${freeUser.plan})`);
    
    // Check user has exactly 1 page
    const userPages = await db.select()
      .from(schema.pages)
      .where(eq(schema.pages.userId, freeUser.id));
    
    if (userPages.length !== 1) {
      console.log(`❌ Free user should have exactly 1 page, found ${userPages.length}`);
      return false;
    }
    
    console.log(`✅ Free user has exactly 1 page: ${userPages[0].title}`);
    
    // Check the page has exactly 3 blocks
    const pageBlocks = await db.select()
      .from(schema.blocks)
      .where(eq(schema.blocks.pageId, userPages[0].id))
      .orderBy(schema.blocks.position);
    
    if (pageBlocks.length !== 3) {
      console.log(`❌ Page should have exactly 3 blocks, found ${pageBlocks.length}`);
      return false;
    }
    
    console.log(`✅ Page has exactly 3 blocks`);
    
    // Check block types are correct
    const expectedTypes = ['links_block', 'social_block', 'contact_block'];
    const actualTypes = pageBlocks.map(block => block.type);
    
    let typesMatch = true;
    for (let i = 0; i < 3; i++) {
      if (actualTypes[i] === expectedTypes[i]) {
        console.log(`✅ Block ${i + 1}: ${actualTypes[i]} (correct)`);
      } else {
        console.log(`❌ Block ${i + 1}: expected ${expectedTypes[i]}, got ${actualTypes[i]}`);
        typesMatch = false;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (typesMatch) {
      console.log('🎉 Free user blocks verification passed!');
      return true;
    } else {
      console.log('💥 Free user blocks verification failed!');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

// Run verification
verifyFreeUserBlocks().then(success => {
  process.exit(success ? 0 : 1);
});
