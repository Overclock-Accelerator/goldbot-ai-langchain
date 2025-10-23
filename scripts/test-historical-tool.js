// Test script for the historical data tool
const path = require('path');

// Mock process.cwd() to return the correct path
const originalCwd = process.cwd;
process.cwd = () => path.join(__dirname, '..');

async function testHistoricalTool() {
  try {
    console.log('🧪 Testing Historical Data Tool');
    console.log('='.repeat(50));

    // Import the tool (using dynamic import for ES modules)
    const { executeHistoricalDataTool } = await import('../lib/tools/historical-data/execute.js');

    // Test 1: Relative period query
    console.log('\n📅 Test 1: Last 5 months for Gold');
    const result1 = await executeHistoricalDataTool('XAU', undefined, undefined, 'last 5 months');
    console.log('Result:', JSON.stringify(result1, null, 2));

    // Test 2: Specific date range
    console.log('\n📅 Test 2: Gold from 1990-01 to 1990-06');
    const result2 = await executeHistoricalDataTool('XAU', '1990-01', '1990-06');
    console.log('Result:', JSON.stringify(result2, null, 2));

    // Test 3: Different metal
    console.log('\n📅 Test 3: Silver last year');
    const result3 = await executeHistoricalDataTool('XAG', undefined, undefined, 'last year');
    console.log('Result:', JSON.stringify(result3, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Restore original cwd
    process.cwd = originalCwd;
  }
}

testHistoricalTool();