// =============================================================================
// Auth Router
// =============================================================================
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { router, publicProcedure, protectedProcedure } from '../lib/trpc.js';
import { TRPCError } from '@trpc/server';

export const authRouter = router({
  // Register new user
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Nama minimal 2 karakter'),
        email: z.string().email('Email tidak valid'),
        password: z.string().min(8, 'Password minimal 8 karakter'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email sudah terdaftar',
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          emailVerified: new Date(), // Auto-verify for now
          profile: {
            create: {
              timezone: 'Asia/Jakarta',
              studyGoalMinutes: 30,
            },
          },
        },
        select: { id: true, email: true, name: true },
      });

      return { success: true, user };
    }),

  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: { profile: true },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User tidak ditemukan' });
    }

    return user;
  }),
});
