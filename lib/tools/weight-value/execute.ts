// Weight Value Tool Execution
// Direct Gold API query and calculation for metal weight valuation

import { executeCalculationTool } from '../calculation';

export interface WeightValueResult {
  success: boolean;
  data?: {
    metal: string;
    weight: number;
    unit: string;
    karat?: string;
    pricePerUnit: number;
    totalValue: number;
    formattedValue: string;
    currency: string;
    spotPriceData?: any;
    calculationExpression: string;
  };
  error?: string;
}

// Map karat to spot price field names
const KARAT_FIELD_MAP: Record<string, string> = {
  '24k': 'price_gram_24k',
  '22k': 'price_gram_22k',
  '21k': 'price_gram_21k',
  '20k': 'price_gram_20k',
  '18k': 'price_gram_18k',
  '16k': 'price_gram_16k',
  '14k': 'price_gram_14k',
  '10k': 'price_gram_10k'
};

// Convert various units to grams for calculation
function convertToGrams(weight: number, unit: string): number {
  const normalizedUnit = unit.toLowerCase().trim();

  switch (normalizedUnit) {
    case 'g':
    case 'grams':
      return weight;
    case 'oz':
    case 'ounces':
    case 'troy_ounces':
      return weight * 31.1035; // 1 troy ounce = 31.1035 grams
    case 'kg':
    case 'kilograms':
      return weight * 1000;
    default:
      throw new Error(`Unsupported unit: ${unit}. Use grams, ounces, or kg.`);
  }
}

export async function executeWeightValueTool(
  metal: string,
  weight: number,
  unit: string,
  karat?: string,
  currency: string = 'USD'
): Promise<WeightValueResult> {
  try {
    console.log('💰 Weight Value Tool - Input:', { metal, weight, unit, karat, currency });

    // Validate inputs
    if (!['XAU', 'XAG', 'XPT', 'XPD'].includes(metal)) {
      return {
        success: false,
        error: `Invalid metal: ${metal}. Must be XAU, XAG, XPT, or XPD.`
      };
    }

    if (weight <= 0) {
      return {
        success: false,
        error: 'Weight must be a positive number.'
      };
    }

    // Validate API key
    if (!process.env.GOLDAPI_KEY) {
      return {
        success: false,
        error: 'GOLDAPI_KEY environment variable is not set'
      };
    }

    // Step 1: Query Gold API directly
    console.log('📊 Step 1: Querying Gold API directly for', metal);
    const apiUrl = `https://www.goldapi.io/api/${metal}/${currency}`;

    const response = await fetch(apiUrl, {
      headers: {
        'x-access-token': process.env.GOLDAPI_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('goldapi.io error:', response.status, errorText);
      return {
        success: false,
        error: `Gold API request failed: ${response.statusText}`
      };
    }

    const apiData = await response.json();
    console.log('✅ Gold API response received');

    // Step 2: Determine the price per gram based on karat (for gold) or metal type
    let pricePerGram: number;
    const karatToUse = karat || '24k'; // Default to 24k for gold

    if (metal === 'XAU' && karat) {
      // For gold with karat specification
      const fieldName = KARAT_FIELD_MAP[karatToUse];
      if (!fieldName) {
        return {
          success: false,
          error: `Invalid karat: ${karat}. Must be 24k, 22k, 21k, 20k, 18k, 16k, 14k, or 10k.`
        };
      }
      pricePerGram = apiData[fieldName];
      console.log(`💎 Using ${karatToUse} gold price: $${pricePerGram}/gram`);
    } else {
      // For other metals or gold without karat, use 24k price per gram
      pricePerGram = apiData.price_gram_24k;
      console.log(`💎 Using price per gram: $${pricePerGram}/gram`);
    }

    // Validate price data
    if (!pricePerGram || pricePerGram <= 0 || !isFinite(pricePerGram)) {
      return {
        success: false,
        error: `Invalid price data received from API: ${pricePerGram}`
      };
    }

    // Step 3: Convert weight to grams if needed
    const weightInGrams = convertToGrams(weight, unit);
    console.log(`⚖️ Converted ${weight} ${unit} to ${weightInGrams} grams`);

    // Validate weight conversion
    if (!isFinite(weightInGrams) || weightInGrams <= 0) {
      return {
        success: false,
        error: `Invalid weight conversion: ${weightInGrams}`
      };
    }

    // Step 4: Calculate total value using the calculation tool
    const expression = `${weightInGrams} * ${pricePerGram}`;
    const description = karat
      ? `Calculate value of ${weight}${unit} of ${karatToUse} ${metal} at $${pricePerGram}/gram`
      : `Calculate value of ${weight}${unit} of ${metal} at $${pricePerGram}/gram`;

    console.log('🧮 Step 2: Calculating total value:', expression);
    const calculationResult = await executeCalculationTool(expression, description);

    if (!calculationResult.success || !calculationResult.data) {
      return {
        success: false,
        error: `Calculation failed: ${calculationResult.error || 'Unknown error'}`
      };
    }

    console.log('✅ Weight value calculation complete:', {
      totalValue: calculationResult.data.result,
      formatted: calculationResult.data.formattedResult
    });

    // Return comprehensive result
    return {
      success: true,
      data: {
        metal,
        weight,
        unit,
        karat: metal === 'XAU' ? karatToUse : undefined,
        pricePerUnit: pricePerGram,
        totalValue: calculationResult.data.result,
        formattedValue: calculationResult.data.formattedResult,
        currency,
        spotPriceData: {
          metal,
          price: apiData.price || apiData.price_gram_24k,
          currency,
          unit: apiData.unit || 'oz',
          timestamp: apiData.timestamp || new Date().toISOString(),
          change: apiData.ch || apiData.change,
          changePercent: apiData.chp || apiData.change_percent,
          rawData: apiData
        },
        calculationExpression: expression
      }
    };

  } catch (error) {
    console.error('❌ Weight value tool error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
