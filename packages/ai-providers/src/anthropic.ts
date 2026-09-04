// =============================================================================
// Anthropic Provider Implementation
// =============================================================================
import Anthropic from '@anthropic-ai/sdk';
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

export class AnthropicProvider extends BaseAIProvider {
  name = 'anthropic' as const;
  config: AIProviderConfig;
  capabilities: ProviderCapabilities = {
    chat: true,
    embedding: false,
    completion: true,
    streaming: true,
    functions: true,
    vision: true,
    jsonMode: false,
  };

  models: AIModel[] = [
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', type: 'chat', maxTokens: 200000, costPer1kTokens: { input: 0.015, output: 0.075 }, supportsStreaming: true, supportsFunctions: true, supportsVision: true },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic', type: 'chat', maxTokens: 200000, costPer1kTokens: { input: 0.003, output: 0.015 }, supportsStreaming: true, supportsFunctions: true, supportsVision: true },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', type: 'chat', maxTokens: 200000, costPer1kTokens: { input: 0.00025, output: 0.00125 }, supportsStreaming: true, supportsFunctions: true, supportsVision: true },
  ];

  client: Anthropic;

  constructor(config: AIProviderConfig) {
    super();
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
    });
  }

  private convertMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
    return messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));
  }

  private extractSystemPrompt(messages: ChatMessage[]): string | undefined {
    const systemMsg = messages.find(m => m.role === 'system');
    return systemMsg?.content;
  }

  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const model = options.model || this.config.defaultModel || 'claude-3-sonnet-20240229';
    const messages = this.convertMessages(options.messages);
    const system = this.extractSystemPrompt(options.messages);
    const tools = this.formatToolsForAnthropic(options.tools);

    const response = await this.client.messages.create({
      model,
      messages,
      system,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 4096,
      top_p: options.topP,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: options.toolChoice ? this.convertToolChoice(options.toolChoice) : undefined,
      stop_sequences: options.stop,
      stream: false,
    });

    return {
      id: response.id,
      model: response.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response.content.map(c => c.type === 'text' ? c.text : '').join(''),
          toolCalls: response.content
            .filter(c => c.type === 'tool_use')
            .map(c => ({
              id: c.id,
              type: 'function' as const,
              function: { name: c.name, arguments: JSON.stringify(c.input) },
            })),
        },
        finishReason: response.stop_reason === 'end_turn' ? 'stop' : response.stop_reason === 'max_tokens' ? 'length' : 'tool_calls',
      }],
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      created: Math.floor(Date.now() / 1000),
    };
  }

  async *chatStream(options: ChatCompletionOptions): AsyncIterable<StreamingChatResponse> {
    const model = options.model || this.config.defaultModel || 'claude-3-sonnet-20240229';
    const messages = this.convertMessages(options.messages);
    const system = this.extractSystemPrompt(options.messages);
    const tools = this.formatToolsForAnthropic(options.tools);

    const stream = await this.client.messages.create({
      model,
      messages,
      system,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 4096,
      top_p: options.topP,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: options.toolChoice ? this.convertToolChoice(options.toolChoice) : undefined,
      stop_sequences: options.stop,
      stream: true,
    });

    let accumulatedContent = '';
    let toolCalls: any[] = [];

    for await (const chunk of stream) {
      switch (chunk.type) {
        case 'content_block_delta':
          if (chunk.delta.type === 'text_delta') {
            accumulatedContent += chunk.delta.text;
            yield {
              id: '',
              model,
              choices: [{
                index: 0,
                delta: { content: chunk.delta.text },
                finishReason: null,
              }],
              created: Math.floor(Date.now() / 1000),
            };
          } else if (chunk.delta.type === 'input_json_delta') {
            // Handle tool call streaming
          }
          break;
        case 'message_delta':
          if (chunk.delta.stop_reason) {
            yield {
              id: '',
              model,
              choices: [{
                index: 0,
                delta: {},
                finishReason: chunk.delta.stop_reason === 'end_turn' ? 'stop' : chunk.delta.stop_reason === 'max_tokens' ? 'length' : 'tool_calls',
              }],
              created: Math.floor(Date.now() / 1000),
            };
          }
          break;
      }
    }
  }

  async embed(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    throw new Error('Anthropic does not support embeddings');
  }

  private formatToolsForAnthropic(tools?: any[]): Anthropic.Tool[] {
    if (!tools) return [];
    return tools.map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters,
    }));
  }

  private convertToolChoice(choice: any): Anthropic.ToolChoice {
    if (choice === 'auto') return { type: 'auto' };
    if (choice === 'none') return { type: 'none' };
    if (choice.type === 'function') return { type: 'tool', name: choice.function.name };
    return { type: 'auto' };
  }
}

export function createAnthropicProvider(env: Record<string, string | undefined> = process.env): AnthropicProvider {
  return new AnthropicProvider(createProviderConfig('anthropic', env));
}