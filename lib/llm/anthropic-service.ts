// ============================================================================
// LLM TOOL CALLING ORCHESTRATION - Educational Example
// ============================================================================
// 
// This file demonstrates how to implement tool calling with Claude (Anthropic's LLM).
// It shows the complete workflow from user query to final response.
//
// KEY CONCEPTS YOU'LL LEARN:
// 1. How to define and pass tools to an LLM
// 2. How the LLM decides when to use tools
// 3. How to execute tools and return results to the LLM
// 4. The multi-turn conversation pattern for tool use
//
// ============================================================================

import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// STEP 1: Import Tool Definitions and Execution Functions
// ============================================================================
// 
// For each tool, we need TWO things:
// 1. DEFINITION - Describes the tool to the LLM (what it does, what parameters it needs)
// 2. EXECUTION - The actual code that runs when the LLM requests the tool
//
// The LLM never executes tools directly - it just tells US which tools to run.
// We execute them and send back the results.
//
import {
  weightValueToolDefinition,      // ← Tool definition (for LLM)
  executeWeightValueTool,          // ← Execution function (for us)
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

// Initialize the Anthropic SDK with your API key
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// MAIN FUNCTION: Process Chat with LLM and Tool Calling
// ============================================================================
//
// This function implements the complete tool calling workflow:
// 1. Send user message to LLM with available tools
// 2. LLM decides whether to use tools or respond directly
// 3. If using tools: Execute them and send results back
// 4. LLM generates final response using tool results
// 5. Return response to user
//
// ============================================================================
export async function processChatWithLLM(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []) {
  try {
    console.log('Starting LLM processing for message:', userMessage);
    
    // ========================================================================
    // STEP 2: Prepare the Conversation History
    // ========================================================================
    // Build an array of messages including previous conversation context.
    // This allows the LLM to maintain context across multiple turns.
    //
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

    // ========================================================================
    // STEP 3: Make the First LLM Call with Tools
    // ========================================================================
    // This is where the magic happens! We send the user's message to Claude
    // along with the tool definitions. Claude will analyze the request and
    // decide whether to:
    //   A) Answer directly without tools, OR
    //   B) Request one or more tools to help answer
    //
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      
      // ======================================================================
      // THE SYSTEM PROMPT: Teaching the LLM About Tools
      // ======================================================================
      // This is YOUR instruction manual to the LLM. Here you explain:
      // - What each tool does
      // - When to use each tool
      // - How to prioritize between tools
      // - What format/style to use in responses
      //
      // The better your system prompt, the better the LLM will use your tools!
      //
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
      
      // ======================================================================
      // THE TOOLS ARRAY: Making Tools Available to the LLM
      // ======================================================================
      // CRITICAL: This is where we pass the tool DEFINITIONS to Claude.
      // 
      // Each definition tells Claude:
      // - name: The identifier for the tool (e.g., "get_spot_price")
      // - description: What the tool does and when to use it
      // - input_schema: What parameters the tool needs (type, required, etc.)
      //
      // Claude reads these definitions and decides which tools to use based on
      // the user's question and the system prompt guidance.
      //
      // See lib/tools/*/definition.ts for how each tool is defined.
      //
      tools: [weightValueToolDefinition, spotPriceToolDefinition, historicalDataToolDefinition, webSearchToolDefinition, calculationToolDefinition, timeChartDataToolDefinition]
    });

    // ========================================================================
    // STEP 4: Check if Claude Wants to Use Tools
    // ========================================================================
    // Claude's response contains "content blocks" that can be:
    // - 'text': Regular text response (Claude answered directly)
    // - 'tool_use': A request for us to execute a tool with specific parameters
    //
    // If Claude requested tools, we need to execute them and send results back.
    //
    if (response.content.some(block => block.type === 'tool_use')) {
      const toolResults = [];
      const toolsUsed: string[] = [];

      // ======================================================================
      // STEP 5: Execute Each Tool Claude Requested
      // ======================================================================
      // Claude can request multiple tools in a single response.
      // We loop through each content block and execute any tool_use blocks.
      //
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          let toolResult;

          // Track which tools were used (useful for logging/debugging)
          toolsUsed.push(block.name);

          // ====================================================================
          // Tool Execution Router
          // ====================================================================
          // Here's where we match tool names to their execution functions.
          // 
          // Claude provides:
          // - block.name: The tool name (e.g., "get_spot_price")
          // - block.input: The parameters Claude wants to pass (e.g., {metal: "XAU"})
          //
          // We extract the parameters and call the appropriate execution function.
          // See lib/tools/*/execute.ts for the actual implementation of each tool.
          //
          if (block.name === 'get_weight_value') {
            // Extract parameters that Claude provided in block.input
            const { metal, weight, unit, karat, currency = 'USD' } = block.input as {
              metal: string,
              weight: number,
              unit: string,
              karat?: string,
              currency?: string
            };
            // Call the execution function with those parameters
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
            // Handle unknown tools gracefully
            toolResult = { success: false, error: `Unknown tool: ${block.name}` };
          }

          // ====================================================================
          // Format Tool Result for Claude
          // ====================================================================
          // Tool results MUST be formatted in this specific structure:
          // - type: 'tool_result' (required)
          // - tool_use_id: Must match the ID from Claude's tool_use block
          // - content: The result data as a JSON string
          //
          // This format allows Claude to match results with its requests.
          //
          toolResults.push({
            type: 'tool_result' as const,
            tool_use_id: block.id,            // Links result to Claude's request
            content: JSON.stringify(toolResult) // The actual data from the tool
          });
        }
      }

      // ======================================================================
      // STEP 6: Send Tool Results Back to Claude (Multi-Turn Pattern)
      // ======================================================================
      // Now we make a SECOND LLM call with the tool results.
      // This creates a conversation like:
      //
      // Turn 1 (User):      "What's the price of gold?"
      // Turn 1 (Assistant): [Uses get_spot_price tool]
      // Turn 2 (User):      [Tool results: {price: 2650, ...}]
      // Turn 2 (Assistant): "Gold is currently $2,650 per ounce."
      //
      // This multi-turn pattern is KEY to tool calling with LLMs!
      //
      if (toolResults.length > 0) {
        // Check if chart tool was used (to customize response format)
        const usedChartTool = toolsUsed.includes('get_time_chart_data');

        // Filter out thinking blocks from the assistant's content to avoid API errors
        const filteredContent = response.content.filter(block =>
          block.type === 'text' || block.type === 'tool_use'
        );

        // Customize system prompt based on which tools were used
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

        // ====================================================================
        // Make the Second LLM Call with Tool Results
        // ====================================================================
        // This is the crucial second call that completes the tool use workflow.
        //
        // Message structure:
        // 1. ...messages           - Original conversation history
        // 2. assistant response    - Claude's first response with tool_use blocks
        // 3. user message          - Our tool results (formatted as user content)
        //
        // Claude reads the tool results and generates a natural language response.
        //
        const finalResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            ...messages,                    // Original conversation
            {
              role: 'assistant',            // Claude's response with tool requests
              content: filteredContent
            },
            {
              role: 'user',                 // Tool results (sent as user message)
              content: toolResults          // Array of tool_result objects
            }
          ]
        });

        // Extract chart data if chart tool was used (for UI rendering)
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

        // ====================================================================
        // STEP 7: Return Final Response (Tools Used Path)
        // ====================================================================
        // Return Claude's natural language response that incorporates the
        // tool results, along with metadata about which tools were used.
        //
        return {
          success: true,
          response: finalResponse.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join(' '),
          usedTool: true,       // Flag indicating tools were used
          toolResults,          // Raw tool results (for debugging/logging)
          toolsUsed,            // Names of tools that were called
          chartData             // Special handling for chart data (if any)
        };
      }
    }

    // ========================================================================
    // STEP 8: Return Direct Response (No Tools Path)
    // ========================================================================
    // If Claude decided it could answer without tools (e.g., general questions
    // like "What is gold?" or "Tell me about precious metals"), we just
    // return its text response directly.
    //
    // This shows that tool use is OPTIONAL - Claude decides based on the
    // user's query and the tool descriptions in the system prompt.
    //
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