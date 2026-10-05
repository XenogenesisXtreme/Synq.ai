import { z } from "zod";

export const recallCitationSchema = z.object({
  notebookId: z.number().int().positive(),
  notebookTitle: z.string().min(1),
  sectionId: z.string().min(1).optional(),
  label: z.string().min(1),
  quote: z.string().min(1),
});

export const recallArtifactKindSchema = z.enum(["briefing", "study_guide", "faq", "quiz", "flashcards", "timeline", "mind_map"]);
export type RecallArtifactKind = z.infer<typeof recallArtifactKindSchema>;

export const recallArtifactSchema = z.object({
  id: z.number().int().positive().optional(),
  kind: recallArtifactKindSchema,
  title: z.string().min(1),
  markdown: z.string().min(1),
  citations: z.array(recallCitationSchema),
  createdAt: z.string().optional(),
});
export type RecallArtifact = z.infer<typeof recallArtifactSchema>;

export const recallAnswerSchema = z.object({
  answer: z.string().min(1),
  citations: z.array(recallCitationSchema),
  suggestedFollowUps: z.array(z.string().min(1)).max(5),
});
export type RecallAnswer = z.infer<typeof recallAnswerSchema>;
