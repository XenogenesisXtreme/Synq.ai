# Pre-Build Decisions and Notebook Contract

## Status

These decisions are approved for the first Synq.ai build. They narrow the initial release to a validated core learning loop and intentionally defer platform breadth until that loop is reliable.

## Approved first vertical slice

Build the browser Workspace first. The first usable increment is:

```text
pasted lecture text or .txt/.md upload
  → source record
  → Master Pedagogy generation
  → stored structured notebook
  → rendered notebook view
```

The first slice does not include the Tauri desktop shell, browser Extension, audio generation, collaboration, advanced mastery, or audio/video transcription. Tauri follows core-loop validation; the Extension follows a stable ingestion contract.

## Input and processing decisions

- Initial input: pasted text and `.txt`/`.md` file upload.
- Audio/video transcription is deferred until text-based generation quality is proven.
- Start generation synchronously through a server-side route with Fluid Compute.
- Benchmark a representative 90-minute lecture before Phase 3 exit. If generation plus retries cannot fit comfortably within the configured execution ceiling, move the route to a durable runner such as Inngest or Trigger.dev.
- Every request still creates durable processing state: `pending`, `processing`, `completed`, or `failed`.
- Provider keys remain server-only deployment secrets; clients never receive Gemini or ElevenLabs credentials.

## Quality gate

Create a fixed 15–20 item golden set spanning technical, fact-dense, interpretive, and edge-case sources. Score every output on factual accuracy, faithfulness, pedagogical clarity, completeness, and uncertainty handling.

Phase 1/core-loop exit requires:

- no factual-accuracy or faithfulness score below 3/5; and
- at least 4.0/5 average across all five dimensions.

Re-run the full set whenever the prompt, schema, or model version changes.

## Model and quota policy

Use one selected Gemini model for the first evaluation cycle rather than silently switching quality tiers. Measure real input/output token usage at 20-, 60-, and 90-minute source lengths before setting free-tier quotas. If a user reaches quota, fail clearly and preserve the source/notebook state; do not silently downgrade quality during the initial release. Revisit cheaper model fallback and Gemini Batch/Flex processing after real measurements.

## Privacy, retention, and sync

- Retain a user's source and generated notebooks until the user deletes them.
- Do not log raw source content, prompts, generated content, or provider responses by default.
- Provide export and permanent deletion before public launch; deletion must cascade to derived notebooks, audio, assessments, and mastery data according to the final retention policy.
- The first browser slice does not promise full offline editing. Show an explicit sync-pending state; add a local queue only if desktop requirements justify it.

## Audio, mastery, and collaboration

- Audio is on demand, initially one default voice and one language, with output cached per notebook version.
- Audio failure never invalidates a completed notebook.
- Mastery begins with transparent rules based on quiz correctness and review history; no opaque personalization in the first release.
- Collaboration remains deferred. Personal ownership and strict RLS are the initial model.

## Notebook JSON contract

The canonical notebook payload adopts the existing website contract from [lecture-notebook-ai-mvp](https://github.com/XenogenesisXtreme/lecture-notebook-ai-mvp), specifically `client/src/lib/lecture.ts`, as the Synq.ai v1 compatibility shape. Synq.ai may wrap this payload with application metadata such as notebook ID, owner ID, source ID, schema version, and processing metadata, but the learner-facing `note` payload should remain compatible with this structure.

```ts
type VisualType = "diagram" | "equation" | "chart" | "slide" | "demonstration" | "other";

type TranscriptLine = {
  timestamp: string; // HH:MM:SS
  speaker: string;
  text: string;
  sectionId?: string;
};

type Definition = {
  term: string;
  meaning: string;
};

type WorkedExample = {
  title: string;
  steps: string[];
};

type LectureSection = {
  id: string;
  heading: string;
  timeStart: string; // HH:MM:SS
  timeEnd: string; // HH:MM:SS
  explanation: string;
  keyPoints: string[];
  definitions: Definition[];
  formulas: string[];
  workedExamples: WorkedExample[];
  teacherEmphasis: string[];
  commonMistakes: string[];
  linkedVisuals: string[];
  intuition?: string;
  whyItMatters?: string;
  stepByStep?: string[];
  selfCheck?: string[];
  connections?: string[];
};

type VisualHighlight = {
  id: string;
  timestamp: string; // HH:MM:SS
  type: VisualType;
  caption: string;
  whatItShows: string;
  relatedSection: string;
};

type LectureNote = {
  title: string;
  course: string;
  date: string;
  overview: string;
  processingStatus: string;
  learningObjectives: string[];
  sections: LectureSection[];
  visualHighlights: VisualHighlight[];
  keyTerms: Definition[];
  reviewQuestions: string[];
  examReview: string[];
  uncertainItems: { timestamp: string; text: string }[];
  transcript: TranscriptLine[];
};
```

### Contract rules

- `LectureNote` is the canonical structured payload; Markdown and HTML are derived exports, never the source of truth.
- Every section and visual has a stable ID. Transcript lines may align to sections through `sectionId`.
- Timestamps use normalized `HH:MM:SS` strings.
- Unsupported or uncertain material belongs in `uncertainItems`; the generator must not invent content to fill optional fields.
- `processingStatus` is application-visible status, not a claim that the content is pedagogically correct.
- The API validates the complete payload before persistence. Prompt version, model identifier, schema version, and evaluation metadata live in the processing-run/application envelope rather than inside learner prose.
- Synq-specific future features may add validated extension fields, but must preserve the v1 fields and meanings so website notebooks can be imported and rendered.

## Build order

1. Contract tests and fixture notebook using the payload above.
2. Browser Workspace with local rendering of the fixture.
3. Source persistence and authenticated sync.
4. Server-side Master Pedagogy route and validated generation.
5. Golden-set evaluation and quality gate.
6. Only after the gate: Tauri packaging, audio, mastery, and Extension work.
