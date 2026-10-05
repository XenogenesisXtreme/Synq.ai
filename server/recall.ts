import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { recallArtifacts, notebooks } from "../drizzle/schema";
import { getDb } from "./db";
import { invokeLLM, type InvokeResult } from "./_core/llm";
import { recallAnswerSchema, recallArtifactKindSchema, type RecallAnswer, type RecallArtifactKind } from "../shared/recall";

function dbOrThrow(db: Awaited<ReturnType<typeof getDb>>) { if (!db) throw new Error("Synq persistence is not available"); return db; }
function content(result: InvokeResult) { const value = result?.choices?.[0]?.message?.content; if (typeof value !== "string" || !value.trim()) throw new Error("Recall Lab received an empty answer"); return value; }
function jsonObject(raw: string) { const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim(); try { return JSON.parse(text); } catch { const start = text.indexOf("{"); const end = text.lastIndexOf("}"); if (start < 0 || end <= start) throw new Error("Recall Lab received invalid structured output"); return JSON.parse(text.slice(start, end + 1)); } }

async function ownedNotes(userId: number, ids: number[]) {
  const db = dbOrThrow(await getDb());
  if (!ids.length) return db.select().from(notebooks).where(and(eq(notebooks.userId, userId), isNull(notebooks.deletedAt))).orderBy(desc(notebooks.updatedAt)).limit(8);
  return db.select().from(notebooks).where(and(eq(notebooks.userId, userId), inArray(notebooks.id, ids), isNull(notebooks.deletedAt))).orderBy(desc(notebooks.updatedAt));
}
function sourcePack(rows: Awaited<ReturnType<typeof ownedNotes>>) { return rows.map(row => ({ notebookId: row.id, title: row.title, note: row.note })).map(item => JSON.stringify(item)).join("\n--- SOURCE ---\n"); }
function sourceCitationGuard(value: unknown, rows: Awaited<ReturnType<typeof ownedNotes>>) { const allowed = new Set(rows.map(row => row.id)); if (!Array.isArray(value)) return []; return value.filter(item => item && allowed.has(Number((item as Record<string, unknown>).notebookId))).map(item => ({ ...(item as object), notebookId: Number((item as Record<string, unknown>).notebookId) })); }

export async function listRecallArtifacts(userId: number) { const db = dbOrThrow(await getDb()); return db.select().from(recallArtifacts).where(eq(recallArtifacts.userId, userId)).orderBy(desc(recallArtifacts.createdAt)).limit(30); }

export async function answerRecall(userId: number, input: { notebookIds: number[]; message: string; history: Array<{ role: "user" | "assistant"; content: string }> }): Promise<RecallAnswer> {
  const rows = await ownedNotes(userId, input.notebookIds); if (!rows.length) throw new Error("Select at least one completed notebook first");
  const result = await invokeLLM({ maxTokens: 5000, responseFormat: { type: "json_object" }, messages: [
    { role: "system", content: "You are Recall Lab, a source-grounded study companion. Answer only from the provided notebooks. If the sources do not support an answer, say so clearly. Return JSON with answer, citations (notebookId, notebookTitle, sectionId optional, label, quote), and suggestedFollowUps (array). Never invent citations." },
    { role: "user", content: JSON.stringify({ sources: sourcePack(rows), history: input.history.slice(-8), question: input.message }) },
  ] });
  const parsed = jsonObject(content(result)); const guarded = { ...parsed, citations: sourceCitationGuard(parsed.citations, rows) }; return recallAnswerSchema.parse(guarded);
}

export async function createRecallArtifact(userId: number, input: { notebookIds: number[]; kind: RecallArtifactKind; instruction?: string }) {
  const rows = await ownedNotes(userId, input.notebookIds); if (!rows.length) throw new Error("Select at least one completed notebook first");
  const label = recallArtifactKindSchema.parse(input.kind);
  const result = await invokeLLM({ maxTokens: 7000, responseFormat: { type: "json_object" }, messages: [
    { role: "system", content: `You are Recall Lab's artifact studio. Create a useful ${label} grounded only in the supplied notebooks. Return JSON with title, markdown, and citations (notebookId, notebookTitle, sectionId optional, label, quote). Use concise Markdown, practical headings, and mark uncertainty. Do not invent citations.` },
    { role: "user", content: JSON.stringify({ sources: sourcePack(rows), instruction: input.instruction ?? `Create a high-quality ${label} for review.` }) },
  ] });
  const parsed = jsonObject(content(result)); const citations = sourceCitationGuard(parsed.citations, rows); const title = String(parsed.title ?? `${label.replace("_", " ")} · Recall Lab`); const markdown = String(parsed.markdown ?? ""); if (!markdown.trim()) throw new Error("Recall Lab produced an empty artifact");
  const db = dbOrThrow(await getDb()); await db.insert(recallArtifacts).values({ userId, notebookId: rows[0].id, kind: label, title, markdown, citations });
  const saved = await db.select({ id: recallArtifacts.id, createdAt: recallArtifacts.createdAt }).from(recallArtifacts).where(and(eq(recallArtifacts.userId, userId), eq(recallArtifacts.title, title))).orderBy(desc(recallArtifacts.createdAt)).limit(1);
  return { id: saved[0]?.id, kind: label, title, markdown, citations, createdAt: saved[0]?.createdAt };
}
