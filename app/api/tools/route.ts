import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'GoldBot AI Tools API',
    description: 'Independent API endpoints for testing each tool',
    tools: {
      'spot-price': {
        endpoint: '/api/tools/spot-price',
        description: 'Get current precious metals spot prices',
        methods: ['GET', 'POST'],
        examples: {
          GET: '/api/tools/spot-price?metal=XAU&currency=USD',
          POST: {
            url: '/api/tools/spot-price',
            body: { metal: 'XAU', currency: 'USD' }
          }
        },
        parameters: {
          metal: {
            required: true,
            type: 'string',
            enum: ['XAU', 'XAG', 'XPT', 'XPD'],
            description: 'Metal symbol (Gold=XAU, Silver=XAG, Platinum=XPT, Palladium=XPD)'
          },
          currency: {
            required: false,
            type: 'string',
            default: 'USD',
            description: 'Currency code for the price'
          }
        }
      },
      'historical-data': {
        endpoint: '/api/tools/historical-data',
        description: 'Analyze historical precious metals price data',
        methods: ['GET', 'POST'],
        examples: {
          GET: {
            relativePeriod: '/api/tools/historical-data?metal=XAU&relativePeriod=last 5 months',
            dateRange: '/api/tools/historical-data?metal=XAU&startDate=2024-01&endDate=2024-06'
          },
          POST: {
            url: '/api/tools/historical-data',
            body: { metal: 'XAU', relativePeriod: 'last 5 months' }
          }
        },
        parameters: {
          metal: {
            required: true,
            type: 'string',
            enum: ['XAU', 'XAG', 'XPT', 'XPD'],
            description: 'Metal symbol (Gold=XAU, Silver=XAG, Platinum=XPT, Palladium=XPD)'
          },
          relativePeriod: {
            required: false,
            type: 'string',
            examples: ['last 5 months', 'past year', 'last 2 years'],
            description: 'Relative time period (alternative to startDate/endDate)'
          },
          startDate: {
            required: false,
            type: 'string',
            format: 'YYYY-MM',
            description: 'Start date for analysis (use with endDate)'
          },
          endDate: {
            required: false,
            type: 'string',
            format: 'YYYY-MM',
            description: 'End date for analysis (use with startDate)'
          }
        }
      },
      'web-search': {
        endpoint: '/api/tools/web-search',
        description: 'Search for news, events, and information about precious metals',
        methods: ['GET', 'POST'],
        examples: {
          GET: {
            basic: '/api/tools/web-search?query=gold+price+news',
            withTimeframe: '/api/tools/web-search?query=silver+market+events&timeframe=last+6+months',
            specific: '/api/tools/web-search?query=platinum+price+drop&timeframe=2024'
          },
          POST: {
            url: '/api/tools/web-search',
            body: { query: 'gold price events', timeframe: 'last 10 months' }
          }
        },
        parameters: {
          query: {
            required: true,
            type: 'string',
            description: 'Search query (e.g., "gold price news", "silver market events")'
          },
          timeframe: {
            required: false,
            type: 'string',
            examples: ['last 6 months', 'last 10 months', '2024', 'past year'],
            description: 'Optional timeframe to focus the search'
          }
        }
      },
      'calculation': {
        endpoint: '/api/tools/calculation',
        description: 'Perform mathematical calculations for precious metals valuations',
        methods: ['GET', 'POST'],
        examples: {
          GET: {
            value: '/api/tools/calculation?expression=24*131.67&description=Calculate+value+of+24g+gold',
            conversion: '/api/tools/calculation?expression=100/31.1035&description=Convert+grams+to+troy+ounces',
            percentage: '/api/tools/calculation?expression=(2500-2000)/2000*100&description=Calculate+percentage+change'
          },
          POST: {
            url: '/api/tools/calculation',
            body: { expression: '24*131.67', description: 'Calculate value of 24g gold at $131.67/gram' }
          }
        },
        parameters: {
          expression: {
            required: true,
            type: 'string',
            description: 'Mathematical expression (supports +, -, *, /, parentheses)'
          },
          description: {
            required: true,
            type: 'string',
            description: 'Human-readable description of the calculation'
          }
        }
      }
    },
    dataRange: {
      start: '1990-01 (January 1990)',
      end: '2025-09 (September 2025)',
      totalMonths: 429
    }
  });
}