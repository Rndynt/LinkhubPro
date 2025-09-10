#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const requiredStructure = [
  // DDD Domain structure
  'domains/users/domain/User.ts',
  'domains/users/domain/UserRepository.ts',
  'domains/users/application/UserService.ts',
  'domains/users/infrastructure/DrizzleUserRepository.ts',
  
  'domains/pages/domain/Page.ts',
  'domains/pages/domain/PageRepository.ts',
  'domains/pages/application/PageService.ts',
  'domains/pages/infrastructure/DrizzlePageRepository.ts',
  
  'domains/billing/domain/Subscription.ts',
  'domains/billing/domain/BillingRepository.ts',
  'domains/billing/application/BillingService.ts',
  'domains/billing/infrastructure/DrizzleBillingRepository.ts',
  
  'domains/analytics/domain/Analytics.ts',
  'domains/analytics/domain/AnalyticsRepository.ts',
  'domains/analytics/application/AnalyticsService.ts',
  'domains/analytics/infrastructure/DrizzleAnalyticsRepository.ts',
  
  'domains/admin/domain/Admin.ts',
  'domains/admin/application/AdminService.ts',
  
  // Database package
  'packages/db/schema.ts',
  'packages/db/connection.ts',
  'packages/db/seed.ts',
  'packages/db/seeds/starter.json',
  
  // Next.js app
  'apps/web/app/layout.tsx',
  'apps/web/components/Header.tsx',
  'apps/web/components/Sidebar.tsx',
  
  // Netlify functions
  'functions/api/auth/register.ts',
  'functions/api/auth/login.ts',
  'functions/api/auth/me.ts',
  'functions/api/pages/index.ts',
  'functions/api/s/[code].ts',
  
  // Config files
  'netlify.toml',
  '.env.example',
];

function checkStructure(): boolean {
  console.log('🔍 Verifying project structure...\n');
  
  let allExists = true;
  
  for (const filePath of requiredStructure) {
    const fullPath = path.resolve(process.cwd(), filePath);
    const exists = fs.existsSync(fullPath);
    
    if (exists) {
      console.log(`✅ ${filePath}`);
    } else {
      console.log(`❌ ${filePath} - MISSING`);
      allExists = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allExists) {
    console.log('🎉 All required files exist!');
    return true;
  } else {
    console.log('💥 Some required files are missing!');
    return false;
  }
}

// Run verification
const success = checkStructure();
process.exit(success ? 0 : 1);
