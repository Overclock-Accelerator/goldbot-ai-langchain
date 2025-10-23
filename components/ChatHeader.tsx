interface ChatHeaderProps {
  onClear?: () => void;
  showClear?: boolean;
}

export default function ChatHeader({ onClear, showClear }: ChatHeaderProps) {
  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-6 px-6">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 bg-clip-text text-transparent">
            GoldBot
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Have a question about precious metals? I can help you with that.
          </p>
        </div>
        {showClear && onClear && (
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            Clear Chat
          </button>
        )}
      </div>
    </header>
  );
}

