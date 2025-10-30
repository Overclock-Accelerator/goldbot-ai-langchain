"use client";

import { useState, useEffect, useCallback } from "react";
import ChatHeader from "@/components/ChatHeader";
import ModelSelector from "@/components/ModelSelector";
import SampleQuestions from "@/components/SampleQuestions";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import LoadingIndicator from "@/components/LoadingIndicator";
import { DEFAULT_PROVIDER, DEFAULT_MODEL } from "@/lib/models/config";
import type { ModelProvider } from "@/lib/models/config";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  usedTool?: boolean;
  toolInfo?: {
    toolName?: string;
    description?: string;
  };
  chartData?: any;
  provider?: string;
  model?: string;
}

interface ChatResponse {
  success: boolean;
  response: string;
  usedTool?: boolean;
  toolResults?: unknown;
  toolsUsed?: string[]; // Array of tool names that were used
  timestamp?: string;
  error?: string;
  chartData?: any;
}

const ALL_QUESTIONS = [
  "What is the current price of gold?",
  "What was the gold to silver ratio on 10/15/2025?",
  "How much is my 32 grams of 24k gold worth?",
  "How has the price of palladium changed over the last 10 weeks?",
  "How much has the price of gold increased this year?",
  "Have any world events impacted the price of platinum this year?",
  "What was the highest price of silver in the last 6 months?",
  "Compare the current gold price to last year's average",
  "What is driving the recent changes in palladium prices?",
  "Show me the price trend for gold over the last quarter",
  "Chart the gold price over the last 12 months",
];

// Shuffle array helper function
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [displayedQuestions, setDisplayedQuestions] = useState<string[]>([]);
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider>(DEFAULT_PROVIDER);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

  // Initialize and shuffle questions on mount
  useEffect(() => {
    const shuffled = shuffleArray(ALL_QUESTIONS);
    // Use setTimeout to avoid calling setState synchronously in effect
    const timeoutId = setTimeout(() => {
      setDisplayedQuestions(shuffled.slice(0, 4));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  // Auto-rotate individual questions randomly (only when no messages)
  useEffect(() => {
    if (messages.length > 0 || displayedQuestions.length === 0) return;

    const rotateRandomQuestion = () => {
      // Pick a random question index to rotate
      const randomIndex = Math.floor(Math.random() * 4);
      
      // Mark this question as animating out
      setAnimatingIndices(prev => new Set(prev).add(randomIndex));
      
      // After fade out, replace with new question
      setTimeout(() => {
        setDisplayedQuestions(current => {
          const newQuestions = [...current];
          // Find a question not currently displayed
          const availableQuestions = ALL_QUESTIONS.filter(q => !newQuestions.includes(q));
          if (availableQuestions.length > 0) {
            const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
            newQuestions[randomIndex] = randomQuestion;
          }
          return newQuestions;
        });
        
        // Remove from animating set to trigger fade in
        setTimeout(() => {
          setAnimatingIndices(prev => {
            const next = new Set(prev);
            next.delete(randomIndex);
            return next;
          });
        }, 50);
      }, 300);
    };

    // Rotate a random question every 5 seconds (reduced frequency for better performance)
    const interval = setInterval(() => {
      rotateRandomQuestion();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [messages.length]);

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      isUser: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      // Create conversation history from current messages
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

      // Use standard API for all queries
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationHistory,
          provider: selectedProvider,
          model: selectedModel
        }),
      });

      const data: ChatResponse = await response.json();

      // Log the full response for debugging
      console.log('Chat API Response:', data);

      if (!data.success) {
        console.error('Chat API Error:', data.error);
        throw new Error(data.error || 'Failed to get response from LLM');
      }

      // Extract tool information from the API response
      let toolInfo = undefined;
      if (data.usedTool && data.toolsUsed && data.toolsUsed.length > 0) {
        // Use the first tool that was used
        const primaryTool = data.toolsUsed[0];

        // Map tool names to descriptions
        const toolDescriptions: Record<string, string> = {
          'get_spot_price': 'Fetched current precious metals pricing data',
          'get_historical_data': 'Analyzed historical price trends and calculated changes',
          'search_metal_news': 'Searched for news and events about precious metals',
          'calculate': 'Performed mathematical calculations',
          'get_time_chart_data': 'Generated price trend chart data'
        };

        toolInfo = {
          toolName: primaryTool,
          description: toolDescriptions[primaryTool] || 'Used an AI tool to process your request'
        };
      }

      const botResponse: Message = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        usedTool: data.usedTool,
        toolInfo,
        chartData: data.chartData,
        provider: selectedProvider,
        model: selectedModel
      };

      setMessages((prev) => [...prev, botResponse]);

      // Log tool usage for demonstration purposes
      if (data.usedTool) {
        console.log('🔧 LLM used tool:', data.toolResults);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: "I apologize, but I encountered an error processing your request. Please try again.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMessages = useCallback(() => {
    setMessages([]);
    setInputValue('');
  }, []);

  const handleQuestionClick = useCallback((question: string) => {
    setInputValue(question);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <div className="flex flex-col h-screen">
        {messages.length > 0 && (
          <ChatHeader 
            onClear={handleClearMessages} 
            showClear={true}
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={setSelectedProvider}
            onModelChange={setSelectedModel}
          />
        )}
      
        <div className={`flex-1 overflow-y-auto pb-32 ${messages.length === 0 ? 'flex items-center justify-center' : 'pt-8'}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-8 w-full max-w-3xl mx-auto px-4">
              <SampleQuestions 
                questions={displayedQuestions}
                onQuestionClick={handleQuestionClick}
                animatingIndices={animatingIndices}
              />
              <ModelSelector
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                onProviderChange={setSelectedProvider}
                onModelChange={setSelectedModel}
                compact={false}
              />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  usedTool={message.usedTool}
                  toolInfo={message.toolInfo}
                  chartData={message.chartData}
                  provider={message.provider}
                  model={message.model}
                />
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="mb-6">
                  <LoadingIndicator 
                    message={`Using ${selectedProvider === 'openai' ? 'OpenAI' : selectedProvider === 'anthropic' ? 'Anthropic' : 'OpenRouter'} ${selectedModel}...`} 
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black dark:to-transparent pb-6 pt-8">
          <div className="max-w-3xl mx-auto px-4">
            <ChatInput
              onSubmit={handleSendMessage}
              value={inputValue}
              onChange={setInputValue}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
