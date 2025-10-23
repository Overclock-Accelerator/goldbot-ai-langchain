import Anthropic from '@anthropic-ai/sdk';
import {
  weightValueToolDefinition,
  executeWeightValueTool,
  spotPriceToolDefinition,
  executeSpotPriceTool,
  historicalDataToolDefinition,
  executeHistoricalDataTool,
  webSearchToolDefinition,
  executeWebSearchTool,
  calculationToolDefinition,
  executeCalculationTool,
  timeChartDataToolDefinition,
  executeTimeChartDataTool
} from '@/lib/tools';

// Validate API key
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper to check if a tool requires streaming (like web search)
function shouldStreamTool(toolName: string): boolean {
  return toolName === 'search_metal_news';
}

// Main function to process chat with LLM and tool calling
export async function processChatWithLLM(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []) {
  try {
    console.log('Starting LLM processing for message:', userMessage);
    // Prepare messages including conversation history
    const messages: Anthropic.Messages.MessageParam[] = [
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    // Call Claude with tool capability
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      system: `You are GoldBot AI, a chat-based assistant specializing in precious metals pricing and information.

You have access to tools that can:
1. Calculate the value of a specific weight of metal (get_weight_value) - PRIMARY TOOL for weight-based queries
2. Fetch current spot prices for precious metals (get_spot_price)
3. Analyze historical price data and trends (get_historical_data)
4. Search for news, events, and market information about precious metals (search_metal_news)
5. Perform mathematical calculations (calculate) - Use only for non-weight calculations
6. Get time-series chart data for visualizing price trends (get_time_chart_data) - Use when users ask to chart, graph, plot, or visualize price trends

PRIORITY TOOL SELECTION:

PRIMARY RULE - When user mentions ANY weight or amount:
- If the message contains weight values (e.g., "15g", "24 grams", "100 oz", "5 kilos", "3 ounces")
- ALWAYS use get_weight_value tool FIRST - it handles price fetching AND calculation automatically
- Example: get_weight_value(metal="XAU", weight=15, unit="g", karat="18k")
- This tool provides the complete answer in one call - no need for additional tools

SECONDARY RULES - Other queries:
- get_spot_price: Use ONLY when user asks for current price without mentioning weight (e.g., "what's the price of gold?")
- get_historical_data: Analyze price changes over time periods
- search_metal_news: Search for news and market information
- calculate: Use for mathematical operations NOT involving weight values (e.g., comparing percentages, other calculations)
- get_time_chart_data: Use when users want to see visual price trends (e.g., "chart gold prices", "show me a graph of silver over the last year")

TOOL PRIORITY ORDER:
1. If weight mentioned → use get_weight_value (handles everything)
2. If no weight, just asking price → use get_spot_price
3. For charting/graphing/visualizing → use get_time_chart_data
4. For historical analysis → use get_historical_data
5. For news/events → use search_metal_news
6. For other math → use calculate

IMPORTANT: When calling any tool, always use these exact symbols:
- Gold: XAU
- Silver: XAG
- Platinum: XPT
- Palladium: XPD

Users may refer to metals by common names (gold, silver, etc.) or chemical symbols (Au, Ag, etc.), but you must always convert these to the correct API symbols above when making tool calls.

After getting the data from the tool, provide a helpful, informative response that includes:
- The current price/value with proper formatting
- Any price changes if available
- Brief context about what the price represents
- Reference the metal by the name the user used, not the symbol

Be conversational and helpful. But try not to offer excessive commentary or advice that is not directly relevant to the user's question. If users ask about topics beyond precious metals pricing, politely explain your specialization but try to be as helpful as possible within your domain.`,
      messages,
      tools: [weightValueToolDefinition, spotPriceToolDefinition, historicalDataToolDefinition, webSearchToolDefinition, calculationToolDefinition, timeChartDataToolDefinition]
    });

    // Handle tool use in the response
    if (response.content.some(block => block.type === 'tool_use')) {
      const toolResults = [];
      const toolsUsed: string[] = [];

      // Process each tool use
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          let toolResult;

          // Track which tool was used
          toolsUsed.push(block.name);

          if (block.name === 'get_weight_value') {
            const { metal, weight, unit, karat, currency = 'USD' } = block.input as {
              metal: string,
              weight: number,
              unit: string,
              karat?: string,
              currency?: string
            };
            toolResult = await executeWeightValueTool(metal, weight, unit, karat, currency);
          } else if (block.name === 'get_spot_price') {
            const { metal, currency = 'USD' } = block.input as { metal: string, currency?: string };
            toolResult = await executeSpotPriceTool(metal, currency);
          } else if (block.name === 'get_historical_data') {
            const { metal, startDate, endDate, relativePeriod } = block.input as {
              metal: string,
              startDate?: string,
              endDate?: string,
              relativePeriod?: string
            };
            toolResult = await executeHistoricalDataTool(metal, startDate, endDate, relativePeriod);
          } else if (block.name === 'search_metal_news') {
            const { query, timeframe } = block.input as { query: string, timeframe?: string };
            toolResult = await executeWebSearchTool(query, timeframe);
          } else if (block.name === 'calculate') {
            const { expression, description } = block.input as { expression: string, description: string };
            toolResult = await executeCalculationTool(expression, description);
          } else if (block.name === 'get_time_chart_data') {
            const { metals, startDate, endDate, relativePeriod, currency, dataPoints } = block.input as {
              metals: string[],
              startDate?: string,
              endDate?: string,
              relativePeriod?: string,
              currency?: string,
              dataPoints?: number
            };
            toolResult = await executeTimeChartDataTool(metals, startDate, endDate, relativePeriod, currency, dataPoints);
          } else {
            toolResult = { success: false, error: `Unknown tool: ${block.name}` };
          }

          toolResults.push({
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: JSON.stringify(toolResult)
          });
        }
      }

      // If we used tools, send the results back to Claude for final response
      if (toolResults.length > 0) {
        // Check if chart tool was used
        const usedChartTool = toolsUsed.includes('get_time_chart_data');

        // Filter out thinking blocks from the assistant's content to avoid API errors
        const filteredContent = response.content.filter(block =>
          block.type === 'text' || block.type === 'tool_use'
        );

        const systemPrompt = usedChartTool
          ? `You are GoldBot AI, a helpful assistant specializing in precious metals pricing and information.

You just received chart data from the get_time_chart_data tool. The chart will be rendered visually by the UI.

IMPORTANT: Keep your response VERY brief - just 1-2 sentences providing context about what the chart shows.

DO NOT describe the data points, prices, or statistics in detail - the chart visualization will show all of that.

Examples of good responses:
- "Here's the gold price trend over the last 12 months showing a 37% increase."
- "I've charted the silver and platinum prices for 2024."
- "The chart shows how gold performed over the past year."

Remember to refer to the metal by the name the user used in their original question, not the API symbol (XAU, XAG, etc.).`
          : `You are GoldBot AI, a helpful assistant specializing in precious metals pricing and information.

You just received real-time pricing data from your tool. Format this information in a clear, helpful way for the user. Include the price, currency, and any available change information. Make the response conversational and informative.

Remember to refer to the metal by the name the user used in their original question, not the API symbol (XAU, XAG, etc.).`;

        const finalResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            ...messages,
            {
              role: 'assistant',
              content: filteredContent
            },
            {
              role: 'user',
              content: toolResults
            }
          ]
        });

        // Extract chart data if chart tool was used
        let chartData = null;
        if (usedChartTool) {
          const chartToolResult = toolResults.find(result => {
            const content = JSON.parse(result.content);
            return content.data?.dataPoints !== undefined;
          });

          if (chartToolResult) {
            const parsedResult = JSON.parse(chartToolResult.content);
            if (parsedResult.success && parsedResult.data) {
              chartData = parsedResult.data;
            }
          }
        }

        return {
          success: true,
          response: finalResponse.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join(' '),
          usedTool: true,
          toolResults,
          toolsUsed,
          chartData
        };
      }
    }

    // If no tools were used, return the direct response
    return {
      success: true,
      response: response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join(' '),
      usedTool: false
    };

  } catch (error) {
    console.error('LLM processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      response: "I'm sorry, I encountered an error processing your request. Please try again."
    };
  }
}

// Streaming version for tools that support extended thinking (like web search)
export async function* processChatWithLLMStreaming(
  userMessage: string,
  conversationHistory: Array<{role: string, content: string}> = []
) {
  try {
    console.log('Starting LLM streaming for message:', userMessage);

    // Prepare messages including conversation history
    const messages: Anthropic.Messages.MessageParam[] = [
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    // Call Claude with tool capability and streaming
    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      thinking: {
        type: 'enabled',
        budget_tokens: 3000
      },
      system: `You are GoldBot AI, a specialist assistant focused on precious metals pricing and analysis. 

You have access to tools that can:
1. Calculate the value of a specific weight of metal (get_weight_value) - PRIMARY TOOL for any weight-based queries
2. Fetch current spot prices for precious metals (get_spot_price)
3. Analyze historical price data and trends (get_historical_data)
4. Search for news, events, and market information about precious metals (search_metal_news)
5. Perform mathematical calculations (calculate) - Use only for non-weight calculations
6. Get time-series chart data for visualizing price trends (get_time_chart_data) - Use when users ask to chart, graph, plot, or visualize price trends

PRIORITY TOOL SELECTION:

PRIMARY RULE - When user mentions ANY weight or amount:
- If the message contains ANY weight values (e.g., "15g", "24 grams", "100 oz", "5 kilos", "3 ounces", "50oz")
- Questions like "how much is 15g worth?", "what's the value of 24 grams?", "how much is my 50oz?"
- ALWAYS use get_weight_value tool FIRST - it handles everything automatically
- Example: get_weight_value(metal="XAU", weight=15, unit="g", karat="18k")
- This tool fetches the price AND calculates the value in one call - DO NOT use other tools

SECONDARY RULES - Other queries:
- get_spot_price: Use ONLY when user asks for current price without mentioning weight (e.g., "what's the price of gold today?")
- get_historical_data: Analyze price changes over time periods
- search_metal_news: Search for news and market information
- calculate: Use for mathematical operations NOT involving weight values (e.g., percentage comparisons, other calculations)

TOOL PRIORITY ORDER (STRICT):
1. If ANY weight mentioned → use get_weight_value (complete solution in one call)
2. If no weight, just asking price → use get_spot_price
3. For historical analysis → use get_historical_data 
4. For charting/graphing/visualizing → use get_time_chart_data
5. For news/events → use search_metal_news
6. For other non-weight math → use calculate

IMPORTANT: When calling any tool, always use these exact symbols:
- Gold: XAU
- Silver: XAG
- Platinum: XPT
- Palladium: XPD

Users may refer to metals by common names (gold, silver, etc.) or chemical symbols (Au, Ag, etc.), but you must always convert these to the correct API symbols above when making tool calls.

After getting the data from the tool, provide a helpful, informative response that includes:
- The current price/value with proper formatting
- Any price changes if available
- Brief context about what the price represents
- Reference the metal by the name the user used, not the symbol

Tone: Concise, factual, and analytical.
Avoid unnecessary commentary, speculation, or investment advice.
If the query extends beyond the scope of precious metals, note your specialization while remaining as informative as possible within domain limits.`,
      messages,
      tools: [weightValueToolDefinition, spotPriceToolDefinition, historicalDataToolDefinition, webSearchToolDefinition, calculationToolDefinition, timeChartDataToolDefinition]
    });

    let thinkingContent = '';
    let textContent = '';

    // Process stream events
    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta;
        if (delta.type === 'thinking_delta') {
          const thinkingDelta = delta.thinking || '';
          thinkingContent += thinkingDelta;
          // Yield thinking updates
          yield { type: 'thinking', content: thinkingDelta };
        } else if (delta.type === 'text_delta') {
          textContent += delta.text || '';
        }
      }
    }

    // Get the final message
    const response = await stream.finalMessage();

    // Handle tool use in the response
    if (response.content.some(block => block.type === 'tool_use')) {
      yield { type: 'status', content: 'Executing tools...' };

      const toolResults = [];
      const toolsUsed: string[] = [];

      // Process each tool use
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          let toolResult;
          toolsUsed.push(block.name);

          if (block.name === 'get_weight_value') {
            const { metal, weight, unit, karat, currency = 'USD' } = block.input as {
              metal: string,
              weight: number,
              unit: string,
              karat?: string,
              currency?: string
            };
            toolResult = await executeWeightValueTool(metal, weight, unit, karat, currency);
          } else if (block.name === 'get_spot_price') {
            const { metal, currency = 'USD' } = block.input as { metal: string, currency?: string };
            toolResult = await executeSpotPriceTool(metal, currency);
          } else if (block.name === 'get_historical_data') {
            const { metal, startDate, endDate, relativePeriod } = block.input as {
              metal: string,
              startDate?: string,
              endDate?: string,
              relativePeriod?: string
            };
            toolResult = await executeHistoricalDataTool(metal, startDate, endDate, relativePeriod);
          } else if (block.name === 'search_metal_news') {
            const { query, timeframe } = block.input as { query: string, timeframe?: string };
            yield { type: 'status', content: `Searching for: ${query}` };
            toolResult = await executeWebSearchTool(query, timeframe);
          } else if (block.name === 'calculate') {
            const { expression, description } = block.input as { expression: string, description: string };
            toolResult = await executeCalculationTool(expression, description);
          } else if (block.name === 'get_time_chart_data') {
            const { metals, startDate, endDate, relativePeriod, currency, dataPoints } = block.input as {
              metals: string[],
              startDate?: string,
              endDate?: string,
              relativePeriod?: string,
              currency?: string,
              dataPoints?: number
            };
            toolResult = await executeTimeChartDataTool(metals, startDate, endDate, relativePeriod, currency, dataPoints);
          } else {
            toolResult = { success: false, error: `Unknown tool: ${block.name}` };
          }

          toolResults.push({
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: JSON.stringify(toolResult)
          });
        }
      }

      // Send results back to Claude for final response
      yield { type: 'status', content: 'Generating response...' };

      // Filter out thinking blocks from the assistant's content to avoid API errors
      const filteredContent = response.content.filter(block =>
        block.type === 'text' || block.type === 'tool_use'
      );

      const finalResponse = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: `You are GoldBot AI, a helpful assistant specializing in precious metals pricing and information.

You just received data from your tool. Format this information in a clear, helpful way for the user.

Remember to refer to the metal by the name the user used in their original question, not the API symbol (XAU, XAG, etc.).`,
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: filteredContent
          },
          {
            role: 'user',
            content: toolResults
          }
        ]
      });

      const finalText = finalResponse.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join(' ');

      yield {
        type: 'complete',
        response: finalText,
        usedTool: true,
        toolResults,
        toolsUsed,
        thinking: thinkingContent
      };
    } else {
      // No tools used
      const responseText = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join(' ');

      yield {
        type: 'complete',
        response: responseText,
        usedTool: false,
        thinking: thinkingContent
      };
    }

  } catch (error) {
    console.error('LLM streaming error:', error);
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      response: "I'm sorry, I encountered an error processing your request. Please try again."
    };
  }
}