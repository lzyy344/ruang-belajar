// =============================================================================
// AI Chat Router
// =============================================================================
import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc.js';
import { TRPCError } from '@trpc/server';
import OpenAI from 'openai';
import { env } from '../config/env.js';

function getOpenAI() {
  if (!env.OPENAI_API_KEY) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'OpenAI API key belum dikonfigurasi',
    });
  }
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export const aiRouter = router({
  // List conversations
  conversations: protectedProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;
      return ctx.prisma.aIConversation.findMany({
        where: { userId: ctx.user.id },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: input.limit,
        select: {
          id: true,
          title: true,
          model: true,
          provider: true,
          updatedAt: true,
          _count: { select: { messages: true } },
        },
      });
    }),

  // Get conversation with messages
  conversation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const conv = await ctx.prisma.aIConversation.findFirst({
        where: { id: input.id, userId: ctx.user.id },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!conv) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Percakapan tidak ditemukan' });
      }

      return conv;
    }),

  // Send message
  chat: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().optional(),
        message: z.string().min(1).max(4000),
        materialId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const openai = getOpenAI();

      // Get or create conversation
      let conversation;
      if (input.conversationId) {
        conversation = await ctx.prisma.aIConversation.findFirst({
          where: { id: input.conversationId, userId: ctx.user.id },
          include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
        });
        if (!conversation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Percakapan tidak ditemukan' });
        }
      } else {
        // Auto-generate title from first message
        const title =
          input.message.length > 50
            ? input.message.substring(0, 47) + '...'
            : input.message;

        conversation = await ctx.prisma.aIConversation.create({
          data: {
            userId: ctx.user.id,
            materialId: input.materialId,
            title,
            model: 'gpt-4o-mini',
            provider: 'openai',
          },
          include: { messages: true },
        });
      }

      // Build message history
      const systemPrompt = `Kamu adalah asisten belajar AI untuk platform Ruang Belajar. 
Bantu pengguna memahami materi, menjawab pertanyaan, dan meningkatkan pemahaman mereka.
Gunakan bahasa Indonesia yang mudah dipahami. Berikan penjelasan yang jelas dan terstruktur.`;

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...(conversation.messages || []).map((m) => ({
          role: m.role.toLowerCase() as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user', content: input.message },
      ];

      // Save user message
      await ctx.prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'USER',
          content: input.message,
        },
      });

      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      const assistantContent = response.choices[0]?.message?.content ?? '';
      const tokensUsed = response.usage?.total_tokens ?? 0;

      // Save assistant message
      await ctx.prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'ASSISTANT',
          content: assistantContent,
          tokensUsed,
        },
      });

      // Update conversation timestamp
      await ctx.prisma.aIConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      return {
        conversationId: conversation.id,
        message: assistantContent,
        tokensUsed,
      };
    }),

  // Delete conversation
  deleteConversation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.aIConversation.deleteMany({
        where: { id: input.id, userId: ctx.user.id },
      });
      return { success: true };
    }),
});
