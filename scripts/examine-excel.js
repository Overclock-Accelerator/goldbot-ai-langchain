// Script to examine the Excel file structure
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'historical_data.xlsx');

try {
  const workbook = XLSX.readFile(filePath);

  console.log('📊 Excel File Analysis');
  console.log('='.repeat(50));

  console.log('\n📋 Sheet Names:', workbook.SheetNames);

  // Examine each sheet
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n🔍 Sheet: ${sheetName}`);
    console.log('-'.repeat(30));

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Show first few rows
    console.log('📝 First 5 rows:');
    jsonData.slice(0, 5).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);
    });

    console.log(`📊 Total rows: ${jsonData.length}`);

    // Show column headers if available
    if (jsonData.length > 0) {
      console.log('🏷️ Columns:', jsonData[0]);
    }
  });

} catch (error) {
  console.error('❌ Error reading Excel file:', error.message);
}