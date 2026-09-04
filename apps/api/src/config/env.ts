// =============================================================================
// Environment Configuration
// =============================================================================
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),

  // AI
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().optional().default('http://localhost:11434'),

  // Storage
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().default('ruang-belajar'),
  S3_REGION: z.string().default('us-east-1'),

  // Transcription
  ASSEMBLYAI_API_KEY: z.string().optional(),

  // Worker
  WORKER_CONCURRENCY: z.coerce.number().default(2),
  JOB_DEFAULT_ATTEMPTS: z.coerce.number().default(3),
  JOB_BACKOFF_DELAY: z.coerce.number().default(5000),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    result.error.errors.forEach((e) => {
      console.error(`  ${e.path.join('.')}: ${e.message}`);
    });
    process.exit(1);
  }
  return result.data;
}

export const env = parseEnv();
export type Env = typeof env;
