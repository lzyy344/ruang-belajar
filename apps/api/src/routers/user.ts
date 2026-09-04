// =============================================================================
// User / Profile Router
// =============================================================================
import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc.js';

export const userRouter = router({
  // Get profile with stats
  profile: protectedProcedure.query(async ({ ctx }) => {
    const [user, stats] = await Promise.all([
      ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: { profile: true },
      }),
      ctx.prisma.$transaction([
        ctx.prisma.material.count({ where: { userId: ctx.user.id } }),
        ctx.prisma.quizAttempt.count({ where: { userId: ctx.user.id, completedAt: { not: null } } }),
        ctx.prisma.pomodoroSession.count({ where: { userId: ctx.user.id, completed: true } }),
        ctx.prisma.userAchievement.count({ where: { userId: ctx.user.id } }),
      ]),
    ]);

    const [materialCount, quizCount, pomodoroCount, achievementCount] = stats;

    return { user, stats: { materialCount, quizCount, pomodoroCount, achievementCount } };
  }),

  // Update profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        bio: z.string().max(500).optional(),
        studyGoalMinutes: z.number().min(5).max(480).optional(),
        timezone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, ...profileData } = input;

      await ctx.prisma.$transaction([
        ...(name
          ? [ctx.prisma.user.update({ where: { id: ctx.user.id }, data: { name } })]
          : []),
        ctx.prisma.profile.upsert({
          where: { userId: ctx.user.id },
          create: { userId: ctx.user.id, ...profileData },
          update: profileData,
        }),
      ]);

      return { success: true };
    }),

  // Get notifications
  notifications: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().default(false), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.notification.findMany({
        where: {
          userId: ctx.user.id,
          ...(input.unreadOnly && { isRead: false }),
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });
    }),

  // Mark notification as read
  markNotificationRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.notification.updateMany({
        where: { id: input.id, userId: ctx.user.id },
        data: { isRead: true, readAt: new Date() },
      });
      return { success: true };
    }),

  // Get achievements
  achievements: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.userAchievement.findMany({
      where: { userId: ctx.user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }),

  // Get XP history
  xpHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.xPTransaction.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });
    }),

  // Get analytics data
  analytics: protectedProcedure
    .input(
      z.object({
        days: z.number().min(7).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const [studySessions, quizAttempts, pomodoroSessions, xpTransactions] =
        await Promise.all([
          ctx.prisma.studySession.findMany({
            where: { userId: ctx.user.id, startedAt: { gte: since } },
            orderBy: { startedAt: 'asc' },
          }),
          ctx.prisma.quizAttempt.findMany({
            where: { userId: ctx.user.id, startedAt: { gte: since }, completedAt: { not: null } },
            orderBy: { startedAt: 'asc' },
          }),
          ctx.prisma.pomodoroSession.findMany({
            where: { userId: ctx.user.id, startedAt: { gte: since }, completed: true },
            orderBy: { startedAt: 'asc' },
          }),
          ctx.prisma.xPTransaction.findMany({
            where: { userId: ctx.user.id, createdAt: { gte: since } },
            orderBy: { createdAt: 'asc' },
          }),
        ]);

      return { studySessions, quizAttempts, pomodoroSessions, xpTransactions };
    }),
});
