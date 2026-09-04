// =============================================================================
// AI Provider Factory
// =============================================================================
import { AIProvider, AIProviderName, AIProviderConfig, AIProviderFactory, ProviderCapabilities } from './types';
import { OpenAIProvider, createOpenAIProvider } from './openai';
import { AnthropicProvider, createAnthropicProvider } from './anthropic';
import { OllamaProvider, createOllamaProvider } from './ollama';

export class AIProviderFactoryImpl implements AIProviderFactory {
  private providers: Map<AIProviderName, AIProvider> = new Map();
  private defaultProvider: AIProviderName = 'openai';
  private config: Record<string, AIProviderConfig> = {};

  constructor(env: Record<string, string | undefined> = process.env) {
    this.initializeProviders(env);
  }

  private initializeProviders(env: Record<string, string | undefined>) {
    // OpenAI
    if (env.OPENAI_API_KEY) {
      const provider = createOpenAIProvider(env);
      this.providers.set('openai', provider);
      this.config.openai = provider.config;
    }

    // Anthropic
    if (env.ANTHROPIC_API_KEY) {
      const provider = createAnthropicProvider(env);
      this.providers.set('anthropic', provider);
      this.config.anthropic = provider.config;
    }

    // Ollama (always available if running)
    const ollamaProvider = createOllamaProvider(env);
    this.providers.set('ollama', ollamaProvider);
    this.config.ollama = ollamaProvider.config;

    // Set default provider based on availability
    if (this.providers.has('openai')) this.defaultProvider = 'openai';
    else if (this.providers.has('anthropic')) this.defaultProvider = 'anthropic';
    else this.defaultProvider = 'ollama';
  }

  createProvider(name: AIProviderName, config: AIProviderConfig): AIProvider {
    switch (name) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'ollama':
        return new OllamaProvider(config);
      default:
        throw new Error(`Unknown provider: ${name}`);
    }
  }

  getDefaultProvider(): AIProviderName {
    return this.defaultProvider;
  }

  getProvider(name: AIProviderName): AIProvider | null {
    return this.providers.get(name) || null;
  }

  getAvailableProviders(): AIProviderName[] {
    return Array.from(this.providers.keys());
  }

  getProviderCapabilities(name: AIProviderName): ProviderCapabilities | null {
    const provider = this.providers.get(name);
    return provider?.capabilities || null;
  }

  async validateAllProviders(): Promise<Record<AIProviderName, boolean>> {
    const results: Record<string, boolean> = {};
    for (const [name, provider] of this.providers) {
      results[name] = await provider.validateConfig();
    }
    return results as Record<AIProviderName, boolean>;
  }

  async getBestProviderForTask(
    task: 'chat' | 'embedding' | 'vision' | 'json' | 'cost',
    preferredProvider?: AIProviderName
  ): Promise<AIProviderName> {
    // If preferred provider is available and supports the task, use it
    if (preferredProvider && this.providers.has(preferredProvider)) {
      const provider = this.providers.get(preferredProvider)!;
      if (this.supportsTask(provider, task)) return preferredProvider;
    }

    // Find best provider for task
    const candidates = Array.from(this.providers.entries())
      .filter(([, provider]) => this.supportsTask(provider, task))
      .sort((a, b) => this.scoreProvider(a[1], task) - this.scoreProvider(b[1], task));

    return candidates[0]?.[0] || this.defaultProvider;
  }

  private supportsTask(provider: AIProvider, task: string): boolean {
    switch (task) {
      case 'chat':
        return provider.capabilities.chat;
      case 'embedding':
        return provider.capabilities.embedding;
      case 'vision':
        return provider.capabilities.vision;
      case 'json':
        return provider.capabilities.jsonMode;
      case 'cost':
        return true; // All providers have some cost model
      default:
        return false;
    }
  }

  private scoreProvider(provider: AIProvider, task: string): number {
    let score = 0;
    const defaultModel = provider.models.find(m => m.id === provider.config.defaultModel);
    
    switch (task) {
      case 'chat':
        score += provider.capabilities.streaming ? 10 : 0;
        score += provider.capabilities.functions ? 5 : 0;
        score -= (defaultModel?.costPer1kTokens?.input || 0) * 1000;
        break;
      case 'embedding':
        score += provider.capabilities.embedding ? 10 : 0;
        break;
      case 'vision':
        score += provider.capabilities.vision ? 10 : 0;
        break;
      case 'cost':
        score -= (defaultModel?.costPer1kTokens?.input || 0) * 1000;
        break;
    }
    return score;
  }
}

// Singleton instance
let factoryInstance: AIProviderFactoryImpl | null = null;

export function getAIFactory(env?: Record<string, string | undefined>): AIProviderFactoryImpl {
  if (!factoryInstance) {
    factoryInstance = new AIProviderFactoryImpl(env);
  }
  return factoryInstance;
}

export function resetAIFactory(): void {
  factoryInstance = null;
}

// Convenience functions
export async function chat(
  options: Parameters<AIProvider['chat']>[0],
  providerName?: AIProviderName
): Promise<ReturnType<AIProvider['chat']>> {
  const factory = getAIFactory();
  const provider = providerName ? factory.getProvider(providerName) : factory.getProvider(factory.getDefaultProvider());
  if (!provider) throw new Error('No AI provider available');
  return provider.chat(options);
}

export async function* chatStream(
  options: Parameters<AIProvider['chatStream']>[0],
  providerName?: AIProviderName
): AsyncIterable<ReturnType<AIProvider['chatStream']>> {
  const factory = getAIFactory();
  const provider = providerName ? factory.getProvider(providerName) : factory.getProvider(factory.getDefaultProvider());
  if (!provider) throw new Error('No AI provider available');
  yield* provider.chatStream(options);
}

export async function embed(
  options: Parameters<AIProvider['embed']>[0],
  providerName?: AIProviderName
): Promise<ReturnType<AIProvider['embed']>> {
  const factory = getAIFactory();
  const provider = providerName ? factory.getProvider(providerName) : factory.getProvider(factory.getDefaultProvider());
  if (!provider) throw new Error('No AI provider available');
  return provider.embed(options);
}

export async function getBestProviderForChat(preferredProvider?: AIProviderName): Promise<AIProviderName> {
  const factory = getAIFactory();
  return factory.getBestProviderForTask('chat', preferredProvider);
}

export async function getBestProviderForEmbedding(preferredProvider?: AIProviderName): Promise<AIProviderName> {
  const factory = getAIFactory();
  return factory.getBestProviderForTask('embedding', preferredProvider);
}