import { describe, expect, it } from "vitest";
import { fixtureLectureNote } from "./lecture-fixture";
import { isLectureNote, validateLectureNote } from "./lecture";
import { toLectureHtml, toLectureMarkdown } from "./lecture-export";

describe("LectureNote contract", () => {
  it("accepts the representative fixture and preserves stable links", () => {
    const parsed = validateLectureNote(fixtureLectureNote);
    expect(parsed.sections.map(section => section.id)).toEqual(["section-feedback-basics", "section-intervention"]);
    expect(parsed.visualHighlights.every(visual => parsed.sections.some(section => section.id === visual.relatedSection))).toBe(true);
    expect(parsed.transcript[0]?.timestamp).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it("rejects duplicate section IDs and broken visual links", () => {
    const invalid = structuredClone(fixtureLectureNote);
    invalid.sections[1]!.id = invalid.sections[0]!.id;
    invalid.visualHighlights[0]!.relatedSection = "missing-section";
    expect(() => validateLectureNote(invalid)).toThrow();
    expect(isLectureNote(invalid)).toBe(false);
  });

  it("rejects timestamps that are not normalized HH:MM:SS", () => {
    const invalid = structuredClone(fixtureLectureNote);
    invalid.transcript[0]!.timestamp = "9:22";
    expect(() => validateLectureNote(invalid)).toThrow();
  });

  it("keeps exports derived from structured notebook data", () => {
    const markdown = toLectureMarkdown(fixtureLectureNote);
    const html = toLectureHtml(fixtureLectureNote);
    expect(markdown).toContain("# Why feedback loops make systems learn");
    expect(markdown).toContain("## Feedback is a loop, not a verdict");
    expect(html).toContain("<article>");
    expect(html).toContain("Causal loop");
  });
});
