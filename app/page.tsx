"use client";

import { useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import SampleQuestions from "@/components/SampleQuestions";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const SAMPLE_QUESTIONS = [
  "What is the current price of gold?",
  "What was the gold to silver ratio on 10/15/2025?",
  "How much is my 32 grams of 24k worth?",
  "How has the price of palladium changed over the last 10 weeks?",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

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
    <div className="flex flex-col h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      {messages.length > 0 && (
        <ChatHeader onClear={handleClearMessages} showClear={true} />
      )}
      
      <div className={`flex-1 overflow-y-auto pb-32 ${messages.length === 0 ? 'flex items-center justify-center' : 'pt-8'}`}>
        {messages.length === 0 ? (
          <SampleQuestions 
            questions={SAMPLE_QUESTIONS}
            onQuestionClick={handleQuestionClick}
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
  );
}
