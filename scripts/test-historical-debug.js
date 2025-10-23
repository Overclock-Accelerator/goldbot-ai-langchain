// Debug script for historical data tool
const path = require('path');

// Mock process.cwd() to return the correct path
const originalCwd = process.cwd;
process.cwd = () => path.join(__dirname, '..');

async function debugHistoricalTool() {
  try {
    console.log('🔍 Debugging Historical Data Tool');
    console.log('='.repeat(50));

    console.log('📁 Current working directory:', process.cwd());
    console.log('📁 Expected Excel file path:', path.join(process.cwd(), 'data', 'historical_data.xlsx'));

    // Check if file exists
    const fs = require('fs');
    const filePath = path.join(process.cwd(), 'data', 'historical_data.xlsx');
    console.log('📊 File exists:', fs.existsSync(filePath));

    if (fs.existsSync(filePath)) {
      console.log('📊 File size:', fs.statSync(filePath).size, 'bytes');
    }

    // Try to import and test the historical data utilities
    console.log('\n🧪 Testing Excel reading...');

    try {
      const XLSX = require('xlsx');
      const workbook = XLSX.readFile(filePath);
      console.log('✅ Excel file loaded successfully');
      console.log('📋 Sheets:', workbook.SheetNames);

      const worksheet = workbook.Sheets['External'];
      if (worksheet) {
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('📊 Rows in External sheet:', jsonData.length);
        console.log('📊 First few rows:');
        jsonData.slice(0, 3).forEach((row, i) => {
          console.log(`  Row ${i + 1}:`, row);
        });
      }
    } catch (xlsxError) {
      console.error('❌ Excel reading error:', xlsxError.message);
    }

    // Test the historical data tool execution
    console.log('\n🧪 Testing tool execution...');
    try {
      const { executeHistoricalDataTool } = await import('../lib/tools/historical-data/execute.js');

      console.log('⏳ Testing: Gold last 5 months...');
      const result1 = await executeHistoricalDataTool('XAU', undefined, undefined, 'last 5 months');
      console.log('Result 1:', JSON.stringify(result1, null, 2));

    } catch (toolError) {
      console.error('❌ Tool execution error:', toolError);
      console.error('Stack:', toolError.stack);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    // Restore original cwd
    process.cwd = originalCwd;
  }
}

debugHistoricalTool();