// Calculation Tool Execution
// Safe mathematical expression evaluation

export interface CalculationResult {
  success: boolean;
  data?: {
    expression: string;
    result: number;
    description: string;
    formattedResult: string;
  };
  error?: string;
}

/**
 * Safely evaluates a mathematical expression
 * Only allows basic arithmetic operations: +, -, *, /, (, ), numbers, and decimals
 */
function safeEvaluate(expression: string): number {
  // Remove whitespace
  const cleaned = expression.replace(/\s+/g, '');

  // Validate that expression only contains allowed characters
  const allowedChars = /^[0-9+\-*/.()]+$/;
  if (!allowedChars.test(cleaned)) {
    throw new Error('Expression contains invalid characters. Only numbers and operators (+, -, *, /, parentheses) are allowed.');
  }

  // Check for balanced parentheses
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

  // Check for consecutive operators (except for negative numbers)
  const invalidOperators = /[+\-*\/]{2,}(?![0-9])/;
  if (invalidOperators.test(cleaned)) {
    throw new Error('Invalid operator sequence');
  }

  try {
    // Use Function constructor for safe evaluation (safer than eval)
    // This creates a sandboxed function that only evaluates the expression
    const result = Function(`'use strict'; return (${cleaned})`)();

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Calculation resulted in invalid number');
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to evaluate expression: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format the result with appropriate precision and thousands separators
 */
function formatResult(value: number): string {
  // For very large or very small numbers, use exponential notation
  if (Math.abs(value) >= 1e6 || (Math.abs(value) < 0.01 && value !== 0)) {
    return value.toExponential(4);
  }

  // For regular numbers, use up to 4 decimal places
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  });

  return formatted;
}

export async function executeCalculationTool(
  expression: string,
  description: string
): Promise<CalculationResult> {
  try {
    console.log('🧮 Calculation Tool - Input:', { expression, description });

    // Validate inputs
    if (!expression || expression.trim().length === 0) {
      return {
        success: false,
        error: 'Expression cannot be empty'
      };
    }

    if (!description || description.trim().length === 0) {
      return {
        success: false,
        error: 'Description cannot be empty'
      };
    }

    // Evaluate the expression
    const result = safeEvaluate(expression);
    const formattedResult = formatResult(result);

    console.log('✅ Calculation successful:', { expression, result, formattedResult });

    return {
      success: true,
      data: {
        expression: expression.trim(),
        result,
        description: description.trim(),
        formattedResult
      }
    };

  } catch (error) {
    console.error('❌ Calculation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during calculation'
    };
  }
}
