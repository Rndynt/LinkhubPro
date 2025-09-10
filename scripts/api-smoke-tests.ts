#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE = process.env.API_BASE || 'http://localhost:8888/.netlify/functions';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

async function runTests(): Promise<boolean> {
  console.log('🔥 Running API smoke tests...\n');
  
  const tests: TestResult[] = [];
  let token = '';
  let freeUserToken = '';
  let createdPageId = '';
  
  // Test 1: User Registration
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        password: 'password123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      token = data.token;
      tests.push({
        name: 'User Registration',
        passed: true,
        message: 'User registered successfully'
      });
    } else {
      const error = await response.text();
      tests.push({
        name: 'User Registration', 
        passed: false,
        message: `Registration failed: ${error}`
      });
    }
  } catch (error) {
    tests.push({
      name: 'User Registration',
      passed: false,
      message: `Network error: ${error.message}`
    });
  }
  
  // Test 2: User Login  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'creator@example.com',
        password: 'password123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      freeUserToken = data.token;
      tests.push({
        name: 'User Login',
        passed: true,
        message: 'Login successful'
      });
    } else {
      tests.push({
        name: 'User Login',
        passed: false,
        message: 'Login failed'
      });
    }
  } catch (error) {
    tests.push({
      name: 'User Login',
      passed: false,
      message: `Network error: ${error.message}`
    });
  }
  
  // Test 3: Free user second page creation (should fail)
  if (freeUserToken) {
    try {
      const response = await fetch(`${API_BASE}/pages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freeUserToken}`
        },
        body: JSON.stringify({
          title: 'Second Page',
          slug: 'second-page'
        })
      });
      
      if (response.status === 403) {
        const data = await response.json();
        if (data.error === 'upgrade_required') {
          tests.push({
            name: 'Free User Page Limit',
            passed: true,
            message: 'Correctly blocked free user from creating second page'
          });
        } else {
          tests.push({
            name: 'Free User Page Limit',
            passed: false,
            message: 'Wrong error message for free user limit'
          });
        }
      } else {
        tests.push({
          name: 'Free User Page Limit',
          passed: false,
          message: 'Free user was allowed to create second page'
        });
      }
    } catch (error) {
      tests.push({
        name: 'Free User Page Limit',
        passed: false,
        message: `Network error: ${error.message}`
      });
    }
  }
  
  // Test 4: Pro user create PRO block
  if (token) {
    try {
      // First create a page
      const pageResponse = await fetch(`${API_BASE}/pages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Test Page',
          slug: 'test-page'
        })
      });
      
      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        createdPageId = pageData.page.id;
        
        // Try to create a PRO block (should fail for free user, succeed for pro)
        const blockResponse = await fetch(`${API_BASE}/pages/${createdPageId}/blocks`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'product_card',
            position: 1,
            config: { title: 'Test Product' }
          })
        });
        
        // This should fail for free users
        if (blockResponse.status === 403) {
          tests.push({
            name: 'Pro Block Creation',
            passed: true,
            message: 'Correctly blocked free user from creating PRO block'
          });
        } else if (blockResponse.status === 201) {
          tests.push({
            name: 'Pro Block Creation',
            passed: true,
            message: 'Pro user successfully created PRO block'
          });
        } else {
          tests.push({
            name: 'Pro Block Creation',
            passed: false,
            message: 'Unexpected response for PRO block creation'
          });
        }
      }
    } catch (error) {
      tests.push({
        name: 'Pro Block Creation',
        passed: false,
        message: `Network error: ${error.message}`
      });
    }
  }
  
  // Test 5: Shortlink redirect
  try {
    const response = await fetch(`${API_BASE}/s/sp1`, {
      method: 'GET',
      redirect: 'manual'
    });
    
    if (response.status === 302) {
      const location = response.headers.get('location');
      if (location) {
        tests.push({
          name: 'Shortlink Redirect',
          passed: true,
          message: `Shortlink redirected to: ${location}`
        });
      } else {
        tests.push({
          name: 'Shortlink Redirect',
          passed: false,
          message: 'Redirect response missing location header'
        });
      }
    } else {
      tests.push({
        name: 'Shortlink Redirect',
        passed: false,
        message: 'Shortlink did not return redirect response'
      });
    }
  } catch (error) {
    tests.push({
      name: 'Shortlink Redirect',
      passed: false,
      message: `Network error: ${error.message}`
    });
  }
  
  // Print results
  console.log('📋 Test Results:\n');
  
  let allPassed = true;
  for (const test of tests) {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.message}`);
    if (!test.passed) allPassed = false;
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 All smoke tests passed!');
    return true;
  } else {
    console.log('💥 Some smoke tests failed!');
    return false;
  }
}

// Run tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
});
