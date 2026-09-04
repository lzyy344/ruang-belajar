// =============================================================================
// Shared Utilities
// =============================================================================
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { id } from 'date-fns/locale';

// -----------------------------------------------------------------------------
// Class Name Utility (for Tailwind)
// -----------------------------------------------------------------------------
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -----------------------------------------------------------------------------
// Date Formatting
// -----------------------------------------------------------------------------
export function formatDate(date: Date | string | number, formatStr = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!isValid(d)) return '-';
  return format(d, formatStr, { locale: id });
}

export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, 'dd MMM yyyy HH:mm');
}

export function formatTime(date: Date | string | number): string {
  return formatDate(date, 'HH:mm');
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!isValid(d)) return '-';
  return formatDistanceToNow(d, { addSuffix: true, locale: id });
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} detik`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours} jam ${remainingMinutes} menit` : `${hours} jam`;
}

// -----------------------------------------------------------------------------
// Number Formatting
// -----------------------------------------------------------------------------
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatXP(xp: number): string {
  return formatNumber(xp);
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

// -----------------------------------------------------------------------------
// String Utilities
// -----------------------------------------------------------------------------
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

export function generateShareToken(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

export function generateId(): string {
  return crypto.randomUUID();
}

// -----------------------------------------------------------------------------
// File Utilities
// -----------------------------------------------------------------------------
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

export function getMimeCategory(mimeType: string): 'video' | 'audio' | 'document' | 'unknown' {
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) return 'document';
  return 'unknown';
}

export function isAllowedFileType(mimeType: string, allowedTypes: readonly string[]): boolean {
  return allowedTypes.includes(mimeType as any);
}

// -----------------------------------------------------------------------------
// Color Utilities (for UI)
// -----------------------------------------------------------------------------
export const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  BASIC: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  MEDIUM: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  ADVANCED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

export const MATERIAL_TYPE_ICONS: Record<string, string> = {
  VIDEO: 'ti-video',
  AUDIO: 'ti-music',
  RECORDING: 'ti-microphone',
  LINK: 'ti-link',
  DOCUMENT: 'ti-file-text',
};

export const MATERIAL_TYPE_LABELS: Record<string, string> = {
  VIDEO: 'Video',
  AUDIO: 'Audio',
  RECORDING: 'Rekaman',
  LINK: 'Link',
  DOCUMENT: 'Dokumen',
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  UPLOADED: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' },
  PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  EXTRACTING_AUDIO: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  TRANSCRIBING: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  ANALYZING: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  SUMMARIZING: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  GENERATING_QUIZ: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
};

export const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  STUDY_REMINDER: 'ti-clock',
  QUIZ_RESULT: 'ti-help-circle',
  ACHIEVEMENT_UNLOCKED: 'ti-trophy',
  FORUM_REPLY: 'ti-message',
  FORUM_LIKE: 'ti-heart',
  PROCESSING_COMPLETE: 'ti-check-circle',
  PROCESSING_FAILED: 'ti-x-circle',
  CHALLENGE_AVAILABLE: 'ti-target',
  CHALLENGE_COMPLETE: 'ti-award',
  TUTOR_BOOKING: 'ti-calendar',
  TUTOR_REMINDER: 'ti-bell',
  SYSTEM: 'ti-info-circle',
};

export const NOTIFICATION_TYPE_COLORS: Record<string, { bg: string; icon: string }> = {
  STUDY_REMINDER: { bg: 'bg-orange-100', icon: 'text-orange-600' },
  QUIZ_RESULT: { bg: 'bg-blue-100', icon: 'text-blue-600' },
  ACHIEVEMENT_UNLOCKED: { bg: 'bg-yellow-100', icon: 'text-yellow-600' },
  FORUM_REPLY: { bg: 'bg-green-100', icon: 'text-green-600' },
  FORUM_LIKE: { bg: 'bg-pink-100', icon: 'text-pink-600' },
  PROCESSING_COMPLETE: { bg: 'bg-green-100', icon: 'text-green-600' },
  PROCESSING_FAILED: { bg: 'bg-red-100', icon: 'text-red-600' },
  CHALLENGE_AVAILABLE: { bg: 'bg-purple-100', icon: 'text-purple-600' },
  CHALLENGE_COMPLETE: { bg: 'bg-yellow-100', icon: 'text-yellow-600' },
  TUTOR_BOOKING: { bg: 'bg-blue-100', icon: 'text-blue-600' },
  TUTOR_REMINDER: { bg: 'bg-orange-100', icon: 'text-orange-600' },
  SYSTEM: { bg: 'bg-gray-100', icon: 'text-gray-600' },
};

// -----------------------------------------------------------------------------
// XP & Level Utilities
// -----------------------------------------------------------------------------
export function calculateLevel(xp: number): number {
  let level = 1;
  let requiredXP = 1000;
  let totalXP = 0;

  while (totalXP + requiredXP <= xp) {
    totalXP += requiredXP;
    level++;
    requiredXP = Math.floor(1000 * Math.pow(level, 1.5));
  }

  return level;
}

export function calculateXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(1000 * Math.pow(i, 1.5));
  }
  return total;
}

export function getXPProgress(xp: number): { level: number; currentLevelXP: number; nextLevelXP: number; progress: number } {
  const level = calculateLevel(xp);
  const currentLevelXP = calculateXPForLevel(level);
  const nextLevelXP = currentLevelXP + Math.floor(1000 * Math.pow(level, 1.5));
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return { level, currentLevelXP, nextLevelXP, progress: Math.min(100, Math.max(0, progress)) };
}

// -----------------------------------------------------------------------------
// Streak Utilities
// -----------------------------------------------------------------------------
export function calculateStreak(lastStudyDate: Date | null, today = new Date()): number {
  if (!lastStudyDate) return 0;

  const lastDate = new Date(lastStudyDate);
  lastDate.setHours(0, 0, 0, 0);
  const todayDate = new Date(today);
  todayDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 1; // Studied today
  if (diffDays === 1) return 1; // Studied yesterday, streak continues
  return 0; // Streak broken
}

export function getStreakMilestone(streak: number): number | null {
  const milestones = [3, 7, 14, 30, 60, 100, 365];
  return milestones.find(m => m === streak) || null;
}

// -----------------------------------------------------------------------------
// Quiz Utilities
// -----------------------------------------------------------------------------
export function calculateQuizScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function isQuizPassed(score: number, passingScore: number): boolean {
  return score >= passingScore;
}

// -----------------------------------------------------------------------------
// Pagination Utilities
// -----------------------------------------------------------------------------
export function calculatePagination(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    offset: (page - 1) * limit,
  };
}

// -----------------------------------------------------------------------------
// Error Handling
// -----------------------------------------------------------------------------
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, details?: Record<string, unknown>) {
    return new AppError('BAD_REQUEST', message, 400, details);
  }

  static unauthorized(message = 'Tidak terautentikasi', details?: Record<string, unknown>) {
    return new AppError('UNAUTHORIZED', message, 401, details);
  }

  static forbidden(message = 'Akses ditolak', details?: Record<string, unknown>) {
    return new AppError('FORBIDDEN', message, 403, details);
  }

  static notFound(message = 'Tidak ditemukan', details?: Record<string, unknown>) {
    return new AppError('NOT_FOUND', message, 404, details);
  }

  static internal(message = 'Terjadi kesalahan server', details?: Record<string, unknown>) {
    return new AppError('INTERNAL_ERROR', message, 500, details);
  }

  static tooManyRequests(message = 'Terlalu banyak permintaan', details?: Record<string, unknown>) {
    return new AppError('TOO_MANY_REQUESTS', message, 429, details);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// -----------------------------------------------------------------------------
// Async Utilities
// -----------------------------------------------------------------------------
export async function retry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; delay?: number; backoff?: number; onRetry?: (error: Error, attempt: number) => void } = {}
): Promise<T> {
  const { attempts = 3, delay = 1000, backoff = 2, onRetry } = options;

  let lastError: Error;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < attempts - 1) {
        onRetry?.(lastError, i + 1);
        await new Promise(r => setTimeout(r, delay * Math.pow(backoff, i)));
      }
    }
  }

  throw lastError!;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// -----------------------------------------------------------------------------
// Object Utilities
// -----------------------------------------------------------------------------
export function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// -----------------------------------------------------------------------------
// Array Utilities
// -----------------------------------------------------------------------------
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function unique<T>(array: T[], key?: (item: T) => string | number): T[] {
  if (!key) return [...new Set(array)];
  const seen = new Set<string | number>();
  return array.filter(item => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function groupBy<T>(array: T[], key: (item: T) => string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// -----------------------------------------------------------------------------
// Environment Helpers
// -----------------------------------------------------------------------------
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export function getEnvBool(key: string, defaultValue = false): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

export function getEnvInt(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is not set`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) throw new Error(`Environment variable ${key} is not a valid integer`);
  return parsed;
}

// -----------------------------------------------------------------------------
// Export all types from types module
// -----------------------------------------------------------------------------
export type * from '../types';