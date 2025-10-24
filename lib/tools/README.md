# LLM Tools - Educational Guide

This folder contains all the tools that the LLM (Claude) can use to perform specific tasks. Each tool is organized in its own subfolder for clarity and maintainability.

## 🎓 **LEARNING OBJECTIVE**

This codebase demonstrates how to implement **tool calling** (also called function calling) with Large Language Models (LLMs). Tool calling allows LLMs to interact with external systems, APIs, and databases, vastly expanding what they can do beyond just generating text.

**What You'll Learn:**
- How to define tools that an LLM can understand
- How LLMs decide when to use tools
- The multi-turn conversation pattern for tool execution
- How to structure tool results for LLM consumption
- Best practices for system prompts and tool organization

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

## 🔧 How Tool Calling Works - The Complete Workflow

Understanding tool calling requires knowing about **three key files**:

### 1. **Tool Definition** (`definition.ts`)
This is the "contract" between you and the LLM. It describes:
- **What** the tool does
- **When** to use it
- **What parameters** it needs
- **What values** are valid

**Key Point:** The LLM ONLY sees the definition, not the implementation!

**Example:** See `lib/tools/spot-price/definition.ts`

### 2. **Tool Execution** (`execute.ts`)
This contains the actual implementation - the code that runs when the tool is called:
- Makes API calls
- Performs calculations
- Queries databases
- Returns structured results

**Key Point:** The LLM never executes this code - WE execute it on the LLM's behalf!

**Example:** See `lib/tools/spot-price/execute.ts`

### 3. **LLM Orchestration** (`lib/llm/anthropic-service.ts`)
This is the "glue" that connects everything:
- Sends user messages + tool definitions to the LLM
- Receives tool requests from the LLM
- Executes the requested tools
- Sends results back to the LLM
- Gets final natural language response

**This is the MOST IMPORTANT file to understand!**

## 📊 The Tool Calling Flow

Here's what happens when a user asks: "What's the price of gold?"

```
1. User: "What's the price of gold?"
   ↓
2. Orchestrator sends to LLM:
   - User message
   - System prompt (explains when to use tools)
   - Tool definitions (what tools are available)
   ↓
3. LLM analyzes and responds:
   "I'll use the get_spot_price tool"
   tool_use { name: "get_spot_price", input: { metal: "XAU" } }
   ↓
4. Orchestrator executes the tool:
   executeSpotPriceTool("XAU") → { price: 2650, currency: "USD", ... }
   ↓
5. Orchestrator sends tool results back to LLM:
   "Here's the result from get_spot_price: {price: 2650...}"
   ↓
6. LLM generates natural response:
   "The current price of gold is $2,650 per ounce."
   ↓
7. User sees: "The current price of gold is $2,650 per ounce."
```

**This multi-turn pattern is the KEY to tool calling!**

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

---

## 🎯 Key Concepts for Students

### Concept 1: Separation of Definition and Execution
The LLM sees the **definition** but never the **execution code**. This separation:
- Keeps tool descriptions concise and clear
- Allows you to change implementation without updating the LLM
- Makes testing easier (mock execution, test orchestration)

### Concept 2: The LLM is the Decision Maker
**You don't tell the LLM which tool to use** - it decides based on:
- The user's query
- The tool descriptions
- The system prompt guidance

This is powerful because the LLM can:
- Choose the right tool for the job
- Use multiple tools in sequence
- Decide when NO tools are needed

### Concept 3: Structured Results are Critical
Always return results in a consistent structure:
```typescript
{
  success: boolean,
  data?: {...},      // Present if success = true
  error?: string     // Present if success = false
}
```

This helps the LLM understand what happened and craft appropriate responses.

### Concept 4: System Prompts are Your Teaching Tool
The system prompt in `anthropic-service.ts` is where you teach the LLM:
- What each tool does
- When to use each tool
- How to prioritize between tools
- What format to use in responses

**Spend time crafting good system prompts!** They dramatically affect tool usage quality.

## 🚦 Best Practices

### ✅ DO:
- Write clear, descriptive tool definitions
- Use meaningful parameter names and descriptions
- Include examples in tool descriptions when helpful
- Return structured, consistent results
- Handle errors gracefully
- Add logging for debugging
- Use enums to restrict parameter values when appropriate

### ❌ DON'T:
- Make tool descriptions too vague or generic
- Forget to mark required vs optional parameters
- Return inconsistent result structures
- Let errors crash - always catch and return error objects
- Make tools do too many things (keep them focused)
- Forget to validate inputs

## 📚 Files to Study (in order)

For students learning tool calling, read these files in this order:

1. **`lib/tools/spot-price/definition.ts`** - See how tools are defined
2. **`lib/tools/spot-price/execute.ts`** - See how tools are implemented
3. **`lib/tools/index.ts`** - See how tools are organized
4. **`lib/llm/anthropic-service.ts`** - See the complete orchestration (MOST IMPORTANT!)

## 🔗 Additional Resources

- [Anthropic Tool Use Documentation](https://docs.anthropic.com/claude/docs/tool-use)
- Each tool folder in this project contains detailed comments
- The `anthropic-service.ts` file has step-by-step explanations