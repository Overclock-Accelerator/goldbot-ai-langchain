import React from 'react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function ChatInput({ onSubmit, value, onChange, disabled = false }: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      onChange('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        name="message"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={disabled ? "Processing..." : "Send a message..."}
        disabled={disabled}
        className="w-full px-6 py-5 pr-16 text-base bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 hover:scale-110 text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </form>
  );
}

export default React.memo(ChatInput);

