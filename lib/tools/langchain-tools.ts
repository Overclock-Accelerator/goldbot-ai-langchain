// ============================================================================
// LANGCHAIN TOOLS REGISTRY
// ============================================================================
//
// This file contains all LangChain-formatted tool wrappers for the GoldBot AI
// application. Each tool wraps an existing execute function with LangChain's
// `tool()` helper and Zod schema validation.
//
// ARCHITECTURE:
// - Execute functions remain framework-agnostic (no changes)
// - This file provides LangChain-specific wrappers
// - Tools are exported in priority order for agent use
//
// ============================================================================

import { tool } from "langchain";
import { z } from "zod";

// Import all execute functions (framework-agnostic)
import { executeWeightValueTool } from './weight-value/execute';
import { executeSpotPriceTool } from './spot-price/execute';
import { executeHistoricalDataTool } from './historical-data/execute';
import { executeWebSearchTool } from './web-search/execute';
import { executeCalculationTool } from './calculation/execute';
import { executeTimeChartDataTool } from './time-chart-data/execute';

// ============================================================================
// TOOL 1: Weight Value Tool (PRIMARY)
// ============================================================================
// Calculates the current value of a specific weight of precious metal.
// This is the PRIMARY tool for weight-based value queries.
//
export const weightValueTool = tool(
  async ({ metal, weight, unit, karat, currency = "USD" }) => {
    const result = await executeWeightValueTool(metal, weight, unit, karat, currency);
    return JSON.stringify(result);
  },
  {
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
    schema: z.object({
      metal: z.enum(["XAU", "XAG", "XPT", "XPD"]).describe("The metal symbol to value"),
      weight: z.number().describe("The weight/amount of the metal (e.g., 15, 24, 100)"),
      unit: z.enum(["grams", "g", "ounces", "oz", "troy_ounces"]).describe("The unit of weight"),
      karat: z.enum(["24k", "22k", "21k", "20k", "18k", "16k", "14k", "10k"]).optional().describe("For gold only: the karat purity. If not specified, defaults to 24k."),
      currency: z.string().default("USD").describe("The currency for pricing (defaults to USD)")
    })
  }
);

// ============================================================================
// TOOL 2: Spot Price Tool
// ============================================================================
// Gets current market spot price for precious metals.
// Use when NO weight is mentioned in the query.
//
export const spotPriceTool = tool(
  async ({ metal, currency = "USD" }) => {
    const result = await executeSpotPriceTool(metal, currency);
    return JSON.stringify(result);
  },
  {
    name: "get_spot_price",
    description: `Get the current spot price for precious metals. Use when NO weight is mentioned.

Use this tool when users ask:
- "What's the gold price?"
- "Current silver spot price?"
- "How much is gold trading at?"
- "What's the price of platinum today?"

DO NOT use this for weight-based queries like "How much is 10g worth?" - use get_weight_value instead.`,
    schema: z.object({
      metal: z.enum(["XAU", "XAG", "XPT", "XPD"]).describe("The metal symbol (XAU=gold, XAG=silver, XPT=platinum, XPD=palladium)"),
      currency: z.string().default("USD").describe("The currency code for pricing (defaults to USD)")
    })
  }
);

// ============================================================================
// TOOL 3: Historical Data Tool
// ============================================================================
// Analyzes price trends and historical data over time periods.
//
export const historicalDataTool = tool(
  async ({ metal, startDate, endDate, relativePeriod }) => {
    const result = await executeHistoricalDataTool(metal, startDate, endDate, relativePeriod);
    return JSON.stringify(result);
  },
  {
    name: "get_historical_data",
    description: `Get historical price data and trends for precious metals over a time period.

Use this tool when users ask about:
- Price trends over time ("gold prices last 6 months")
- Historical performance ("how has silver performed this year?")
- Price changes over periods ("platinum price changes last week")

You can specify either:
- Absolute dates (startDate, endDate in YYYY-MM-DD format)
- Relative periods (relativePeriod: "1w", "1m", "3m", "6m", "1y")`,
    schema: z.object({
      metal: z.enum(["XAU", "XAG", "XPT", "XPD"]).describe("The metal symbol"),
      startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
      relativePeriod: z.enum(["1w", "1m", "3m", "6m", "1y", "5y"]).optional().describe("Relative time period (e.g., '6m' for 6 months)")
    })
  }
);

// ============================================================================
// TOOL 4: Web Search Tool
// ============================================================================
// Searches for precious metals news and market information.
//
export const webSearchTool = tool(
  async ({ query, timeframe }) => {
    const result = await executeWebSearchTool(query, timeframe);
    return JSON.stringify(result);
  },
  {
    name: "search_metal_news",
    description: `Search for news, articles, and information about precious metals markets.

Use this tool when users ask:
- "Latest gold news"
- "What's happening in the silver market?"
- "Recent platinum mining updates"
- "News about palladium prices"

Returns recent articles and news related to precious metals markets.`,
    schema: z.object({
      query: z.string().describe("The search query (e.g., 'gold mining news', 'silver market trends')"),
      timeframe: z.string().optional().describe("Optional timeframe filter (e.g., 'today', 'this week', 'this month')")
    })
  }
);

// ============================================================================
// TOOL 5: Calculation Tool
// ============================================================================
// Performs mathematical calculations.
//
export const calculationTool = tool(
  async ({ expression, description }) => {
    const result = await executeCalculationTool(expression, description);
    return JSON.stringify(result);
  },
  {
    name: "calculate",
    description: `Perform mathematical calculations and expressions.

Use this tool for:
- Basic arithmetic ("10% of 2000", "1500 * 1.15")
- Percentage calculations
- Unit conversions
- Any mathematical expression

The expression parameter should be a valid mathematical expression.`,
    schema: z.object({
      expression: z.string().describe("The mathematical expression to evaluate (e.g., '10 * 20', '2500 * 0.75')"),
      description: z.string().describe("A brief description of what's being calculated")
    })
  }
);

// ============================================================================
// TOOL 6: Time Chart Data Tool
// ============================================================================
// Provides time-series data for chart visualizations.
//
export const timeChartDataTool = tool(
  async ({ metals, startDate, endDate, relativePeriod, currency = "USD", dataPoints = 30 }) => {
    const result = await executeTimeChartDataTool(metals, startDate, endDate, relativePeriod, currency, dataPoints);
    return JSON.stringify(result);
  },
  {
    name: "get_time_chart_data",
    description: `Get time-series data formatted for chart visualization.

Use this tool when users explicitly request:
- "Chart gold prices over last year"
- "Show me a graph of silver prices"
- "Visualize platinum trends"

This provides structured data that the frontend can use to render charts.`,
    schema: z.object({
      metals: z.array(z.enum(["XAU", "XAG", "XPT", "XPD"])).describe("Array of metal symbols to include in chart"),
      startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
      relativePeriod: z.enum(["1w", "1m", "3m", "6m", "1y"]).optional().describe("Relative time period"),
      currency: z.string().default("USD").describe("Currency code for pricing"),
      dataPoints: z.number().default(30).describe("Number of data points to return (default: 30)")
    })
  }
);

// ============================================================================
// ALL LANGCHAIN TOOLS ARRAY
// ============================================================================
// Export in priority order for agent tool selection.
// The agent will consider tools in this order when deciding which to use.
//
export const allLangChainTools = [
  weightValueTool,      // Priority 1: Weight-based value queries
  spotPriceTool,        // Priority 2: Current spot prices
  historicalDataTool,   // Priority 3: Price trends and history
  webSearchTool,        // Priority 4: News and market information
  calculationTool,      // Priority 5: Mathematical operations
  timeChartDataTool     // Priority 6: Chart visualization data
];
