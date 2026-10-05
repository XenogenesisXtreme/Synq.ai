import { z } from 'zod';

const timestamp = z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Expected HH:MM:SS timestamp');

export const definitionSchema = z.object({ term: z.string().min(1), meaning: z.string().min(1) });
export const workedExampleSchema = z.object({ title: z.string().min(1), steps: z.array(z.string().min(1)) });
export const transcriptLineSchema = z.object({ timestamp, speaker: z.string().min(1), text: z.string().min(1), sectionId: z.string().min(1).optional() });
export const lectureSectionSchema = z.object({
  id: z.string().min(1), heading: z.string().min(1), timeStart: timestamp, timeEnd: timestamp, explanation: z.string().min(1),
  keyPoints: z.array(z.string().min(1)), definitions: z.array(definitionSchema), formulas: z.array(z.string()), workedExamples: z.array(workedExampleSchema),
  teacherEmphasis: z.array(z.string()), commonMistakes: z.array(z.string()), linkedVisuals: z.array(z.string()), intuition: z.string().optional(), whyItMatters: z.string().optional(),
  stepByStep: z.array(z.string()).optional(), selfCheck: z.array(z.string()).optional(), connections: z.array(z.string()).optional()
});
export const visualHighlightSchema = z.object({ id: z.string().min(1), timestamp, type: z.enum(['diagram','equation','chart','slide','demonstration','other']), caption: z.string().min(1), whatItShows: z.string().min(1), relatedSection: z.string().min(1) });
export const lectureNoteSchema = z.object({
  title: z.string().min(1), course: z.string(), date: z.string().min(1), overview: z.string().min(1), processingStatus: z.string().min(1),
  learningObjectives: z.array(z.string().min(1)), sections: z.array(lectureSectionSchema).min(1), visualHighlights: z.array(visualHighlightSchema), keyTerms: z.array(definitionSchema),
  reviewQuestions: z.array(z.string().min(1)), examReview: z.array(z.string().min(1)), uncertainItems: z.array(z.object({ timestamp, text: z.string().min(1) })), transcript: z.array(transcriptLineSchema)
});

export type LectureNote = z.infer<typeof lectureNoteSchema>;
export type LectureSection = z.infer<typeof lectureSectionSchema>;
export function parseLectureNote(value: unknown): LectureNote { return lectureNoteSchema.parse(value); }
