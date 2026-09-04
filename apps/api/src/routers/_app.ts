// =============================================================================
// Root App Router - combines all routers
// =============================================================================
import { router } from '../lib/trpc.js';
import { authRouter } from './auth.js';
import { materialRouter } from './material.js';
import { quizRouter } from './quiz.js';
import { aiRouter } from './ai.js';
import { userRouter } from './user.js';
import { communityRouter } from './community.js';

export const appRouter = router({
  auth: authRouter,
  material: materialRouter,
  quiz: quizRouter,
  ai: aiRouter,
  user: userRouter,
  community: communityRouter,
});

export type AppRouter = typeof appRouter;
