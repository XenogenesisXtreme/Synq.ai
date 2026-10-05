import { parseLectureNote, type LectureNote } from "../src/lib/lecture";
import { MpsModelRouter } from "./mpsRouter";

export type ProcessingStatus = "pending" | "processing" | "completed" | "failed";
export type SourceKind = "pasted_text" | "text_file";
export type SourceRecord = { id: string; ownerId: string; title: string; kind: SourceKind; content: string; status: ProcessingStatus };
export type ProcessingRun = { id: string; sourceId: string; ownerId: string; status: ProcessingStatus; provider?: string; model?: string; errorCode?: string };

export interface GenerationPersistence {
  createSource(input: Omit<SourceRecord, "id" | "status">): Promise<SourceRecord>;
  createRun(input: Omit<ProcessingRun, "id" | "status">): Promise<ProcessingRun>;
  updateRun(id: string, patch: Partial<ProcessingRun>): Promise<void>;
  saveNotebook(input: { ownerId: string; sourceId: string; runId: string; title: string; note: LectureNote }): Promise<{ id: string }>;
}

export type GenerationResult = { source: SourceRecord; run: ProcessingRun; notebook: LectureNote; notebookId: string };

export async function generateNotebook(input: { ownerId: string; title: string; kind: SourceKind; content: string }, deps: { persistence: GenerationPersistence; router?: Pick<MpsModelRouter, "execute"> }): Promise<GenerationResult> {
  const content = input.content.trim();
  if (!content) throw new Error("Source content is required");
  if (content.length > 500_000) throw new Error("Source content exceeds the 500,000 character limit");
  const source = await deps.persistence.createSource({ ownerId: input.ownerId, title: input.title.trim() || "Untitled source", kind: input.kind, content });
  const run = await deps.persistence.createRun({ ownerId: input.ownerId, sourceId: source.id });
  await deps.persistence.updateRun(run.id, { status: "processing" });
  try {
    const response = await (deps.router ?? new MpsModelRouter()).execute("reasoning", [
      { role: "system", content: "You are Synq.ai Master Pedagogy. Return only a JSON object matching the LectureNote contract. Preserve uncertainty instead of inventing details." },
      { role: "user", content: `Source: ${content}` },
    ], { responseFormat: "json_object", temperature: 0.1 });
    const note = parseLectureNote(JSON.parse(response.content));
    const notebook = await deps.persistence.saveNotebook({ ownerId: input.ownerId, sourceId: source.id, runId: run.id, title: note.title, note });
    const completedRun = { ...run, status: "completed" as const, provider: response.provider, model: response.model };
    await deps.persistence.updateRun(run.id, completedRun);
    return { source: { ...source, status: "completed" }, run: completedRun, notebook: { ...note, processingStatus: "completed" }, notebookId: notebook.id };
  } catch (error) {
    await deps.persistence.updateRun(run.id, { status: "failed", errorCode: error instanceof Error ? error.name : "GENERATION_FAILED" });
    throw error;
  }
}
