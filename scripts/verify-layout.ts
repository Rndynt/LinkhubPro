#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function verifyLayout(): boolean {
  console.log('🔍 Verifying layout components...\n');
  
  const layoutPath = path.resolve(process.cwd(), 'apps/web/app/layout.tsx');
  const headerPath = path.resolve(process.cwd(), 'apps/web/components/Header.tsx');
  const sidebarPath = path.resolve(process.cwd(), 'apps/web/components/Sidebar.tsx');
  
  // Check if files exist
  if (!fs.existsSync(layoutPath)) {
    console.log('❌ Layout file not found');
    return false;
  }
  
  if (!fs.existsSync(headerPath)) {
    console.log('❌ Header component not found');
    return false;
  }
  
  if (!fs.existsSync(sidebarPath)) {
    console.log('❌ Sidebar component not found');
    return false;
  }
  
  // Check layout imports
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  const hasHeaderImport = layoutContent.includes('Header');
  const hasSidebarImport = layoutContent.includes('Sidebar');
  
  console.log(`✅ Layout file exists`);
  console.log(`✅ Header component exists`);
  console.log(`✅ Sidebar component exists`);
  
  // Check sidebar links
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
  const requiredLinks = [
    'Dashboard',
    'Pages', 
    'Analytics',
    'Billing',
    'Domains',
    'Admin'
  ];
  
  let hasAllLinks = true;
  for (const link of requiredLinks) {
    if (sidebarContent.includes(link)) {
      console.log(`✅ Sidebar contains ${link} link`);
    } else {
      console.log(`❌ Sidebar missing ${link} link`);
      hasAllLinks = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (hasAllLinks) {
    console.log('🎉 Layout verification passed!');
    return true;
  } else {
    console.log('💥 Layout verification failed!');
    return false;
  }
}

// Run verification
const success = verifyLayout();
process.exit(success ? 0 : 1);
