import { NextRequest, NextResponse } from 'next/server';
// LANGCHAIN MIGRATION: Switched to LangChain agent service (Epic 4)
import { processChatWithLangChain } from '@/lib/llm/langchain-service';
// ROLLBACK: Uncomment line below and comment line above to rollback
// import { processChatWithLLM } from '@/lib/llm/anthropic-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate conversation history format if provided
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: 'Conversation history must be an array' },
        { status: 400 }
      );
    }

    // Process the chat message with LangChain agent
    console.log('Processing chat message:', message);
    const result = await processChatWithLangChain(message, conversationHistory);
    console.log('LangChain agent result:', result);

    if (!result.success) {
      console.error('LLM processing failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process chat message',
          details: result.error,
          response: result.response || 'Sorry, I encountered an error processing your request.'
        },
        { status: 200 } // Change to 200 so frontend can handle it properly
      );
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      response: result.response,
      usedTool: result.usedTool || false,
      toolResults: result.toolResults || null,
      toolsUsed: result.toolsUsed || [],
      chartData: result.chartData || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        response: "I'm sorry, I encountered an error processing your request. Please try again."
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}