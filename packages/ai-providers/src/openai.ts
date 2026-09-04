// =============================================================================
// OpenAI Provider Implementation
// =============================================================================
import OpenAI from 'openai';
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
  TokenUsage,
} from './types';

export class OpenAIProvider extends BaseAIProvider {
  name = 'openai' as const;
  config: AIProviderConfig;
  capabilities: ProviderCapabilities = {
    chat: true,
    embedding: true,
    completion: true,
    streaming: true,
    functions: true,
    vision: true,
    jsonMode: true,
  };

  models: AIModel[] = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', type: 'chat', maxTokens: 128000, costPer1kTokens: { input: 0.005, output: 0.015 }, supportsStreaming: true, supportsFunctions: true, supportsVision: true },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', type: 'chat', maxTokens: 128000, costPer1kTokens: { input: 0.00015, output: 0.0006 }, supportsStreaming: true, supportsFunctions: true, supportsVision: true },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', type: 'chat', maxTokens: 128000, costPer1kTokens: { input: 0.01, output: 0.03 }, supportsStreaming: true, supportsFunctions: true, supportsVision: true },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', type: 'chat', maxTokens: 16384, costPer1kTokens: { input: 0.0005, output: 0.0015 }, supportsStreaming: true, supportsFunctions: true, supportsVision: false },
    { id: 'text-embedding-3-small', name: 'Embedding 3 Small', provider: 'openai', type: 'embedding', maxTokens: 8191, costPer1kTokens: { input: 0.00002 }, supportsStreaming: false, supportsFunctions: false, supportsVision: false },
    { id: 'text-embedding-3-large', name: 'Embedding 3 Large', provider: 'openai', type: 'embedding', maxTokens: 8191, costPer1kTokens: { input: 0.00013 }, supportsStreaming: false, supportsFunctions: false, supportsVision: false },
  ];

  client: OpenAI;

  constructor(config: AIProviderConfig) {
    super();
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
      baseURL: config.baseUrl,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
    });
  }

  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const model = options.model || this.config.defaultModel || 'gpt-4o';
    const messages = this.formatMessages(options.messages);
    const tools = this.formatTools(options.tools);

    const completion = await this.client.chat.completions.create({
      model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      tools: tools as OpenAI.Chat.Completions.ChatCompletionTool[] | undefined,
      tool_choice: options.toolChoice as any,
      stop: options.stop,
      seed: options.seed,
      response_format: options.responseFormat as any,
      stream: false,
    });

    const choice = completion.choices[0];
    return {
      id: completion.id,
      model: completion.model,
      choices: [{
        index: 0,
        message: {
          role: choice.message.role,
          content: choice.message.content || '',
          toolCalls: choice.message.tool_calls?.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: { name: tc.function.name, arguments: tc.function.arguments },
          })),
        },
        finishReason: choice.finish_reason,
      }],
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
      created: completion.created,
    };
  }

  async *chatStream(options: ChatCompletionOptions): AsyncIterable<StreamingChatResponse> {
    const model = options.model || this.config.defaultModel || 'gpt-4o';
    const messages = this.formatMessages(options.messages);
    const tools = this.formatTools(options.tools);

    const stream = await this.client.chat.completions.create({
      model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      tools: tools as OpenAI.Chat.Completions.ChatCompletionTool[] | undefined,
      tool_choice: options.toolChoice as any,
      stop: options.stop,
      seed: options.seed,
      response_format: options.responseFormat as any,
      stream: true,
    });

    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      if (!choice) continue;

      yield {
        id: chunk.id,
        model: chunk.model,
        choices: [{
          index: 0,
          delta: {
            role: choice.delta.role,
            content: choice.delta.content,
            toolCalls: choice.delta.tool_calls?.map(tc => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.function.name, arguments: tc.function.arguments },
            })),
          },
          finishReason: choice.finish_reason,
        }],
        created: chunk.created,
      };
    }
  }

  async embed(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    const model = options.model || 'text-embedding-3-small';
    const input = Array.isArray(options.input) ? options.input : [options.input];

    const response = await this.client.embeddings.create({
      model,
      input,
      encoding_format: options.encodingFormat,
      dimensions: options.dimensions,
    });

    return {
      object: 'list',
      data: response.data.map((d, i) => ({
        object: 'embedding',
        embedding: d.embedding,
        index: i,
      })),
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: 0,
        totalTokens: response.usage.total_tokens,
      },
    };
  }
}

export function createOpenAIProvider(env: Record<string, string | undefined> = process.env): OpenAIProvider {
  return new OpenAIProvider(createProviderConfig('openai', env));
}