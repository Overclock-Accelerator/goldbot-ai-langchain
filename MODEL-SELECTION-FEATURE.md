# Model Provider Selection Feature

## Overview

GoldBot now supports multiple AI model providers, allowing users to switch between different models at runtime. The selection is stored in session state and resets on page reload.

## Supported Providers & Models

### OpenAI
- **GPT-5**: Latest flagship model
- **GPT-5 Mini**: Balanced performance and cost
- **GPT-5 Nano**: Fast, cost-effective (default)

### Anthropic
- **Claude Sonnet 4.5**: Balanced capabilities
- **Claude Haiku 4.5**: Fast, efficient

### OpenRouter
- **Grok 4 Fast** (x-ai/grok-4-fast): X.AI's latest model
- **DeepSeek V3.2** (deepseek/deepseek-v3.2-exp): Advanced reasoning
- **GLM 4.6** (z-ai/glm-4.6): Multilingual capabilities

## Architecture

### Frontend Components

**ModelSelector Component** (`components/ModelSelector.tsx`)
- Provider dropdown (OpenAI, Anthropic, OpenRouter)
- Model dropdown (filtered by selected provider)
- Two display modes: compact (navbar) and full (home page)
- Auto-selects first model when provider changes

**Integration Points**
- **Home Page** (`app/page.tsx`): Full selector above sample questions when no messages
- **Chat Header** (`components/ChatHeader.tsx`): Compact selector in navbar during conversation

### Backend Implementation

**Model Configuration** (`lib/models/config.ts`)
- Centralized provider and model definitions
- Type-safe ModelProvider type
- Helper functions for validation
- Default: OpenAI GPT-5 Nano

**Dynamic Model Instantiation** (`lib/llm/langchain-service.ts`)
- `createModelInstance()` factory function
- Creates appropriate model based on provider:
  - OpenAI: Uses `ChatOpenAI` with OpenAI API
  - Anthropic: Uses `ChatAnthropic` with Anthropic API
  - OpenRouter: Uses `ChatOpenAI` with OpenRouter endpoint
- Agent created dynamically per request with selected model

**API Route** (`app/api/chat/route.ts`)
- Accepts `provider` and `model` in request body
- Validates provider/model combination
- Passes to LangChain service

## State Management

- **Storage**: Session state (React useState)
- **Persistence**: None (resets on page reload)
- **Default**: OpenAI GPT-5 Nano
- **Scope**: Global across the application

## Environment Variables

Users must configure at least one provider's API key:

```bash
# OpenAI - for GPT models
OPENAI_API_KEY=sk-...

# Anthropic - for Claude models
ANTHROPIC_API_KEY=sk-ant-...

# OpenRouter - for Grok, DeepSeek, GLM models
OPENROUTER_API_KEY=sk-or-...
```

## User Experience

### Initial State
1. User sees full ModelSelector above sample questions
2. Default selection: OpenAI GPT-5 Nano
3. User can change provider/model before starting conversation

### During Conversation
1. Compact ModelSelector appears in navbar next to "Clear Chat"
2. User can switch models mid-conversation
3. New model applies to subsequent messages only
4. Previous messages remain unchanged

### Model Switching Behavior
- Changing provider auto-selects first model of new provider
- Model selection persists during session
- Resets to default on page reload
- No server-side persistence

## Error Handling

**Missing API Keys**
- Runtime error if selected provider's API key not configured
- Error message indicates which key is missing

**Invalid Provider/Model**
- API validates provider/model combination
- Returns 400 error with details if invalid
- Frontend prevents invalid selections via dropdown

## Implementation Details

### Type Safety
- TypeScript types ensure compile-time safety
- `ModelProvider` type restricts to valid providers
- Config validation prevents invalid combinations

### Performance
- Agent created per request (no pre-initialization)
- Minimal overhead (~50ms for model instantiation)
- No caching (allows clean model switching)

### LangChain Integration
- Uses LangChain's `createAgent()` with dynamic model
- Works with all LangChain tools unchanged
- Compatible with existing conversation history

## Testing

To test the feature:

1. Configure multiple provider API keys in `.env.local`
2. Start development server: `npm run dev`
3. Open browser to `http://localhost:3000`
4. Try switching providers and models
5. Send messages with different models
6. Verify responses come from selected model

## Future Enhancements

Potential improvements:
- LocalStorage persistence across sessions
- Per-conversation model selection
- Model performance comparison UI
- Token usage tracking per model
- Model-specific configuration (temperature, max_tokens)

