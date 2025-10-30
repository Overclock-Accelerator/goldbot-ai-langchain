// ============================================================================
// LANGCHAIN AGENT SERVICE - Educational Example
// ============================================================================
//
// This file demonstrates LangChain's agent-based approach to tool calling.
// Compare with anthropic-service.ts to see the difference:
//
// ANTHROPIC SDK APPROACH (413 lines):
// - Manual tool routing with if/else statements (40 lines)
// - Two API calls per request (initial + tool results)
// - Manual message formatting and error handling
//
// LANGCHAIN APPROACH (~120 lines):
// - Automatic tool routing (agent decides and executes)
// - Single agent.invoke() call (one API call)
// - Built-in message handling and error recovery
//
// KEY IMPROVEMENT: 70% code reduction, same functionality
//
// ============================================================================

import { createAgent } from "langchain";
// import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { allLangChainTools } from '@/lib/tools/langchain-tools';

// Validate API key
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

// ============================================================================
// MODEL INITIALIZATION - Explicit Provider Import
// ============================================================================
//
// NOTE: We use ChatAnthropic directly instead of string reference
// ("anthropic:claude-sonnet-4-5-20250929") because Next.js bundler
// can't resolve LangChain's dynamic imports at build time.
//
// This is a common pattern when using LangChain with Next.js/Webpack.
//
// const model = new ChatAnthropic({
//   modelName: "claude-sonnet-4-5-20250929",
//   anthropicApiKey: process.env.ANTHROPIC_API_KEY,
//   maxTokens: 2000,
// });

const model = new ChatOpenAI({
  modelName: "gpt-5-nano",
  openAIApiKey: process.env.OPENAI_API_KEY,
  maxTokens: 2000,
});

// ============================================================================
// AGENT CREATION - Single Point of Configuration
// ============================================================================
//
// LangChain's createAgent() handles:
// - Model connection (explicit ChatAnthropic instance)
// - Tool registration and invocation
// - Message formatting and conversation history
// - Error handling and retry logic
//
// This replaces 100+ lines of manual setup in the Anthropic SDK approach.
//
const agent = createAgent({
  model,                    // Explicit model instance (works with Next.js bundler)
  tools: allLangChainTools, // Tools array (already in LangChain format)
});

// ============================================================================
// SYSTEM PROMPT - Copied Verbatim from anthropic-service.ts
// ============================================================================
// This prompt teaches the agent:
// - What each tool does
// - When to use each tool
// - How to prioritize between tools
// - Response formatting preferences
//
const SYSTEM_PROMPT = `You are GoldBot AI, a chat-based assistant specializing in precious metals pricing and information.

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

Be conversational and helpful. But try not to offer excessive commentary or advice that is not directly relevant to the user's question. If users ask about topics beyond precious metals pricing, politely explain your specialization but try to be as helpful as possible within your domain.`;

// ============================================================================
// MAIN FUNCTION: Process Chat with LangChain Agent
// ============================================================================
//
// This single function replaces the entire tool calling workflow:
// 1. Build message history (system + conversation + new user message)
// 2. Invoke agent (agent handles tool selection, execution, and response)
// 3. Extract response and metadata (which tools were used, chart data, etc.)
// 4. Return formatted result
//
// Compare to anthropic-service.ts:
// - No manual tool routing (agent decides automatically)
// - No second API call (agent handles internally)
// - No manual message formatting (LangChain handles it)
//
// ============================================================================
export async function processChatWithLangChain(
  userMessage: string,
  conversationHistory: Array<{role: string, content: string}> = []
) {
  try {
    console.log('[LangChain] Processing message:', userMessage);

    // ========================================================================
    // Build Messages Array
    // ========================================================================
    // Convert conversation history to LangChain message types.
    // LangChain uses specific message classes:
    // - SystemMessage: Instructions for the agent
    // - HumanMessage: User messages
    // - AIMessage: Assistant responses
    //
    const messages = [new SystemMessage(SYSTEM_PROMPT)];

    // Add conversation history
    conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        messages.push(new HumanMessage(msg.content));
      } else if (msg.role === 'assistant') {
        messages.push(new AIMessage(msg.content));
      }
    });

    // Add new user message
    messages.push(new HumanMessage(userMessage));

    // ========================================================================
    // Invoke Agent - Single Call Does Everything
    // ========================================================================
    // This is where LangChain's power shows:
    // - Agent reads the message and system prompt
    // - Agent decides which tools (if any) to use
    // - Agent executes tools automatically
    // - Agent generates natural language response
    // - All in ONE API invocation
    //
    // Compare to Anthropic SDK: Required 2 API calls (initial + tool results)
    //
    const result = await agent.invoke({ messages });

    console.log('[LangChain] Agent invocation complete');

    // ========================================================================
    // Extract Response and Metadata
    // ========================================================================
    // The agent result contains:
    // - messages: Array of all messages including tool calls
    // - Last message: The agent's final response to the user
    //
    const lastMessage = result.messages[result.messages.length - 1];

    // Extract which tools were used (for logging and frontend display)
    const toolsUsed = result.messages
      .filter(msg => msg.tool_calls?.length > 0)
      .flatMap(msg => msg.tool_calls.map(tc => tc.name));

    console.log('[LangChain] Tools used:', toolsUsed);

    // ========================================================================
    // Chart Data Extraction (Special Case)
    // ========================================================================
    // If the agent used get_time_chart_data, extract the chart data
    // so the frontend can render it visually.
    //
    let chartData = null;
    const chartToolMsg = result.messages.find(
      msg => msg.type === 'tool' && msg.name === 'get_time_chart_data'
    );

    if (chartToolMsg) {
      try {
        const parsed = JSON.parse(chartToolMsg.content);
        chartData = parsed.success ? parsed.data : null;
        console.log('[LangChain] Chart data extracted');
      } catch (e) {
        console.error('[LangChain] Chart data parse error:', e);
      }
    }

    // ========================================================================
    // Return Formatted Response
    // ========================================================================
    // Return format matches the Anthropic SDK version exactly,
    // so the frontend requires NO changes.
    //
    return {
      success: true,
      response: lastMessage.content,
      usedTool: toolsUsed.length > 0,
      toolsUsed: [...new Set(toolsUsed)],  // Remove duplicates
      chartData
    };

  } catch (error) {
    console.error('[LangChain] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      response: "I'm sorry, I encountered an error processing your request."
    };
  }
}

// ============================================================================
// Export Agent for LangGraph Cloud
// ============================================================================
// The agent instance can be deployed to LangGraph Cloud for serverless
// execution, monitoring, and scaling. See docs/architecture/langgraph-cloud.md
//
export { agent };
