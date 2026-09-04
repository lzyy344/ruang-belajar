// =============================================================================
// Shared Constants
// =============================================================================

// -----------------------------------------------------------------------------
// App Constants
// -----------------------------------------------------------------------------
export const APP_NAME = 'Ruang Belajar';
export const APP_DESCRIPTION = 'Platform belajar cerdas dengan AI';

export const SUPPORTED_LOCALES = ['id', 'en'] as const;
export const DEFAULT_LOCALE = 'id';

export const TIMEZONE_DEFAULT = 'Asia/Jakarta';

// -----------------------------------------------------------------------------
// File Upload
// -----------------------------------------------------------------------------
export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB
export const MAX_FILE_SIZE_MB = 500;

export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/x-matroska',
  'video/x-msvideo',
  'video/quicktime',
  'video/webm',
] as const;

export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/ogg',
  'audio/webm',
] as const;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

export const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_VIDEO_MIME_TYPES,
  ...ALLOWED_AUDIO_MIME_TYPES,
  ...ALLOWED_DOCUMENT_MIME_TYPES,
] as const;

export const FILE_TYPE_CATEGORIES = {
  video: ALLOWED_VIDEO_MIME_TYPES,
  audio: ALLOWED_AUDIO_MIME_TYPES,
  document: ALLOWED_DOCUMENT_MIME_TYPES,
} as const;

// -----------------------------------------------------------------------------
// Processing
// -----------------------------------------------------------------------------
export const PROCESSING_STEPS = [
  'EXTRACTING_AUDIO',
  'TRANSCRIBING',
  'ANALYZING',
  'SUMMARIZING',
  'GENERATING_QUIZ',
] as const;

export const PROCESSING_STEP_LABELS: Record<string, string> = {
  EXTRACTING_AUDIO: 'Mengekstrak audio dari video...',
  TRANSCRIBING: 'Mentranskripsikan audio ke teks...',
  ANALYZING: 'Menganalisis konten materi...',
  SUMMARIZING: 'Membuat ringkasan otomatis...',
  GENERATING_QUIZ: 'Membuat kuis dari materi...',
};

export const JOB_PRIORITY = {
  LOW: 0,
  NORMAL: 5,
  HIGH: 10,
  URGENT: 20,
} as const;

export const MAX_JOB_ATTEMPTS = 3;
export const JOB_BACKOFF_MS = 5000;

// -----------------------------------------------------------------------------
// AI Providers
// -----------------------------------------------------------------------------
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  OLLAMA: 'ollama',
} as const;

export const AI_MODELS = {
  // OpenAI
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_4O: 'gpt-4o',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  TEXT_EMBEDDING_3_SMALL: 'text-embedding-3-small',
  TEXT_EMBEDDING_3_LARGE: 'text-embedding-3-large',

  // Anthropic
  CLAUDE_3_OPUS: 'claude-3-opus-20240229',
  CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
  CLAUDE_3_HAIKU: 'claude-3-haiku-20240307',

  // Ollama (local)
  LLAMA_3: 'llama3',
  MISTRAL: 'mistral',
  CODELLAMA: 'codellama',
} as const;

export const DEFAULT_AI_PROVIDER = AI_PROVIDERS.OPENAI;
export const DEFAULT_CHAT_MODEL = AI_MODELS.GPT_4O;
export const DEFAULT_EMBEDDING_MODEL = AI_MODELS.TEXT_EMBEDDING_3_SMALL;

// -----------------------------------------------------------------------------
// Transcription
// -----------------------------------------------------------------------------
export const TRANSCRIPTION_PROVIDERS = {
  ASSEMBLYAI: 'assemblyai',
  OPENAI_WHISPER: 'openai_whisper',
} as const;

export const DEFAULT_TRANSCRIPTION_PROVIDER = TRANSCRIPTION_PROVIDERS.ASSEMBLYAI;

// -----------------------------------------------------------------------------
// Gamification
// -----------------------------------------------------------------------------
export const XP_VALUES: Record<string, number> = {
  MATERIAL_COMPLETE: 100,
  QUIZ_COMPLETE: 50,
  QUIZ_PERFECT: 100,
  POMODORO_COMPLETE: 25,
  DAILY_STREAK: 10,
  ACHIEVEMENT_UNLOCK: 50,
  CHALLENGE_COMPLETE: 200,
  NOTE_CREATE: 5,
  FORUM_POST: 20,
  FORUM_LIKE_RECEIVED: 2,
};

export const LEVEL_XP_CURVE = (level: number): number => {
  // Exponential curve: 1000 * level^1.5
  return Math.floor(1000 * Math.pow(level, 1.5));
};

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

export const ACHIEVEMENT_DEFINITIONS = [
  // Streak
  { key: 'streak_3', name: 'Streak 3 Hari', description: 'Belajar 3 hari berturut-turut', icon: 'ti-flame', category: 'STREAK' as const, requirement: { type: 'streak' as const, value: 3 }, xpReward: 50 },
  { key: 'streak_7', name: 'Streak 7 Hari', description: 'Belajar 7 hari berturut-turut', icon: 'ti-flame', category: 'STREAK' as const, requirement: { type: 'streak' as const, value: 7 }, xpReward: 100 },
  { key: 'streak_14', name: 'Streak 14 Hari', description: 'Belajar 14 hari berturut-turut', icon: 'ti-flame', category: 'STREAK' as const, requirement: { type: 'streak' as const, value: 14 }, xpReward: 200 },
  { key: 'streak_30', name: 'Streak 30 Hari', description: 'Belajar 30 hari berturut-turut', icon: 'ti-calendar', category: 'STREAK' as const, requirement: { type: 'streak' as const, value: 30 }, xpReward: 500 },
  { key: 'streak_100', name: 'Streak 100 Hari', description: 'Belajar 100 hari berturut-turut', icon: 'ti-crown', category: 'STREAK' as const, requirement: { type: 'streak' as const, value: 100 }, xpReward: 2000 },

  // Quiz
  { key: 'quiz_first', name: 'Kuis Pertama', description: 'Selesaikan kuis pertama', icon: 'ti-help-circle', category: 'QUIZ' as const, requirement: { type: 'quiz_count' as const, value: 1 }, xpReward: 50 },
  { key: 'quiz_10', name: 'Pecinta Kuis', description: 'Selesaikan 10 kuis', icon: 'ti-help-circle', category: 'QUIZ' as const, requirement: { type: 'quiz_count' as const, value: 10 }, xpReward: 200 },
  { key: 'quiz_50', name: 'Master Kuis', description: 'Selesaikan 50 kuis', icon: 'ti-trophy', category: 'QUIZ' as const, requirement: { type: 'quiz_count' as const, value: 50 }, xpReward: 500 },
  { key: 'quiz_perfect', name: 'Sempurna', description: 'Dapat nilai 100% pada kuis', icon: 'ti-star', category: 'QUIZ' as const, requirement: { type: 'quiz_perfect' as const, value: 1 }, xpReward: 100 },
  { key: 'quiz_perfect_5', name: 'Juara Kuis', description: 'Dapat nilai 100% pada 5 kuis', icon: 'ti-crown', category: 'QUIZ' as const, requirement: { type: 'quiz_perfect' as const, value: 5 }, xpReward: 500 },

  // Learning
  { key: 'material_1', name: 'Pemula', description: 'Selesaikan materi pertama', icon: 'ti-book', category: 'LEARNING' as const, requirement: { type: 'material_count' as const, value: 1 }, xpReward: 50 },
  { key: 'material_10', name: 'Penjelajah', description: 'Selesaikan 10 materi', icon: 'ti-map', category: 'LEARNING' as const, requirement: { type: 'material_count' as const, value: 10 }, xpReward: 200 },
  { key: 'material_50', name: 'Ahli', description: 'Selesaikan 50 materi', icon: 'ti-graduation-cap', category: 'LEARNING' as const, requirement: { type: 'material_count' as const, value: 50 }, xpReward: 1000 },

  // Social
  { key: 'forum_first_post', name: 'Penulis', description: 'Buat postingan forum pertama', icon: 'ti-pencil', category: 'SOCIAL' as const, requirement: { type: 'forum_post' as const, value: 1 }, xpReward: 50 },
  { key: 'forum_10_posts', name: 'Aktif di Forum', description: 'Buat 10 postingan forum', icon: 'ti-messages', category: 'SOCIAL' as const, requirement: { type: 'forum_post' as const, value: 10 }, xpReward: 200 },

  // Special
  { key: 'pomodoro_10', name: 'Fokus', description: 'Selesaikan 10 sesi Pomodoro', icon: 'ti-clock', category: 'SPECIAL' as const, requirement: { type: 'pomodoro_count' as const, value: 10 }, xpReward: 100 },
  { key: 'night_owl', name: 'Malam Minggu', description: 'Belajar setelah pukul 22:00', icon: 'ti-moon', category: 'SPECIAL' as const, requirement: { type: 'streak' as const, value: 1, metadata: { hour: 22 } }, xpReward: 100, isSecret: true },
] as const;

// -----------------------------------------------------------------------------
// Challenges
// -----------------------------------------------------------------------------
export const WEEKLY_CHALLENGES = [
  { key: 'weekly_quiz_5', name: 'Juara Kuis Mingguan', description: 'Selesaikan 5 kuis minggu ini', type: 'WEEKLY' as const, target: 5, xpReward: 500, badgeReward: 'quiz_master_weekly' },
  { key: 'weekly_study_3h', name: 'Rajin Belajar', description: 'Belajar total 3 jam minggu ini', type: 'WEEKLY' as const, target: 180, xpReward: 300 },
  { key: 'weekly_pomodoro_10', name: 'Fokus Mingguan', description: 'Selesaikan 10 sesi Pomodoro', type: 'WEEKLY' as const, target: 10, xpReward: 300 },
] as const;

// -----------------------------------------------------------------------------
// Pagination
// -----------------------------------------------------------------------------
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// -----------------------------------------------------------------------------
// Cache TTL (seconds)
// -----------------------------------------------------------------------------
export const CACHE_TTL = {
  USER_PROFILE: 300, // 5 min
  MATERIAL_LIST: 60, // 1 min
  MATERIAL_DETAIL: 300, // 5 min
  TRANSCRIPT: 3600, // 1 hour
  SUMMARY: 3600, // 1 hour
  QUIZ: 3600, // 1 hour
  FORUM_POSTS: 60, // 1 min
  LEADERBOARD: 300, // 5 min
  ANALYTICS: 300, // 5 min
} as const;

// -----------------------------------------------------------------------------
// Rate Limits
// -----------------------------------------------------------------------------
export const RATE_LIMITS = {
  AUTH_LOGIN: { max: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  AUTH_REGISTER: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  AUTH_FORGOT_PASSWORD: { max: 2, windowMs: 60 * 60 * 1000 }, // 2 per hour
  API_GENERAL: { max: 100, windowMs: 15 * 60 * 1000 }, // 100 per 15 min
  AI_CHAT: { max: 30, windowMs: 60 * 1000 }, // 30 per minute
  UPLOAD: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  QUIZ_ATTEMPT: { max: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
} as const;

// -----------------------------------------------------------------------------
// Date Formats
// -----------------------------------------------------------------------------
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_SHORT: 'dd/MM/yyyy',
  DATETIME: 'dd MMM yyyy HH:mm',
  TIME: 'HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ssXXX",
} as const;

// -----------------------------------------------------------------------------
// Regex Patterns
// -----------------------------------------------------------------------------
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_8: /^.{8,}$/,
  PASSWORD_HAS_UPPER: /[A-Z]/,
  PASSWORD_HAS_LOWER: /[a-z]/,
  PASSWORD_HAS_NUMBER: /[0-9]/,
  PASSWORD_HAS_SPECIAL: /[!@#$%^&*(),.?":{}|<>]/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  SLUG: /^[a-z0-9-]+$/,
  YOUTUBE_URL: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
  GOOGLE_DRIVE_URL: /^https?:\/\/drive\.google\.com\/.*/,
} as const;