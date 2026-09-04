// =============================================================================
// Shared Types - Core domain types shared across frontend/backend
// =============================================================================

// -----------------------------------------------------------------------------
// User & Auth
// -----------------------------------------------------------------------------
export type UserRole = 'STUDENT' | 'TUTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  bio: string | null;
  avatarUrl: string | null;
  timezone: string;
  studyGoalMinutes: number;
  streakDays: number;
  longestStreak: number;
  lastStudyDate: Date | null;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  studyReminder: StudyReminderSettings;
  challengeNotifications: boolean;
  forumNotifications: boolean;
  achievementNotifications: boolean;
  language: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface StudyReminderSettings {
  enabled: boolean;
  time: string; // HH:mm format
  timezone: string;
}

// -----------------------------------------------------------------------------
// Materials
// -----------------------------------------------------------------------------
export type MaterialType = 'VIDEO' | 'AUDIO' | 'RECORDING' | 'LINK' | 'DOCUMENT';
export type MaterialStatus = 'UPLOADED' | 'PROCESSING' | 'EXTRACTING_AUDIO' | 'TRANSCRIBING' | 'ANALYZING' | 'SUMMARIZING' | 'GENERATING_QUIZ' | 'COMPLETED' | 'FAILED';
export type Difficulty = 'BASIC' | 'MEDIUM' | 'ADVANCED';

export interface Material {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: MaterialType;
  status: MaterialStatus;
  sourceUrl: string | null;
  duration: number | null; // seconds
  category: string | null;
  difficulty: Difficulty;
  tags: string[];
  estimatedStudyTime: number | null; // minutes
  progress: number; // 0-100
  isPublic: boolean;
  shareToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface MediaFile {
  id: string;
  materialId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number; // bytes
  s3Key: string;
  s3Bucket: string;
  duration: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// Transcript
// -----------------------------------------------------------------------------
export interface Transcript {
  id: string;
  materialId: string;
  fullText: string;
  language: string;
  duration: number; // seconds
  wordCount: number;
  confidence: number | null;
  provider: string;
  providerData: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptChunk {
  id: string;
  transcriptId: string;
  index: number;
  startTime: number; // seconds
  endTime: number; // seconds
  text: string;
  speaker: string | null;
  confidence: number | null;
  tokens: number | null;
  embeddings: number[] | null;
}

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
export interface Summary {
  id: string;
  materialId: string;
  title: string;
  shortSummary: string;
  fullSummary: string;
  keyPoints: string[];
  mainConcepts: string[];
  importantTerms: ImportantTerm[];
  conclusion: string | null;
  difficulty: Difficulty;
  category: string | null;
  estimatedTime: number | null; // minutes
  provider: string;
  model: string;
  tokensUsed: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportantTerm {
  term: string;
  definition: string;
}

// -----------------------------------------------------------------------------
// Notes
// -----------------------------------------------------------------------------
export interface Note {
  id: string;
  userId: string;
  materialId: string;
  content: string;
  timestamp: number | null; // video/audio timestamp reference
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------------------------------------------------------
// Quiz
// -----------------------------------------------------------------------------
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface Quiz {
  id: string;
  materialId: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  questionCount: number;
  timeLimit: number | null; // seconds
  passingScore: number; // percentage
  isPublished: boolean;
  generatedBy: 'ai' | 'manual';
  provider: string | null;
  model: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  index: number;
  type: QuestionType;
  question: string;
  options: QuizOption[];
  correctAnswer: number; // index
  explanation: string;
  difficulty: Difficulty;
  topic: string | null;
  sourceChunkId: string | null;
  createdAt: Date;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number; // percentage
  correctCount: number;
  totalQuestions: number;
  timeSpent: number; // seconds
  startedAt: Date;
  completedAt: Date | null;
  isPassed: boolean;
}

export interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number; // seconds
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// Study Sessions & Pomodoro
// -----------------------------------------------------------------------------
export type SessionType = 'MATERIAL_READ' | 'QUIZ' | 'POMODORO' | 'AI_CHAT' | 'FLASH_CARD' | 'SPEED_MATCH' | 'WORD_SCRAMBLE';
export type PomodoroMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

export interface StudySession {
  id: string;
  userId: string;
  materialId: string | null;
  type: SessionType;
  startedAt: Date;
  endedAt: Date | null;
  duration: number; // seconds
  xpEarned: number;
  metadata: Record<string, unknown> | null;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  materialId: string | null;
  mode: PomodoroMode;
  plannedDuration: number; // seconds
  actualDuration: number; // seconds
  completed: boolean;
  tasks: PomodoroTask[];
  startedAt: Date;
  endedAt: Date | null;
}

export interface PomodoroTask {
  text: string;
  completed: boolean;
}

// -----------------------------------------------------------------------------
// AI Chat
// -----------------------------------------------------------------------------
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';

export interface AIConversation {
  id: string;
  userId: string;
  materialId: string | null;
  title: string;
  model: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  tokensUsed: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// Forum
// -----------------------------------------------------------------------------
export interface ForumPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  likeCount: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumComment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumLike {
  id: string;
  userId: string;
  postId: string | null;
  commentId: string | null;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// Tutor
// -----------------------------------------------------------------------------
export interface Tutor {
  id: string;
  userId: string;
  bio: string;
  subjects: string[];
  hourlyRate: number; // cents
  rating: number;
  reviewCount: number;
  totalSessions: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TutorAvailability {
  id: string;
  tutorId: string;
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
  isRecurring: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface TutorBooking {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  meetingUrl: string | null;
  notes: string | null;
  rating: number | null;
  review: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------------------------------------------------------
// Notifications
// -----------------------------------------------------------------------------
export type NotificationType =
  | 'STUDY_REMINDER'
  | 'QUIZ_RESULT'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'FORUM_REPLY'
  | 'FORUM_LIKE'
  | 'PROCESSING_COMPLETE'
  | 'PROCESSING_FAILED'
  | 'CHALLENGE_AVAILABLE'
  | 'CHALLENGE_COMPLETE'
  | 'TUTOR_BOOKING'
  | 'TUTOR_REMINDER'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// Processing Jobs
// -----------------------------------------------------------------------------
export type ProcessingJobType =
  | 'AUDIO_EXTRACTION'
  | 'TRANSCRIPTION'
  | 'TRANSCRIPT_CLEANING'
  | 'AI_ANALYSIS'
  | 'SUMMARY_GENERATION'
  | 'QUIZ_GENERATION'
  | 'EMBEDDING_GENERATION';

export type JobStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ProcessingJob {
  id: string;
  userId: string;
  materialId: string;
  type: ProcessingJobType;
  status: JobStatus;
  priority: number;
  progress: number; // 0-100
  currentStep: string | null;
  error: string | null;
  result: Record<string, unknown> | null;
  attempts: number;
  maxAttempts: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------------------------------------------------------
// Gamification
// -----------------------------------------------------------------------------
export type XPSource =
  | 'MATERIAL_COMPLETE'
  | 'QUIZ_COMPLETE'
  | 'QUIZ_PERFECT'
  | 'POMODORO_COMPLETE'
  | 'DAILY_STREAK'
  | 'ACHIEVEMENT_UNLOCK'
  | 'CHALLENGE_COMPLETE'
  | 'NOTE_CREATE'
  | 'FORUM_POST'
  | 'FORUM_LIKE_RECEIVED';

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  source: XPSource;
  referenceId: string | null;
  description: string;
  createdAt: Date;
}

export type AchievementCategory = 'STREAK' | 'QUIZ' | 'LEARNING' | 'SOCIAL' | 'SPECIAL';

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  xpReward: number;
  isSecret: boolean;
  createdAt: Date;
}

export interface AchievementRequirement {
  type: 'streak' | 'quiz_count' | 'quiz_perfect' | 'material_count' | 'xp_total' | 'challenge_complete' | 'forum_post' | 'pomodoro_count';
  value: number;
  metadata?: Record<string, unknown>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

export type ChallengeType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';

export interface Challenge {
  id: string;
  key: string;
  name: string;
  description: string;
  type: ChallengeType;
  target: number;
  xpReward: number;
  badgeReward: string | null; // achievement key
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// Analytics
// -----------------------------------------------------------------------------
export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  sessionId: string | null;
  materialId: string | null;
  createdAt: Date;
}

export interface HeatmapData {
  date: string; // YYYY-MM-DD
  level: 0 | 1 | 2 | 3 | 4;
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  quizCount: number;
  studyTime: number; // minutes
  color: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  xp: number;
  medal: string | null;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

// -----------------------------------------------------------------------------
// Upload
// -----------------------------------------------------------------------------
export interface PresignedUploadUrl {
  uploadUrl: string;
  fields: Record<string, string>;
  key: string;
  bucket: string;
  expiresIn: number;
}

export interface UploadCompleteInput {
  key: string;
  bucket: string;
  etag: string;
  size: number;
}