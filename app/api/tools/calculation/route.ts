// Calculation Tool API Endpoint
// Test URLs:
// GET: http://localhost:3000/api/tools/calculation?expression=24*131.6689&description=Calculate+value+of+24g+gold
// POST: http://localhost:3000/api/tools/calculation (with JSON body: {"expression": "100 / 31.1035", "description": "Convert 100g to troy ounces"})

import { NextRequest, NextResponse } from 'next/server';
import { executeCalculationTool } from '@/lib/tools/calculation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const expression = searchParams.get('expression');
    const description = searchParams.get('description');

    if (!expression) {
      return NextResponse.json(
        {
          success: false,
          error: 'Expression parameter is required',
          usage: 'GET /api/tools/calculation?expression=24*131.67&description=Calculate+value',
          examples: [
            'expression=24*131.67&description=Calculate+value+of+24g+gold',
            'expression=100/31.1035&description=Convert+grams+to+troy+ounces',
            'expression=(2500-2000)/2000*100&description=Calculate+percentage+change'
          ]
        },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Description parameter is required',
          usage: 'GET /api/tools/calculation?expression=24*131.67&description=Calculate+value',
          examples: [
            'expression=24*131.67&description=Calculate+value+of+24g+gold',
            'expression=100/31.1035&description=Convert+grams+to+troy+ounces'
          ]
        },
        { status: 400 }
      );
    }

    const result = await executeCalculationTool(expression, description);

    return NextResponse.json({
      ...result,
      tool: 'calculation',
      timestamp: new Date().toISOString(),
      request: { expression, description }
    });

  } catch (error) {
    console.error('Calculation API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tool: 'calculation',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expression, description } = body;

    if (!expression) {
      return NextResponse.json(
        {
          success: false,
          error: 'Expression parameter is required in request body',
          usage: 'POST /api/tools/calculation with body: {"expression": "24*131.67", "description": "Calculate value"}',
          examples: [
            { expression: '24*131.67', description: 'Calculate value of 24g gold at $131.67/gram' },
            { expression: '100/31.1035', description: 'Convert 100 grams to troy ounces' },
            { expression: '(2500-2000)/2000*100', description: 'Calculate percentage change' }
          ]
        },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Description parameter is required in request body',
          usage: 'POST /api/tools/calculation with body: {"expression": "24*131.67", "description": "Calculate value"}',
          examples: [
            { expression: '24*131.67', description: 'Calculate value of 24g gold at $131.67/gram' },
            { expression: '100/31.1035', description: 'Convert 100 grams to troy ounces' }
          ]
        },
        { status: 400 }
      );
    }

    const result = await executeCalculationTool(expression, description);

    return NextResponse.json({
      ...result,
      tool: 'calculation',
      timestamp: new Date().toISOString(),
      request: { expression, description }
    });

  } catch (error) {
    console.error('Calculation API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tool: 'calculation',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
