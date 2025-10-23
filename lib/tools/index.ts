// Tools Index
// This file exports all available tools for the LLM system

// Weight Value Tool (Primary tool for "how much is X worth" queries)
export * from './weight-value';

// Spot Price Tool
export * from './spot-price';

// Historical Data Tool
export * from './historical-data';

// Web Search Tool
export * from './web-search';

// Calculation Tool
export * from './calculation';

// Time Chart Data Tool
export * from './time-chart-data';

// Import all tool definitions for easy access
import { weightValueToolDefinition } from './weight-value';
import { spotPriceToolDefinition } from './spot-price';
import { historicalDataToolDefinition } from './historical-data';
import { webSearchToolDefinition } from './web-search';
import { calculationToolDefinition } from './calculation';
import { timeChartDataToolDefinition } from './time-chart-data';

// Array of all available tool definitions (for easy iteration)
// NOTE: weightValueToolDefinition is first to prioritize it for valuation queries
export const allToolDefinitions = [
  weightValueToolDefinition,
  spotPriceToolDefinition,
  historicalDataToolDefinition,
  webSearchToolDefinition,
  calculationToolDefinition,
  timeChartDataToolDefinition
];

// Tool registry for dynamic tool execution
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

// Helper to get tool definition by name
export function getToolDefinition(toolName: string) {
  return allToolDefinitions.find(tool => tool.name === toolName);
}