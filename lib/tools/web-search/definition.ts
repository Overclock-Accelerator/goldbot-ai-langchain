// Web Search Tool Definition
// This file defines the tool that Claude can use to search for news and information about precious metals

export const webSearchToolDefinition = {
  name: "search_metal_news",
  description: "Search for news, events, and information about precious metals. Use this when users ask about news, events affecting prices, market analysis, or historical events related to gold, silver, platinum, or palladium. Particularly useful for understanding price movements, market trends, or recent developments.",
  input_schema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string" as const,
        description: "The search query. Should include the metal name and relevant keywords like 'price', 'news', 'events', time periods, etc."
      },
      timeframe: {
        type: "string" as const,
        description: "Optional timeframe for the search (e.g., 'last 10 months', 'past year', '2024'). This helps focus the search on recent or specific time periods.",
      }
    },
    required: ["query"]
  }
};
