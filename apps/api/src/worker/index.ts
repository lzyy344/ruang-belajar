// =============================================================================
// Background Worker - BullMQ
// =============================================================================
import { Worker, Queue } from 'bullmq';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';
import { env } from '../config/env.js';

console.log('🚀 Worker starting...');

// Queue names
export const QUEUES = {
  MATERIAL_PROCESSING: 'material-processing',
} as const;

// Create queues (exported for use in API)
export const materialQueue = new Queue(QUEUES.MATERIAL_PROCESSING, {
  connection: redis,
  defaultJobOptions: {
    attempts: env.JOB_DEFAULT_ATTEMPTS,
    backoff: { type: 'exponential', delay: env.JOB_BACKOFF_DELAY },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

// Material processing worker
const materialWorker = new Worker(
  QUEUES.MATERIAL_PROCESSING,
  async (job) => {
    const { materialId, userId, type } = job.data;

    console.log(`Processing job ${job.id}: ${type} for material ${materialId}`);

    // Update job status in DB
    await prisma.processingJob.updateMany({
      where: { materialId, type, status: 'QUEUED' },
      data: { status: 'RUNNING', startedAt: new Date(), currentStep: type },
    });

    try {
      switch (type) {
        case 'AUDIO_EXTRACTION':
          await handleAudioExtraction(materialId, job);
          break;
        case 'TRANSCRIPTION':
          await handleTranscription(materialId, job);
          break;
        case 'SUMMARY_GENERATION':
          await handleSummaryGeneration(materialId, job);
          break;
        case 'QUIZ_GENERATION':
          await handleQuizGeneration(materialId, job);
          break;
        default:
          console.warn(`Unknown job type: ${type}`);
      }

      // Mark job complete
      await prisma.processingJob.updateMany({
        where: { materialId, type, status: 'RUNNING' },
        data: { status: 'COMPLETED', completedAt: new Date(), progress: 100 },
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      await prisma.processingJob.updateMany({
        where: { materialId, type, status: 'RUNNING' },
        data: { status: 'FAILED', error: errMsg },
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId,
          type: 'PROCESSING_FAILED',
          title: 'Pemrosesan gagal',
          message: `Gagal memproses materi. Error: ${errMsg}`,
          data: { materialId, jobType: type },
        },
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: env.WORKER_CONCURRENCY,
  }
);

// -----------------------------------------------------------------------
// Job handlers (stubs - implement when ready)
// -----------------------------------------------------------------------
async function handleAudioExtraction(materialId: string, job: any) {
  await job.updateProgress(10);
  await prisma.material.update({
    where: { id: materialId },
    data: { status: 'EXTRACTING_AUDIO' },
  });
  // TODO: implement ffmpeg audio extraction
  await job.updateProgress(100);
}

async function handleTranscription(materialId: string, job: any) {
  await job.updateProgress(10);
  await prisma.material.update({
    where: { id: materialId },
    data: { status: 'TRANSCRIBING' },
  });
  // TODO: implement AssemblyAI / Whisper transcription
  await job.updateProgress(100);
}

async function handleSummaryGeneration(materialId: string, job: any) {
  await job.updateProgress(10);
  await prisma.material.update({
    where: { id: materialId },
    data: { status: 'SUMMARIZING' },
  });
  // TODO: implement OpenAI summary generation
  await job.updateProgress(100);
}

async function handleQuizGeneration(materialId: string, job: any) {
  await job.updateProgress(10);
  await prisma.material.update({
    where: { id: materialId },
    data: { status: 'GENERATING_QUIZ' },
  });
  // TODO: implement OpenAI quiz generation
  await job.updateProgress(100);
}

// -----------------------------------------------------------------------
// Worker event handlers
// -----------------------------------------------------------------------
materialWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

materialWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

materialWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Worker shutting down...');
  await materialWorker.close();
  await redis.quit();
  process.exit(0);
});

console.log(`✅ Worker ready - concurrency: ${env.WORKER_CONCURRENCY}`);
