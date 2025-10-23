interface LoadingIndicatorProps {
  message?: string;
}

const loadingMessages = [
  "Analyzing precious metals data...",
  "Fetching current prices...",
  "Processing historical trends...",
  "Calculating price changes...",
  "Consulting market data..."
];

export default function LoadingIndicator({ message }: LoadingIndicatorProps) {
  // Use provided message or random loading message
  const displayMessage = message || loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  return (
    <div className="flex items-center space-x-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 max-w-2xl">
      {/* Animated dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
      </div>

      {/* Loading message */}
      <span className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">
        {displayMessage}
      </span>

      {/* Pulsing icon */}
      <div className="ml-auto">
        <svg
          className="w-5 h-5 text-yellow-500 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
    </div>
  );
}