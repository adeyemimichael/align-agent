#!/usr/bin/env tsx
/**
 * Test Gemini API key and list available models
 */

import { config } from 'dotenv';
config();

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not set');
    return;
  }

  console.log('🔑 Testing Gemini API Key...');
  console.log(`Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try a simple generation with different model names
    const modelNames = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
    ];

    for (const modelName of modelNames) {
      try {
        console.log(`Testing model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...\n`);
        break; // Stop after first successful model
      } catch (error: any) {
        console.log(`❌ ${modelName} failed: ${error.message}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testGeminiAPI();
