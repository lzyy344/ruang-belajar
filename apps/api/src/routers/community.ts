// =============================================================================
// Community / Forum Router
// =============================================================================
import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc.js';
import { TRPCError } from '@trpc/server';

export const communityRouter = router({
  // List posts
  posts: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().max(50).default(20),
        category: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;
      const where = {
        ...(input.category && { category: input.category }),
        ...(input.search && { title: { contains: input.search, mode: 'insensitive' as const } }),
      };

      const [posts, total] = await Promise.all([
        ctx.prisma.forumPost.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, image: true } },
            _count: { select: { comments: true, likes: true } },
          },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          skip: offset,
          take: input.limit,
        }),
        ctx.prisma.forumPost.count({ where }),
      ]);

      return { posts, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
    }),

  // Get single post with comments
  post: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.forumPost.findUnique({
        where: { id: input.id },
        include: {
          user: { select: { id: true, name: true, image: true } },
          comments: {
            where: { parentId: null },
            include: {
              user: { select: { id: true, name: true, image: true } },
              replies: {
                include: { user: { select: { id: true, name: true, image: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: 'Post tidak ditemukan' });

      // Increment view count
      await ctx.prisma.forumPost.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
      });

      return post;
    }),

  // Create post
  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(200),
        content: z.string().min(10),
        category: z.string(),
        tags: z.array(z.string()).max(5).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.forumPost.create({
        data: { userId: ctx.user.id, ...input },
      });

      // Award XP for posting
      await ctx.prisma.xPTransaction.create({
        data: {
          userId: ctx.user.id,
          amount: 10,
          source: 'FORUM_POST',
          referenceId: post.id,
          description: 'Membuat post forum',
        },
      });

      return post;
    }),

  // Add comment
  addComment: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().min(2),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.forumComment.create({
        data: { userId: ctx.user.id, ...input },
      });

      await ctx.prisma.forumPost.update({
        where: { id: input.postId },
        data: { replyCount: { increment: 1 } },
      });

      return comment;
    }),

  // Toggle like on post
  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.forumLike.findUnique({
        where: { userId_postId: { userId: ctx.user.id, postId: input.postId } },
      });

      if (existing) {
        await ctx.prisma.forumLike.delete({ where: { id: existing.id } });
        await ctx.prisma.forumPost.update({
          where: { id: input.postId },
          data: { likeCount: { decrement: 1 } },
        });
        return { liked: false };
      }

      await ctx.prisma.forumLike.create({
        data: { userId: ctx.user.id, postId: input.postId },
      });
      await ctx.prisma.forumPost.update({
        where: { id: input.postId },
        data: { likeCount: { increment: 1 } },
      });

      return { liked: true };
    }),
});
