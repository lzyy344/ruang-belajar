// =============================================================================
// Ollama Provider Implementation (Local LLM)
// =============================================================================
import { BaseAIProvider, createProviderConfig } from './base';
import {
  AIProviderConfig,
  AIModel,
  ChatMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  StreamingChatResponse,
  EmbeddingOptions,
  EmbeddingResponse,
  ProviderCapabilities,
} from './types';

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaEmbeddingResponse {
  embedding: number[];
}

export class OllamaProvider extends BaseAIProvider {
  name = 'ollama' as const;
  config: AIProviderConfig;
  capabilities: ProviderCapabilities = {
    chat: true,
    embedding: true,
    completion: true,
    streaming: true,
    functions: false,
    vision: false,
    jsonMode: false,
  };

  models: AIModel[] = [
    { id: 'llama3', name: 'Llama 3', provider: 'ollama', type: 'chat', maxTokens: 8192, supportsStreaming: true, supportsFunctions: false, supportsVision: false },
    { id: 'llama3:70b', name: 'Llama 3 70B', provider: 'ollama', type: 'chat', maxTokens: 8192, supportsStreaming: true, supportsFunctions: false, supportsVision: false },
    { id: 'mistral', name: 'Mistral', provider: 'ollama', type: 'chat', maxTokens: 32768, supportsStreaming: true, supportsFunctions: false, supportsVision: false },
    { id: 'codellama', name: 'Code Llama', provider: 'ollama', type: 'chat', maxTokens: 16384, supportsStreaming: true, supportsFunctions: false, supportsVision: false },
    { id: 'nomic-embed-text', name: 'Nomic Embed Text', provider: 'ollama', type: 'embedding', maxTokens: 8192, supportsStreaming: false, supportsFunctions: false, supportsVision: false },
  ];

  constructor(config: AIProviderConfig) {
    super();
    this.config = config;
  }

  private get baseUrl(): string {
    return this.config.baseUrl || 'http://localhost:11434';
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const model = options.model || this.config.defaultModel || 'llama3';
    const messages = this.formatMessages(options.messages);
    const prompt = this.messagesToPrompt(messages);

    const response = await this.fetch<OllamaGenerateResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens,
          top_p: options.topP,
          stop: options.stop,
        },
      }),
    });

    return {
      id: `ollama-${Date.now()}`,
      model: response.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response.response,
        },
        finishReason: response.done ? 'stop' : 'length',
      }],
      usage: {
        promptTokens: response.prompt_eval_count || 0,
        completionTokens: response.eval_count || 0,
        totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0),
      },
      created: Math.floor(Date.now() / 1000),
    };
  }

  async *chatStream(options: ChatCompletionOptions): AsyncIterable<StreamingChatResponse> {
    const model = options.model || this.config.defaultModel || 'llama3';
    const messages = this.formatMessages(options.messages);
    const prompt = this.messagesToPrompt(messages);

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens,
          top_p: options.topP,
          stop: options.stop,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    if (!reader) throw new Error('No response body');

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data: OllamaGenerateResponse = JSON.parse(line);
            yield {
              id: `ollama-${Date.now()}`,
              model: data.model,
              choices: [{
                index: 0,
                delta: { content: data.response },
                finishReason: data.done ? 'stop' : null,
              }],
              created: Math.floor(Date.now() / 1000),
            };
          } catch {
            // Ignore parse errors for incomplete lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async embed(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    const model = options.model || 'nomic-embed-text';
    const inputs = Array.isArray(options.input) ? options.input : [options.input];

    const embeddings = await Promise.all(
      inputs.map(async (input) => {
        const response = await this.fetch<OllamaEmbeddingResponse>('/api/embeddings', {
          method: 'POST',
          body: JSON.stringify({ model, prompt: input }),
        });
        return response.embedding;
      })
    );

    return {
      object: 'list',
      data: embeddings.map((embedding, index) => ({
        object: 'embedding',
        embedding,
        index,
      })),
      model,
      usage: {
        promptTokens: inputs.reduce((sum, t) => sum + t.length, 0),
        completionTokens: 0,
        totalTokens: inputs.reduce((sum, t) => sum + t.length, 0),
      },
    };
  }

  async listModels(): Promise<AIModel[]> {
    try {
      const response = await this.fetch<{ models: { name: string }[] }>('/api/tags');
      const availableModels = response.models.map(m => m.name);
      return this.models.filter(m => availableModels.includes(m.id));
    } catch {
      return this.models;
    }
  }

  private messagesToPrompt(messages: ChatMessage[]): string {
    const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
    const conversation = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    return `${systemPrompt ? `System: ${systemPrompt}\n\n` : ''}${conversation}\n\nAssistant:`;
  }
}

export function createOllamaProvider(env: Record<string, string | undefined> = process.env): OllamaProvider {
  return new OllamaProvider(createProviderConfig('ollama', env));
}