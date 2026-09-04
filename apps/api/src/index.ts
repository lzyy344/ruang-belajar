// =============================================================================
// API Server Entry Point
// This runs as part of Next.js via the tRPC route handler in apps/web
// The worker (src/worker/index.ts) runs separately
// =============================================================================

export { appRouter, type AppRouter } from './routers/_app.js';
export { createContext } from './lib/trpc.js';
export { prisma } from './lib/prisma.js';
