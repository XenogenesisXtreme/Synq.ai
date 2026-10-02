import { and, desc, eq, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { lectureSources, notebooks, processingRuns } from "../drizzle/schema";
import { generateLectureNote } from "./mps";
import { buildLessonPath } from "../shared/lesson-path";

function requireDatabase(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Synq persistence is not available" });
  }
  return db;
}

export async function createLectureSource(input: {
  userId: number;
  title: string;
  content: string;
  sourceType: "pasted_text" | "text_file";
  fileName?: string;
  mimeType?: string;
}) {
  const db = requireDatabase(await getDb());
  return db.transaction(async tx => {
    const sourceResult = await tx.insert(lectureSources).values({
      userId: input.userId,
      title: input.title,
      content: input.content,
      sourceType: input.sourceType,
      fileName: input.fileName,
      mimeType: input.mimeType,
      status: "pending",
    });
    const sourceId = Number((sourceResult as unknown as { insertId: number }).insertId);
    const runResult = await tx.insert(processingRuns).values({
      userId: input.userId,
      sourceId,
      promptVersion: "mps-v1",
      schemaVersion: "lecture-note-v1",
      status: "pending",
    });
    return { sourceId, processingRunId: Number((runResult as unknown as { insertId: number }).insertId) };
  });
}

export async function listOwnedSources(userId: number) {
  const db = requireDatabase(await getDb());
  return db.select({
    id: lectureSources.id,
    title: lectureSources.title,
    sourceType: lectureSources.sourceType,
    fileName: lectureSources.fileName,
    status: lectureSources.status,
    createdAt: lectureSources.createdAt,
    updatedAt: lectureSources.updatedAt,
  }).from(lectureSources).where(and(eq(lectureSources.userId, userId), isNull(lectureSources.deletedAt))).orderBy(desc(lectureSources.updatedAt));
}

export async function listOwnedNotebooks(userId: number) {
  const db = requireDatabase(await getDb());
  return db.select({
    id: notebooks.id,
    sourceId: notebooks.sourceId,
    title: notebooks.title,
    status: notebooks.status,
    schemaVersion: notebooks.schemaVersion,
    version: notebooks.version,
    createdAt: notebooks.createdAt,
    updatedAt: notebooks.updatedAt,
  }).from(notebooks).where(and(eq(notebooks.userId, userId), isNull(notebooks.deletedAt))).orderBy(desc(notebooks.updatedAt));
}

export async function getOwnedNotebook(userId: number, notebookId: number) {
  const db = requireDatabase(await getDb());
  const rows = await db.select().from(notebooks).where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, userId), isNull(notebooks.deletedAt))).limit(1);
  return rows[0] ?? null;
}

export async function generateOwnedNotebook(userId: number, sourceId: number) {
  const db = requireDatabase(await getDb());
  const sources = await db.select().from(lectureSources).where(and(eq(lectureSources.id, sourceId), eq(lectureSources.userId, userId), isNull(lectureSources.deletedAt))).limit(1);
  const source = sources[0];
  if (!source) throw new TRPCError({ code: "NOT_FOUND", message: "Source not found" });
  const existingNotebooks = await db.select({ id: notebooks.id, processingRunId: notebooks.processingRunId, status: notebooks.status }).from(notebooks).where(and(eq(notebooks.sourceId, sourceId), eq(notebooks.userId, userId), isNull(notebooks.deletedAt))).orderBy(desc(notebooks.updatedAt)).limit(1);
  const existingNotebook = existingNotebooks[0];
  if (existingNotebook?.status === "ready") return { notebookId: existingNotebook.id, processingRunId: existingNotebook.processingRunId, status: "completed" as const };
  if (source.status === "processing") throw new TRPCError({ code: "CONFLICT", message: "This source is already being processed" });
  const runs = await db.select().from(processingRuns).where(and(eq(processingRuns.sourceId, sourceId), eq(processingRuns.userId, userId))).orderBy(desc(processingRuns.createdAt)).limit(1);
  const run = runs[0];
  if (!run) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Source has no processing run" });

  await db.update(lectureSources).set({ status: "processing", errorCode: null }).where(eq(lectureSources.id, sourceId));
  await db.update(processingRuns).set({ status: "processing", errorCode: null }).where(eq(processingRuns.id, run.id));
  const startedAt = Date.now();
  try {
    const generated = await generateLectureNote({ title: source.title, content: source.content });
    const notebookResult = await db.insert(notebooks).values({
      userId,
      sourceId,
      processingRunId: run.id,
      title: generated.note.title,
      schemaVersion: "lecture-note-v1",
      status: "ready",
      note: generated.note,
      lessonPath: buildLessonPath(generated.note),
      version: 1,
    });
    const notebookId = Number((notebookResult as unknown as { insertId: number }).insertId);
    await db.update(lectureSources).set({ status: "completed" }).where(eq(lectureSources.id, sourceId));
    await db.update(processingRuns).set({
      status: "completed",
      modelId: generated.modelId,
      inputTokens: generated.usage?.prompt_tokens,
      outputTokens: generated.usage?.completion_tokens,
      durationMs: Date.now() - startedAt,
    }).where(eq(processingRuns.id, run.id));
    return { notebookId, processingRunId: run.id, status: "completed" as const };
  } catch (error) {
    await db.update(lectureSources).set({ status: "failed", errorCode: "MPS_GENERATION_FAILED" }).where(eq(lectureSources.id, sourceId));
    await db.update(processingRuns).set({ status: "failed", errorCode: "MPS_GENERATION_FAILED", durationMs: Date.now() - startedAt }).where(eq(processingRuns.id, run.id));
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Notebook generation failed; your source is preserved and can be retried" });
  }
}
