// =============================================================================
// Base AI Provider Abstract Class
// =============================================================================
import {
  AIProvider,
  AIProviderConfig,
  AIModel,
  ChatMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  StreamingChatResponse,
  EmbeddingOptions,
  EmbeddingResponse,
  ProviderCapabilities,
  Tool,
} from './types';

export abstract class BaseAIProvider implements AIProvider {
  abstract name: 'openai' | 'anthropic' | 'ollama';
  abstract config: AIProviderConfig;
  abstract capabilities: ProviderCapabilities;
  abstract models: AIModel[];

  protected abstract client: unknown;

  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    throw new Error('Not implemented');
  }

  async *chatStream(options: ChatCompletionOptions): AsyncIterable<StreamingChatResponse> {
    throw new Error('Not implemented');
  }

  async embed(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    throw new Error('Not implemented');
  }

  async listModels(): Promise<AIModel[]> {
    return this.models;
  }

  async validateConfig(): Promise<boolean> {
    try {
      await this.listModels();
      return true;
    } catch {
      return false;
    }
  }

  protected formatMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      ...(msg.name && { name: msg.name }),
      ...(msg.toolCalls && { toolCalls: msg.toolCalls }),
      ...(msg.toolCallId && { toolCallId: msg.toolCallId }),
    }));
  }

  protected formatTools(tools?: Tool[]): Tool[] | undefined {
    return tools;
  }

  protected calculateUsage(promptTokens: number, completionTokens: number) {
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }
}

export function createProviderConfig(
  provider: 'openai' | 'anthropic' | 'ollama',
  env: Record<string, string | undefined>
): AIProviderConfig {
  switch (provider) {
    case 'openai':
      return {
        apiKey: env.OPENAI_API_KEY,
        organization: env.OPENAI_ORGANIZATION,
        baseUrl: env.OPENAI_BASE_URL,
        defaultModel: env.OPENAI_DEFAULT_MODEL || 'gpt-4o',
        timeout: 60000,
        maxRetries: 3,
      };
    case 'anthropic':
      return {
        apiKey: env.ANTHROPIC_API_KEY,
        baseUrl: env.ANTHROPIC_BASE_URL,
        defaultModel: env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-sonnet-20240229',
        timeout: 60000,
        maxRetries: 3,
      };
    case 'ollama':
      return {
        baseUrl: env.OLLAMA_BASE_URL || 'http://localhost:11434',
        defaultModel: env.OLLAMA_DEFAULT_MODEL || 'llama3',
        timeout: 120000,
        maxRetries: 2,
      };
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}