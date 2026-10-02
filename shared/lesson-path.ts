import { z } from "zod";
import type { LectureNote } from "./lecture";

export const lessonNodeKindSchema = z.enum(["lesson", "practice", "challenge"]);
export const lessonNodeStatusSchema = z.enum(["locked", "unlocked", "complete"]);

export const lessonNodeSchema = z.object({
  id: z.string().min(1),
  kind: lessonNodeKindSchema,
  status: lessonNodeStatusSchema,
  title: z.string().min(1),
  subtitle: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  sectionId: z.string().min(1).optional(),
  prompt: z.string().min(1).optional(),
  options: z.array(z.string().min(1)).min(2).max(6).optional(),
  answer: z.string().min(1).optional(),
});

export const lessonUnitSchema = z.object({
  id: z.string().min(1),
  position: z.number().int().positive(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  nodes: z.array(lessonNodeSchema).min(1),
});

export const lessonPathSchema = z.object({
  schemaVersion: z.literal("mps-path-v1"),
  title: z.string().min(1),
  overview: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  units: z.array(lessonUnitSchema).min(1),
});

export type LessonNode = z.infer<typeof lessonNodeSchema>;
export type LessonUnit = z.infer<typeof lessonUnitSchema>;
export type LessonPath = z.infer<typeof lessonPathSchema>;

export function buildLessonPath(note: LectureNote): LessonPath {
  const units = note.sections.map((section, sectionIndex) => {
    const reviewQuestion = note.reviewQuestions[sectionIndex] ?? `Explain the main idea of ${section.heading} in your own words.`;
    const firstPoint = section.keyPoints[0] ?? section.explanation;
    const nodes: LessonNode[] = [
      { id: `${section.id}-lesson`, kind: "lesson", status: sectionIndex === 0 ? "unlocked" : "locked", title: section.heading, subtitle: "Learn the core idea", durationMinutes: 3, sectionId: section.id, prompt: firstPoint },
      { id: `${section.id}-practice`, kind: "practice", status: "locked", title: "Quick practice", subtitle: "Check your understanding", durationMinutes: 2, sectionId: section.id, prompt: reviewQuestion, options: ["I can explain it", "I need another example", "I want to review the source"], answer: "I can explain it" },
      { id: `${section.id}-challenge`, kind: "challenge", status: "locked", title: "Level challenge", subtitle: "Use the idea in context", durationMinutes: 3, sectionId: section.id, prompt: section.whyItMatters ?? `Where would you use ${section.heading}?` },
    ];
    return { id: `unit-${sectionIndex + 1}`, position: sectionIndex + 1, title: `${sectionIndex + 1}. ${section.heading}`, subtitle: `${nodes.length} short steps`, nodes };
  });
  return lessonPathSchema.parse({ schemaVersion: "mps-path-v1", title: note.title, overview: note.overview, estimatedMinutes: units.reduce((sum, unit) => sum + unit.nodes.reduce((nodeSum, node) => nodeSum + node.durationMinutes, 0), 0), units });
}
