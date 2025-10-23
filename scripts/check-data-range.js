// Check the data range in the Excel file
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'historical_data.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets['External'];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('📊 Data Range Analysis');
  console.log('='.repeat(50));

  console.log('📊 Total rows:', jsonData.length);
  console.log('📊 First data row (after headers):', jsonData[2]);
  console.log('📊 Last data row:', jsonData[jsonData.length - 1]);

  // Extract all dates
  const dates = [];
  for (let i = 2; i < jsonData.length; i++) {
    if (jsonData[i] && jsonData[i][0]) {
      dates.push(jsonData[i][0]);
    }
  }

  console.log('📅 Date range:');
  console.log('  First date:', dates[0]);
  console.log('  Last date:', dates[dates.length - 1]);
  console.log('  Total data points:', dates.length);

  // Show last 10 dates
  console.log('📅 Last 10 dates in dataset:');
  dates.slice(-10).forEach((date, i) => {
    console.log(`  ${dates.length - 10 + i + 1}: ${date}`);
  });

} catch (error) {
  console.error('❌ Error:', error.message);
}