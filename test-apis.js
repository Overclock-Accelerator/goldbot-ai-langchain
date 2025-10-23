// Simple test script for API endpoints
const baseUrl = 'http://localhost:3001';

async function testApi(url, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`URL: ${url}`);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...');

  // Test spot price API
  await testApi(`${baseUrl}/api/tools/spot-price?metal=XAU`, 'Spot Price - Gold');
  await testApi(`${baseUrl}/api/tools/spot-price?metal=XAG&currency=EUR`, 'Spot Price - Silver in EUR');

  // Test historical data API
  await testApi(`${baseUrl}/api/tools/historical-data?metal=XAU&relativePeriod=last%205%20months`, 'Historical Data - Gold last 5 months');
  await testApi(`${baseUrl}/api/tools/historical-data?metal=XAG&startDate=2024-01&endDate=2024-06`, 'Historical Data - Silver date range');

  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error);