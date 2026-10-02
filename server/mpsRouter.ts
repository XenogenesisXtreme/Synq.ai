import type { LectureNote } from "../src/lib/lecture";

export type MpsTier = "ingestion" | "reasoning" | "interactivity";
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type MpsResponse = { content: string; provider: string; model: string; mocked: boolean };

type Provider = { name: string; apiKey?: string; baseUrl: string; model: string };

export class ProviderUnavailableError extends Error {
  constructor(public readonly tier: MpsTier, message: string) {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}

export class MpsModelRouter {
  private readonly providers: Record<MpsTier, Provider[]>;
  private readonly mockMode: boolean;

  constructor(env: Record<string, string | undefined> = runtimeEnv()) {
    this.mockMode = env.SYNQ_MOCK_MODE === "true" || env.NODE_ENV === "test";
    this.providers = {
      ingestion: [{ name: "gemini", apiKey: env.GEMINI_API_KEY, baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", model: env.GEMINI_MODEL ?? "gemini-2.5-flash" }],
      reasoning: [
        { name: "openrouter", apiKey: env.OPENROUTER_API_KEY, baseUrl: "https://openrouter.ai/api/v1", model: env.OPENROUTER_MODEL ?? "deepseek/deepseek-r1:free" },
        { name: "groq", apiKey: env.GROQ_API_KEY, baseUrl: "https://api.groq.com/openai/v1", model: env.GROQ_REASONING_MODEL ?? "llama-3.3-70b-versatile" },
      ],
      interactivity: [{ name: "groq", apiKey: env.GROQ_API_KEY, baseUrl: "https://api.groq.com/openai/v1", model: env.GROQ_MODEL ?? "llama-3.3-70b-versatile" }],
    };
  }

  async execute(tier: MpsTier, messages: ChatMessage[], options: { temperature?: number; responseFormat?: "json_object" } = {}): Promise<MpsResponse> {
    if (this.mockMode) return { content: mockNotebookJson(messages), provider: "mock", model: "fixture-v1", mocked: true };
    const providers = this.providers[tier];
    let lastError: unknown;
    for (const provider of providers) {
      if (!provider.apiKey) { lastError = new ProviderUnavailableError(tier, `${provider.name} is not configured`); continue; }
      try {
        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${provider.apiKey}` },
          body: JSON.stringify({ model: provider.model, messages, temperature: options.temperature ?? 0.1, ...(options.responseFormat ? { response_format: { type: options.responseFormat } } : {}) }),
        });
        if (!response.ok) throw new Error(`${provider.name} returned HTTP ${response.status}`);
        const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        const content = body.choices?.[0]?.message?.content;
        if (!content) throw new Error(`${provider.name} returned an empty response`);
        return { content, provider: provider.name, model: provider.model, mocked: false };
      } catch (error) { lastError = error; }
    }
    throw lastError instanceof Error ? lastError : new ProviderUnavailableError(tier, `No provider available for ${tier}`);
  }
}

function mockNotebookJson(messages: ChatMessage[]): string {
  const source = messages[messages.length - 1]?.content.replace(/^Source:\s*/i, "").trim() || "the supplied learning material";
  const excerpt = source.slice(0, 240) || "The supplied learning material";
  const note: LectureNote = {
    title: "Untitled learning note",
    course: "Synq.ai draft",
    date: new Date().toISOString().slice(0, 10),
    overview: `A local mock notebook generated from: ${excerpt}`,
    processingStatus: "completed",
    learningObjectives: ["Identify the main idea in the supplied material.", "Explain the key concept in your own words."],
    sections: [{ id: "section-1", heading: "Core idea", timeStart: "00:00:00", timeEnd: "00:05:00", explanation: excerpt, keyPoints: [excerpt], definitions: [], formulas: [], workedExamples: [], teacherEmphasis: [], commonMistakes: [], linkedVisuals: [], selfCheck: ["Can you restate the core idea without looking?"] }],
    visualHighlights: [], keyTerms: [], reviewQuestions: ["What is the most important idea in this material?"], examReview: ["Review the core idea and explain why it matters."], uncertainItems: [], transcript: [],
  };
  return JSON.stringify(note);
}

function runtimeEnv(): Record<string, string | undefined> {
  return ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});
}
