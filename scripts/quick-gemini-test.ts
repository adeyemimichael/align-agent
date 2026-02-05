#!/usr/bin/env tsx
/**
 * Quick Gemini API Test
 */

import { config } from 'dotenv';
config();

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGemini() {
  console.log('🧪 Testing Gemini API...\n');

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('📡 Sending test request...');
    
    const result = await model.generateContent('Say "Hello, I am working!" in one sentence.');
    const response = result.response;
    const text = response.text();

    console.log('\n✅ Gemini API is working!');
    console.log('📝 Response:', text);
    console.log('\n🎉 SUCCESS: Gemini AI integration is functional!\n');
    
  } catch (error) {
    console.error('\n❌ Gemini API Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
}

testGemini();
