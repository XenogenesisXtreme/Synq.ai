import { describe, expect, it } from "vitest";
import { fixtureLecture } from "./fixture";
import { generateNotebook, type GenerationPersistence, type ProcessingRun, type SourceRecord } from "../../server/generation";
import { MpsModelRouter } from "../../server/mpsRouter";

class MemoryPersistence implements GenerationPersistence {
  sources: SourceRecord[] = [];
  runs: ProcessingRun[] = [];
  saved: unknown[] = [];
  async createSource(input: Omit<SourceRecord, "id" | "status">) { const source = { ...input, id: "source-1", status: "pending" as const }; this.sources.push(source); return source; }
  async createRun(input: Omit<ProcessingRun, "id" | "status">) { const run = { ...input, id: "run-1", status: "pending" as const }; this.runs.push(run); return run; }
  async updateRun(id: string, patch: Partial<ProcessingRun>) { const run = this.runs.find(item => item.id === id)!; Object.assign(run, patch); }
  async saveNotebook(input: { ownerId: string; sourceId: string; runId: string; title: string; note: typeof fixtureLecture }) { this.saved.push(input); return { id: "notebook-1" }; }
}

describe("server notebook generation", () => {
  it("creates a source, processes it, validates the note, and saves the notebook", async () => {
    const persistence = new MemoryPersistence();
    const result = await generateNotebook({ ownerId: "user-1", title: "Feedback loops", kind: "pasted_text", content: "Feedback loops return an output to influence the system." }, { persistence, router: new MpsModelRouter({ NODE_ENV: "test" }) });
    expect(result.notebook.processingStatus).toBe("completed");
    expect(result.notebookId).toBe("notebook-1");
    expect(persistence.runs[0]?.status).toBe("completed");
  });

  it("marks the processing run failed when the provider returns an invalid contract", async () => {
    const persistence = new MemoryPersistence();
    const invalidRouter = { execute: async () => ({ content: JSON.stringify({ title: "bad" }), provider: "test", model: "bad", mocked: false as const }) };
    await expect(generateNotebook({ ownerId: "user-1", title: "Bad", kind: "pasted_text", content: "A source" }, { persistence, router: invalidRouter })).rejects.toThrow();
    expect(persistence.runs[0]?.status).toBe("failed");
  });
});
