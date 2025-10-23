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
- Supports symbol-based pricing queries (gold, silver, platinum, palladium)
- Includes date parameter for historical data
- Currency parameter support (defaults to USD)

### Key Features
- **Animated Sample Questions**: Questions auto-rotate individually every 2.5 seconds when chat is empty
- **WebGL Plasma Background**: Interactive plasma effect with mouse interaction and customizable properties
- **Chat State Management**: Tracks messages, input state, and UI transitions
- **API Proxy**: Secure goldapi.io integration through Next.js API routes

### Dependencies
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

## goldapi.io Integration

The API endpoint `/api/current_prices` accepts:
- `symbol` (required): metal symbol (XAU for gold, XAG for silver, etc.)
- `currency` (optional): currency code (defaults to USD)
- `date` (optional): historical date in YYYYMMDD format

API token is currently hardcoded in route.ts and should be moved to environment variables for production.