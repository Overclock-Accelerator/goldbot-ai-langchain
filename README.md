# GoldBot AI

An intelligent chat assistant for precious metals pricing and analysis, powered by Claude AI and real-time market data from goldapi.io.

## What is GoldBot AI?

GoldBot AI is a Next.js-based chatbot application that provides accurate, real-time information about precious metals (gold, silver, platinum, and palladium). Using Anthropic's Claude 3.5 Sonnet with advanced tool calling capabilities, it can understand natural language queries and intelligently decide which data sources and calculations to use to provide comprehensive answers.

## Key Features

### AI-Powered Natural Language Understanding
- Uses Claude 3.5 Sonnet for natural language processing
- Understands context and maintains conversation history
- Intelligently routes queries to appropriate tools
- Provides conversational, informative responses

### Real-Time Market Data Integration
- Live spot prices from goldapi.io
- Current pricing for gold (XAU), silver (XAG), platinum (XPT), and palladium (XPD)
- Multiple currency support
- Price change and percentage change indicators

### Historical Data Analysis
- Access to historical price data
- Analyze price trends over weeks, months, or years
- Compare start and end prices over any time period
- Calculate absolute and percentage changes

### Intelligent Tool Calling System
GoldBot uses six specialized tools that Claude automatically selects based on your query:

1. **get_weight_value** - Calculate the value of specific weights of precious metals
   - Supports grams, ounces, troy ounces
   - Multiple karat options for gold (24k, 22k, 21k, 20k, 18k, 16k, 14k, 10k)
   - Automatic price fetching and calculation in one step

2. **get_spot_price** - Fetch current spot prices
   - Real-time pricing from goldapi.io
   - Multiple currency support (USD default)
   - Includes price change information

3. **get_historical_data** - Analyze historical price trends
   - Flexible date range support
   - Relative period queries (e.g., "last 6 months", "past year")
   - Price change analysis with direction indicators

4. **get_time_chart_data** - Generate visualization data
   - Time-series data for charting price trends
   - Support for single or multiple metals comparison
   - Customizable data point granularity

5. **search_metal_news** - Search for market news and events
   - Search for news affecting precious metals prices
   - Timeframe-based search capabilities
   - Context for understanding price movements

6. **calculate** - Perform mathematical calculations
   - Used for non-weight calculations
   - Supports complex mathematical expressions

### Interactive User Interface
- Modern, animated WebGL plasma background
- Smooth chat interface with message history
- Sample questions that auto-rotate when idle
- Visual chart rendering for time-series data
- Responsive design with mobile support

## Types of Questions GoldBot Can Answer

### Current Pricing Queries
- "What's the current price of gold?"
- "How much is silver trading at?"
- "Show me platinum prices in EUR"

### Weight-Based Value Calculations
- "How much is 15 grams of gold worth?"
- "What's the value of 24 grams of 18k gold?"
- "Calculate the value of 100 oz of silver"
- "How much is my 5 oz gold coin worth?"

### Historical Analysis
- "How has gold performed over the last 12 months?"
- "What was the price change of silver between January and December 2024?"
- "Compare platinum prices from 6 months ago to now"
- "Show me gold's performance over the past year"

### Visual Trend Analysis
- "Chart gold prices over the last year"
- "Show me a graph of silver and platinum prices"
- "Visualize gold price trends for 2024"
- "Plot palladium prices for the last 6 months"

### Market Context and News
- "What events affected gold prices in 2024?"
- "Why did silver prices increase last month?"
- "Search for news about platinum prices"

### General Information
- "What's the difference between 18k and 24k gold?"
- "Tell me about precious metals"
- "How do spot prices work?"

## How It Works

### Architecture Overview

```
User Query
    ↓
Chat Interface (React)
    ↓
/api/chat endpoint
    ↓
Claude 3.5 Sonnet (Anthropic)
    ↓
Tool Selection & Execution
    ├── get_weight_value → goldapi.io
    ├── get_spot_price → goldapi.io
    ├── get_historical_data → Historical dataset
    ├── get_time_chart_data → Historical dataset
    ├── search_metal_news → Web search
    └── calculate → Math evaluation
    ↓
Claude generates natural language response
    ↓
User sees formatted answer (with optional chart)
```

### The Tool Calling Workflow

1. **User sends a message** through the chat interface
2. **Frontend calls /api/chat** with the message and conversation history
3. **Claude analyzes the query** and determines which tools (if any) are needed
4. **Tool execution**: If tools are needed:
   - Claude specifies which tool to call and with what parameters
   - The backend executes the tool(s) (fetching from goldapi.io or historical data)
   - Tool results are returned to Claude
5. **Response generation**: Claude uses the tool results to generate a natural, informative response
6. **Frontend displays** the formatted response (and renders charts if applicable)

### Data Integration

#### Real-Time Data (goldapi.io)
- Spot prices are fetched directly from goldapi.io API
- Includes current prices, units, currencies, and change metrics
- Used by `get_spot_price` and `get_weight_value` tools
- Requires GOLDAPI_KEY environment variable

#### Historical Data
- Pre-loaded historical dataset with monthly price data
- Used for analyzing trends and generating charts
- Powers `get_historical_data` and `get_time_chart_data` tools
- Supports flexible date queries and relative periods

#### Web Search Integration
- Provides context for price movements and market events
- Searches for news and information about precious metals
- Helps explain historical price changes

## Running Locally

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Anthropic API key (from https://console.anthropic.com)
- goldapi.io API key (from https://www.goldapi.io)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd goldbot-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GOLDAPI_KEY=your_goldapi_key_here
   ```

   To get your API keys:
   - **Anthropic API Key**: Sign up at https://console.anthropic.com
   - **goldapi.io Key**: Sign up at https://www.goldapi.io

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint for code quality checks

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19.2.0** - UI component library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Animation library
- **OGL** - WebGL library for plasma background effects
- **Chart.js** & **react-chartjs-2** - Chart visualization

### Backend & AI
- **Anthropic AI SDK** - Claude 3.5 Sonnet integration
- **Claude 3.5 Sonnet** - Natural language understanding and tool calling
- **goldapi.io API** - Real-time precious metals pricing data
- **Next.js API Routes** - Serverless backend functions

### Data & Utilities
- **xlsx** - Excel file processing for historical data
- **react-markdown** - Markdown rendering in chat
- **clsx** & **tailwind-merge** - CSS utility management

## Project Structure

```
goldbot-ai/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              # Main chat endpoint
│   │   └── tools/                     # Tool API routes
│   │       ├── spot-price/
│   │       ├── historical-data/
│   │       ├── weight-value/
│   │       ├── time-chart-data/
│   │       ├── web-search/
│   │       └── calculation/
│   ├── page.tsx                       # Main chat interface
│   └── layout.tsx                     # Root layout
├── components/
│   ├── ChatHeader.tsx                 # Chat header with clear button
│   ├── ChatInput.tsx                  # User input component
│   ├── ChatMessage.tsx                # Message display component
│   ├── SampleQuestions.tsx            # Rotating sample questions
│   └── Plasma.tsx                     # WebGL animated background
├── lib/
│   ├── llm/
│   │   └── anthropic-service.ts       # Claude integration & orchestration
│   └── tools/
│       ├── spot-price/
│       │   ├── definition.ts          # Tool schema for Claude
│       │   └── execute.ts             # Tool implementation
│       ├── historical-data/
│       ├── weight-value/
│       ├── time-chart-data/
│       ├── web-search/
│       └── calculation/
├── .env.local                         # Environment variables (create this)
└── package.json                       # Dependencies and scripts
```

## Key Implementation Details

### Tool Definition Pattern
Each tool has two components:
1. **definition.ts** - Describes the tool to Claude (schema, parameters, when to use)
2. **execute.ts** - Actual implementation that runs when Claude calls the tool

### Multi-Turn Conversation Flow
The system uses a multi-turn conversation pattern:
1. User message → Claude (with tool definitions)
2. Claude decides to use tools → Returns tool requests
3. Backend executes tools → Returns results
4. Results sent back to Claude → Claude generates final response
5. Final response → User

This allows Claude to seamlessly integrate real-time data into natural language responses.

### Intelligent Tool Selection
Claude automatically selects the right tool based on:
- The system prompt guidance
- Tool definitions and descriptions
- User query content and intent
- Conversation context

For example, if you ask "How much is 15 grams of 18k gold worth?", Claude:
1. Recognizes this as a weight-based value query
2. Selects the `get_weight_value` tool
3. Extracts parameters: metal=XAU, weight=15, unit=g, karat=18k
4. Executes the tool (which fetches current price and calculates)
5. Formats the result into a natural language response

## Development Notes

- The application uses educational comments throughout the codebase to explain LLM tool calling concepts
- All API routes follow consistent error handling patterns
- Tool results use a standardized success/error format
- The UI automatically handles chart rendering when chart data is returned
- Conversation history is maintained client-side and passed with each request

## License

This project is private and proprietary.

## Support

For issues or questions, please refer to the project documentation in the CLAUDE.md file.
