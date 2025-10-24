// ============================================================================
// TOOL DEFINITION: Spot Price Tool
// ============================================================================
//
// This file defines how the tool is described to the LLM.
// The LLM reads this definition to understand:
// - What the tool does
// - When to use it
// - What parameters it needs
// - What values are valid for each parameter
//
// IMPORTANT: The LLM never sees the execution code - only this definition!
//
// ============================================================================

export const spotPriceToolDefinition = {
  // ========================================================================
  // Tool Name: Unique identifier for this tool
  // ========================================================================
  // This is how the LLM will reference the tool in its responses.
  // Use descriptive, action-oriented names like "get_X", "search_Y", etc.
  //
  name: "get_spot_price",
  
  // ========================================================================
  // Tool Description: When and how to use this tool
  // ========================================================================
  // This is your chance to guide the LLM on:
  // - What the tool does
  // - When it should be used
  // - What kind of queries it's good for
  //
  // Be specific! The clearer your description, the better the LLM will use it.
  //
  description: "Get the current spot price for precious metals like gold, silver, platinum, and palladium. Use this when users ask about current prices, spot prices, or metal values.",
  
  // ========================================================================
  // Input Schema: What parameters does this tool accept?
  // ========================================================================
  // Define the structure and types of parameters the tool needs.
  // The LLM will use this schema to provide properly formatted parameters.
  //
  // This follows JSON Schema format with types, descriptions, enums, etc.
  //
  input_schema: {
    type: "object" as const,
    properties: {
      // Metal parameter: Which metal to get the price for
      metal: {
        type: "string" as const,
        description: "The metal symbol to get the price for",
        enum: ["XAU", "XAG", "XPT", "XPD"]  // Restrict to valid values
      },
      // Currency parameter: What currency to return the price in
      currency: {
        type: "string" as const,
        description: "Currency for the price (default: USD)",
        default: "USD"
      }
    },
    required: ["metal"]  // Only metal is required, currency is optional
  }
};