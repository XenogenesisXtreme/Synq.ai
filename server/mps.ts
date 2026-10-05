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
    cachedModelId = models.data.find(model => model.id === "gpt-5-mini")?.id ?? models.data[0]?.id;
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

function normalizeStrings(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (!Array.isArray(value)) return [];
  return value.map(item => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      const entry = item as Record<string, unknown>;
      return String(entry.text ?? entry.question ?? entry.prompt ?? entry.title ?? JSON.stringify(item));
    }
    return String(item);
  }).filter(Boolean);
}

function normalizeDefinitions(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.map(normalizeDefinition);
  if (value && typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([term, meaning]) => ({ term, meaning }));
  return [];
}

function normalizeDefinition(value: unknown): unknown {
  if (typeof value === "string") return { term: value, meaning: value };
  if (!value || typeof value !== "object") return { term: "Untitled term", meaning: "No definition provided" };
  const item = value as Record<string, unknown>;
  return { term: item.term ?? "Untitled term", meaning: item.meaning ?? item.definition ?? "No definition provided" };
}

function normalizeLectureNote(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const note = value as Record<string, unknown>;
  const sections = Array.isArray(note.sections) ? note.sections.map((raw, index) => {
    const section = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const keyPoints = normalizeStrings(section.keyPoints);
    const workedExamples = Array.isArray(section.workedExamples) ? section.workedExamples.map(example => {
      const item = (example && typeof example === "object" ? example : {}) as Record<string, unknown>;
      return { title: item.title ?? item.problem ?? `Worked example ${index + 1}`, steps: normalizeStrings(item.steps).length ? normalizeStrings(item.steps) : [String(item.solution ?? "Review the example step by step.")] };
    }) : [];
    const formulas = Array.isArray(section.formulas) ? normalizeStrings(section.formulas) : section.formulas && typeof section.formulas === "object" ? Object.entries(section.formulas as Record<string, unknown>).map(([key, item]) => `${key}: ${String(item)}`) : [];
    return { ...section, heading: section.heading ?? section.title ?? (typeof keyPoints[0] === "string" ? keyPoints[0] : `Lesson section ${index + 1}`), keyPoints, definitions: normalizeDefinitions(section.definitions), formulas, workedExamples, teacherEmphasis: normalizeStrings(section.teacherEmphasis), commonMistakes: normalizeStrings(section.commonMistakes), linkedVisuals: normalizeStrings(section.linkedVisuals), stepByStep: section.stepByStep === undefined ? undefined : normalizeStrings(section.stepByStep), selfCheck: section.selfCheck === undefined ? undefined : normalizeStrings(section.selfCheck), connections: section.connections === undefined ? undefined : normalizeStrings(section.connections) };
  }) : [];
  const sectionIds = sections.map(section => String((section as Record<string, unknown>).id ?? ""));
  return { ...note, sections, keyTerms: normalizeDefinitions(note.keyTerms), learningObjectives: normalizeStrings(note.learningObjectives), visualHighlights: Array.isArray(note.visualHighlights) ? note.visualHighlights.map((raw, index) => { const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>; const allowed = ["diagram", "equation", "chart", "slide", "demonstration", "other"]; const requestedSection = String(item.relatedSection ?? ""); return { ...item, id: String(item.id ?? `visual-${index + 1}`), timestamp: String(item.timestamp ?? "00:00:00"), type: allowed.includes(String(item.type)) ? item.type : "other", caption: String(item.caption ?? "Visual highlight"), whatItShows: String(item.whatItShows ?? item.description ?? "Related visual"), relatedSection: sectionIds.includes(requestedSection) ? requestedSection : sectionIds[0] ?? "section-1" }; }) : [], reviewQuestions: normalizeStrings(note.reviewQuestions), examReview: normalizeStrings(note.examReview), uncertainItems: Array.isArray(note.uncertainItems) ? note.uncertainItems.map(raw => { const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>; return { ...item, timestamp: String(item.timestamp ?? "00:00:00"), text: String(item.text ?? item.description ?? "Uncertain item") }; }) : [], transcript: Array.isArray(note.transcript) ? note.transcript.map(line => { const item = (line && typeof line === "object" ? line : {}) as Record<string, unknown>; return { ...item, timestamp: String(item.timestamp ?? "00:00:00"), speaker: String(item.speaker ?? "Instructor"), text: String(item.text ?? "No transcript text provided") }; }) : [] };
}

export function parseMasterPedagogyResponse(result: InvokeResult): LectureNote {
  const content = result?.choices?.[0]?.message?.content;
  if (!Array.isArray(result?.choices)) {
    throw new Error("Managed LLM response did not include choices");
  }
  if (typeof content !== "string" || !content.trim()) throw new Error("Master Pedagogy returned empty content");
  const parsed = normalizeLectureNote(extractJson(content));
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
      { role: "user", content: JSON.stringify({ sourceTitle: source.title, course: source.course?.trim() || "General learning", date: source.date ?? new Date().toISOString().slice(0, 10), sourceText: source.content }) },
    ],
  });
  try {
    return { note: parseMasterPedagogyResponse(result), modelId: result.model || modelId, usage: result.usage };
  } catch (error) {
    console.error("[MPS] Invalid managed LLM response", JSON.stringify(result).slice(0, 4000));
    throw error;
  }
}
