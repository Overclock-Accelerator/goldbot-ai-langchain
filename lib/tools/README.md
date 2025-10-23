# LLM Tools

This folder contains all the tools that the LLM (Claude) can use to perform specific tasks. Each tool is organized in its own subfolder for clarity and maintainability.

## 📁 Folder Structure

```
lib/tools/
├── README.md              # This file - explains the tools system
├── index.ts               # Main tools index - exports all tools
├── spot-price/            # Spot price tool folder
│   ├── index.ts           # Tool exports
│   ├── definition.ts      # Tool definition for Claude
│   └── execute.ts         # Tool execution logic
└── historical-data/       # Historical data analysis tool folder
    ├── index.ts           # Tool exports
    ├── definition.ts      # Tool definition for Claude
    ├── execute.ts         # Tool execution logic
    └── utils.ts           # Date parsing and Excel utilities
```

## 🔧 How Tools Work

1. **Tool Definition** (`definition.ts`): Defines what the tool does and what parameters it accepts
2. **Tool Execution** (`execute.ts`): Contains the actual code that runs when Claude calls the tool
3. **Tool Index** (`index.ts`): Exports everything for easy importing

## 📋 Available Tools

### Spot Price Tool (`spot-price/`)
- **Purpose**: Gets current precious metals prices (gold, silver, platinum, palladium)
- **Usage**: Claude automatically calls this when users ask about metal prices
- **Parameters**:
  - `metal`: Metal symbol (XAU, XAG, XPT, XPD)
  - `currency`: Currency code (defaults to USD)

### Historical Data Tool (`historical-data/`)
- **Purpose**: Analyzes historical price trends and changes over time periods
- **Usage**: Claude calls this for questions about price changes, historical trends, or period comparisons
- **Parameters**:
  - `metal`: Metal symbol (XAU, XAG, XPT, XPD)
  - `startDate`: Start date (YYYY-MM format) - optional if using relativePeriod
  - `endDate`: End date (YYYY-MM format) - optional if using relativePeriod
  - `relativePeriod`: Relative time like "last 5 months", "past year" - alternative to specific dates
- **Features**:
  - Converts Excel date format (1990M9) to readable format (September 1990)
  - Calculates absolute and percentage changes
  - Handles relative periods ("last 5 months", "past year")
  - Finds closest available dates if exact dates not found

## 🚀 Adding New Tools

To add a new tool:

1. Create a new folder: `lib/tools/your-tool-name/`
2. Create these files:
   - `definition.ts` - Define the tool for Claude
   - `execute.ts` - Implement the tool logic
   - `index.ts` - Export everything
3. Add your tool to `lib/tools/index.ts`
4. Update this README

## 💡 Example Tool Structure

```typescript
// definition.ts
export const yourToolDefinition = {
  name: "your_tool_name",
  description: "What your tool does",
  input_schema: {
    // Define parameters here
  }
};

// execute.ts
export async function executeYourTool(param1: string) {
  // Tool logic here
  return { success: true, data: result };
}

// index.ts
export * from './definition';
export * from './execute';
```

## 🔄 Integration with LLM

Tools are automatically available to Claude through the LLM service in `lib/llm/anthropic-service.ts`. Claude decides when and how to use them based on user input and the tool definitions.