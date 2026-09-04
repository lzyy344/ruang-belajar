// =============================================================================
// Quiz Router
// =============================================================================
import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc.js';
import { TRPCError } from '@trpc/server';

export const quizRouter = router({
  // List quizzes for a material
  byMaterial: protectedProcedure
    .input(z.object({ materialId: z.string() }))
    .query(async ({ ctx, input }) => {
      const quizzes = await ctx.prisma.quiz.findMany({
        where: {
          materialId: input.materialId,
          material: { userId: ctx.user.id },
          isPublished: true,
        },
        include: {
          _count: { select: { questions: true, attempts: true } },
          attempts: {
            where: { userId: ctx.user.id },
            orderBy: { startedAt: 'desc' },
            take: 1,
          },
        },
      });

      return quizzes;
    }),

  // Get quiz with questions for taking
  start: protectedProcedure
    .input(z.object({ quizId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await ctx.prisma.quiz.findFirst({
        where: {
          id: input.quizId,
          isPublished: true,
          material: { userId: ctx.user.id },
        },
        include: {
          questions: {
            orderBy: { index: 'asc' },
            select: {
              id: true,
              index: true,
              type: true,
              question: true,
              options: true,
              difficulty: true,
              // Don't expose correctAnswer during quiz
            },
          },
        },
      });

      if (!quiz) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Kuis tidak ditemukan' });
      }

      // Create attempt record
      const attempt = await ctx.prisma.quizAttempt.create({
        data: {
          userId: ctx.user.id,
          quizId: quiz.id,
          score: 0,
          correctCount: 0,
          totalQuestions: quiz.questions.length,
          timeSpent: 0,
          isPassed: false,
        },
      });

      return { quiz, attemptId: attempt.id };
    }),

  // Submit quiz answers
  submit: protectedProcedure
    .input(
      z.object({
        attemptId: z.string(),
        answers: z.array(
          z.object({
            questionId: z.string(),
            selectedAnswer: z.number().nullable(),
            timeSpent: z.number(),
          })
        ),
        totalTimeSpent: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const attempt = await ctx.prisma.quizAttempt.findFirst({
        where: { id: input.attemptId, userId: ctx.user.id },
        include: {
          quiz: {
            include: {
              questions: { orderBy: { index: 'asc' } },
            },
          },
        },
      });

      if (!attempt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Attempt tidak ditemukan' });
      }

      // Grade answers
      let correctCount = 0;
      const answerData = input.answers.map((ans) => {
        const question = attempt.quiz.questions.find((q) => q.id === ans.questionId);
        const isCorrect = question ? ans.selectedAnswer === question.correctAnswer : false;
        if (isCorrect) correctCount++;

        return {
          attemptId: attempt.id,
          questionId: ans.questionId,
          selectedAnswer: ans.selectedAnswer,
          isCorrect,
          timeSpent: ans.timeSpent,
        };
      });

      const score = Math.round((correctCount / attempt.totalQuestions) * 100);
      const isPassed = score >= attempt.quiz.passingScore;

      // Save answers and update attempt
      await ctx.prisma.$transaction([
        ctx.prisma.quizAnswer.createMany({ data: answerData }),
        ctx.prisma.quizAttempt.update({
          where: { id: attempt.id },
          data: {
            score,
            correctCount,
            timeSpent: input.totalTimeSpent,
            isPassed,
            completedAt: new Date(),
          },
        }),
      ]);

      // Award XP
      const xpAmount = isPassed
        ? score === 100
          ? 150 // Perfect score
          : 50  // Passed
        : 10;  // Tried

      await ctx.prisma.xPTransaction.create({
        data: {
          userId: ctx.user.id,
          amount: xpAmount,
          source: score === 100 ? 'QUIZ_PERFECT' : 'QUIZ_COMPLETE',
          referenceId: attempt.id,
          description: `Kuis selesai: ${score}%`,
        },
      });

      return {
        score,
        correctCount,
        totalQuestions: attempt.totalQuestions,
        isPassed,
        xpEarned: xpAmount,
      };
    }),

  // Get quiz history
  history: protectedProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;
      const attempts = await ctx.prisma.quizAttempt.findMany({
        where: { userId: ctx.user.id, completedAt: { not: null } },
        include: {
          quiz: {
            select: {
              title: true,
              difficulty: true,
              material: { select: { title: true } },
            },
          },
        },
        orderBy: { startedAt: 'desc' },
        skip: offset,
        take: input.limit,
      });

      return attempts;
    }),
});
