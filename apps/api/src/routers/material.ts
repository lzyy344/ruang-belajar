// =============================================================================
// Material Router
// =============================================================================
import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc.js';
import { TRPCError } from '@trpc/server';

export const materialRouter = router({
  // List user's materials
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().max(50).default(10),
        category: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, category, status, search } = input;
      const offset = (page - 1) * limit;

      const where = {
        userId: ctx.user.id,
        ...(category && { category }),
        ...(status && { status: status as any }),
        ...(search && {
          title: { contains: search, mode: 'insensitive' as const },
        }),
      };

      const [materials, total] = await Promise.all([
        ctx.prisma.material.findMany({
          where,
          include: {
            mediaFiles: { select: { id: true, mimeType: true, size: true } },
            summary: { select: { id: true, shortSummary: true } },
            _count: { select: { quizzes: true, notes: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        ctx.prisma.material.count({ where }),
      ]);

      return {
        materials,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
      };
    }),

  // Get single material by id
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const material = await ctx.prisma.material.findFirst({
        where: { id: input.id, userId: ctx.user.id },
        include: {
          mediaFiles: true,
          transcript: { include: { chunks: { take: 20, orderBy: { index: 'asc' } } } },
          summary: true,
          notes: { where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' } },
          quizzes: { include: { _count: { select: { questions: true, attempts: true } } } },
          processingJobs: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      });

      if (!material) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Materi tidak ditemukan' });
      }

      return material;
    }),

  // Update material progress
  updateProgress: protectedProcedure
    .input(z.object({ id: z.string(), progress: z.number().min(0).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const material = await ctx.prisma.material.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!material) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Materi tidak ditemukan' });
      }

      const updated = await ctx.prisma.material.update({
        where: { id: input.id },
        data: {
          progress: input.progress,
          ...(input.progress === 100 && { completedAt: new Date() }),
        },
      });

      return updated;
    }),

  // Delete material
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const material = await ctx.prisma.material.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!material) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Materi tidak ditemukan' });
      }

      await ctx.prisma.material.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
