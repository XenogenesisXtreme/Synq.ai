import { z } from "zod";

const timestampSchema = z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Timestamp must use HH:MM:SS format");

export const visualTypeSchema = z.enum([
  "diagram",
  "equation",
  "chart",
  "slide",
  "demonstration",
  "other",
]);

export const transcriptLineSchema = z.object({
  timestamp: timestampSchema,
  speaker: z.string().min(1),
  text: z.string().min(1),
  sectionId: z.string().min(1).optional(),
});

export const definitionSchema = z.object({
  term: z.string().min(1),
  meaning: z.string().min(1),
});

export const workedExampleSchema = z.object({
  title: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
});

export const lectureSectionSchema = z.object({
  id: z.string().min(1),
  heading: z.string().min(1),
  timeStart: timestampSchema,
  timeEnd: timestampSchema,
  explanation: z.string().min(1),
  keyPoints: z.array(z.string().min(1)),
  definitions: z.array(definitionSchema),
  formulas: z.array(z.string().min(1)),
  workedExamples: z.array(workedExampleSchema),
  teacherEmphasis: z.array(z.string().min(1)),
  commonMistakes: z.array(z.string().min(1)),
  linkedVisuals: z.array(z.string().min(1)),
  intuition: z.string().min(1).optional(),
  whyItMatters: z.string().min(1).optional(),
  stepByStep: z.array(z.string().min(1)).optional(),
  selfCheck: z.array(z.string().min(1)).optional(),
  connections: z.array(z.string().min(1)).optional(),
});

export const visualHighlightSchema = z.object({
  id: z.string().min(1),
  timestamp: timestampSchema,
  type: visualTypeSchema,
  caption: z.string().min(1),
  whatItShows: z.string().min(1),
  relatedSection: z.string().min(1),
});

export const uncertainItemSchema = z.object({
  timestamp: timestampSchema,
  text: z.string().min(1),
});

export const lectureNoteSchema = z
  .object({
    title: z.string().min(1),
    course: z.string().min(1),
    date: z.string().min(1),
    overview: z.string().min(1),
    processingStatus: z.string().min(1),
    learningObjectives: z.array(z.string().min(1)),
    sections: z.array(lectureSectionSchema).min(1),
    visualHighlights: z.array(visualHighlightSchema),
    keyTerms: z.array(definitionSchema),
    reviewQuestions: z.array(z.string().min(1)),
    examReview: z.array(z.string().min(1)),
    uncertainItems: z.array(uncertainItemSchema),
    transcript: z.array(transcriptLineSchema),
  })
  .superRefine((note, ctx) => {
    const sectionIds = new Set<string>();
    for (const [index, section] of note.sections.entries()) {
      if (sectionIds.has(section.id)) {
        ctx.addIssue({ code: "custom", path: ["sections", index, "id"], message: "Section IDs must be stable and unique" });
      }
      sectionIds.add(section.id);
    }

    const visualIds = new Set<string>();
    for (const [index, visual] of note.visualHighlights.entries()) {
      if (visualIds.has(visual.id)) {
        ctx.addIssue({ code: "custom", path: ["visualHighlights", index, "id"], message: "Visual IDs must be stable and unique" });
      }
      visualIds.add(visual.id);
      if (!sectionIds.has(visual.relatedSection)) {
        ctx.addIssue({ code: "custom", path: ["visualHighlights", index, "relatedSection"], message: "Visual must link to an existing section" });
      }
    }

    for (const [index, line] of note.transcript.entries()) {
      if (line.sectionId && !sectionIds.has(line.sectionId)) {
        ctx.addIssue({ code: "custom", path: ["transcript", index, "sectionId"], message: "Transcript sectionId must link to an existing section" });
      }
    }
  });

export type VisualType = z.infer<typeof visualTypeSchema>;
export type TranscriptLine = z.infer<typeof transcriptLineSchema>;
export type Definition = z.infer<typeof definitionSchema>;
export type WorkedExample = z.infer<typeof workedExampleSchema>;
export type LectureSection = z.infer<typeof lectureSectionSchema>;
export type VisualHighlight = z.infer<typeof visualHighlightSchema>;
export type LectureNote = z.infer<typeof lectureNoteSchema>;

export function validateLectureNote(payload: unknown): LectureNote {
  return lectureNoteSchema.parse(payload);
}

export function isLectureNote(payload: unknown): payload is LectureNote {
  return lectureNoteSchema.safeParse(payload).success;
}
