# Architecture Documentation

## Overview

Ruang Belajar follows a **modular monolith** architecture deployed as containerized microservices. The system is designed for horizontal scalability, type safety, and developer experience.

## High-Level Components

### 1. Frontend (Next.js 14)
- **App Router** with React Server Components
- **tRPC Client** for type-safe API calls
- **TanStack Query** for server state management
- **Zustand** for client-side global state
- **Tailwind CSS + shadcn/ui** for styling

### 2. Backend (tRPC + Next.js API Routes)
- **tRPC Routers** organized by domain (auth, material, quiz, ai, etc.)
- **Middleware** for auth, rate limiting, validation, logging
- **Services** layer for business logic separation
- **Prisma Client** for type-safe database access

### 3. Background Workers (BullMQ + Redis)
- **Audio Extraction Worker** - FFmpeg video→audio
- **Transcription Worker** - AssemblyAI/Whisper
- **Summarization Worker** - LLM-based summary generation
- **Quiz Generation Worker** - LLM-based quiz creation
- **Embedding Worker** - Vector embeddings for RAG

### 4. Database (PostgreSQL + Prisma)
- **Relational schema** with proper FKs, indexes, constraints
- **pgvector** extension for embedding storage
- **Migrations** for schema evolution

### 5. Storage (S3/MinIO)
- **Direct browser upload** via presigned URLs
- **Multipart upload** for large files
- **CDN-ready** public URLs

### 6. AI Providers (Abstraction Layer)
- **OpenAI** (GPT-4o, embeddings)
- **Anthropic** (Claude 3)
- **Ollama** (local models)
- **Factory pattern** for provider selection

## Data Flow

### Material Upload & Processing
```
1. User requests presigned URL → API returns S3 signed URL
2. Browser uploads directly to S3 → S3 event notification
3. API creates ProcessingJob records → BullMQ queues
4. Workers process sequentially:
   a. Audio Extraction (if video)
   b. Transcription (AssemblyAI/Whisper)
   c. Transcript Cleaning & Chunking
   d. AI Analysis (concepts, difficulty, categories)
   e. Summary Generation (title, short/full, key points, terms)
   f. Quiz Generation (questions from chunks)
   g. Embedding Generation (for RAG)
5. Material status → COMPLETED
6. Notification sent to user
```

### AI Chat (RAG)
```
1. User sends message with material context
2. API retrieves relevant transcript chunks via vector similarity
3. LLM receives: system prompt + context chunks + user message
4. Streaming response returned to client
5. Conversation persisted to database
```

### Quiz Attempt
```
1. User starts attempt → QuizAttempt record created
2. Questions served one by one (or all at once)
3. Answers submitted → QuizAnswer records
4. Auto-grading on submit
5. Score calculated → XP awarded
6. Analytics events tracked
```

## Security Architecture

```
Internet
    │
    ▼
┌─────────────────┐
│   Nginx         │  SSL/TLS, Rate Limiting, CSP, Security Headers
│   Reverse Proxy │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js       │  Auth Middleware, CSRF, Input Validation
│   (tRPC/NextAuth)│
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌──────────┐
│Postgres│ │  Redis   │  Parameterized queries, Prepared statements
└───────┘ └──────────┘
```

## Scalability Considerations

### Horizontal Scaling
- **Frontend**: Stateless Next.js containers behind load balancer
- **API**: Stateless tRPC handlers, can run multiple replicas
- **Workers**: BullMQ supports multiple workers per queue
- **Database**: Read replicas for analytics queries
- **Redis**: Cluster mode for high availability

### Performance Optimizations
- **Database indexes** on query patterns (userId, status, createdAt)
- **Redis caching** for hot data (user profile, leaderboard, heatmap)
- **Pagination** on all list endpoints
- **Streaming responses** for AI chat
- **Direct S3 upload** bypasses backend bandwidth

## Deployment Architecture

### Development
```
localhost:3000 (Next.js dev)
    │
    ├──► postgres:5432
    ├──► redis:6379
    ├──► minio:9000
    └──► mailhog:1025
```

### Production
```
Internet
    │
    ▼
┌─────────────┐
│   Nginx     │  :80/:443, SSL termination, Rate limiting
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Docker Swarm / Kubernetes          │
│  ┌─────────┐  ┌─────────┐           │
│  │ Web (3) │  │ Web (3) │  ...      │  Next.js replicas
│  └─────────┘  └─────────┘           │
│  ┌─────────┐  ┌─────────┐           │
│  │API (2)  │  │API (2)  │  ...      │  tRPC API replicas
│  └─────────┘  └─────────┘           │
│  ┌─────────┐  ┌─────────┐           │
│  │Worker(2)│  │Worker(2)│  ...      │  Background workers
│  └─────────┘  └─────────┘           │
└─────────────────────────────────────┘
       │
    ┌──┴──┐
    ▼     ▼
Postgres  Redis Cluster
(Primary) (3 nodes)
    │
    ▼
MinIO/S3  (or AWS S3)
```

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js App Router | RSC, streaming, built-in API routes, excellent DX |
| tRPC over REST/GraphQL | End-to-end type safety, no codegen, simpler mental model |
| Prisma ORM | Type-safe DB access, migrations, middleware, great DX |
| BullMQ over native | Retries, priorities, delayed jobs, monitoring, clustering |
| Direct S3 Upload | Scales better, reduces backend bandwidth, secure via signed URLs |
| AI Provider Abstraction | Vendor lock-in prevention, cost optimization, local model support |
| PostgreSQL + pgvector | Single DB for relational + vector, sufficient for MVP scale |
| NextAuth.js v5 | Modern, edge-compatible, multiple providers, secure defaults |
| Turborepo | Monorepo management, caching, parallel execution |

## Future Considerations

1. **Search**: Upgrade to Meilisearch/Typesense when PostgreSQL FTS insufficient
2. **Real-time**: Migrate from polling to WebSocket/SSE for live features
3. **Video Processing**: Add transcoding pipeline (HLS/DASH) for adaptive streaming
4. **Analytics**: ClickHouse or TimescaleDB for high-volume event storage
5. **Multi-tenancy**: Add organization/workspace support
6. **Mobile**: React Native app sharing business logic via shared package