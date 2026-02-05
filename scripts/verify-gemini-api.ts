import { GoogleGenerativeAI } from '@google/generative-ai';

async function verifyGeminiAPI() {
  console.log('🔍 Verifying Gemini API...\n');

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

  try {
    console.log('\n📡 Testing connection to Gemini API...');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try gemini-2.5-flash first (what the app uses)
    console.log('Testing model: gemini-2.5-flash');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent('Say "Hello" if you can read this');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API is working!');
    console.log('Response:', text);
    console.log('\n✨ Your Gemini API is properly configured and ready to use!');
    
  } catch (error: any) {
    console.error('\n❌ Gemini API Error:', error.message);
    
    if (error.message?.includes('API key')) {
      console.error('\n💡 Solution: Your API key may be invalid or expired');
      console.error('   1. Visit https://aistudio.google.com/apikey');
      console.error('   2. Generate a new API key');
      console.error('   3. Update GEMINI_API_KEY in your .env file');
    } else if (error.message?.includes('quota')) {
      console.error('\n💡 Solution: You may have exceeded your API quota');
      console.error('   1. Check usage at https://aistudio.google.com/apikey');
      console.error('   2. Wait for quota reset or upgrade your plan');
    } else if (error.message?.includes('model')) {
      console.error('\n💡 Solution: The model may not be available');
      console.error('   Trying fallback model: gemini-1.5-flash');
      
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await fallbackModel.generateContent('Say "Hello"');
        const response = await result.response;
        console.log('✅ Fallback model works! Response:', response.text());
        console.log('\n⚠️  Note: Update lib/gemini.ts to use "gemini-1.5-flash" instead of "gemini-2.5-flash"');
      } catch (fallbackError: any) {
        console.error('❌ Fallback model also failed:', fallbackError.message);
      }
    } else {
      console.error('\n💡 Full error details:', error);
    }
    
    process.exit(1);
  }
}

verifyGeminiAPI();
