async function testGeminiDirect() {
  console.log('🔍 Testing Gemini API with direct HTTP call...\n');

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }

  console.log('✅ API Key found');

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say "Hello" if you can read this'
          }]
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      process.exit(1);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    console.log('✅ Gemini API is working!');
    console.log('Response:', text);
    console.log('\n✨ Your Gemini API is properly configured!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testGeminiDirect();
