// ============================================================================
// MODEL CONFIGURATION
// ============================================================================
// Defines available AI model providers and their models for the GoldBot app

export type ModelProvider = 'openai' | 'anthropic' | 'openrouter';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
}

export interface ProviderConfig {
  id: ModelProvider;
  name: string;
  models: ModelConfig[];
}

export const MODEL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-5', name: 'GPT-5', provider: 'openai' },
      { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai' },
      { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'anthropic' },
      { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'anthropic' },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      { id: 'x-ai/grok-4-fast', name: 'Grok 4 Fast', provider: 'openrouter' },
      { id: 'deepseek/deepseek-v3.2-exp', name: 'DeepSeek V3.2', provider: 'openrouter' },
      { id: 'z-ai/glm-4.6', name: 'GLM 4.6', provider: 'openrouter' },
    ],
  },
];

// Default model selection
export const DEFAULT_PROVIDER: ModelProvider = 'openrouter';
export const DEFAULT_MODEL = 'z-ai/glm-4.6';

// Helper functions
export function getProviderConfig(providerId: ModelProvider): ProviderConfig | undefined {
  return MODEL_PROVIDERS.find(p => p.id === providerId);
}

export function getModelConfig(providerId: ModelProvider, modelId: string): ModelConfig | undefined {
  const provider = getProviderConfig(providerId);
  return provider?.models.find(m => m.id === modelId);
}

export function isValidProviderAndModel(providerId: string, modelId: string): boolean {
  const provider = MODEL_PROVIDERS.find(p => p.id === providerId);
  if (!provider) return false;
  return provider.models.some(m => m.id === modelId);
}

