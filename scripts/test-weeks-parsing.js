// Test weeks parsing in parseRelativePeriod

function parseRelativePeriod(relativePeriod) {
  const latestDataYear = 2025;
  const latestDataMonth = 9;
  const endDateExcel = `${latestDataYear}M${latestDataMonth}`;

  // Parse patterns like "10 weeks", "last 10 weeks", "past 8 weeks"
  const weeksMatch = relativePeriod.match(/(?:last|past|)\s*(\d+)\s*weeks?/i);
  if (weeksMatch) {
    const weeksBack = parseInt(weeksMatch[1]);
    const monthsBack = Math.round(weeksBack / 4.33);
    let startYear = latestDataYear;
    let startMonth = latestDataMonth - monthsBack;

    // Handle month overflow
    while (startMonth <= 0) {
      startMonth += 12;
      startYear -= 1;
    }

    return {
      startDate: `${startYear}M${startMonth}`,
      endDate: endDateExcel,
      weeksBack,
      monthsBack
    };
  }

  throw new Error(`Unable to parse: ${relativePeriod}`);
}

// Test cases
const testCases = [
  'last 10 weeks',
  '10 weeks',
  'past 10 weeks',
  'last 4 weeks',
  'last 8 weeks',
  'last 12 weeks',
  'last 26 weeks',
  'last 52 weeks'
];

console.log('Testing weeks parsing:\n');
testCases.forEach(testCase => {
  try {
    const result = parseRelativePeriod(testCase);
    console.log(`✅ "${testCase}"`);
    console.log(`   → ${result.weeksBack} weeks = ~${result.monthsBack} months`);
    console.log(`   → Date range: ${result.startDate} to ${result.endDate}\n`);
  } catch (error) {
    console.log(`❌ "${testCase}": ${error.message}\n`);
  }
});
