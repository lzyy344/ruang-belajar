# 🎓 Ruang Belajar

> Platform belajar cerdas dengan AI — Ringkasan video, kuis otomatis, asisten belajar, dan gamifikasi

[![CI](https://github.com/your-org/ruang-belajar/workflows/CI/badge.svg)](https://github.com/your-org/ruang-belajar/actions/workflows/ci.yml)
[![CD Staging](https://github.com/your-org/ruang-belajar/workflows/CD%20Staging/badge.svg)](https://github.com/your-org/ruang-belajar/actions/workflows/cd-staging.yml)
[![CD Production](https://github.com/your-org/ruang-belajar/workflows/CD%20Production/badge.svg)](https://github.com/your-org/ruang-belajar/actions/workflows/cd-production.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Fitur Utama

### 📚 Manajemen Materi
- **Upload multi-format**: Video (MP4, MKV, AVI), Audio (MP3, WAV, M4A), Link YouTube/Drive
- **Pipeline AI otomatis**: Transkripsi → Analisis → Ringkasan → Kuis
- **Progress real-time**: Tracking status processing via WebSocket/SSE
- **Transkrip lengkap** dengan speaker diarization & timestamp

### 🤖 AI Asisten Belajar
- **Chat kontekstual** berbasis materi yang dibuka (RAG dengan embeddings)
- **Generate kuis** dari transkrip dengan tingkat kesulitan terkontrol
- **Jelaskan konsep** dengan analogi sederhana
- **Tips belajar** personalisasi

### 🎮 Gamifikasi Lengkap
- **XP & Level** berdasarkan aktivitas nyata (bukan halaman dibuka)
- **Streak harian** dengan milestone achievement
- **Badge system**: 15+ lencana (Streak, Quiz, Learning, Social, Special)
- **Tantangan mingguan/bulanan** dengan reward XP & badge
- **Leaderboard** mingguan/bulanan/all-time

### ⏱️ Produktivitas
- **Pomodoro timer** terintegrasi dengan analytics & XP
- **Catatan pribadi** per materi dengan timestamp video/audio
- **Mini games**: Flash Card, Speed Match, Word Scramble
- **Analytics personal**: Heatmap, performa per matpel, waktu belajar

### 👥 Komunitas
- **Forum diskusi** dengan kategori, tag, like, reply nested
- **Tutor marketplace** dengan jadwal & booking
- **Share materi** via public link
- **Notifikasi real-time**: study reminder, quiz result, achievement, forum

## 🏗️ Arsitektur

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js 14    │     │   tRPC API      │     │   PostgreSQL    │
│   (App Router)  │◄───►│   (Type-safe)   │◄───►│   + Prisma ORM  │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Redis +       │     │   S3/MinIO      │
│   BullMQ Queue  │     │   File Storage  │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  AI Providers   │     │  Transcription  │
│  (OpenAI/       │     │  (AssemblyAI/   │
│   Anthropic/    │     │   Whisper)      │
│   Ollama)       │     │                 │
└─────────────────┘     └─────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui, Lucide Icons |
| **State** | Zustand (client), TanStack Query (server) |
| **API** | tRPC v10 (end-to-end type safety) |
| **Auth** | NextAuth.js v5 (Credentials, Google, GitHub) |
| **Database** | PostgreSQL 16, Prisma ORM |
| **Cache/Queue** | Redis 7, BullMQ |
| **Storage** | S3-compatible (MinIO dev, AWS S3 prod) |
| **AI** | OpenAI GPT-4o, Anthropic Claude 3, Ollama (local) |
| **Transcription** | AssemblyAI / OpenAI Whisper |
| **Video Processing** | FFmpeg (audio extraction) |
| **Real-time** | Socket.io (notifications, progress) |
| **Container** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |
| **Monitoring** | Sentry, Prometheus, Grafana |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (via Docker)
- Redis 7 (via Docker)
- MinIO (via Docker)

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/ruang-belajar.git
cd ruang-belajar

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your configuration

# Start infrastructure
npm run docker:dev

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development servers
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **API (tRPC)**: http://localhost:3000/api/trpc
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Mailhog**: http://localhost:8025
- **Prisma Studio**: `npm run db:studio`

## 📦 Project Structure

```
ruang-belajar/
├── .github/workflows/     # CI/CD pipelines
├── docker/                # Docker configs
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   ├── Dockerfile.frontend*
│   ├── Dockerfile.worker*
│   └── nginx/
├── docs/                  # Documentation
├── packages/
│   ├── shared/           # Types, constants, validators, utils
│   ├── ui/               # Shared UI components (shadcn-based)
│   └── ai-providers/     # AI provider abstraction layer
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/          # App Router pages
│   │   │   ├── components/   # Feature components
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── lib/          # Utilities, auth, prisma
│   │   │   ├── store/        # Zustand stores
│   │   │   └── styles/       # Global styles
│   │   └── public/
│   └── api/              # tRPC backend + Workers
│       ├── prisma/
│       ├── src/
│       │   ├── router/       # tRPC routers
│       │   ├── services/     # Business logic
│       │   ├── workers/      # Background job processors
│       │   ├── queue/        # BullMQ setup
│       │   └── middleware/   # Auth, rate limit, validation
│       └── dist/
└── infrastructure/       # Nginx, Prometheus, Grafana configs
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start all dev servers
npm run docker:dev       # Start infrastructure (Postgres, Redis, MinIO)
npm run docker:dev:down  # Stop infrastructure

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run lint             # ESLint all packages
npm run typecheck        # TypeScript check all packages
npm run format           # Prettier format
npm run test             # Run tests
npm run test:watch       # Watch mode tests

# Build
npm run build            # Build all packages
npm run build:prod       # Build production packages

# Docker
npm run docker:prod      # Start production stack
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `NEXTAUTH_SECRET` | 32+ char secret (openssl rand -base64 32) | ✅ |
| `NEXTAUTH_URL` | App URL (http://localhost:3000) | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅* |
| `ANTHROPIC_API_KEY` | Anthropic API key | ✅* |
| `ASSEMBLYAI_API_KEY` | AssemblyAI transcription key | ✅* |
| `S3_ENDPOINT` | S3/MinIO endpoint | ✅ |
| `S3_ACCESS_KEY` | S3 access key | ✅ |
| `S3_SECRET_KEY` | S3 secret key | ✅ |
| `S3_BUCKET` | Bucket name | ✅ |
| `EMAIL_SERVER_*` | SMTP config for emails | ✅ |

*At least one AI provider required

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [API Specification](docs/api-spec.md)
- [Database Schema](docs/database-schema.md)
- [Deployment Guide](docs/deployment.md)
- [Development Guide](docs/development.md)
- [AI Provider Setup](docs/ai-providers.md)

## 🧪 Testing

```bash
# Unit & integration tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test -- --coverage
```

## 🚢 Deployment

### Staging (auto on `develop` branch)
```bash
# Manual trigger
gh workflow run cd-staging.yml
```

### Production (auto on version tags)
```bash
# Create and push tag
git tag v1.0.0
git push origin v1.0.0
```

### Manual Docker Deploy
```bash
# Build images
docker compose -f docker/docker-compose.prod.yml build

# Deploy
docker compose -f docker/docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker/docker-compose.prod.yml exec api npx prisma migrate deploy
```

## 🔒 Security

- **Authentication**: NextAuth.js v5 with JWT + HTTP-only cookies
- **Authorization**: Role-based (STUDENT, TUTOR, ADMIN) + resource ownership
- **Rate Limiting**: Per-endpoint limits via middleware
- **Input Validation**: Zod schemas on all tRPC procedures
- **File Upload**: Signed URLs, type validation, size limits, virus scan
- **Secrets**: Environment variables only, never in code
- **CSP**: Strict Content Security Policy headers
- **CORS**: Configured for specific origins

## 📊 Monitoring

- **Error Tracking**: Sentry (frontend + backend)
- **Metrics**: Prometheus + Grafana dashboards
- **Logging**: Structured JSON logs (Pino)
- **Health Checks**: `/health` endpoint for all services
- **Queue Monitoring**: BullMQ dashboard via Redis

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- 80%+ test coverage for new code

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [tRPC](https://trpc.io/) - Type-safe APIs
- [Prisma](https://prisma.io/) - Database toolkit
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [BullMQ](https://bullmq.io/) - Queue system
- [AssemblyAI](https://www.assemblyai.com/) - Transcription API