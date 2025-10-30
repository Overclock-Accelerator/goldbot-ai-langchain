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

```bash
npm run dev
```

This starts the Next.js application on **http://localhost:3000**

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
┌─────────────────┐       ┌──────────────────┐
│   Next.js App   │◄─────►│   LangSmith      │
│  /api/chat      │       │   (Tracing)      │
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
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Environment Variables Not Loading

- Ensure `.env.local` is in the project root
- Restart the server after changing env vars
- Check for typos in variable names (case-sensitive)

### Chat Returns "Internal Server Error"

1. Verify your API keys are set correctly in `.env.local`
2. Check LangSmith traces for detailed error info if tracing is enabled
3. Look at the terminal console logs for error details

## Next Steps

- **LangChain Migration**: See [MIGRATING-TO-LANGCHAIN.md](./MIGRATING-TO-LANGCHAIN.md) for architecture details
- **Production Deployment**: See [DEPLOYMENT-QUICKSTART.md](./DEPLOYMENT-QUICKSTART.md) for optional LangGraph Cloud deployment (not required)

## Development Tips

### Hot Reload

Next.js automatically reloads on file changes for instant feedback during development.

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
