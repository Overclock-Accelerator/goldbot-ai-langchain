// Weight Value Tool Definition
// This tool calculates the value of a specific weight of precious metal

export const weightValueToolDefinition = {
  name: "get_weight_value",
  description: `Calculate the current value of a specific weight/amount of precious metal.

PRIMARY USE CASE - Use this tool when users ask:
- "How much is [X]g/oz/kg of [metal] worth?"
- "What's the value of [X] grams of [metal]?"
- "How much is my [X]g of [karat] gold worth?"
- "Calculate the value of [X] ounces of silver"
- Any variation asking for the monetary value of a specific weight of metal

This tool will:
1. Automatically fetch the current spot price for the metal
2. Use the appropriate price per unit (price_gram_24k, price_gram_18k, etc.)
3. Calculate the total value (weight × price)
4. Return the complete result with breakdown

DO NOT use get_spot_price + calculate separately for these queries. Use this tool instead.`,
  input_schema: {
    type: "object" as const,
    properties: {
      metal: {
        type: "string" as const,
        description: "The metal symbol to value",
        enum: ["XAU", "XAG", "XPT", "XPD"]
      },
      weight: {
        type: "number" as const,
        description: "The weight/amount of the metal (e.g., 15, 24, 100)"
      },
      unit: {
        type: "string" as const,
        description: "The unit of weight",
        enum: ["grams", "g", "ounces", "oz", "troy_ounces"]
      },
      karat: {
        type: "string" as const,
        description: "For gold only: the karat purity (24k, 22k, 21k, 20k, 18k, 16k, 14k, 10k). If not specified, defaults to 24k.",
        enum: ["24k", "22k", "21k", "20k", "18k", "16k", "14k", "10k"]
      },
      currency: {
        type: "string" as const,
        description: "The currency for pricing (defaults to USD)"
      }
    },
    required: ["metal", "weight", "unit"],
    additionalProperties: false
  }
};
