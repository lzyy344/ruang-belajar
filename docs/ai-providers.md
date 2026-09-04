# AI Providers Documentation

## Overview

Ruang Belajar uses an abstraction layer for AI providers, allowing seamless switching between OpenAI, Anthropic, and local Ollama models without changing application code.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Provider Factory                       │
├─────────────────────────────────────────────────────────────┤
│  getBestProviderForTask()  │  createProvider()              │
└──────────────┬───────────────┬───────────────┬──────────────┘
               ▼               ▼               ▼
        ┌────────────┐  ┌────────────┐  ┌────────────┐
        │  OpenAI    │  │ Anthropic  │  │  Ollama    │
        │  Provider  │  │  Provider  │  │  Provider  │
        └────────────┘  └────────────┘  └────────────┘
```

## Provider Comparison

| Feature | OpenAI | Anthropic | Ollama |
|---------|--------|-----------|--------|
| **Chat** | ✅ GPT-4o, GPT-4 Turbo | ✅ Claude 3 Opus/Sonnet/Haiku | ✅ Llama 3, Mistral, CodeLlama |
| **Embeddings** | ✅ text-embedding-3-small/large | ❌ | ✅ nomic-embed-text |
| **Streaming** | ✅ | ✅ | ✅ |
| **Function Calling** | ✅ | ✅ | ❌ |
| **Vision** | ✅ GPT-4o | ✅ Claude 3 | ❌ |
| **JSON Mode** | ✅ | ❌ | ❌ |
| **Cost (per 1K tokens)** | $0.005-$0.015 in / $0.015-$0.075 out | $0.00025-$0.015 in / $0.00125-$0.075 out | Free (local) |
| **Latency** | Low | Low | Medium-High |
| **Privacy** | Cloud | Cloud | Local |
| **Rate Limits** | Tier-based | Tier-based | Hardware-limited |

## Configuration

### Environment Variables

```bash
# OpenAI (required for production)
OPENAI_API_KEY=sk-...
OPENAI_ORGANIZATION=org-...  # Optional
OPENAI_BASE_URL=https://api.openai.com/v1  # Optional (for proxies)
OPENAI_DEFAULT_MODEL=gpt-4o

# Anthropic (alternative)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_BASE_URL=https://api.anthropic.com  # Optional
ANTHROPIC_DEFAULT_MODEL=claude-3-sonnet-20240229

# Ollama (local development)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3
```

### Provider Selection Logic

```typescript
// Automatic selection based on task and availability
const provider = await getBestProviderForTask('chat', 'openai');

// Manual selection
const provider = factory.getProvider('anthropic');
```

**Priority Order:**
1. OpenAI (best all-around, supports all features)
2. Anthropic (excellent reasoning, no embeddings)
3. Ollama (free, local, limited features)

## Usage Examples

### Basic Chat

```typescript
import { chat, getBestProviderForChat } from '@ruang-belajar/ai-providers';

const provider = await getBestProviderForChat();
const response = await chat({
  messages: [
    { role: 'system', content: 'You are a helpful learning assistant.' },
    { role: 'user', content: 'Explain quantum superposition simply.' }
  ],
  temperature: 0.7,
  maxTokens: 1000
}, provider);

console.log(response.choices[0].message.content);
```

### Streaming Chat

```typescript
import { chatStream } from '@ruang-belajar/ai-providers';

for await (const chunk of chatStream({
  messages: [{ role: 'user', content: 'Write a poem about learning.' }],
  temperature: 0.8
})) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}
```

### Embeddings

```typescript
import { embed, getBestProviderForEmbedding } from '@ruang-belajar/ai-providers';

const provider = await getBestProviderForEmbedding();
const response = await embed({
  input: ['text to embed', 'another text'],
  model: 'text-embedding-3-small'
}, provider);

console.log(response.data[0].embedding); // number[]
```

### Function Calling (OpenAI/Anthropic)

```typescript
import { chat } from '@ruang-belajar/ai-providers';

const response = await chat({
  messages: [{ role: 'user', content: 'What\'s the weather in Jakarta?' }],
  tools: [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'City name' }
        },
        required: ['location']
      }
    }
  }],
  toolChoice: 'auto'
}, 'openai');

if (response.choices[0].message.toolCalls) {
  // Execute function and send result back
}
```

### RAG (Retrieval-Augmented Generation)

```typescript
import { embed, chat } from '@ruang-belajar/ai-providers';

// 1. Embed user query
const queryEmbedding = await embed({ input: userQuestion });

// 2. Search vector DB for relevant chunks
const relevantChunks = await vectorSearch(queryEmbedding[0].embedding, 5);

// 3. Build context
const context = relevantChunks.map(c => c.text).join('\n\n');

// 4. Generate response with context
const response = await chat({
  messages: [
    { role: 'system', content: `Answer based on this context:\n${context}` },
    { role: 'user', content: userQuestion }
  ],
  temperature: 0.3
});
```

## Models Reference

### OpenAI
| Model | Context | Best For | Cost (in/out per 1K) |
|-------|---------|----------|---------------------|
| gpt-4o | 128K | General chat, complex reasoning | $0.005 / $0.015 |
| gpt-4o-mini | 128K | Fast, cost-effective chat | $0.00015 / $0.0006 |
| gpt-4-turbo | 128K | Complex tasks | $0.01 / $0.03 |
| gpt-3.5-turbo | 16K | Simple tasks | $0.0005 / $0.0015 |
| text-embedding-3-small | 8K | Embeddings (1536 dim) | $0.00002 |
| text-embedding-3-large | 8K | Embeddings (3072 dim) | $0.00013 |

### Anthropic
| Model | Context | Best For | Cost (in/out per 1K) |
|-------|---------|----------|---------------------|
| claude-3-opus | 200K | Most complex reasoning | $0.015 / $0.075 |
| claude-3-sonnet | 200K | Balanced performance | $0.003 / $0.015 |
| claude-3-haiku | 200K | Fast, simple tasks | $0.00025 / $0.00125 |

### Ollama (Local)
| Model | Size | Best For |
|-------|------|----------|
| llama3 | 8B | General chat |
| llama3:70b | 70B | Complex reasoning |
| mistral | 7B | Fast chat |
| codellama | 7B/13B/34B | Code generation |
| nomic-embed-text | - | Embeddings |

## Cost Optimization

### Token Budgeting
```typescript
// Track usage per user
interface UserAIUsage {
  userId: string;
  dailyTokens: number;
  monthlyTokens: number;
  dailyCost: number;
  monthlyCost: number;
}

// Enforce limits
const TIER_LIMITS = {
  free: { dailyTokens: 50000, monthlyTokens: 500000 },
  pro: { dailyTokens: 500000, monthlyTokens: 10000000 },
  premium: { dailyTokens: 2000000, monthlyTokens: 50000000 }
};
```

### Caching Strategies
```typescript
// Cache embeddings for repeated content
const embeddingCache = new Map<string, number[]>();

async function getEmbedding(text: string) {
  const hash = hashText(text);
  if (embeddingCache.has(hash)) return embeddingCache.get(hash)!;
  
  const result = await embed({ input: text });
  embeddingCache.set(hash, result.data[0].embedding);
  return result.data[0].embedding;
}

// Cache LLM responses for identical prompts
const responseCache = new LRUCache<string, string>({ max: 1000 });
```

### Model Selection by Task
```typescript
function selectModelForTask(task: string): string {
  switch (task) {
    case 'chat':
      return 'gpt-4o-mini';  // Cost-effective
    case 'complex_reasoning':
      return 'gpt-4o';  // Best reasoning
    case 'embedding':
      return 'text-embedding-3-small';  // Cheap & fast
    case 'summarization':
      return 'gpt-4o-mini';  // Good enough
    case 'quiz_generation':
      return 'gpt-4o';  // Needs accuracy
    default:
      return 'gpt-4o-mini';
  }
}
```

## Error Handling

```typescript
import { AIProvider } from '@ruang-belajar/ai-providers';

async function robustChat(provider: AIProvider, options: ChatOptions) {
  const maxRetries = 3;
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await provider.chat(options);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on auth errors
      if (error.message.includes('401') || error.message.includes('403')) {
        throw error;
      }
      
      // Exponential backoff
      if (attempt < maxRetries) {
        await sleep(1000 * Math.pow(2, attempt - 1));
      }
    }
  }
  
  throw lastError!;
}
```

## Testing

### Unit Tests
```typescript
// packages/ai-providers/src/__tests__/factory.test.ts
import { getAIFactory } from '../factory';

describe('AI Factory', () => {
  it('should create OpenAI provider when API key present', () => {
    const factory = getAIFactory({ OPENAI_API_KEY: 'test' });
    expect(factory.getProvider('openai')).toBeDefined();
  });
  
  it('should fallback to Ollama when no cloud keys', () => {
    const factory = getAIFactory({});
    expect(factory.getDefaultProvider()).toBe('ollama');
  });
});
```

### Integration Tests
```typescript
// apps/api/src/__tests__/ai.integration.test.ts
import { chat } from '@ruang-belajar/ai-providers';

describe('AI Integration', () => {
  it('should generate response from OpenAI', async () => {
    const response = await chat({
      messages: [{ role: 'user', content: 'Say hello' }],
      maxTokens: 50
    }, 'openai');
    
    expect(response.choices[0].message.content).toContain('hello');
  }, 30000); // Longer timeout for API calls
});
```

## Monitoring

### Key Metrics
- **Latency**: p50, p95, p99 per provider
- **Token Usage**: Input/output per user, per model
- **Error Rate**: By provider, by error type
- **Cost**: Daily/monthly per user, per model
- **Availability**: Uptime per provider

### Logging
```typescript
// Structured logging for AI calls
logger.info('AI chat request', {
  provider: 'openai',
  model: 'gpt-4o',
  userId: ctx.user.id,
  tokensEstimated: estimateTokens(options.messages),
  timestamp: new Date().toISOString()
});
```

## Migration Guide

### Switching Providers
```typescript
// 1. Add new provider credentials to .env
ANTHROPIC_API_KEY=sk-ant-...

// 2. Update default model if needed
ANTHROPIC_DEFAULT_MODEL=claude-3-sonnet-20240229

// 3. Factory will auto-detect and use it
// No code changes needed!
```

### Adding Custom Provider
1. Create `packages/ai-providers/src/custom.ts` extending `BaseAIProvider`
2. Implement required methods: `chat`, `chatStream`, `embed`, `listModels`, `validateConfig`
3. Register in `factory.ts`
4. Add to `AIProviderName` type

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "No AI provider available" | No API keys set | Add OPENAI_API_KEY or ANTHROPIC_API_KEY |
| "Model not found" | Wrong model name | Check model IDs in provider docs |
| "Rate limit exceeded" | Too many requests | Implement backoff, upgrade tier |
| "Context length exceeded" | Input too long | Truncate or use larger context model |
| "Ollama connection refused" | Ollama not running | `ollama serve` or check OLLAMA_BASE_URL |

### Debug Mode
```bash
# Enable debug logging
DEBUG=ai:* npm run dev
```