# LangGraph Deployment Quick Start

> **⚠️ IMPORTANT**: This guide is for **optional** advanced deployment with LangGraph Cloud. Your application works perfectly with just `npm run dev` and LangSmith tracing enabled in `.env.local`.
>
> **You only need this guide if you want:**
> - LangGraph Cloud managed infrastructure
> - LangGraph Studio visual debugging interface
> - Advanced streaming capabilities
> - Hosted agent deployments
>
> **For most users, this is NOT required.** See [QUICKSTART.md](./QUICKSTART.md) for the simple setup.

---

**Goal**: Get LangGraph local server running and LangSmith tracing active in <15 minutes.

## Prerequisites

✅ Migration complete (all tests passing)
✅ Dev server running on http://localhost:3002
✅ You want to use LangGraph Cloud features (optional)

---

## Step 1: Get LangSmith API Key (5 minutes)

1. Visit https://smith.langchain.com/
2. Sign up or log in with GitHub
3. Click your profile → Settings → API Keys
4. Create API key → Copy it

---

## Step 2: Update Environment Variables (2 minutes)

Add to your `.env.local` file:

```bash
# LangSmith Observability
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=<paste_your_key_here>
LANGSMITH_PROJECT=goldbot-ai-development
```

**Restart your dev server:**
```bash
# Kill existing server
pkill -f "npm run dev"

# Restart
npm run dev
```

---

## Step 3: Test LangSmith Tracing (3 minutes)

**Send a test request:**
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the current gold price?"}'
```

**View the trace:**
1. Go to https://smith.langchain.com/
2. Click "Projects" → "goldbot-ai-development"
3. See your trace with full LLM calls and tool executions!

**What you'll see:**
```
agent.invoke()
├── [ChatAnthropic] "What is the current gold price?"
├── [get_spot_price] Tool call {metal: "XAU"}
└── [ChatAnthropic] "The current gold price is $2,750.50..."
```

---

## Step 4: Start Local LangGraph Server (5 minutes)

**Install LangGraph CLI:**
```bash
npm install -g @langchain/langgraph-cli
```

**Start the server:**
```bash
npx @langchain/langgraph-cli dev
```

**Expected output:**
```
✓ Starting LangGraph API server...
✓ Server running at http://localhost:2024
✓ LangGraph Studio: https://smith.langchain.com/studio?baseUrl=http://localhost:2024
```

**Test the LangGraph endpoint:**
```bash
curl -X POST http://localhost:2024/runs/stream \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "goldbot-agent",
    "input": {
      "messages": [{"role": "user", "content": "What is gold worth?"}]
    },
    "stream_mode": "updates"
  }'
```

---

## ✅ Success Criteria

You're ready for deployment when:

- [ ] LangSmith traces appear in dashboard
- [ ] Local LangGraph server starts without errors
- [ ] Test request returns valid agent response
- [ ] All 6 tools traced in LangSmith

---

## Next Steps

### Option A: Deploy to LangGraph Cloud (Recommended)
See full guide: `docs/architecture/langgraph-cloud-deployment.md`

**Quick commands:**
```bash
# Authenticate
langgraph auth login

# Deploy
langgraph deploy \
  --project goldbot-ai \
  --name production
```

### Option B: Keep Testing Locally
- Use LangGraph Studio Web UI: https://smith.langchain.com/studio?baseUrl=http://localhost:2024
- Test different queries and monitor in LangSmith
- Optimize prompts and tool usage

---

## Troubleshooting

### Issue: LangSmith traces not appearing
**Solution:**
- Check `LANGSMITH_TRACING=true` is set
- Verify API key is correct
- Restart dev server after adding env vars

### Issue: LangGraph server won't start
**Solution:**
- Check Node.js version: `node --version` (should be 20+)
- Verify `langgraph.json` exists in project root
- Check `.env.local` has all required keys

### Issue: "Cannot find module" errors
**Solution:**
- Run `npm install` to ensure all dependencies are installed
- Check `lib/llm/langchain-service.ts` exports `agent`

---

## Cost Estimates

**Local Testing (Free):**
- LangSmith: Free tier (5k traces/month)
- Anthropic: Pay per token (~$0.01/request)
- GoldAPI: Free tier (1k requests/month)

**Production (LangGraph Cloud):**
- LangGraph Cloud: $49/month (Starter)
- Anthropic: ~$105/month (10k requests)
- GoldAPI: $29/month (10k requests)
- **Total**: ~$183/month

---

## Documentation

- **Full Deployment Guide**: `docs/architecture/langgraph-cloud-deployment.md`
- **Migration Details**: `MIGRATING-TO-LANGCHAIN.md`
- **Architecture**: `docs/architecture/index.md`
- **LangSmith Docs**: https://docs.smith.langchain.com/
- **LangGraph Docs**: https://langchain-ai.github.io/langgraphjs/
