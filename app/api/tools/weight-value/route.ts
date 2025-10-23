// Weight Value Tool API Endpoint
// Test URL: http://localhost:3000/api/tools/weight-value?metal=XAU&weight=15&unit=g&karat=18k

import { NextRequest, NextResponse } from 'next/server';
import { executeWeightValueTool } from '@/lib/tools/weight-value';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metal = searchParams.get('metal');
    const weightStr = searchParams.get('weight');
    const unit = searchParams.get('unit');
    const karat = searchParams.get('karat') || undefined;
    const currency = searchParams.get('currency') || 'USD';

    if (!metal) {
      return NextResponse.json(
        { success: false, error: 'metal parameter is required' },
        { status: 400 }
      );
    }

    if (!weightStr) {
      return NextResponse.json(
        { success: false, error: 'weight parameter is required' },
        { status: 400 }
      );
    }

    if (!unit) {
      return NextResponse.json(
        { success: false, error: 'unit parameter is required (g, oz, kg)' },
        { status: 400 }
      );
    }

    const weight = parseFloat(weightStr);
    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json(
        { success: false, error: 'weight must be a positive number' },
        { status: 400 }
      );
    }

    const result = await executeWeightValueTool(metal, weight, unit, karat, currency);

    return NextResponse.json({
      ...result,
      tool: 'weight-value',
      timestamp: new Date().toISOString(),
      request: { metal, weight, unit, karat, currency }
    });

  } catch (error) {
    console.error('Weight value API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tool: 'weight-value',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
