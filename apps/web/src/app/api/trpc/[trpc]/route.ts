// =============================================================================
// tRPC HTTP Route Handler
// =============================================================================
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@ruang-belajar/api';
import { createContext } from '@ruang-belajar/api';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ req: req as any, res: undefined as any }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`tRPC error on ${path}:`, error);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
