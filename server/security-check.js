#!/usr/bin/env node
/**
 * Security Check Script
 * Verifies that credentials are properly secured and not exposed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 Running Security Check...\n');

let passed = 0;
let failed = 0;

// Test 1: Check if .env exists locally
console.log('📋 Test 1: Checking .env file exists...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file found');
  passed++;
} else {
  console.log('   ❌ .env file NOT found');
  console.log('      Create .env file with ADMIN_USERNAME and ADMIN_PASSWORD');
  failed++;
}

// Test 2: Check if .env has required variables
console.log('\n📋 Test 2: Checking .env has required variables...');
try {
  require('dotenv').config();
  const required = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'JWT_SECRET', 'DB_HOST'];
  let missing = [];
  
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });
  
  if (missing.length === 0) {
    console.log('   ✅ All required variables present');
    console.log(`      ADMIN_USERNAME: ${process.env.ADMIN_USERNAME}`);
    console.log(`      ADMIN_PASSWORD: ${'*'.repeat(process.env.ADMIN_PASSWORD?.length || 0)}`);
    passed++;
  } else {
    console.log('   ❌ Missing variables:', missing.join(', '));
    failed++;
  }
} catch (error) {
  console.log('   ❌ Error reading .env:', error.message);
  failed++;
}

// Test 3: Check if .gitignore includes .env
console.log('\n📋 Test 3: Checking .gitignore blocks .env...');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignore.includes('.env') || gitignore.includes('*.env')) {
    console.log('   ✅ .gitignore properly blocks .env files');
    passed++;
  } else {
    console.log('   ❌ .gitignore does NOT block .env');
    console.log('      Add ".env" to .gitignore');
    failed++;
  }
} else {
  console.log('   ⚠️  No .gitignore file found');
  failed++;
}

// Test 4: Check if .env is tracked by git
console.log('\n📋 Test 4: Checking .env is not tracked by git...');
try {
  const trackedFiles = execSync('git ls-files', { encoding: 'utf8' });
  if (trackedFiles.includes('.env') && !trackedFiles.includes('.env.example')) {
    console.log('   ❌ .env is tracked by git!');
    console.log('      Run: git rm --cached .env');
    failed++;
  } else {
    console.log('   ✅ .env is not tracked by git');
    passed++;
  }
} catch (error) {
  console.log('   ⚠️  Not a git repository or git not available');
}

// Test 5: Check for hardcoded credentials in source files
console.log('\n📋 Test 5: Checking for hardcoded credentials...');
try {
  const searchPatterns = [
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_USERNAME
  ].filter(Boolean);
  
  let foundInCode = false;
  
  for (const pattern of searchPatterns) {
    try {
      // Search in .js files, excluding node_modules and .env
      const result = execSync(
        `grep -r "${pattern}" . --include="*.js" --exclude-dir=node_modules 2>/dev/null || true`,
        { encoding: 'utf8' }
      );
      
      // Filter out .env files from results
      const matches = result.split('\n').filter(line => 
        line && !line.includes('.env') && !line.includes('security-check.js')
      );
      
      if (matches.length > 0) {
        console.log(`   ❌ Found "${pattern}" in source code:`);
        matches.forEach(match => console.log(`      ${match}`));
        foundInCode = true;
      }
    } catch (err) {
      // Grep returns non-zero if no matches, which is good
    }
  }
  
  if (!foundInCode) {
    console.log('   ✅ No hardcoded credentials found in source code');
    passed++;
  } else {
    console.log('   ❌ Hardcoded credentials found! Remove them from source files.');
    failed++;
  }
} catch (error) {
  console.log('   ⚠️  Could not check for hardcoded credentials');
}

// Test 6: Check if middleware files exist
console.log('\n📋 Test 6: Checking middleware files exist...');
const middlewarePath = path.join(__dirname, 'middleware');
const requiredMiddleware = ['auth.js', 'validation.js'];
let middlewareExists = true;

requiredMiddleware.forEach(file => {
  const filePath = path.join(middlewarePath, file);
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Missing: middleware/${file}`);
    middlewareExists = false;
  }
});

if (middlewareExists) {
  console.log('   ✅ All middleware files present');
  passed++;
} else {
  console.log('   ❌ Some middleware files are missing');
  failed++;
}

// Test 7: Check if .env.example exists
console.log('\n📋 Test 7: Checking .env.example exists...');
const envExamplePath = path.join(__dirname, '.env.example');
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  // Check if it doesn't contain real credentials
  if (!envExample.includes(process.env.ADMIN_PASSWORD)) {
    console.log('   ✅ .env.example exists without real credentials');
    passed++;
  } else {
    console.log('   ❌ .env.example contains real credentials!');
    console.log('      Remove real values from .env.example');
    failed++;
  }
} else {
  console.log('   ⚠️  .env.example not found (optional but recommended)');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Security Check Summary');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All security checks passed!');
  console.log('🔒 Your credentials are properly secured.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some security checks failed!');
  console.log('Please fix the issues above before deploying.');
  process.exit(1);
}