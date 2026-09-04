// =============================================================================
// AI Provider Types
// =============================================================================

export type AIProviderName = 'openai' | 'anthropic' | 'ollama';

export type AIModelType = 'chat' | 'embedding' | 'completion';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProviderName;
  type: AIModelType;
  maxTokens: number;
  costPer1kTokens?: { input: number; output: number };
  supportsStreaming: boolean;
  supportsFunctions: boolean;
  supportsVision: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  tools?: Tool[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  stream?: boolean;
  stop?: string[];
  seed?: number;
  responseFormat?: { type: 'text' | 'json_object' };
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: ChatChoice[];
  usage: TokenUsage;
  created: number;
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface StreamingChatResponse {
  id: string;
  model: string;
  choices: StreamingChoice[];
  created: number;
}

export interface StreamingChoice {
  index: number;
  delta: Partial<ChatMessage>;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

export interface EmbeddingOptions {
  input: string | string[];
  model?: string;
  encodingFormat?: 'float' | 'base64';
  dimensions?: number;
}

export interface EmbeddingResponse {
  object: 'list';
  data: EmbeddingData[];
  model: string;
  usage: TokenUsage;
}

export interface EmbeddingData {
  object: 'embedding';
  embedding: number[];
  index: number;
}

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  organization?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ProviderCapabilities {
  chat: boolean;
  embedding: boolean;
  completion: boolean;
  streaming: boolean;
  functions: boolean;
  vision: boolean;
  jsonMode: boolean;
}

export interface AIProvider {
  name: AIProviderName;
  config: AIProviderConfig;
  capabilities: ProviderCapabilities;
  models: AIModel[];

  chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse>;
  chatStream(options: ChatCompletionOptions): AsyncIterable<StreamingChatResponse>;
  embed(options: EmbeddingOptions): Promise<EmbeddingResponse>;
  listModels(): Promise<AIModel[]>;
  validateConfig(): Promise<boolean>;
}

export interface AIProviderFactory {
  createProvider(name: AIProviderName, config: AIProviderConfig): AIProvider;
  getDefaultProvider(): AIProviderName;
  getProvider(name: AIProviderName): AIProvider | null;
}