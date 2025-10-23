"use client";

import { useState, useEffect } from "react";
import ChatHeader from "@/components/ChatHeader";
import SampleQuestions from "@/components/SampleQuestions";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Plasma from "@/components/Plasma";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const ALL_QUESTIONS = [
  "What is the current price of gold?",
  "What was the gold to silver ratio on 10/15/2025?",
  "How much is my 32 grams of 24k worth?",
  "How has the price of palladium changed over the last 10 weeks?",
  "How much has the price of gold increased this year?",
  "Have any world events impacted the price of platinum this year?",
  "What was the highest price of silver in the last 6 months?",
  "Compare the current gold price to last year's average",
  "What is driving the recent changes in palladium prices?",
  "Show me the price trend for gold over the last quarter",
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

  // Initialize and shuffle questions on mount
  useEffect(() => {
    const shuffled = shuffleArray(ALL_QUESTIONS);
    setDisplayedQuestions(shuffled.slice(0, 4));
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

    // Rotate a random question every 2.5 seconds
    const interval = setInterval(() => {
      rotateRandomQuestion();
    }, 2500);

    return () => {
      clearInterval(interval);
    };
  }, [messages.length]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      isUser: true,
    };
    
    setMessages((prev) => [...prev, newMessage]);

    // Simulate bot response (placeholder for future API integration)
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: "This is a placeholder response. API integration coming soon!",
        isUser: false,
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);
  };

  const handleClearMessages = () => {
    setMessages([]);
    setInputValue('');
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black relative">
      {/* Background Plasma Effect */}
      <div className="absolute inset-0 z-0 opacity-30">
        <Plasma 
          color="#F5C344"
          speed={0.3}
          direction="forward"
          scale={1.2}
          opacity={0.6}
          mouseInteractive={true}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen">
        {messages.length > 0 && (
          <ChatHeader onClear={handleClearMessages} showClear={true} />
        )}
      
        <div className={`flex-1 overflow-y-auto pb-32 ${messages.length === 0 ? 'flex items-center justify-center' : 'pt-8'}`}>
          {messages.length === 0 ? (
            <SampleQuestions 
              questions={displayedQuestions}
              onQuestionClick={handleQuestionClick}
              animatingIndices={animatingIndices}
            />
          ) : (
            <div className="max-w-3xl mx-auto px-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                />
              ))}
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black dark:to-transparent pb-6 pt-8">
          <div className="max-w-3xl mx-auto px-4">
            <ChatInput 
              onSubmit={handleSendMessage}
              value={inputValue}
              onChange={setInputValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
