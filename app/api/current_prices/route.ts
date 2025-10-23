import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get query parameters
  const symbol = searchParams.get('symbol');
  const currency = searchParams.get('currency') || 'USD';
  const date = searchParams.get('date'); // format: YYYYMMDD
  
  // Validate required parameter
  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }
  
  // Construct the goldapi.io URL
  let apiUrl = `https://www.goldapi.io/api/${symbol}/${currency}`;
  if (date) {
    apiUrl += `/${date}`;
  }
  
  // Prepare headers
  const headers = new Headers();
  headers.append('x-access-token', 'goldapi-3kuua19mh2qh841-io');
  headers.append('Content-Type', 'application/json');
  
  try {
    // Fetch data from goldapi.io
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch from goldapi.io', details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Return the JSON response directly
    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

