#!/usr/bin/env npx tsx

/**
 * Fix NextAuth Configuration Issues
 * Diagnoses and provides fixes for NextAuth configuration errors
 */

import { PrismaClient } from '@prisma/client';

console.log('🔧 NextAuth Configuration Fix\n');
console.log('='.repeat(60));

// Check environment variables
console.log('\n📋 CHECKING ENVIRONMENT VARIABLES:');
console.log('─'.repeat(60));

const requiredVars = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
};

let hasErrors = false;

for (const [key, value] of Object.entries(requiredVars)) {
  if (!value) {
    console.log(`❌ ${key}: NOT SET`);
    hasErrors = true;
  } else {
    if (key === 'NEXTAUTH_URL' || key === 'DATABASE_URL') {
      console.log(`✅ ${key}: ${value}`);
    } else {
      console.log(`✅ ${key}: ***set***`);
    }
  }
}

// Check NEXTAUTH_SECRET length
if (requiredVars.NEXTAUTH_SECRET) {
  if (requiredVars.NEXTAUTH_SECRET.length < 32) {
    console.log(`⚠️  NEXTAUTH_SECRET is too short (${requiredVars.NEXTAUTH_SECRET.length} chars, should be 32+)`);
    hasErrors = true;
  }
}

// Check NEXTAUTH_URL format
if (requiredVars.NEXTAUTH_URL) {
  if (requiredVars.NEXTAUTH_URL.includes('localhost') && process.env.NODE_ENV === 'production') {
    console.log(`⚠️  NEXTAUTH_URL is set to localhost in production!`);
    hasErrors = true;
  }
  if (!requiredVars.NEXTAUTH_URL.startsWith('http')) {
    console.log(`⚠️  NEXTAUTH_URL should start with http:// or https://`);
    hasErrors = true;
  }
}

// Test database connection
console.log('\n📋 CHECKING DATABASE CONNECTION:');
console.log('─'.repeat(60));

try {
  const prisma = new PrismaClient();
  await prisma.$connect();
  console.log('✅ Database connection successful');
  
  // Check if User table exists
  const userCount = await prisma.user.count();
  console.log(`✅ User table accessible (${userCount} users)`);
  
  await prisma.$disconnect();
} catch (error: any) {
  console.log('❌ Database connection failed:', error.message);
  hasErrors = true;
}

// Provide recommendations
console.log('\n💡 RECOMMENDATIONS:');
console.log('─'.repeat(60));

if (hasErrors) {
  console.log('\n🔴 ISSUES FOUND - Please fix the following:\n');
  
  if (!requiredVars.NEXTAUTH_URL) {
    console.log('1. Set NEXTAUTH_URL in your environment:');
    console.log('   Local: NEXTAUTH_URL=http://localhost:3000');
    console.log('   Production: NEXTAUTH_URL=https://your-domain.vercel.app');
  }
  
  if (!requiredVars.NEXTAUTH_SECRET || (requiredVars.NEXTAUTH_SECRET && requiredVars.NEXTAUTH_SECRET.length < 32)) {
    console.log('\n2. Generate a new NEXTAUTH_SECRET:');
    console.log('   Run: openssl rand -base64 32');
    console.log('   Or use: https://generate-secret.vercel.app/32');
  }
  
  if (!requiredVars.GOOGLE_CLIENT_ID || !requiredVars.GOOGLE_CLIENT_SECRET) {
    console.log('\n3. Set Google OAuth credentials:');
    console.log('   Get them from: https://console.cloud.google.com/apis/credentials');
  }
  
  if (!requiredVars.DATABASE_URL) {
    console.log('\n4. Set DATABASE_URL:');
    console.log('   Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE');
  }
  
  console.log('\n📝 FOR VERCEL DEPLOYMENT:');
  console.log('   1. Go to Vercel Dashboard → Settings → Environment Variables');
  console.log('   2. Add all missing variables for Production environment');
  console.log('   3. Redeploy your application');
  
} else {
  console.log('✅ All configuration checks passed!');
  console.log('\nIf you\'re still seeing errors, try:');
  console.log('1. Clear your browser cookies and cache');
  console.log('2. Restart your development server');
  console.log('3. Check Vercel logs for detailed error messages');
}

console.log('\n' + '='.repeat(60));
