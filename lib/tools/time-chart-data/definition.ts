// Time Chart Data Tool Definition
// This tool provides chart-ready data for visualizing precious metals price trends over time

export const timeChartDataToolDefinition = {
  name: "get_time_chart_data",
  description: "Get chart-ready time series data for visualizing precious metals price trends. Use this when users ask to chart, graph, visualize, plot, or see trends in metal prices over time. Can return data for one or multiple metals for comparison.",
  input_schema: {
    type: "object" as const,
    properties: {
      metals: {
        type: "array" as const,
        items: {
          type: "string" as const,
          enum: ["XAU", "XAG", "XPT", "XPD"]
        },
        description: "Array of metal symbols to chart (e.g., ['XAU', 'XAG'] for gold and silver comparison)",
        minItems: 1,
        maxItems: 4
      },
      startDate: {
        type: "string" as const,
        description: "Start date in YYYY-MM format (e.g., '2024-01')",
      },
      endDate: {
        type: "string" as const,
        description: "End date in YYYY-MM format (e.g., '2024-12'). Defaults to current month if not specified."
      },
      relativePeriod: {
        type: "string" as const,
        description: "Relative time period instead of specific dates (e.g., 'last 3 months', 'past year', 'last 6 months'). Use this when users ask for recent periods.",
      },
      currency: {
        type: "string" as const,
        description: "Currency for prices (default: USD)",
        default: "USD"
      },
      dataPoints: {
        type: "number" as const,
        description: "Approximate number of data points to return (default: 12 for monthly). More points = more granular chart.",
        default: 12
      }
    },
    required: ["metals"]
  }
};
