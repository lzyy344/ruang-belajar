# AGENTS.md - Ruang Belajar Development Guidelines

## Project Overview
Ruang Belajar is an AI-powered learning platform with video/audio summarization, quiz generation, gamification, and community features.

**Stack:** Next.js 14 + tRPC + Prisma + PostgreSQL + Redis + BullMQ + Docker

## Development Commands

```bash
# Install all dependencies
npm install

# Start development infrastructure (Postgres, Redis, MinIO, Mailhog)
npm run docker:dev

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with demo data
npm run db:seed

# Start all dev servers
npm run dev

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run tests
npm run test

# Build all packages
npm run build
```

## Project Structure

```
ruang-belajar/
├── apps/
│   ├── web/          # Next.js 14 frontend (App Router)
│   └── api/          # tRPC backend + BullMQ workers
├── packages/
│   ├── shared/       # Types, constants, validators, utils
│   ├── ui/           # Shared UI components (shadcn-based)
│   └── ai-providers/ # AI provider abstraction (OpenAI, Anthropic, Ollama)
├── docker/           # Docker configs for dev/prod
└── docs/             # Architecture, API, DB, deployment docs
```

## Key Conventions

### TypeScript
- Strict mode enabled everywhere
- No `any` types - use `unknown` or proper types
- Zod schemas for ALL external inputs (API, forms, webhooks)
- Explicit return types for public APIs

### tRPC Procedures
```typescript
// Always validate input
export const createMaterial = protectedProcedure
  .input(createMaterialSchema)  // Zod schema from @ruang-belajar/shared
  .mutation(async ({ ctx, input }) => {
    // Check authorization
    // Implement business logic
    // Return typed response
  });
```

### Database (Prisma)
- CUID for all IDs
- Proper indexes on query patterns
- Cascade deletes where appropriate
- JSON for flexible metadata
- Run `npm run db:migrate` after schema changes

### React Components
- Server Components by default
- `'use client'` only when needed (interactivity, hooks)
- Component composition over inheritance
- Accessible markup (ARIA, semantic HTML)

### State Management
- **TanStack Query** for server state (caching, sync, mutations)
- **Zustand** for client-only global state (theme, UI)
- **React Hook Form + Zod** for forms

### Background Jobs (BullMQ)
```typescript
// In apps/api/src/workers/processors/*.ts
export const processor = async (job: Job) => {
  await job.updateProgress(10);
  // Process with error handling
  // Update progress
  // Return result
};
```

## File Naming
- `kebab-case` for files and directories
- `PascalCase` for React components
- `camelCase` for functions/variables
- `UPPER_SNAKE_CASE` for constants/enums

## Git Workflow
```bash
# Feature branch
git checkout -b feat/short-description

# Conventional commits
git commit -m "feat: add material upload with progress tracking"

# Push and create PR
git push origin feat/short-description
```

## Environment Variables
Copy `.env.example` to `.env.local` and fill in:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `NEXTAUTH_SECRET` - 32+ char random string
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` - At least one required
- `ASSEMBLYAI_API_KEY` - For transcription
- `S3_*` - MinIO/S3 credentials

## Testing
```bash
# Unit/Integration tests
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Watch mode
npm run test:watch
```

## Common Tasks

### Add New API Endpoint
1. Add types to `packages/shared/src/types/index.ts`
2. Add validators to `packages/shared/src/validators/index.ts`
3. Create router procedure in `apps/api/src/router/<domain>.ts`
4. Implement service in `apps/api/src/services/<domain>.service.ts`
5. Add frontend hook in `apps/web/src/hooks/`

### Add New Background Job
1. Add `ProcessingJobType` enum value in Prisma schema
2. Create processor in `apps/api/src/workers/processors/`
3. Register in `apps/api/src/queue/job-queue.ts`
4. Update worker entry point

### Database Changes
1. Edit `apps/api/prisma/schema.prisma`
2. Run `npm run db:migrate` (enter descriptive name)
3. Update seed if needed

## Code Review Checklist
- [ ] Types defined in shared package
- [ ] Zod validation on all inputs
- [ ] Authorization checks (ownership, roles)
- [ ] Error handling with proper codes
- [ ] Unit tests for business logic
- [ ] Integration tests for API
- [ ] Frontend loading/error/empty states
- [ ] Responsive design
- [ ] Accessibility (keyboard, screen reader)
- [ ] No secrets in code

## Debugging

### Frontend
- React DevTools
- TanStack Query DevTools
- Network tab for tRPC calls

### Backend
- `npm run dev` shows tRPC logs
- Prisma query logging: `DEBUG=prisma:query`
- BullMQ dashboard (if configured)

### Database
- Prisma Studio: `npm run db:studio`
- Direct SQL: `docker exec -it ruang-belajar-postgres psql -U postgres -d ruang_belajar`

## Documentation
- Architecture: `docs/architecture.md`
- API Spec: `docs/api-spec.md`
- Database: `docs/database-schema.md`
- Deployment: `docs/deployment.md`
- Development: `docs/development.md`