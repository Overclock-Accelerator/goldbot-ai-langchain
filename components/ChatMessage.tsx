import ReactMarkdown from 'react-markdown';
import ToolUsageIndicator from './ToolUsageIndicator';
import PriceChart from './PriceChart';
import { MODEL_PROVIDERS } from '@/lib/models/config';

interface ChatMessageProps {
  message: string;
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

export default function ChatMessage({ message, isUser, usedTool, toolInfo, chartData, provider, model }: ChatMessageProps) {
  // Don't render empty messages
  if (!message && !chartData) return null;

  // Format provider and model names for display
  const providerConfig = MODEL_PROVIDERS.find(p => p.id === provider);
  const modelConfig = providerConfig?.models.find(m => m.id === model);
  const providerDisplay = providerConfig?.name || provider;
  const modelDisplay = modelConfig?.name || model;

  return (
    <div className={`mb-6 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      {!isUser && provider && model && (
        <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-1 px-2">
          {providerDisplay} · {modelDisplay}
        </div>
      )}
      <div className={`${chartData ? 'w-full' : 'max-w-[80%]'} rounded-2xl px-5 py-3 ${
        isUser
          ? 'bg-zinc-900 dark:bg-zinc-800 text-white'
          : 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 text-zinc-900 dark:text-zinc-100 border border-yellow-200 dark:border-yellow-800'
      }`}>
        {chartData && (
          <PriceChart data={chartData} />
        )}

        {isUser ? (
          <p className="text-sm leading-relaxed">
            {message}
          </p>
        ) : (
          message && (
            <div className="text-sm leading-relaxed prose prose-sm max-w-none
              prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-strong:font-semibold
              prose-p:my-1 prose-p:text-zinc-900 dark:prose-p:text-zinc-100
              prose-a:text-yellow-600 dark:prose-a:text-yellow-400 prose-a:no-underline hover:prose-a:underline
              prose-code:text-yellow-700 dark:prose-code:text-yellow-300 prose-code:bg-yellow-100 dark:prose-code:bg-yellow-900/30 prose-code:px-1 prose-code:rounded
            ">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 text-zinc-900 dark:text-zinc-100">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{children}</strong>,
                  em: ({ children }) => <em className="italic text-zinc-900 dark:text-zinc-100">{children}</em>,
                  code: ({ children }) => <code className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-1 rounded text-xs">{children}</code>
                }}
              >
                {message}
              </ReactMarkdown>
            </div>
          )
        )}
      </div>

      {/* Tool usage indicator for assistant messages only */}
      {!isUser && (message || chartData) && (
        <div className={`${chartData ? 'w-full' : 'max-w-[80%]'} w-full`}>
          <ToolUsageIndicator toolInfo={toolInfo} usedTool={usedTool} />
        </div>
      )}
    </div>
  );
}

