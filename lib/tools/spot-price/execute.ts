// ============================================================================
// TOOL EXECUTION: Spot Price Tool
// ============================================================================
//
// This file contains the ACTUAL IMPLEMENTATION of the tool.
// When the LLM requests this tool, the orchestration file (anthropic-service.ts)
// calls this execution function with the parameters the LLM provided.
//
// KEY RESPONSIBILITIES:
// 1. Receive parameters from the LLM (via the orchestrator)
// 2. Perform the actual work (API calls, calculations, database queries, etc.)
// 3. Return structured results in a consistent format
// 4. Handle errors gracefully
//
// IMPORTANT: The LLM never calls this directly! We call it on the LLM's behalf.
//
// ============================================================================

// ============================================================================
// Result Interface: Define the structure of what this tool returns
// ============================================================================
// Having a consistent result structure is important:
// - success: boolean flag indicating if the operation succeeded
// - data: The actual result data (only present if success = true)
// - error: Error message (only present if success = false)
//
// This pattern makes it easy for the LLM to understand what happened.
//
export interface SpotPriceResult {
  success: boolean;
  data?: {
    metal: string;
    price: number;
    currency: string;
    unit: string;
    timestamp: string;
    change?: number;
    changePercent?: number;
    rawData: any;
  };
  error?: string;
}

// ============================================================================
// Execution Function: The actual tool implementation
// ============================================================================
// This function receives the parameters that the LLM provided and performs
// the actual work of fetching the spot price from an external API.
//
// Parameters come from the LLM's tool_use request.
// Results go back to the LLM as tool_result content.
//
export async function executeSpotPriceTool(
  metal: string,
  currency: string = 'USD'
): Promise<SpotPriceResult> {
  try {
    // Validate environment configuration
    if (!process.env.GOLDAPI_KEY) {
      throw new Error('GOLDAPI_KEY environment variable is not set');
    }

    // ========================================================================
    // Make External API Call
    // ========================================================================
    // This is where the real work happens! We're calling an external API
    // to get live precious metals pricing data.
    //
    // The LLM provided the 'metal' parameter (e.g., "XAU" for gold).
    // We use it to construct the API URL.
    //
    const apiUrl = `https://www.goldapi.io/api/${metal}/${currency}`;
    console.log('Fetching spot price from goldapi.io:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'x-access-token': process.env.GOLDAPI_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('goldapi.io error:', response.status, errorText);
      throw new Error(`goldapi.io request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // ========================================================================
    // Return Structured Success Result
    // ========================================================================
    // Format the API data into our standardized result structure.
    // The LLM will receive this data and use it to craft a natural language
    // response for the user.
    //
    return {
      success: true,
      data: {
        metal,
        price: data.price || data.price_gram_24k || data.ask,
        currency,
        unit: data.unit || 'oz',
        timestamp: data.timestamp || new Date().toISOString(),
        change: data.ch || data.change,
        changePercent: data.chp || data.change_percent,
        rawData: data  // Include full API response for debugging
      }
    };
  } catch (error) {
    // ========================================================================
    // Return Structured Error Result
    // ========================================================================
    // If anything goes wrong, return an error in the same structured format.
    // The LLM can then explain the error to the user in natural language.
    //
    console.error('Spot price tool error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}