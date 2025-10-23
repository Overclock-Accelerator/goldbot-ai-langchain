// Web Search Tool Execution
// This file contains the logic for searching the web for precious metals news and information

import Anthropic from '@anthropic-ai/sdk';

export interface WebSearchResult {
  success: boolean;
  data?: {
    query: string;
    results: string;
    sources?: string[];
    timestamp: string;
  };
  error?: string;
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function executeWebSearchTool(
  query: string,
  timeframe?: string
): Promise<WebSearchResult> {
  try {
    // Enhance the query with timeframe if provided
    const enhancedQuery = timeframe
      ? `${query} ${timeframe}`
      : query;

    console.log('Executing web search with query:', enhancedQuery);

    // Use Anthropic's web search capability with extended thinking
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      thinking: {
        type: 'enabled',
        budget_tokens: 3000
      },
      system: `You are a research assistant specializing in precious metals markets.
Your task is to search for and summarize relevant information about precious metals news, events, and market developments.

When providing results:
- Focus on factual, verifiable information
- Include specific dates and data points when available
- Mention key events that could impact prices
- Cite sources when possible (URLs if available)
- Be concise but comprehensive
- If searching for historical events, prioritize relevance to the time period requested
- Organize information chronologically when relevant`,
      messages: [
        {
          role: 'user',
          content: `Search for information about: ${enhancedQuery}\n\nProvide a comprehensive summary of the most relevant information, focusing on events, news, and factors that could affect precious metals prices. Include dates and sources where available.`
        }
      ],
      tools: [{
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5
      }]
    });

    // Extract text from response and look for sources
    let resultText = '';
    let sources: string[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        resultText += block.text;
        // Extract URLs from the text as sources
        const urlRegex = /https?:\/\/[^\s\)]+/g;
        const urls = block.text.match(urlRegex);
        if (urls) {
          sources.push(...urls);
        }
      }
    }

    return {
      success: true,
      data: {
        query: enhancedQuery,
        results: resultText,
        sources: [...new Set(sources)], // Remove duplicates
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Web search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during web search'
    };
  }
}
