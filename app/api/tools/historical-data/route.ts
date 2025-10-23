// Historical Data Tool API Endpoint
// Test URLs:
// GET: http://localhost:3000/api/tools/historical-data?metal=XAU&relativePeriod=last%205%20months
// GET: http://localhost:3000/api/tools/historical-data?metal=XAG&startDate=2024-01&endDate=2024-06
// POST: http://localhost:3000/api/tools/historical-data (with JSON body: {"metal": "XAU", "relativePeriod": "last 5 months"})

import { NextRequest, NextResponse } from 'next/server';
import { executeHistoricalDataTool } from '@/lib/tools/historical-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const metal = searchParams.get('metal');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const relativePeriod = searchParams.get('relativePeriod') || undefined;

    // Validate required parameter
    if (!metal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Metal parameter is required',
          usage: {
            relativePeriod: 'GET /api/tools/historical-data?metal=XAU&relativePeriod=last 5 months',
            dateRange: 'GET /api/tools/historical-data?metal=XAU&startDate=2024-01&endDate=2024-06',
          },
          validMetals: ['XAU', 'XAG', 'XPT', 'XPD'],
          examples: {
            relativePeriods: ['last 5 months', 'past year', 'last 2 years'],
            dateFormat: 'YYYY-MM (e.g., 2024-01)'
          }
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

    // Validate that either relativePeriod or both startDate/endDate are provided
    if (!relativePeriod && (!startDate || !endDate)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either relativePeriod OR both startDate and endDate must be provided',
          examples: {
            relativePeriod: '?metal=XAU&relativePeriod=last 5 months',
            dateRange: '?metal=XAU&startDate=2024-01&endDate=2024-06'
          }
        },
        { status: 400 }
      );
    }

    // Execute the historical data tool
    const result = await executeHistoricalDataTool(
      metal.toUpperCase(),
      startDate,
      endDate,
      relativePeriod
    );

    // Return the result with additional metadata
    return NextResponse.json({
      ...result,
      tool: 'historical-data',
      timestamp: new Date().toISOString(),
      request: {
        metal: metal.toUpperCase(),
        startDate,
        endDate,
        relativePeriod
      }
    });

  } catch (error) {
    console.error('Historical data tool API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        tool: 'historical-data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metal, startDate, endDate, relativePeriod } = body;

    // Validate required parameter
    if (!metal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Metal parameter is required in request body',
          usage: {
            relativePeriod: '{"metal": "XAU", "relativePeriod": "last 5 months"}',
            dateRange: '{"metal": "XAU", "startDate": "2024-01", "endDate": "2024-06"}',
          },
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

    // Validate that either relativePeriod or both startDate/endDate are provided
    if (!relativePeriod && (!startDate || !endDate)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either relativePeriod OR both startDate and endDate must be provided',
          examples: {
            relativePeriod: '{"metal": "XAU", "relativePeriod": "last 5 months"}',
            dateRange: '{"metal": "XAU", "startDate": "2024-01", "endDate": "2024-06"}'
          }
        },
        { status: 400 }
      );
    }

    // Execute the historical data tool
    const result = await executeHistoricalDataTool(
      metal.toUpperCase(),
      startDate,
      endDate,
      relativePeriod
    );

    // Return the result with additional metadata
    return NextResponse.json({
      ...result,
      tool: 'historical-data',
      timestamp: new Date().toISOString(),
      request: {
        metal: metal.toUpperCase(),
        startDate,
        endDate,
        relativePeriod
      }
    });

  } catch (error) {
    console.error('Historical data tool API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        tool: 'historical-data'
      },
      { status: 500 }
    );
  }
}