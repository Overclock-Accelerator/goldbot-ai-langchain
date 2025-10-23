// Test CSV Reader
// Quick test to verify CSV reading functionality

const fs = require('fs');
const path = require('path');

// Parse CSV line, handling quoted values
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Metal column mapping
const METAL_COLUMNS = {
  'XAU': 'PGOLD',
  'XAG': 'PSILVER',
  'XPT': 'PPLAT',
  'XPD': 'PPALLA'
};

function testCSVReader(metal) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'historical_data.csv');
    console.log('📂 Reading file:', filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    console.log(`📊 Total lines: ${lines.length}`);

    // Parse headers
    const headers = parseCSVLine(lines[0]);
    console.log('📋 Headers:', headers.slice(0, 5));

    const metalColumn = METAL_COLUMNS[metal];
    const columnIndex = headers.indexOf(metalColumn);

    console.log(`🔍 Looking for column: ${metalColumn}`);
    console.log(`📍 Column index: ${columnIndex}`);

    if (columnIndex === -1) {
      throw new Error(`Column ${metalColumn} not found`);
    }

    // Process first 5 data rows
    const dataRows = lines.slice(2, 7);
    console.log('\n📈 First 5 data points:');

    dataRows.forEach(line => {
      const values = parseCSVLine(line);
      const date = values[0];
      const price = parseFloat(values[columnIndex]);

      console.log(`  ${date}: $${price}`);
    });

    // Process last 5 data rows
    const lastRows = lines.slice(-5);
    console.log('\n📈 Last 5 data points:');

    lastRows.forEach(line => {
      const values = parseCSVLine(line);
      const date = values[0];
      const price = parseFloat(values[columnIndex]);

      console.log(`  ${date}: $${price}`);
    });

    console.log('\n✅ CSV reading test passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Test all metals
console.log('Testing CSV reader for all metals:\n');
['XAU', 'XAG', 'XPT', 'XPD'].forEach(metal => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing ${metal} (${METAL_COLUMNS[metal]})`);
  console.log('='.repeat(50));
  testCSVReader(metal);
});
