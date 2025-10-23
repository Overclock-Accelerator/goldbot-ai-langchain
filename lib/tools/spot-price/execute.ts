// Spot Price Tool Execution
// This file contains the actual logic for fetching precious metals prices

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

export async function executeSpotPriceTool(
  metal: string,
  currency: string = 'USD'
): Promise<SpotPriceResult> {
  try {
    // Validate API key
    if (!process.env.GOLDAPI_KEY) {
      throw new Error('GOLDAPI_KEY environment variable is not set');
    }

    // Call goldapi.io directly
    // Note: metal should already be in correct symbol format (XAU, XAG, etc.) from Claude
    const apiUrl = `https://www.goldapi.io/api/${metal}/${currency}`;

    console.log('Fetching spot price from goldapi.io:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'x-access-token': process.env.GOLDAPI_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('goldapi.io error:', response.status, errorText);
      throw new Error(`goldapi.io request failed: ${response.statusText}`);
    }

    const data = await response.json();

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
        rawData: data
      }
    };
  } catch (error) {
    console.error('Spot price tool error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}