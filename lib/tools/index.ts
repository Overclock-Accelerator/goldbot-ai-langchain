// ============================================================================
// TOOLS INDEX - Central Registry of All Available Tools
// ============================================================================
//
// This file serves as the central hub for all LLM tools in the application.
// It exports all tool definitions and execution functions, making them easy
// to import elsewhere in the codebase.
//
// ARCHITECTURE NOTE:
// Each tool is organized in its own directory with two key files:
// 1. definition.ts - Describes the tool to the LLM
// 2. execute.ts   - Implements the tool's actual functionality
//
// This separation of concerns makes tools:
// - Easy to understand (definition vs implementation)
// - Easy to test (mock execution while testing orchestration)
// - Easy to maintain (change implementation without touching definition)
//
// ============================================================================

// ============================================================================
// Export All Tools
// ============================================================================
// Re-export everything from each tool module so they can be imported from
// this single index file: import { spotPriceToolDefinition } from '@/lib/tools'
//

// Weight Value Tool - Calculates value of a specific weight of metal
export * from './weight-value';

// Spot Price Tool - Gets current market price for a metal
export * from './spot-price';

// Historical Data Tool - Analyzes price trends over time
export * from './historical-data';

// Web Search Tool - Searches for news and market information
export * from './web-search';

// Calculation Tool - Performs mathematical calculations
export * from './calculation';

// Time Chart Data Tool - Provides time-series data for visualizations
export * from './time-chart-data';

// ============================================================================
// Import Tool Definitions for Convenience Arrays
// ============================================================================
// Import all the definitions so we can create convenient arrays and registries
//
import { weightValueToolDefinition } from './weight-value';
import { spotPriceToolDefinition } from './spot-price';
import { historicalDataToolDefinition } from './historical-data';
import { webSearchToolDefinition } from './web-search';
import { calculationToolDefinition } from './calculation';
import { timeChartDataToolDefinition } from './time-chart-data';

// ============================================================================
// All Tool Definitions Array
// ============================================================================
// A convenient array of all tool definitions that can be passed directly to
// the LLM. This is used in anthropic-service.ts when making LLM calls.
//
// NOTE: Order can matter! In this case, weightValueToolDefinition is first
// to signal its priority for value-related queries.
//
export const allToolDefinitions = [
  weightValueToolDefinition,
  spotPriceToolDefinition,
  historicalDataToolDefinition,
  webSearchToolDefinition,
  calculationToolDefinition,
  timeChartDataToolDefinition
];

// ============================================================================
// Tool Registry: Dynamic Tool Execution (Optional Pattern)
// ============================================================================
// This registry provides an alternative way to execute tools dynamically
// by tool name, without needing a large if/else block.
//
// USAGE EXAMPLE:
//   const toolFn = toolRegistry['get_spot_price'];
//   const result = await toolFn('XAU', 'USD');
//
// This pattern is useful for:
// - Cleaner code when you have many tools
// - Dynamic tool loading
// - Testing and mocking
//
// NOTE: The main anthropic-service.ts file uses explicit if/else for clarity,
// but this registry could be used as an alternative approach.
//
export const toolRegistry = {
  'get_weight_value': async (metal: string, weight: number, unit: string, karat?: string, currency?: string) => {
    const { executeWeightValueTool } = await import('./weight-value');
    return executeWeightValueTool(metal, weight, unit, karat, currency);
  },
  'get_spot_price': async (metal: string, currency?: string) => {
    const { executeSpotPriceTool } = await import('./spot-price');
    return executeSpotPriceTool(metal, currency);
  },
  'get_historical_data': async (metal: string, startDate?: string, endDate?: string, relativePeriod?: string) => {
    const { executeHistoricalDataTool } = await import('./historical-data');
    return executeHistoricalDataTool(metal, startDate, endDate, relativePeriod);
  },
  'search_metal_news': async (query: string, timeframe?: string) => {
    const { executeWebSearchTool } = await import('./web-search');
    return executeWebSearchTool(query, timeframe);
  },
  'calculate': async (expression: string, description: string) => {
    const { executeCalculationTool } = await import('./calculation');
    return executeCalculationTool(expression, description);
  },
  'get_time_chart_data': async (metals: string[], startDate?: string, endDate?: string, relativePeriod?: string, currency?: string, dataPoints?: number) => {
    const { executeTimeChartDataTool } = await import('./time-chart-data');
    return executeTimeChartDataTool(metals, startDate, endDate, relativePeriod, currency, dataPoints);
  }
};

// ============================================================================
// Helper Function: Get Tool Definition by Name
// ============================================================================
// Utility function to look up a tool definition by its name.
// Useful for debugging, logging, or dynamic tool discovery.
//
export function getToolDefinition(toolName: string) {
  return allToolDefinitions.find(tool => tool.name === toolName);
}