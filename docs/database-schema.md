# Database Schema Documentation

## Overview

PostgreSQL 16 with Prisma ORM. Uses `pgvector` extension for embeddings.

## Entity Relationship Diagram

```
User 1──1 Profile
User 1──M Material
User 1──M Note
User 1──M QuizAttempt
User 1──M PomodoroSession
User 1──M XPTransaction
User 1──M UserAchievement
User 1──M UserChallenge
User 1──M ForumPost
User 1──M ForumComment
User 1──M ForumLike
User 1──M Notification
User 1──M AIConversation
User 1──M TutorBooking (student)
User 1──M StudySession

Material 1──M MediaFile
Material 1──1 Transcript
Material 1──1 Summary
Material 1──M Quiz
Material 1──M ProcessingJob

Transcript 1──M TranscriptChunk

Quiz 1──M QuizQuestion
Quiz 1──M QuizAttempt
QuizQuestion 1──M QuizAnswer
QuizAttempt 1──M QuizAnswer

Tutor 1──M TutorAvailability
Tutor 1──M TutorBooking
User 1──1 Tutor (optional)

ForumPost 1──M ForumComment
ForumPost 1──M ForumLike
ForumComment 1──M ForumComment (replies)
ForumComment 1──M ForumLike
```

## Tables

### Users & Authentication

#### `users`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, CUID | Unique identifier |
| email | TEXT | UNIQUE, NOT NULL | User email |
| emailVerified | TIMESTAMPTZ | NULLABLE | Verification timestamp |
| name | TEXT | NULLABLE | Display name |
| passwordHash | TEXT | NULLABLE | Bcrypt hash |
| image | TEXT | NULLABLE | Avatar URL |
| role | ENUM | DEFAULT 'STUDENT' | STUDENT/TUTOR/ADMIN |
| createdAt | TIMESTAMPTZ | DEFAULT now() | |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Auto-update |

**Indexes:** `email` (unique)

#### `accounts` (NextAuth)
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| userId | TEXT | FK → users.id CASCADE |
| type | TEXT | NOT NULL |
| provider | TEXT | NOT NULL |
| providerAccountId | TEXT | NOT NULL |
| refresh_token | TEXT | NULLABLE |
| access_token | TEXT | NULLABLE |
| expires_at | INTEGER | NULLABLE |
| token_type | TEXT | NULLABLE |
| scope | TEXT | NULLABLE |
| id_token | TEXT | NULLABLE |
| session_state | TEXT | NULLABLE |

**Unique:** `(provider, providerAccountId)`

#### `sessions` (NextAuth)
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| sessionToken | TEXT | UNIQUE |
| userId | TEXT | FK → users.id CASCADE |
| expires | TIMESTAMPTZ | NOT NULL |

#### `verification_tokens` (NextAuth)
| Column | Type | Constraints |
|--------|------|-------------|
| identifier | TEXT | |
| token | TEXT | UNIQUE |
| expires | TIMESTAMPTZ | |

**Unique:** `(identifier, token)`

### Profile & Gamification

#### `profiles`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| userId | TEXT | UNIQUE, FK → users.id CASCADE | |
| bio | TEXT | NULLABLE | |
| avatarUrl | TEXT | NULLABLE | |
| timezone | TEXT | NOT NULL | 'Asia/Jakarta' |
| studyGoalMinutes | INTEGER | NOT NULL | 30 |
| streakDays | INTEGER | NOT NULL | 0 |
| longestStreak | INTEGER | NOT NULL | 0 |
| lastStudyDate | TIMESTAMPTZ | NULLABLE | |
| totalXP | INTEGER | NOT NULL | 0 |
| level | INTEGER | NOT NULL | 1 |
| xpToNextLevel | INTEGER | NOT NULL | 1000 |
| settings | JSONB | NOT NULL | '{}' |
| createdAt | TIMESTAMPTZ | DEFAULT now() | |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | |

#### `xp_transactions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| userId | TEXT | FK → users.id CASCADE |
| amount | INTEGER | NOT NULL |
| source | ENUM | NOT NULL |
| referenceId | TEXT | NULLABLE |
| description | TEXT | NOT NULL |
| createdAt | TIMESTAMPTZ | DEFAULT now() |

**Indexes:** `(userId, createdAt)`

**XP Sources:** MATERIAL_COMPLETE, QUIZ_COMPLETE, QUIZ_PERFECT, POMODORO_COMPLETE, DAILY_STREAK, ACHIEVEMENT_UNLOCK, CHALLENGE_COMPLETE, NOTE_CREATE, FORUM_POST, FORUM_LIKE_RECEIVED

#### `achievements`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| key | TEXT | UNIQUE |
| name | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| icon | TEXT | NOT NULL |
| category | ENUM | NOT NULL |
| requirement | JSONB | NOT NULL |
| xpReward | INTEGER | DEFAULT 0 |
| isSecret | BOOLEAN | DEFAULT false |
| createdAt | TIMESTAMPTZ | DEFAULT now() |

**Categories:** STREAK, QUIZ, LEARNING, SOCIAL, SPECIAL

#### `user_achievements`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| userId | TEXT | FK → users.id CASCADE |
| achievementId | TEXT | FK → achievements.id CASCADE |
| unlockedAt | TIMESTAMPTZ | DEFAULT now() |

**Unique:** `(userId, achievementId)`

#### `challenges`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| key | TEXT | UNIQUE |
| name | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| type | ENUM | NOT NULL |
| target | INTEGER | NOT NULL |
| xpReward | INTEGER | NOT NULL |
| badgeReward | TEXT | NULLABLE |
| startsAt | TIMESTAMPTZ | NOT NULL |
| endsAt | TIMESTAMPTZ | NOT NULL |
| isActive | BOOLEAN | DEFAULT true |
| createdAt | TIMESTAMPTZ | DEFAULT now() |

**Types:** DAILY, WEEKLY, MONTHLY, SPECIAL

#### `user_challenges`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| userId | TEXT | FK → users.id CASCADE |
| challengeId | TEXT | FK → challenges.id CASCADE |
| progress | INTEGER | DEFAULT 0 |
| completed | BOOLEAN | DEFAULT false |
| completedAt | TIMESTAMPTZ | NULLABLE |
| createdAt | TIMESTAMPTZ | DEFAULT now() |

**Unique:** `(userId, challengeId)`

### Materials & Processing

#### `materials`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| userId | TEXT | FK → users.id CASCADE | |
| title | TEXT | NOT NULL | |
| description | TEXT | NULLABLE | |
| type | ENUM | NOT NULL | |
| status | ENUM | NOT NULL | 'UPLOADED' |
| sourceUrl | TEXT | NULLABLE | |
| duration | INTEGER | NULLABLE | seconds |
| category | TEXT | NULLABLE | |
| difficulty | ENUM | NOT NULL | 'MEDIUM' |
| tags | TEXT[] | NOT NULL | '{}' |
| estimatedStudyTime | INTEGER | NULLABLE | minutes |
| progress | INTEGER | NOT NULL | 0 |
| isPublic | BOOLEAN | NOT NULL | false |
| shareToken | TEXT | UNIQUE, NULLABLE | |
| createdAt | TIMESTAMPTZ | DEFAULT now() | |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | |
| completedAt | TIMESTAMPTZ | NULLABLE | |

**Indexes:** `(userId, status)`, `(userId, category)`, `(userId, createdAt)`

**Types:** VIDEO, AUDIO, RECORDING, LINK, DOCUMENT
**Statuses:** UPLOADED, PROCESSING, EXTRACTING_AUDIO, TRANSCRIBING, ANALYZING, SUMMARIZING, GENERATING_QUIZ, COMPLETED, FAILED
**Difficulties:** BASIC, MEDIUM, ADVANCED

#### `media_files`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| materialId | TEXT | FK → materials.id CASCADE |
| filename | TEXT | NOT NULL |
| originalName | TEXT | NOT NULL |
| mimeType | TEXT | NOT NULL |
| size | INTEGER | NOT NULL |
| s3Key | TEXT | UNIQUE |
| s3Bucket | TEXT | NOT NULL |
| duration | INTEGER | NULLABLE |
| metadata | JSONB | NULLABLE |
| createdAt | TIMESTAMPTZ | DEFAULT now() |

**Index:** `materialId`

#### `transcripts`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| materialId | TEXT | UNIQUE, FK → materials.id CASCADE | |
| fullText | TEXT | NOT NULL | |
| language | TEXT | NOT NULL | 'id' |
| duration | INTEGER | NOT NULL | seconds |
| wordCount | INTEGER | NOT NULL | |
| confidence | FLOAT | NULLABLE | |
| provider | TEXT | NOT NULL | |
| providerData | JSONB | NULLABLE | |
| createdAt | TIMESTAMPTZ | DEFAULT now() | |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | |

#### `transcript_chunks`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| transcriptId | TEXT | FK → transcripts.id CASCADE |
| index | INTEGER | NOT NULL |
| startTime | FLOAT | NOT NULL |
| endTime | FLOAT | NOT NULL |
| text | TEXT | NOT NULL |
| speaker | TEXT | NULLABLE |
| confidence | FLOAT | NULLABLE |
| tokens | INTEGER | NULLABLE |
| embeddings | VECTOR(1536) | NULLABLE |

**Index:** `(transcriptId, index)`

**Note:** Requires `pgvector` extension. Embeddings for semantic search.

#### `summaries`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| materialId | TEXT | UNIQUE, FK → materials.id CASCADE |
| title | TEXT | NOT NULL |
| shortSummary | TEXT | NOT NULL |
| fullSummary | TEXT | NOT NULL |
| keyPoints | TEXT[] | NOT NULL |
| mainConcepts | TEXT[] | NOT NULL |
| importantTerms | JSONB | NOT NULL |
| conclusion | TEXT | NULLABLE |
| difficulty | ENUM | NOT NULL |
| category | TEXT | NULLABLE |
| estimatedTime | INTEGER | NULLABLE |
| provider | TEXT | NOT NULL |
| model | TEXT | NOT NULL |
| tokensUsed | INTEGER | NULLABLE |
| createdAt | TIMESTAMPTZ | DEFAULT now() |
| updatedAt | TIMESTAMPTZ | DEFAULT now() |

**ImportantTerms JSON structure:** `[{term: string, definition: string}]`

### Notes

#### `notes`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| userId | TEXT | FK → users.id CASCADE |
| materialId | TEXT | FK → materials.id CASCADE |
| content | TEXT | NOT NULL |
| timestamp | FLOAT | NULLABLE |
| isPublic | BOOLEAN | DEFAULT false |
| createdAt | TIMESTAMPTZ | DEFAULT now() |
| updatedAt | TIMESTAMPTZ | DEFAULT now() |

**Index:** `(userId, materialId)`

### Quiz System

#### `quizzes`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| materialId | TEXT | FK → materials.id CASCADE | |
| title | TEXT | NOT NULL | |
| description | TEXT | NULLABLE | |
| difficulty | ENUM | NOT NULL | |
| questionCount | INTEGER | NOT NULL | |
| timeLimit | INTEGER | NULLABLE | seconds |
| passingScore | INTEGER | NOT NULL | 70 |
| isPublished | BOOLEAN | NOT NULL | true |
| generatedBy | TEXT | NOT NULL | 'ai' or 'manual' |
| provider | TEXT | NULLABLE | |
| model | TEXT | NULLABLE | |
| createdAt | TIMESTAMPTZ | DEFAULT now() | |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | |

**Index:** `materialId`

#### `quiz_questions`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| quizId | TEXT | FK → quizzes.id CASCADE | |
| index | INTEGER | NOT NULL | |
| type | ENUM | NOT NULL | 'MULTIPLE_CHOICE' |
| question | TEXT | NOT NULL | |
| options | JSONB | NOT NULL | |
| correctAnswer | INTEGER | NOT NULL | |
| explanation | TEXT | NOT NULL | |
| difficulty | ENUM | NOT NULL | |
| topic | TEXT | NULLABLE | |
| sourceChunkId | TEXT | NULLABLE | FK → transcript_chunks.id |
| createdAt | TIMESTAMPTZ | DEFAULT now() | |

**Index:** `(quizId, index)`

**Options JSON structure:** `[{text: string, isCorrect: boolean}]`

**Question Types:** MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER

#### `quiz_attempts`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| userId | TEXT | FK → users.id CASCADE | |
| quizId | TEXT | FK → quizzes.id CASCADE | |
| score | INTEGER | NOT NULL | percentage 0-100 |
| correctCount | INTEGER | NOT NULL | |
| totalQuestions | INTEGER | NOT NULL | |
| timeSpent | INTEGER | NOT NULL | seconds |
| startedAt | TIMESTAMPTZ | DEFAULT now() | |
| completedAt | TIMESTAMPTZ | NULLABLE | |
| isPassed | BOOLEAN | NOT NULL | |

**Indexes:** `(userId, quizId)`, `(userId, startedAt)`

#### `quiz_answers`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| attemptId | TEXT | FK → quiz_attempts.id CASCADE |
| questionId | TEXT | FK → quiz_questions.id CASCADE |
| selectedAnswer | INTEGER | NULLABLE |
| isCorrect | BOOLEAN | NOT NULL |
| timeSpent | INTEGER | NOT NULL |
| createdAt | TIMESTAMPTZ | DEFAULT now() |

**Unique:** `(attemptId, questionId)`

### Study Sessions & Pomodoro

#### `study_sessions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| userId | TEXT | FK → users.id CASCADE |
| materialId | TEXT | FK → materials.id SET NULL |
| type | ENUM | NOT NULL |
| startedAt | TIMESTAMPTZ | DEFAULT now() |
| endedAt | TIMESTAMPTZ | NULLABLE |
| duration | INTEGER | NOT NULL |
| xpEarned | INTEGER | DEFAULT 0 |
| metadata | JSONB | NULLABLE |

**Indexes:** `(userId, startedAt)`, `(userId, materialId)`

**Types:** MATERIAL_READ, QUIZ, POMODORO, AI_CHAT, FLASH_CARD, SPEED_MATCH, WORD_SCRAMBLE

#### `pomodoro_sessions`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| userId | TEXT | FK → users.id CASCADE | |
| materialId | TEXT | FK → materials.id SET NULL | |
| mode | ENUM | NOT NULL | |
| plannedDuration | INTEGER | NOT NULL | |
| actualDuration | INTEGER | NOT NULL | |
| completed | BOOLEAN | NOT NULL | false |
| tasks | JSONB | NOT NULL | '[]' |
| startedAt | TIMESTAMPTZ | DEFAULT now() | |
| endedAt | TIMESTAMPTZ | NULLABLE | |

**Index:** `(userId, startedAt)`

**Modes:** WORK, SHORT_BREAK, LONG_BREAK

**Tasks JSON structure:** `[{text: string, completed: boolean}]`

### AI Chat

#### `ai_conversations`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| userId | TEXT | FK → users.id CASCADE |
| materialId | TEXT | FK → materials.id SET NULL |
| title | TEXT | NOT NULL |
| model | TEXT | NOT NULL |
| provider | TEXT | NOT NULL |
| createdAt | TIMESTAMPTZ | DEFAULT now() |
| updatedAt | TIMESTAMPTZ | DEFAULT now() |

**Index:** `(userId, updatedAt)`

#### `ai_messages`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| conversationId | TEXT | FK → ai_conversations.id CASCADE |
| role | ENUM | NOT NULL |
| content | TEXT | NOT NULL |
| tokensUsed | INTEGER | NULLABLE |
| metadata | JSONB | NULLABLE |
| createdAt | TIMESTAMPTZ | DEFAULT now() |

**Index:** `(conversationId, createdAt)`

**Roles:** USER, ASSISTANT, SYSTEM, TOOL

### Forum / Community

#### `forum_posts`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| userId | TEXT | FK → users.id CASCADE | |
| title | TEXT | NOT NULL | |
| content | TEXT | NOT NULL | |
| category | TEXT | NOT NULL | |
| tags | TEXT[] | NOT NULL | '{}' |
| isPinned | BOOLEAN | NOT NULL | false |
| isLocked | BOOLEAN | NOT NULL | false |
| viewCount | INTEGER | NOT NULL | 0 |
| likeCount | INTEGER | NOT NULL | 0 |
| replyCount | INTEGER | NOT NULL | 0 |
| createdAt | TIMESTAMPTZ | DEFAULT now() | |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | |

**Indexes:** `(category, createdAt)`, `(userId, createdAt)`

#### `forum_comments`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| postId | TEXT | FK → forum_posts.id CASCADE |
| userId | TEXT | FK → users.id CASCADE |
| parentId | TEXT | FK → forum_comments.id CASCADE (self-ref) |
| content | TEXT | NOT NULL |
| likeCount | INTEGER | DEFAULT 0 |
| createdAt | TIMESTAMPTZ | DEFAULT now() |
| updatedAt | TIMESTAMPTZ | DEFAULT now() |

**Indexes:** `(postId, createdAt)`, `(userId, createdAt)`

#### `forum_likes`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| userId | TEXT | FK → users.id CASCADE |
| postId | TEXT | FK → forum_posts.id CASCADE |
| commentId | TEXT | FK → forum_comments.id CASCADE |
| createdAt | TIMESTAMPTZ | DEFAULT now() |

**Unique:** `(userId, postId)`, `(userId, commentId)`

### Tutor System

#### `tutors`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| userId | TEXT | UNIQUE, FK → users.id CASCADE | |
| bio | TEXT | NOT NULL | |
| subjects | TEXT[] | NOT NULL | '{}' |
| hourlyRate | INTEGER | NOT NULL | cents |
| rating | FLOAT | NOT NULL | 0 |
| reviewCount | INTEGER | NOT NULL | 0 |
| totalSessions | INTEGER | NOT NULL | 0 |
| isVerified | BOOLEAN | NOT NULL | false |
| isActive | BOOLEAN | NOT NULL | true |
| createdAt | TIMESTAMPTZ | DEFAULT now() | |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | |

#### `tutor_availabilities`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| tutorId | TEXT | FK → tutors.id CASCADE | |
| dayOfWeek | INTEGER | NOT NULL | 0-6 |
| startTime | TEXT | NOT NULL | HH:mm |
| endTime | TEXT | NOT NULL | HH:mm |
| timezone | TEXT | NOT NULL | 'Asia/Jakarta' |
| isRecurring | BOOLEAN | NOT NULL | true |
| validFrom | TIMESTAMPTZ | NULLABLE | |
| validUntil | TIMESTAMPTZ | NULLABLE | |

**Index:** `(tutorId, dayOfWeek)`

#### `tutor_bookings`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| studentId | TEXT | FK → users.id CASCADE | |
| tutorId | TEXT | FK → tutors.id CASCADE | |
| subject | TEXT | NOT NULL | |
| startTime | TIMESTAMPTZ | NOT NULL | |
| endTime | TIMESTAMPTZ | NOT NULL | |
| status | ENUM | NOT NULL | 'PENDING' |
| meetingUrl | TEXT | NULLABLE | |
| notes | TEXT | NULLABLE | |
| rating | INTEGER | NULLABLE | 1-5 |
| review | TEXT | NULLABLE | |
| createdAt | TIMESTAMPTZ | DEFAULT now() | |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | |

**Indexes:** `(studentId, startTime)`, `(tutorId, startTime)`

**Statuses:** PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW

### Notifications

#### `notifications`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| userId | TEXT | FK → users.id CASCADE | |
| type | ENUM | NOT NULL | |
| title | TEXT | NOT NULL | |
| message | TEXT | NOT NULL | |
| data | JSONB | NULLABLE | |
| isRead | BOOLEAN | NOT NULL | false |
| readAt | TIMESTAMPTZ | NULLABLE | |
| createdAt | TIMESTAMPTZ | DEFAULT now() | |

**Index:** `(userId, isRead, createdAt)`

**Types:** STUDY_REMINDER, QUIZ_RESULT, ACHIEVEMENT_UNLOCKED, FORUM_REPLY, FORUM_LIKE, PROCESSING_COMPLETE, PROCESSING_FAILED, CHALLENGE_AVAILABLE, CHALLENGE_COMPLETE, TUTOR_BOOKING, TUTOR_REMINDER, SYSTEM

### Processing Jobs

#### `processing_jobs`
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | TEXT | PK | |
| userId | TEXT | FK → users.id CASCADE | |
| materialId | TEXT | FK → materials.id CASCADE | |
| type | ENUM | NOT NULL | |
| status | ENUM | NOT NULL | 'PENDING' |
| priority | INTEGER | NOT NULL | 0 |
| progress | INTEGER | NOT NULL | 0 |
| currentStep | TEXT | NULLABLE | |
| error | TEXT | NULLABLE | |
| result | JSONB | NULLABLE | |
| attempts | INTEGER | NOT NULL | 0 |
| maxAttempts | INTEGER | NOT NULL | 3 |
| startedAt | TIMESTAMPTZ | NULLABLE | |
| completedAt | TIMESTAMPTZ | NULLABLE | |
| createdAt | TIMESTAMPTZ | DEFAULT now() | |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | |

**Indexes:** `(userId, status)`, `(materialId, type)`

**Types:** AUDIO_EXTRACTION, TRANSCRIPTION, TRANSCRIPT_CLEANING, AI_ANALYSIS, SUMMARY_GENERATION, QUIZ_GENERATION, EMBEDDING_GENERATION

**Statuses:** PENDING, QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED

### Analytics

#### `analytics_events`
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK |
| userId | TEXT | FK → users.id CASCADE |
| eventType | TEXT | NOT NULL |
| eventData | JSONB | NOT NULL |
| sessionId | TEXT | NULLABLE |
| materialId | TEXT | NULLABLE |
| createdAt | TIMESTAMPTZ | DEFAULT now() |

**Indexes:** `(userId, eventType, createdAt)`, `(userId, createdAt)`

**Event Types:** material_opened, material_completed, quiz_started, quiz_completed, answer_correct, pomodoro_completed, note_created, ai_chat_message, forum_post_created, forum_comment_created, achievement_unlocked, challenge_completed, tutor_booking_created, study_reminder_sent

## Migrations

### Initial Migration
```bash
npm run db:migrate
# Name: "init"
```

### Adding New Migration
```bash
# 1. Edit prisma/schema.prisma
# 2. Run
npm run db:migrate
# 3. Enter descriptive name
```

### Production Migration Deploy
```bash
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

## Seeding

```bash
npm run db:seed
```

Creates:
- Admin user (admin@ruangbelajar.app / admin123)
- Demo user (budi@ruangbelajar.app / password123)
- 14 achievements
- 3 weekly challenges
- 4 demo materials
- XP transactions
- Forum posts
- Tutor profile
- Analytics events

## Performance Considerations

### Critical Indexes
```sql
-- User queries
CREATE INDEX idx_materials_user_status ON materials(user_id, status);
CREATE INDEX idx_materials_user_category ON materials(user_id, category);
CREATE INDEX idx_materials_user_created ON materials(user_id, created_at);

-- Quiz queries
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_quiz_attempts_user_started ON quiz_attempts(user_id, started_at);

-- Study sessions
CREATE INDEX idx_study_sessions_user_started ON study_sessions(user_id, started_at);
CREATE INDEX idx_study_sessions_user_material ON study_sessions(user_id, material_id);

-- Notifications
CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, is_read, created_at);

-- Forum
CREATE INDEX idx_forum_posts_category_created ON forum_posts(category, created_at);
CREATE INDEX idx_forum_posts_user_created ON forum_posts(user_id, created_at);
CREATE INDEX idx_forum_comments_post_created ON forum_comments(post_id, created_at);

-- Processing jobs
CREATE INDEX idx_processing_jobs_user_status ON processing_jobs(user_id, status);
CREATE INDEX idx_processing_jobs_material_type ON processing_jobs(material_id, type);

-- Analytics
CREATE INDEX idx_analytics_user_type_created ON analytics_events(user_id, event_type, created_at);
CREATE INDEX idx_analytics_user_created ON analytics_events(user_id, created_at);
```

### Vector Search (pgvector)
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS vector;

-- HNSW index for embeddings (after data exists)
CREATE INDEX ON transcript_chunks USING hnsw (embeddings vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### Partitioning (Future)
For `analytics_events` table when > 100M rows:
```sql
-- Partition by month
CREATE TABLE analytics_events (
    ...
) PARTITION BY RANGE (created_at);

CREATE TABLE analytics_events_2024_01 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```