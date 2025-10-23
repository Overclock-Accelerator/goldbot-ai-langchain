// Web Search Tool API Endpoint
// Test URLs:
// GET: http://localhost:3000/api/tools/web-search?query=gold+price+news
// GET: http://localhost:3000/api/tools/web-search?query=silver+market+events&timeframe=last+6+months
// POST: http://localhost:3000/api/tools/web-search (with JSON body: {"query": "gold price news", "timeframe": "2024"})

import { NextRequest, NextResponse } from 'next/server';
import { executeWebSearchTool } from '@/lib/tools/web-search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const query = searchParams.get('query');
    const timeframe = searchParams.get('timeframe') || undefined;

    // Validate required parameter
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query parameter is required',
          usage: 'GET /api/tools/web-search?query=gold+price+news&timeframe=last+6+months',
          examples: [
            'query=gold+price+news',
            'query=silver+market+events&timeframe=2024',
            'query=platinum+price+drop&timeframe=last+10+months'
          ]
        },
        { status: 400 }
      );
    }

    // Execute the web search tool
    const result = await executeWebSearchTool(query, timeframe);

    // Return the result with additional metadata
    return NextResponse.json({
      ...result,
      tool: 'web-search',
      timestamp: new Date().toISOString(),
      request: { query, timeframe }
    });

  } catch (error) {
    console.error('Web search tool API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        tool: 'web-search'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, timeframe } = body;

    // Validate required parameter
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query parameter is required in request body',
          usage: 'POST /api/tools/web-search with body: {"query": "gold price news", "timeframe": "2024"}',
          examples: [
            { query: 'gold price news' },
            { query: 'silver market events', timeframe: '2024' },
            { query: 'platinum price drop', timeframe: 'last 10 months' }
          ]
        },
        { status: 400 }
      );
    }

    // Execute the web search tool
    const result = await executeWebSearchTool(query, timeframe);

    // Return the result with additional metadata
    return NextResponse.json({
      ...result,
      tool: 'web-search',
      timestamp: new Date().toISOString(),
      request: { query, timeframe }
    });

  } catch (error) {
    console.error('Web search tool API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        tool: 'web-search'
      },
      { status: 500 }
    );
  }
}
