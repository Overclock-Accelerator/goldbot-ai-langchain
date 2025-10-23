// Calculation Tool Definition
// This tool performs mathematical calculations for precious metals valuations

export const calculationToolDefinition = {
  name: "calculate",
  description: `Perform mathematical calculations for precious metals valuations, conversions, and comparisons.

REQUIRED USE CASES - You MUST use this tool when:
1. User asks "how much is [amount] of [metal] worth?" (e.g., "how much is 15g of 18k gold worth?")
2. User asks "what is [amount] of [metal] valued at?" (e.g., "what is 50 grams of silver valued at?")
3. User wants to know the total value of a specific weight/quantity of metal
4. Any question involving multiplying weight by price per unit
5. Converting between units (grams to ounces, etc.)
6. Calculating percentage changes or differences in prices
7. ANY arithmetic operation, no matter how simple

WORKFLOW: After getting the price from get_spot_price, use this tool to multiply weight × price_per_gram.
Example: For "15g of 18k gold", call calculate("15 * 98.7517", "Calculate value of 15g of 18k gold")`,
  input_schema: {
    type: "object" as const,
    properties: {
      expression: {
        type: "string" as const,
        description: "The mathematical expression to evaluate. Examples: '15 * 98.7517' (multiply weight by price), '24 * 131.6689' (24g of gold), '100 / 31.1035' (convert grams to troy ounces), '(2500 - 2000) / 2000 * 100' (percentage change). Supports operators: +, -, *, /, (, ), and decimals."
      },
      description: {
        type: "string" as const,
        description: "A human-readable description of what this calculation represents. Examples: 'Calculate value of 15g of 18k gold at $98.75/gram', 'Calculate value of 24g of 24k gold', 'Convert 100 grams to troy ounces', 'Calculate percentage increase from $2000 to $2500'"
      }
    },
    required: ["expression", "description"],
    additionalProperties: false
  }
};
