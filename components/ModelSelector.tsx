"use client";

import { MODEL_PROVIDERS, type ModelProvider } from '@/lib/models/config';

interface ModelSelectorProps {
  selectedProvider: ModelProvider;
  selectedModel: string;
  onProviderChange: (provider: ModelProvider) => void;
  onModelChange: (model: string) => void;
  compact?: boolean;
}

export default function ModelSelector({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  compact = false
}: ModelSelectorProps) {
  const currentProvider = MODEL_PROVIDERS.find(p => p.id === selectedProvider);
  const availableModels = currentProvider?.models || [];

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as ModelProvider;
    onProviderChange(newProvider);
    
    // Auto-select first model of new provider
    const newProviderConfig = MODEL_PROVIDERS.find(p => p.id === newProvider);
    if (newProviderConfig && newProviderConfig.models.length > 0) {
      onModelChange(newProviderConfig.models[0].id);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onModelChange(e.target.value);
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        <select
          value={selectedProvider}
          onChange={handleProviderChange}
          className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {MODEL_PROVIDERS.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        
        <select
          value={selectedModel}
          onChange={handleModelChange}
          className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {availableModels.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Provider
        </label>
        <select
          value={selectedProvider}
          onChange={handleProviderChange}
          className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {MODEL_PROVIDERS.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Model
        </label>
        <select
          value={selectedModel}
          onChange={handleModelChange}
          className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {availableModels.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

