// Spot Price Tool Definition
// This file defines the tool that Claude can use to get precious metals pricing

export const spotPriceToolDefinition = {
  name: "get_spot_price",
  description: "Get the current spot price for precious metals like gold, silver, platinum, and palladium. Use this when users ask about current prices, spot prices, or metal values.",
  input_schema: {
    type: "object" as const,
    properties: {
      metal: {
        type: "string" as const,
        description: "The metal symbol to get the price for",
        enum: ["XAU", "XAG", "XPT", "XPD"]
      },
      currency: {
        type: "string" as const,
        description: "Currency for the price (default: USD)",
        default: "USD"
      }
    },
    required: ["metal"]
  }
};