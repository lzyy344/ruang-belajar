# Development Guide

## Getting Started

### Prerequisites
- Node.js 20.10+
- Docker Desktop / Docker Engine + Compose
- Git
- VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma
  - TypeScript Hero

### Initial Setup

```bash
# 1. Clone repo
git clone https://github.com/your-org/ruang-belajar.git
cd ruang-belajar

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your keys

# 4. Start infrastructure
npm run docker:dev

# 5. Wait for services to be healthy (check with `docker ps`)

# 6. Setup database
npm run db:generate
npm run db:migrate
npm run db:seed

# 7. Start development
npm run dev
```

## Daily Development Workflow

### Starting Work
```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Run migrations if schema changed
npm run db:migrate

# Start dev servers
npm run dev
```

### Making Changes

#### 1. Shared Package Changes
```bash
# Edit files in packages/shared/src/
# Types, constants, validators, utils

# Build to test
npm run build --filter=@ruang-belajar/shared
```

#### 2. UI Components
```bash
# Edit files in packages/ui/src/
# Components follow shadcn/ui patterns

# Test in web app
npm run dev --filter=@ruang-belajar/web
```

#### 3. AI Providers
```bash
# Edit files in packages/ai-providers/src/
# Add new provider in factory.ts

# Test with unit tests
npm run test --filter=@ruang-belajar/ai-providers
```

#### 4. Backend (tRPC)
```bash
# Add router in apps/api/src/router/
# Add procedures with Zod validation
# Add service in apps/api/src/services/

# Test
npm run test --filter=@ruang-belajar/api
```

#### 5. Frontend Pages
```bash
# Add page in apps/web/src/app/(dashboard)/<feature>/
# Use server components where possible
# Client components for interactivity

# Test
npm run test --filter=@ruang-belajar/web
```

### Database Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npm run db:migrate
# 3. Enter migration name (e.g., "add_user_avatar")
# 4. Migration file created in prisma/migrations/
# 4. Run seed if needed
npm run db:seed
```

### Adding New API Endpoint

1. **Define types** in `packages/shared/src/types/index.ts`
2. **Add validators** in `packages/shared/src/validators/index.ts`
3. **Create router procedure** in `apps/api/src/router/<domain>.ts`
4. **Implement service** in `apps/api/src/services/<domain>.service.ts`
5. **Add tests** in `apps/api/src/__tests__/`
6. **Update frontend** hooks in `apps/web/src/hooks/`

### Adding New Background Job

1. **Add job type** to `ProcessingJobType` enum in Prisma schema
2. **Create processor** in `apps/api/src/workers/processors/`
3. **Register in queue** in `apps/api/src/queue/job-queue.ts`
4. **Add to worker entry** in `apps/api/src/worker/index.ts`
7. **Update frontend** progress tracking

## Code Conventions

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for public functions
- Zod schemas for all external inputs

### React
- Server Components by default
- Client Components only when needed (`'use client'`)
- Component composition over inheritance
- Custom hooks for reusable logic

### API (tRPC)
- Input validation with Zod on every procedure
- Consistent error handling with `TRPCError`
- Proper HTTP status codes
- Pagination on all list endpoints

### Database
- CUID for IDs (shorter than UUID, sortable)
- Proper indexes on query patterns
- Cascade deletes where appropriate
- JSON for flexible metadata fields

### Git
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Branch naming: `feat/short-description`, `fix/issue-number`
- PR template with description, testing steps, screenshots

## Testing Strategy

### Unit Tests
- Pure functions, validators, utilities
- AI provider logic (mocked)
- Gamification calculations

### Integration Tests
- tRPC procedures with test database
- Database operations
- Authentication flows

### E2E Tests (Playwright)
- Critical user journeys:
  - Register → Login → Upload → Process → Quiz
  - AI Chat conversation
  - Pomodoro session
  - Forum post & reply

### Running Tests
```bash
# All tests
npm run test

# Specific package
npm run test --filter=@ruang-belajar/api

# Watch mode
npm run test:watch

# Coverage
npm run test -- --coverage

# E2E
npm run test:e2e
```

## Debugging

### Frontend
- React DevTools
- Next.js DevTools
- TanStack Query DevTools
- Network tab for tRPC calls

### Backend
- `npm run dev` shows tRPC procedure logs
- Prisma query logging in development
- BullMQ dashboard: `npm run queue:ui` (if configured)

### Database
- Prisma Studio: `npm run db:studio`
- Direct SQL: `docker exec -it ruang-belajar-postgres psql -U postgres -d ruang_belajar`

### Workers
- Check BullMQ dashboard
- Worker logs: `docker logs -f ruang-belajar-worker`
- Job data in `ProcessingJob` table

## Common Issues

### Port Conflicts
```bash
# Check what's using port 3000
lsof -i :3000
# Kill if needed
kill -9 <PID>
```

### Database Connection
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs ruang-belajar-postgres

# Reset database
npm run db:push --force-reset
npm run db:seed
```

### Prisma Client Out of Sync
```bash
npm run db:generate
# If still issues:
rm -rf node_modules/.prisma
npm run db:generate
```

### Type Errors After Schema Change
```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

## Performance Profiling

### Frontend
```bash
# Next.js build analysis
ANALYZE=true npm run build

# React Profiler in DevTools
# Lighthouse CI in CI/CD
```

### Backend
```bash
# Prisma query timing
# Add to .env: DEBUG=prisma:query

# tRPC procedure timing
# Check server logs
```

### Database
```sql
-- Slow query analysis
EXPLAIN ANALYZE SELECT * FROM materials WHERE user_id = '...' AND status = 'COMPLETED';

-- Index usage
SELECT * FROM pg_stat_user_indexes WHERE relname = 'materials';
```

## Adding New Features Checklist

- [ ] Types defined in `packages/shared`
- [ ] Validators created in `packages/shared`
- [ ] Database schema updated (Prisma)
- [ ] Migration created and tested
- [ ] Backend service implemented
- [ ] tRPC router procedures added
- [ ] Input validation on all procedures
- [ ] Authorization checks (ownership, roles)
- [ ] Unit tests for business logic
- [ ] Integration tests for API
- [ ] Frontend components created
- [ ] Frontend hooks for data fetching
- [ ] Error/loading/empty states handled
- [ ] Responsive design verified
- [ ] Accessibility checked (keyboard, screen reader)
- [ ] Documentation updated
- [ ] CHANGELOG entry added

## Useful Commands Reference

```bash
# Database
npm run db:studio          # Open Prisma Studio
npm run db:seed            # Run seed script
npm run db:migrate:prod    # Deploy migrations to prod

# Docker
docker compose -f docker/docker-compose.dev.yml logs -f  # Follow logs
docker compose -f docker/docker-compose.dev.yml exec postgres psql -U postgres  # PSQL shell

# Cleanup
npm run clean              # Remove node_modules, dist, .next (if script exists)
docker system prune -a     # Clean Docker

# Monitoring
docker stats               # Resource usage
```