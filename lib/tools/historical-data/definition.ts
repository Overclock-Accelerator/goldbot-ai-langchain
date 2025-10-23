// Historical Data Tool Definition
// This tool analyzes historical precious metals price data over time periods

export const historicalDataToolDefinition = {
  name: "get_historical_data",
  description: "Analyze historical precious metals price changes over specific date ranges or relative time periods. Use this when users ask about price changes between dates, trends over months/years, or comparative analysis.",
  input_schema: {
    type: "object" as const,
    properties: {
      metal: {
        type: "string" as const,
        description: "The metal to analyze",
        enum: ["XAU", "XAG", "XPT", "XPD"]
      },
      startDate: {
        type: "string" as const,
        description: "Start date in format YYYY-MM or relative like '5 months ago' (optional if using relativePeriod)"
      },
      endDate: {
        type: "string" as const,
        description: "End date in format YYYY-MM or 'now' for current data (optional if using relativePeriod)"
      },
      relativePeriod: {
        type: "string" as const,
        description: "Relative time period like 'last 10 weeks', 'last 5 months', 'past year', '6 months' (alternative to specific dates). Supports weeks, months, and years."
      }
    },
    required: ["metal"],
    additionalProperties: false
  }
};