import { lectureNoteSchema, type LectureNote } from "@shared/lecture";
import { invokeLLM, listLLMModels, type InvokeResult } from "./_core/llm";

export const MPS_PROMPT_VERSION = "mps-v1";
export const LECTURE_NOTE_SCHEMA_VERSION = "lecture-note-v1";

const systemPrompt = `You are Master Pedagogy for Synq.ai. Transform the learner's source into a faithful, useful LectureNote JSON object. Preserve uncertainty instead of inventing facts. The output must contain exactly these top-level fields: title, course, date, overview, processingStatus, learningObjectives, sections, visualHighlights, keyTerms, reviewQuestions, examReview, uncertainItems, transcript. Every section needs a stable unique id, normalized HH:MM:SS timeStart/timeEnd, explanation, keyPoints, definitions, formulas, workedExamples, teacherEmphasis, commonMistakes, linkedVisuals, and may include intuition, whyItMatters, stepByStep, selfCheck, connections. Every visual needs a stable unique id, normalized timestamp, type, caption, whatItShows, and a relatedSection that exists. Transcript lines use normalized HH:MM:SS timestamps and may link to sectionId. Keep unsupported claims in uncertainItems. Do not output Markdown fences or commentary. processingStatus must be \"completed\" only when the JSON is structurally complete; it does not certify factual correctness.`;

let cachedModelId: string | undefined;

async function resolveModelId(): Promise<string | undefined> {
  const configured = process.env.MPS_MODEL_ID?.trim();
  if (configured) return configured;
  if (cachedModelId) return cachedModelId;
  try {
    const models = await listLLMModels();
    cachedModelId = models.data[0]?.id;
  } catch {
    // The platform default remains a valid fallback when the catalog is unavailable.
  }
  return cachedModelId;
}

function extractJson(content: string): unknown {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Master Pedagogy returned no JSON object");
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

export function parseMasterPedagogyResponse(result: InvokeResult): LectureNote {
  const content = result.choices[0]?.message.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Master Pedagogy returned empty content");
  const parsed = extractJson(content);
  const validated = lectureNoteSchema.safeParse(parsed);
  if (!validated.success) throw new Error(`Master Pedagogy contract validation failed: ${validated.error.issues[0]?.message ?? "invalid notebook"}`);
  return validated.data;
}

export async function generateLectureNote(source: { title: string; content: string; course?: string; date?: string }): Promise<{ note: LectureNote; modelId?: string; usage?: InvokeResult["usage"] }> {
  const modelId = await resolveModelId();
  const result = await invokeLLM({
    ...(modelId ? { model: modelId } : {}),
    maxTokens: 16000,
    responseFormat: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify({ sourceTitle: source.title, course: source.course ?? "", date: source.date ?? new Date().toISOString().slice(0, 10), sourceText: source.content }) },
    ],
  });
  return { note: parseMasterPedagogyResponse(result), modelId: result.model || modelId, usage: result.usage };
}
