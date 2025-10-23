interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export default function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div className={`mb-6 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
        isUser 
          ? 'bg-zinc-900 dark:bg-zinc-800 text-white' 
          : 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 text-zinc-900 dark:text-zinc-100 border border-yellow-200 dark:border-yellow-800'
      }`}>
        <p className="text-sm leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

