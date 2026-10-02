import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createLectureSource, generateOwnedNotebook, getOwnedNotebook, listOwnedNotebooks, listOwnedSources } from "./synqDb";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  workspace: router({
    snapshot: protectedProcedure.query(async ({ ctx }) => ({
      sources: await listOwnedSources(ctx.user.id),
      notebooks: await listOwnedNotebooks(ctx.user.id),
    })),
  }),
  lectureLens: router({
    list: protectedProcedure.query(({ ctx }) => listOwnedSources(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      title: z.string().trim().min(1).max(255),
      content: z.string().trim().min(1).max(2_000_000),
      sourceType: z.enum(["pasted_text", "text_file"]),
      fileName: z.string().trim().max(255).optional(),
      mimeType: z.string().trim().max(120).optional(),
    })).mutation(({ ctx, input }) => createLectureSource({ ...input, userId: ctx.user.id })),
    generate: protectedProcedure.input(z.object({ sourceId: z.number().int().positive() })).mutation(({ ctx, input }) => generateOwnedNotebook(ctx.user.id, input.sourceId)),
  }),
  notebooks: router({
    list: protectedProcedure.query(({ ctx }) => listOwnedNotebooks(ctx.user.id)),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ ctx, input }) => getOwnedNotebook(ctx.user.id, input.id)),
  }),
});

export type AppRouter = typeof appRouter;
