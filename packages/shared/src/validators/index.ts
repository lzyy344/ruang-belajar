// =============================================================================
// Shared Validators (Zod Schemas)
// =============================================================================
import { z } from 'zod';

// -----------------------------------------------------------------------------
// Primitive Validators
// -----------------------------------------------------------------------------
export const emailSchema = z.string().email('Email tidak valid').max(255);
export const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(128)
  .regex(/[A-Z]/, 'Harus mengandung huruf besar')
  .regex(/[a-z]/, 'Harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Harus mengandung angka')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Harus mengandung karakter khusus');
export const usernameSchema = z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/);
export const uuidSchema = z.string().uuid('ID tidak valid');
export const positiveIntSchema = z.number().int().positive();
export const nonNegativeIntSchema = z.number().int().nonnegative();

// -----------------------------------------------------------------------------
// Auth Validators
// -----------------------------------------------------------------------------
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2).max(100).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

// -----------------------------------------------------------------------------
// User Validators
// -----------------------------------------------------------------------------
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  timezone: z.string().optional(),
  studyGoalMinutes: z.number().int().min(5).max(480).optional(),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      inApp: z.boolean().optional(),
    }).optional(),
    studyReminder: z.object({
      enabled: z.boolean().optional(),
      time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      timezone: z.string().optional(),
    }).optional(),
    challengeNotifications: z.boolean().optional(),
    forumNotifications: z.boolean().optional(),
    achievementNotifications: z.boolean().optional(),
    language: z.string().optional(),
  }).optional(),
});

// -----------------------------------------------------------------------------
// Material Validators
// -----------------------------------------------------------------------------
export const createMaterialSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['VIDEO', 'AUDIO', 'RECORDING', 'LINK', 'DOCUMENT']),
  sourceUrl: z.string().url().optional().nullable(),
  category: z.string().max(100).optional(),
  difficulty: z.enum(['BASIC', 'MEDIUM', 'ADVANCED']).default('MEDIUM'),
  tags: z.array(z.string().max(50)).max(10).default([]),
  isPublic: z.boolean().default(false),
});

export const updateMaterialSchema = createMaterialSchema.partial().extend({
  status: z.enum(['UPLOADED', 'PROCESSING', 'EXTRACTING_AUDIO', 'TRANSCRIBING', 'ANALYZING', 'SUMMARIZING', 'GENERATING_QUIZ', 'COMPLETED', 'FAILED']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
});

export const materialFilterSchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(['BASIC', 'MEDIUM', 'ADVANCED']).optional(),
  status: z.enum(['UPLOADED', 'PROCESSING', 'EXTRACTING_AUDIO', 'TRANSCRIBING', 'ANALYZING', 'SUMMARIZING', 'GENERATING_QUIZ', 'COMPLETED', 'FAILED']).optional(),
  type: z.enum(['VIDEO', 'AUDIO', 'RECORDING', 'LINK', 'DOCUMENT']).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'progress']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// -----------------------------------------------------------------------------
// Upload Validators
// -----------------------------------------------------------------------------
export const presignUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().refine(
    (v) => [
      'video/mp4',
      'video/x-matroska',
      'video/x-msvideo',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/x-m4a',
      'application/pdf',
    ].includes(v),
    'Tipe file tidak didukung'
  ),
  size: z.number().int().positive().max(500 * 1024 * 1024),
  materialId: z.string().uuid().optional(),
});

export const completeUploadSchema = z.object({
  key: z.string().min(1),
  bucket: z.string().min(1),
  etag: z.string().min(1),
  size: z.number().int().positive(),
});

// -----------------------------------------------------------------------------
// Transcript Validators
// -----------------------------------------------------------------------------
export const transcriptChunkSchema = z.object({
  index: z.number().int().nonnegative(),
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  text: z.string().min(1),
  speaker: z.string().optional().nullable(),
  confidence: z.number().min(0).max(1).optional().nullable(),
  tokens: z.number().int().positive().optional().nullable(),
});

export const createTranscriptSchema = z.object({
  materialId: z.string().uuid(),
  fullText: z.string().min(1),
  language: z.string().default('id'),
  duration: z.number().int().positive(),
  wordCount: z.number().int().positive(),
  confidence: z.number().min(0).max(1).optional().nullable(),
  provider: z.string(),
  providerData: z.record(z.unknown()).optional().nullable(),
  chunks: z.array(transcriptChunkSchema).optional(),
});

// -----------------------------------------------------------------------------
// Summary Validators
// -----------------------------------------------------------------------------
export const importantTermSchema = z.object({
  term: z.string().min(1).max(100),
  definition: z.string().min(1).max(500),
});

export const createSummarySchema = z.object({
  materialId: z.string().uuid(),
  title: z.string().min(1).max(200),
  shortSummary: z.string().min(1).max(500),
  fullSummary: z.string().min(1),
  keyPoints: z.array(z.string().max(200)).max(20),
  mainConcepts: z.array(z.string().max(100)).max(15),
  importantTerms: z.array(importantTermSchema).max(20),
  conclusion: z.string().max(1000).optional().nullable(),
  difficulty: z.enum(['BASIC', 'MEDIUM', 'ADVANCED']),
  category: z.string().max(100).optional().nullable(),
  estimatedTime: z.number().int().positive().optional().nullable(),
  provider: z.string(),
  model: z.string(),
  tokensUsed: z.number().int().positive().optional().nullable(),
});

// -----------------------------------------------------------------------------
// Note Validators
// -----------------------------------------------------------------------------
export const createNoteSchema = z.object({
  materialId: z.string().uuid(),
  content: z.string().min(1),
  timestamp: z.number().nonnegative().optional().nullable(),
  isPublic: z.boolean().default(false),
});

export const updateNoteSchema = createNoteSchema.partial();

// -----------------------------------------------------------------------------
// Quiz Validators
// -----------------------------------------------------------------------------
export const quizOptionSchema = z.object({
  text: z.string().min(1).max(500),
  isCorrect: z.boolean(),
});

export const createQuizSchema = z.object({
  materialId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  difficulty: z.enum(['BASIC', 'MEDIUM', 'ADVANCED']),
  questionCount: z.number().int().positive().max(50).default(10),
  timeLimit: z.number().int().positive().max(7200).optional().nullable(), // max 2 hours
  passingScore: z.number().int().min(0).max(100).default(70),
  questions: z.array(z.object({
    type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']),
    question: z.string().min(1),
    options: z.array(quizOptionSchema).min(2).max(6),
    correctAnswer: z.number().int().min(0),
    explanation: z.string().min(1).max(1000),
    difficulty: z.enum(['BASIC', 'MEDIUM', 'ADVANCED']),
    topic: z.string().max(100).optional().nullable(),
    sourceChunkId: z.string().uuid().optional().nullable(),
  })).min(1).max(50),
});

export const startQuizAttemptSchema = z.object({
  quizId: z.string().uuid(),
});

export const submitQuizAnswerSchema = z.object({
  attemptId: z.string().uuid(),
  questionId: z.string().uuid(),
  selectedAnswer: z.number().int().min(0).optional().nullable(),
  timeSpent: z.number().int().nonnegative(),
});

export const completeQuizAttemptSchema = z.object({
  attemptId: z.string().uuid(),
});

// -----------------------------------------------------------------------------
// Study Session Validators
// -----------------------------------------------------------------------------
export const createStudySessionSchema = z.object({
  materialId: z.string().uuid().optional().nullable(),
  type: z.enum(['MATERIAL_READ', 'QUIZ', 'POMODORO', 'AI_CHAT', 'FLASH_CARD', 'SPEED_MATCH', 'WORD_SCRAMBLE']),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export const endStudySessionSchema = z.object({
  sessionId: z.string().uuid(),
  duration: z.number().int().positive(),
  xpEarned: z.number().int().nonnegative().default(0),
  metadata: z.record(z.unknown()).optional().nullable(),
});

// -----------------------------------------------------------------------------
// Pomodoro Validators
// -----------------------------------------------------------------------------
export const createPomodoroSessionSchema = z.object({
  materialId: z.string().uuid().optional().nullable(),
  mode: z.enum(['WORK', 'SHORT_BREAK', 'LONG_BREAK']),
  plannedDuration: z.number().int().positive(),
  tasks: z.array(z.object({
    text: z.string().min(1).max(200),
    completed: z.boolean().default(false),
  })).default([]),
});

export const updatePomodoroTaskSchema = z.object({
  sessionId: z.string().uuid(),
  taskIndex: z.number().int().nonnegative(),
  completed: z.boolean(),
});

export const completePomodoroSessionSchema = z.object({
  sessionId: z.string().uuid(),
  actualDuration: z.number().int().nonnegative(),
});

// -----------------------------------------------------------------------------
// AI Chat Validators
// -----------------------------------------------------------------------------
export const createConversationSchema = z.object({
  materialId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(200),
  model: z.string().default('gpt-4o'),
  provider: z.string().default('openai'),
});

export const sendChatMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(4000),
  materialId: z.string().uuid().optional().nullable(),
});

export const aiGenerateQuizSchema = z.object({
  materialId: z.string().uuid(),
  questionCount: z.number().int().positive().max(20).default(10),
  difficulty: z.enum(['BASIC', 'MEDIUM', 'ADVANCED']).default('MEDIUM'),
  topics: z.array(z.string()).optional(),
});

export const aiExplainSchema = z.object({
  materialId: z.string().uuid(),
  concept: z.string().min(1).max(200),
  level: z.enum(['simple', 'intermediate', 'advanced']).default('simple'),
});

export const aiSummarizeSchema = z.object({
  transcriptId: z.string().uuid(),
  detailLevel: z.enum(['brief', 'standard', 'detailed']).default('standard'),
});

// -----------------------------------------------------------------------------
// Forum Validators
// -----------------------------------------------------------------------------
export const createForumPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  category: z.string().min(1).max(50),
  tags: z.array(z.string().max(30)).max(5).default([]),
});

export const updateForumPostSchema = createForumPostSchema.partial();

export const createForumCommentSchema = z.object({
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(),
  content: z.string().min(1).max(5000),
});

export const forumPostFilterSchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  userId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
  sortBy: z.enum(['createdAt', 'likeCount', 'replyCount', 'viewCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// -----------------------------------------------------------------------------
// Tutor Validators
// -----------------------------------------------------------------------------
export const createTutorProfileSchema = z.object({
  bio: z.string().min(10).max(2000),
  subjects: z.array(z.string().max(50)).min(1).max(10),
  hourlyRate: z.number().int().positive(),
  availabilities: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: z.string().default('Asia/Jakarta'),
    isRecurring: z.boolean().default(true),
    validFrom: z.string().datetime().optional().nullable(),
    validUntil: z.string().datetime().optional().nullable(),
  })).min(1).max(20),
});

export const createBookingSchema = z.object({
  tutorId: z.string().uuid(),
  subject: z.string().min(1).max(100),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  meetingUrl: z.string().url().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  review: z.string().max(1000).optional().nullable(),
});

// -----------------------------------------------------------------------------
// Notification Validators
// -----------------------------------------------------------------------------
export const notificationFilterSchema = z.object({
  isRead: z.boolean().optional(),
  type: z.enum([
    'STUDY_REMINDER',
    'QUIZ_RESULT',
    'ACHIEVEMENT_UNLOCKED',
    'FORUM_REPLY',
    'FORUM_LIKE',
    'PROCESSING_COMPLETE',
    'PROCESSING_FAILED',
    'CHALLENGE_AVAILABLE',
    'CHALLENGE_COMPLETE',
    'TUTOR_BOOKING',
    'TUTOR_REMINDER',
    'SYSTEM',
  ]).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

// -----------------------------------------------------------------------------
// Analytics Validators
// -----------------------------------------------------------------------------
export const trackEventSchema = z.object({
  eventType: z.string().min(1).max(100),
  eventData: z.record(z.unknown()),
  sessionId: z.string().uuid().optional().nullable(),
  materialId: z.string().uuid().optional().nullable(),
});

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  eventTypes: z.array(z.string()).optional(),
});

// -----------------------------------------------------------------------------
// Processing Job Validators
// -----------------------------------------------------------------------------
export const createProcessingJobSchema = z.object({
  materialId: z.string().uuid(),
  type: z.enum([
    'AUDIO_EXTRACTION',
    'TRANSCRIPTION',
    'TRANSCRIPT_CLEANING',
    'AI_ANALYSIS',
    'SUMMARY_GENERATION',
    'QUIZ_GENERATION',
    'EMBEDDING_GENERATION',
  ]),
  priority: z.number().int().min(0).max(20).default(5),
  maxAttempts: z.number().int().positive().max(5).default(3),
});

// -----------------------------------------------------------------------------
// Search Validators
// -----------------------------------------------------------------------------
export const globalSearchSchema = z.object({
  query: z.string().min(1).max(200),
  types: z.array(z.enum(['material', 'transcript', 'summary', 'forum', 'user'])).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

// -----------------------------------------------------------------------------
// Validation Helper
// -----------------------------------------------------------------------------
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
}

export function validateAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  return schema.parseAsync(data);
}