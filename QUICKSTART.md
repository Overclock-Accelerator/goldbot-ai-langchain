# GoldBot AI - Quick Start Guide

Get up and running with GoldBot AI in 5 minutes.

## Prerequisites

- Node.js 20+
- npm or yarn
- API keys (see below)

## 1. Environment Setup

Create a `.env.local` file in the project root:

```bash
# AI Model Provider API Keys (at least one required)
# OpenAI - for GPT-5, GPT-5 Mini, GPT-5 Nano models
OPENAI_API_KEY=sk-...

# Anthropic - for Claude Sonnet 4.5, Claude Haiku 4.5 models
ANTHROPIC_API_KEY=sk-ant-...

# OpenRouter - for Grok, DeepSeek, GLM models
OPENROUTER_API_KEY=sk-or-...

# Required: GoldAPI Key (for precious metals pricing)
GOLDAPI_KEY=goldapi-...

# Optional: LangSmith Tracing (highly recommended for debugging)
LANGSMITH_API_KEY=lsv2_pt_...
LANGSMITH_TRACING_V2=true
LANGSMITH_PROJECT=goldbot-ai
```

### Getting API Keys

**OpenAI API Key:**
1. Sign up at https://platform.openai.com/
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-`)

**Anthropic API Key:**
1. Sign up at https://console.anthropic.com/
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-ant-`)

**OpenRouter API Key:**
1. Sign up at https://openrouter.ai/
2. Navigate to Keys section
3. Create a new API key
4. Copy the key (starts with `sk-or-`)

**GoldAPI Key:**
1. Sign up at https://www.goldapi.io/
2. Get your API key from the dashboard
3. Free tier includes 100 requests/month

**LangSmith API Key (Optional but Recommended):**
1. Sign up at https://smith.langchain.com/
2. Navigate to Settings → API Keys
3. Create a new API key (starts with `lsv2_pt_`)
4. Create a project called "goldbot-ai" (or use any name you prefer)

## 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note**: The `--legacy-peer-deps` flag resolves peer dependency conflicts between LangChain packages.

## 3. Start the Application

You need to run **two** processes:

### Terminal 1: Next.js Frontend

```bash
npm run dev
```

This starts the Next.js application on **http://localhost:3000**

### Terminal 2: LangGraph Server

```bash
npx @langchain/langgraph-cli@latest dev --tunnel
```

This starts the LangGraph Platform server with:
- **Local API**: http://localhost:2024
- **Cloudflare Tunnel**: Public URL printed in terminal (e.g., `https://xxx.trycloudflare.com`)
- **LangGraph Studio**: Connect at https://smith.langchain.com/studio?baseUrl=http://localhost:2024

> **Tip**: The `--tunnel` flag creates a public URL for remote testing and LangGraph Studio access.

## 4. Access the Application

Open your browser to:

```
http://localhost:3000
```

You should see the GoldBot AI chat interface with animated plasma background.

## 5. LangSmith Tracing Setup

LangSmith provides powerful debugging and monitoring for your LangChain applications.

### Enable Tracing

If you added the LangSmith environment variables to `.env.local`, tracing is automatically enabled.

### View Traces

1. Go to https://smith.langchain.com/
2. Navigate to your project (e.g., "goldbot-ai")
3. You'll see:
   - **Traces**: Every conversation with full LLM interactions
   - **Tool calls**: Which tools were invoked and their results
   - **Token usage**: Cost tracking per request
   - **Latency metrics**: Performance analysis

### What You Can Monitor

- **Agent reasoning**: See the agent's thought process
- **Tool selection**: Why the agent chose specific tools
- **Error debugging**: Stack traces and error context
- **Performance**: Identify slow operations
- **Cost tracking**: Token usage and API costs

### Example Trace View

```
User: "What's the current gold price?"
  ├─ Agent: Analyzes query
  ├─ Tool: get_spot_price(symbol="XAU", currency="USD")
  │   └─ Result: $2,650.30/oz (+0.8%)
  └─ Agent: Formats response
```

## 6. Test the Application

Try these sample queries:

```
- "What is the current gold price?"
- "How much is 15 grams of 18k gold worth?"
- "Show me a chart of silver prices over the last year"
- "What's the latest gold market news?"
```

## Architecture Overview

```
┌─────────────────┐
│   Browser       │
│  localhost:3000 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js App   │
│  /api/chat      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐       ┌──────────────────┐
│ LangGraph Server│◄─────►│   LangSmith      │
│  localhost:2024 │       │   (Tracing)      │
└────────┬────────┘       └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Anthropic Claude│
│  (LLM + Tools)  │
└─────────────────┘
```

## Troubleshooting

### Port Already in Use

```bash
# Kill processes on ports 3000 and 2024
lsof -ti:3000 -ti:2024 | xargs kill -9
```

### LangGraph Server Not Starting

```bash
# Ensure you have the latest CLI
npm install -g @langchain/langgraph-cli@latest

# Run with debug output
npx @langchain/langgraph-cli@latest dev --tunnel --verbose
```

### Environment Variables Not Loading

- Ensure `.env.local` is in the project root
- Restart both processes after changing env vars
- Check for typos in variable names (case-sensitive)

### Chat Returns "Internal Server Error"

1. Check that LangGraph server is running (Terminal 2)
2. Verify `ANTHROPIC_API_KEY` is set correctly
3. Check LangSmith traces for detailed error info
4. Look at LangGraph server logs for connection issues

## Next Steps

- **LangChain Migration**: See [MIGRATING-TO-LANGCHAIN.md](./MIGRATING-TO-LANGCHAIN.md) for architecture details
- **Production Deployment**: See [DEPLOYMENT-QUICKSTART.md](./DEPLOYMENT-QUICKSTART.md) for production setup

## Development Tips

### Hot Reload

Both processes support hot reload:
- **Next.js**: Automatically reloads on file changes
- **LangGraph**: Restarts on `langgraph.json` or agent code changes

### LangGraph Studio

Use LangGraph Studio for visual debugging:

1. Open https://smith.langchain.com/studio
2. Set Base URL: `http://localhost:2024`
3. Test your agent with the visual interface
4. Input JSON:
   ```json
   {
     "messages": [
       {"role": "user", "content": "What is the current gold price?"}
     ]
   }
   ```

### Debugging with LangSmith

Enable verbose logging:

```bash
# In .env.local
LANGSMITH_TRACING_V2=true
LANGSMITH_VERBOSE=true
```

View detailed traces including:
- Prompt templates
- Tool schemas
- Model responses
- Error stack traces

## Support

- **Issues**: https://github.com/yourusername/goldbot-ai/issues
- **Discussions**: https://github.com/yourusername/goldbot-ai/discussions
- **LangChain Docs**: https://docs.langchain.com/
- **LangGraph Docs**: https://langchain-ai.github.io/langgraph/
