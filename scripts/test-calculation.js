// Test Calculation Tool
// Verify the calculation tool works correctly with various expressions

const testCases = [
  {
    expression: '24 * 131.6689',
    description: 'Calculate value of 24g of gold at $131.67/gram',
    expected: 3160.0536
  },
  {
    expression: '100 / 31.1035',
    description: 'Convert 100 grams to troy ounces',
    expected: 3.2151
  },
  {
    expression: '(2500 - 2000) / 2000 * 100',
    description: 'Calculate percentage change from $2000 to $2500',
    expected: 25
  },
  {
    expression: '50 * 0.9999 * 2500 / 31.1035',
    description: 'Value of 50g of .9999 gold at $2500/oz',
    expected: 4018.39
  },
  {
    expression: '(3666.52 - 3341.65) / 3341.65 * 100',
    description: 'Gold percentage increase',
    expected: 9.7218
  },
  {
    expression: '1000000 * 2',
    description: 'Large number calculation',
    expected: 2000000
  },
  {
    expression: '0.001 * 0.001',
    description: 'Small number calculation',
    expected: 0.000001
  }
];

// Safe evaluation function (copied from execute.ts logic)
function safeEvaluate(expression) {
  const cleaned = expression.replace(/\s+/g, '');
  const allowedChars = /^[0-9+\-*/.()]+$/;

  if (!allowedChars.test(cleaned)) {
    throw new Error('Expression contains invalid characters');
  }

  let parenCount = 0;
  for (const char of cleaned) {
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (parenCount < 0) {
      throw new Error('Unbalanced parentheses');
    }
  }
  if (parenCount !== 0) {
    throw new Error('Unbalanced parentheses');
  }

  try {
    const result = Function(`'use strict'; return (${cleaned})`)();
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Calculation resulted in invalid number');
    }
    return result;
  } catch (error) {
    throw new Error(`Failed to evaluate: ${error.message}`);
  }
}

function formatResult(value) {
  if (Math.abs(value) >= 1e6 || (Math.abs(value) < 0.01 && value !== 0)) {
    return value.toExponential(4);
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  });
}

console.log('Testing Calculation Tool:\n');
console.log('='.repeat(70));

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.description}`);
  console.log(`Expression: ${testCase.expression}`);

  try {
    const result = safeEvaluate(testCase.expression);
    const formatted = formatResult(result);

    // Check if result is close to expected (within 0.01)
    const isClose = Math.abs(result - testCase.expected) < 0.01;

    if (isClose) {
      console.log(`✅ Result: ${formatted} (${result})`);
      passCount++;
    } else {
      console.log(`❌ Result: ${formatted} (${result})`);
      console.log(`   Expected: ${testCase.expected}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    failCount++;
  }
});

console.log('\n' + '='.repeat(70));
console.log(`\nResults: ${passCount} passed, ${failCount} failed`);

// Test invalid expressions
console.log('\n\nTesting Invalid Expressions:\n');
console.log('='.repeat(70));

const invalidCases = [
  { expr: 'alert(1)', desc: 'JavaScript function call' },
  { expr: '1; alert(1)', desc: 'Multiple statements' },
  { expr: 'Math.random()', desc: 'Math object access' },
  { expr: '((1+2)', desc: 'Unbalanced parentheses' },
  { expr: '1++2', desc: 'Invalid operator' },
  { expr: '', desc: 'Empty expression' }
];

invalidCases.forEach((testCase, index) => {
  console.log(`\nInvalid Test ${index + 1}: ${testCase.desc}`);
  console.log(`Expression: "${testCase.expr}"`);

  try {
    const result = safeEvaluate(testCase.expr || 'invalid');
    console.log(`❌ Should have failed but got: ${result}`);
  } catch (error) {
    console.log(`✅ Correctly rejected: ${error.message}`);
  }
});

console.log('\n' + '='.repeat(70));
