// Time Chart Data Tool API Endpoint
// Test URLs:
// GET: http://localhost:3000/api/tools/time-chart-data?metals=XAU&relativePeriod=last+6+months
// GET: http://localhost:3000/api/tools/time-chart-data?metals=XAU,XAG&startDate=2024-01&endDate=2024-12
// POST: http://localhost:3000/api/tools/time-chart-data (with JSON body)

import { NextRequest, NextResponse } from 'next/server';
import { executeTimeChartDataTool } from '@/lib/tools/time-chart-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const metalsParam = searchParams.get('metals');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const relativePeriod = searchParams.get('relativePeriod') || undefined;
    const currency = searchParams.get('currency') || 'USD';
    const dataPoints = searchParams.get('dataPoints') ? parseInt(searchParams.get('dataPoints')!) : 12;

    // Validate required parameters
    if (!metalsParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Metals parameter is required',
          usage: 'GET /api/tools/time-chart-data?metals=XAU,XAG&relativePeriod=last+6+months',
          examples: [
            'metals=XAU&relativePeriod=last+6+months',
            'metals=XAU,XAG&startDate=2024-01&endDate=2024-12',
            'metals=XAU,XAG,XPT&relativePeriod=past+year&dataPoints=24'
          ]
        },
        { status: 400 }
      );
    }

    // Parse metals array
    const metals = metalsParam.split(',').map(m => m.trim().toUpperCase());

    // Validate metals
    const validMetals = ['XAU', 'XAG', 'XPT', 'XPD'];
    for (const metal of metals) {
      if (!validMetals.includes(metal)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid metal: ${metal}. Must be one of: ${validMetals.join(', ')}`,
            validMetals
          },
          { status: 400 }
        );
      }
    }

    // Execute the time chart data tool
    const result = await executeTimeChartDataTool(
      metals,
      startDate,
      endDate,
      relativePeriod,
      currency,
      dataPoints
    );

    // Return the result with additional metadata
    return NextResponse.json({
      ...result,
      tool: 'time-chart-data',
      timestamp: new Date().toISOString(),
      request: { metals, startDate, endDate, relativePeriod, currency, dataPoints }
    });

  } catch (error) {
    console.error('Time chart data tool API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        tool: 'time-chart-data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metals, startDate, endDate, relativePeriod, currency = 'USD', dataPoints = 12 } = body;

    // Validate required parameters
    if (!metals || !Array.isArray(metals) || metals.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Metals array is required in request body',
          usage: 'POST /api/tools/time-chart-data with body: {"metals": ["XAU", "XAG"], "relativePeriod": "last 6 months"}',
          examples: [
            { metals: ['XAU'], relativePeriod: 'last 6 months' },
            { metals: ['XAU', 'XAG'], startDate: '2024-01', endDate: '2024-12' },
            { metals: ['XAU', 'XAG', 'XPT'], relativePeriod: 'past year', dataPoints: 24 }
          ]
        },
        { status: 400 }
      );
    }

    // Validate metals
    const validMetals = ['XAU', 'XAG', 'XPT', 'XPD'];
    for (const metal of metals) {
      if (!validMetals.includes(metal)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid metal: ${metal}. Must be one of: ${validMetals.join(', ')}`,
            validMetals
          },
          { status: 400 }
        );
      }
    }

    // Execute the time chart data tool
    const result = await executeTimeChartDataTool(
      metals,
      startDate,
      endDate,
      relativePeriod,
      currency,
      dataPoints
    );

    // Return the result with additional metadata
    return NextResponse.json({
      ...result,
      tool: 'time-chart-data',
      timestamp: new Date().toISOString(),
      request: { metals, startDate, endDate, relativePeriod, currency, dataPoints }
    });

  } catch (error) {
    console.error('Time chart data tool API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        tool: 'time-chart-data'
      },
      { status: 500 }
    );
  }
}
