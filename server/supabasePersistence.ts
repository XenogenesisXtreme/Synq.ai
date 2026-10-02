import type { GenerationPersistence, ProcessingRun, SourceRecord, SourceKind } from "./generation";
import type { LectureNote } from "../src/lib/lecture";

type Env = Record<string, string | undefined>;

export class SupabasePersistence implements GenerationPersistence {
  private readonly url: string;
  private readonly key: string;

  constructor(env: Env = runtimeEnv()) {
    this.url = env.SUPABASE_URL ?? "";
    this.key = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    if (!this.url || !this.key) throw new Error("Supabase server persistence is not configured");
  }

  async createSource(input: Omit<SourceRecord, "id" | "status">): Promise<SourceRecord> {
    const row = await this.request("lecture_sources", "POST", { owner_id: input.ownerId, title: input.title, kind: input.kind, content: input.content, status: "pending" });
    return { id: row.id, ownerId: row.owner_id, title: row.title, kind: row.kind as SourceKind, content: row.content, status: row.status };
  }

  async createRun(input: Omit<ProcessingRun, "id" | "status">): Promise<ProcessingRun> {
    const row = await this.request("processing_runs", "POST", { owner_id: input.ownerId, source_id: input.sourceId, status: "pending", schema_version: "lecture-note-v1" });
    return { id: row.id, sourceId: row.source_id, ownerId: row.owner_id, status: row.status };
  }

  async updateRun(id: string, patch: Partial<ProcessingRun>): Promise<void> {
    await this.request(`processing_runs?id=eq.${encodeURIComponent(id)}`, "PATCH", {
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.provider ? { provider: patch.provider } : {}),
      ...(patch.model ? { model: patch.model } : {}),
      ...(patch.errorCode ? { error_code: patch.errorCode } : {}),
      ...(patch.status === "processing" ? { started_at: new Date().toISOString() } : {}),
      ...(patch.status === "completed" || patch.status === "failed" ? { completed_at: new Date().toISOString() } : {}),
    }, false);
  }

  async saveNotebook(input: { ownerId: string; sourceId: string; runId: string; title: string; note: LectureNote }): Promise<{ id: string }> {
    const row = await this.request("notebooks", "POST", { owner_id: input.ownerId, source_id: input.sourceId, processing_run_id: input.runId, title: input.title, schema_version: "lecture-note-v1", note: input.note, status: "completed" });
    return { id: row.id };
  }

  private async request(path: string, method: "POST" | "PATCH", body: unknown, returnRepresentation = true): Promise<Record<string, any>> {
    const response = await fetch(`${this.url.replace(/\/$/, "")}/rest/v1/${path}`, {
      method,
      headers: { apikey: this.key, authorization: `Bearer ${this.key}`, "content-type": "application/json", ...(returnRepresentation ? { Prefer: "return=representation" } : {}) },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Supabase persistence failed with HTTP ${response.status}`);
    if (!returnRepresentation) return {};
    const rows = await response.json() as Record<string, any>[];
    if (!rows[0]) throw new Error("Supabase persistence returned no row");
    return rows[0];
  }
}

function runtimeEnv(): Env {
  return ((globalThis as { process?: { env?: Env } }).process?.env ?? {});
}
