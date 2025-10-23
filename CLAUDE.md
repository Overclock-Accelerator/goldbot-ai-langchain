# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 chatbot application called "GoldBot AI" that provides information about precious metals prices. The app features a modern chat interface with animated background effects and integration with the goldapi.io service for real-time precious metals pricing data.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Framework
- Next.js 16 with App Router
- React 19.2.0
- TypeScript 5
- Tailwind CSS 4

## Architecture

### Core Components
- **app/page.tsx** - Main chat interface with state management for messages, sample questions rotation, and chat functionality
- **components/Plasma.tsx** - WebGL-based animated background using OGL library for plasma effects
- **components/ChatInput.tsx** - User input component for chat messages
- **components/ChatMessage.tsx** - Individual chat message display component
- **components/SampleQuestions.tsx** - Animated sample questions that rotate when no chat is active
- **components/ChatHeader.tsx** - Chat header with clear functionality

### API Integration
- **app/api/current_prices/route.ts** - Next.js API route that proxies requests to goldapi.io
- **app/api/chat/route.ts** - LLM chat endpoint that processes user messages with Claude
- Supports symbol-based pricing queries (gold, silver, platinum, palladium)
- Includes date parameter for historical data
- Currency parameter support (defaults to USD)

### LLM Integration (Anthropic Claude)
- **lib/llm/anthropic-service.ts** - Core LLM service with tool calling capabilities
- Uses Claude 3.5 Sonnet for natural language understanding
- Implements function calling for spot price retrieval
- Handles conversation history and context management
- Tool definition follows Anthropic's function calling format

### Key Features
- **LLM-Powered Chat**: Claude 3.5 Sonnet processes natural language queries and decides when to use tools
- **Tool Integration**: Automatic spot price retrieval when users ask about precious metals pricing
- **Animated Sample Questions**: Questions auto-rotate individually every 2.5 seconds when chat is empty
- **WebGL Plasma Background**: Interactive plasma effect with mouse interaction and customizable properties
- **Chat State Management**: Tracks messages, conversation history, and loading states
- **API Proxy**: Secure goldapi.io integration through Next.js API routes

### Dependencies
- `@anthropic-ai/sdk` - Anthropic Claude API integration
- `ogl` - WebGL library for plasma effects
- `framer-motion` - Animation library
- `clsx` and `tailwind-merge` - CSS utility management

### Styling
- Tailwind CSS with custom gradients and dark mode support
- CSS modules for WebGL canvas styling (components/Plasma.css)
- Responsive design with fixed bottom input area

### State Management
The main page manages:
- Message history with user/bot identification
- Sample questions rotation and animation states
- Input value synchronization
- Chat visibility toggle

## Environment Variables

Required environment variables in `.env.local`:
- `ANTHROPIC_API_KEY` - Your Anthropic Claude API key
- `GOLDAPI_KEY` - Your goldapi.io API token

## LLM Tool Flow

1. User sends message via chat interface
2. Frontend calls `/api/chat` with message and conversation history
3. Claude analyzes message and determines if spot price tool is needed
4. If tool is needed, Claude calls `get_spot_price` function
5. Tool executes API call to `/api/current_prices` → goldapi.io
6. Tool results are sent back to Claude for interpretation
7. Claude generates human-readable response with pricing data
8. Response is displayed in chat interface

## goldapi.io Integration

The API endpoint `/api/current_prices` accepts:
- `symbol` (required): metal symbol (XAU for gold, XAG for silver, etc.)
- `currency` (optional): currency code (defaults to USD)
- `date` (optional): historical date in YYYYMMDD format