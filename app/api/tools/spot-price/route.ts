// Spot Price Tool API Endpoint
// Test URLs:
// GET: http://localhost:3000/api/tools/spot-price?metal=XAU
// GET: http://localhost:3000/api/tools/spot-price?metal=XAG&currency=EUR
// POST: http://localhost:3000/api/tools/spot-price (with JSON body: {"metal": "XAU", "currency": "USD"})

import { NextRequest, NextResponse } from 'next/server';
import { executeSpotPriceTool } from '@/lib/tools/spot-price';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const metal = searchParams.get('metal');
    const currency = searchParams.get('currency') || 'USD';

    // Validate required parameter
    if (!metal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Metal parameter is required',
          usage: 'GET /api/tools/spot-price?metal=XAU&currency=USD',
          validMetals: ['XAU', 'XAG', 'XPT', 'XPD']
        },
        { status: 400 }
      );
    }

    // Validate metal parameter
    if (!['XAU', 'XAG', 'XPT', 'XPD'].includes(metal.toUpperCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid metal: ${metal}. Must be one of: XAU, XAG, XPT, XPD`,
          validMetals: ['XAU', 'XAG', 'XPT', 'XPD']
        },
        { status: 400 }
      );
    }

    // Execute the spot price tool
    const result = await executeSpotPriceTool(metal.toUpperCase(), currency.toUpperCase());

    // Return the result with additional metadata
    return NextResponse.json({
      ...result,
      tool: 'spot-price',
      timestamp: new Date().toISOString(),
      request: { metal: metal.toUpperCase(), currency: currency.toUpperCase() }
    });

  } catch (error) {
    console.error('Spot price tool API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        tool: 'spot-price'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metal, currency = 'USD' } = body;

    // Validate required parameter
    if (!metal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Metal parameter is required in request body',
          usage: 'POST /api/tools/spot-price with body: {"metal": "XAU", "currency": "USD"}',
          validMetals: ['XAU', 'XAG', 'XPT', 'XPD']
        },
        { status: 400 }
      );
    }

    // Validate metal parameter
    if (!['XAU', 'XAG', 'XPT', 'XPD'].includes(metal.toUpperCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid metal: ${metal}. Must be one of: XAU, XAG, XPT, XPD`,
          validMetals: ['XAU', 'XAG', 'XPT', 'XPD']
        },
        { status: 400 }
      );
    }

    // Execute the spot price tool
    const result = await executeSpotPriceTool(metal.toUpperCase(), currency.toUpperCase());

    // Return the result with additional metadata
    return NextResponse.json({
      ...result,
      tool: 'spot-price',
      timestamp: new Date().toISOString(),
      request: { metal: metal.toUpperCase(), currency: currency.toUpperCase() }
    });

  } catch (error) {
    console.error('Spot price tool API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        tool: 'spot-price'
      },
      { status: 500 }
    );
  }
}