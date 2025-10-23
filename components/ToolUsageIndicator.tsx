interface ToolUsageIndicatorProps {
  toolInfo?: {
    toolName?: string;
    description?: string;
  };
  usedTool?: boolean;
}

const toolDisplayNames: Record<string, string> = {
  'get_spot_price': 'Current Price Tool',
  'get_historical_data': 'Historical Data Tool',
};

const toolIcons: Record<string, string> = {
  'get_spot_price': '💰',
  'get_historical_data': '📊',
};

export default function ToolUsageIndicator({ toolInfo, usedTool }: ToolUsageIndicatorProps) {
  if (!toolInfo && !usedTool) return null;

  const toolName = toolInfo?.toolName;
  const displayName = toolName ? toolDisplayNames[toolName] || toolName : 'Unknown Tool';
  const icon = toolName ? toolIcons[toolName] || '🔧' : '🤖';

  const isNativeResponse = !usedTool || !toolName;

  return (
    <div className="mt-2 flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
      <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
        <span className="text-sm">{icon}</span>
        <span className="font-medium">
          {isNativeResponse ? 'Native Response' : displayName}
        </span>
      </div>

      {toolInfo?.description && (
        <span className="text-zinc-400 dark:text-zinc-500 italic">
          {toolInfo.description}
        </span>
      )}

      {isNativeResponse && (
        <span className="text-zinc-400 dark:text-zinc-500 italic">
          Generated using Claude's built-in knowledge
        </span>
      )}
    </div>
  );
}