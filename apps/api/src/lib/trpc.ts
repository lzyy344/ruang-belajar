// =============================================================================
// tRPC Initialization
// =============================================================================
import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth';
import superjson from 'superjson';
import { prisma } from './prisma.js';

// Context
export async function createContext(opts: CreateNextContextOptions) {
  const session = await getServerSession(opts.req as any, opts.res as any, {
    secret: process.env.NEXTAUTH_SECRET!,
    providers: [],
    callbacks: {
      jwt: async ({ token }) => token,
      session: async ({ session }) => session,
    },
  });

  return {
    session,
    prisma,
    req: opts.req,
    res: opts.res,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// tRPC init
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Auth middleware
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user as { id: string; email: string; name: string | null; role: string },
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
