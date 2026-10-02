import { describe, expect, it } from "vitest";
import { parseMasterPedagogyResponse } from "./mps";
import { fixtureLectureNote } from "@shared/lecture-fixture";

function result(content: string) {
  return { id: "test", created: 0, model: "test-model", choices: [{ index: 0, message: { role: "assistant" as const, content }, finish_reason: "stop" }], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } };
}

describe("Master Pedagogy adapter", () => {
  it("recovers a JSON object wrapped in a markdown fence", () => {
    const fenced = "```json\n" + JSON.stringify(fixtureLectureNote) + "\n```";
    const note = parseMasterPedagogyResponse(result(fenced));
    expect(note.title).toBe(fixtureLectureNote.title);
  });

  it("rejects empty model output", () => {
    expect(() => parseMasterPedagogyResponse(result(""))).toThrow("empty content");
  });

  it("rejects output that does not satisfy the LectureNote contract", () => {
    expect(() => parseMasterPedagogyResponse(result(JSON.stringify({ title: "Only a title" })))).toThrow("contract validation failed");
  });
});
