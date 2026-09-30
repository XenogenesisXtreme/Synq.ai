# Synq.ai Manus Handoff Context

> **Required reading:** Every Manus account/session working on Synq.ai must read this file before inspecting, planning, editing, or building anything in this repository.
>
> **Required maintenance:** After every meaningful change—decision, implementation, migration, test result, blocker, branch change, deployment change, or scope change—the active Manus session must update this file before handing off. Keep it concise, factual, and usable by the next account.

## Handoff protocol

1. Read this file first.
2. Inspect the current repository state and branch; do not assume the state below is still current.
3. Review the relevant planning or implementation files before changing them.
4. Preserve existing user work. Do not overwrite or delete files unless explicitly authorized.
5. Before stopping, update the sections below:
   - **Current status**
   - **Last completed work**
   - **Next concrete task**
   - **Active decisions and constraints**
   - **Blockers or open questions**
   - **Validation and commit**
6. Commit and push context updates together with the work they describe whenever possible.
7. Never put secrets, API keys, access tokens, private credentials, or personal authentication data in this file.

This file is a durable handoff aid, not a substitute for Git history, tests, issue tracking, or the authoritative planning documents.

## Project

- **Name:** Synq.ai
- **Repository:** https://github.com/XenogenesisXtreme/Synq.ai
- **Working branch:** `updated`
- **Main branch:** `main`
- **Reference notebook repository:** https://github.com/XenogenesisXtreme/lecture-notebook-ai-mvp

## Current status

Planning is approved and the project is ready to begin implementation. The first build is a browser-first vertical slice, not the full product.

The target first slice is:

```text
pasted lecture text or .txt/.md upload
  → source record
  → Master Pedagogy generation
  → stored structured notebook
  → rendered Workspace
```

Nothing beyond this core loop should take priority until it works on a real lecture and clears the quality gate.

## Last completed work

- Added planning documents `09-quality-evaluation-plan.md`, `10-cost-model.md`, and `11-operational-decisions-addendum.md`.
- Adopted the recommended pre-build decisions.
- Adopted the `LectureNote`-compatible notebook contract from `lecture-notebook-ai-mvp/client/src/lib/lecture.ts`.
- Updated `03-database-design.md`, `06-build-roadmap.md`, and `07-open-questions.md` to reflect those decisions.
- Added `12-pre-build-decisions-and-notebook-contract.md` as the authoritative decision and schema record.
- Branch `updated` was pushed to GitHub. The latest planning commit before this file is `f08731c`.

## Next concrete task

Start implementation with a contract-first browser vertical slice:

1. Inspect the existing repository structure and choose the web app foundation.
2. Add a fixture notebook using the adopted `LectureNote` shape.
3. Add runtime/schema validation for the notebook payload.
4. Render the fixture in a minimal Workspace.
5. Add source creation and persistence boundaries.
6. Add the server-side Master Pedagogy route only after the contract tests exist.
7. Build the golden-set evaluation harness before treating generation quality as complete.

Do not begin with Tauri packaging, audio, Extension work, collaboration, advanced mastery, local AI, or broad file-format support.

## Adopted decisions and constraints

- Initial input: pasted text plus `.txt`/`.md` uploads.
- Audio/video transcription is deferred.
- Start generation synchronously through a server-side Fluid Compute route.
- Benchmark a representative 90-minute lecture; use Inngest or Trigger.dev if the execution ceiling is unreliable.
- Persist durable processing states: `pending`, `processing`, `completed`, `failed`.
- Gemini and ElevenLabs credentials are server-side secrets only; never expose them to clients or commit them.
- The learner-facing notebook payload follows the website's `LectureNote` contract. See `12-pre-build-decisions-and-notebook-contract.md` for the full TypeScript shape and compatibility rules.
- Markdown and HTML are derived exports, not the notebook source of truth.
- Browser-first; no full offline-editing promise in the first slice.
- Retain sources and notebooks until user deletion; do not log raw source content by default.
- Export and permanent deletion are required before public launch.
- Audio is on demand, initially one default voice and language, cached per notebook version.
- Mastery starts with transparent quiz correctness and review-history rules.
- Collaboration, Extension, self-hosting, BYOK, and local AI are deferred.
- Tauri desktop token storage, when reached, uses Stronghold for the Supabase refresh token, PKCE for OAuth, and memory-only access tokens.

## Quality gate

Create a fixed 15–20 item golden set covering technical, fact-dense, interpretive, and edge-case sources. Score:

1. Factual accuracy
2. Faithfulness
3. Pedagogical clarity
4. Completeness
5. Uncertainty handling

The core-loop exit gate is:

- no factual-accuracy or faithfulness score below 3/5; and
- average of at least 4.0/5 across all five dimensions.

Re-run the full set whenever the prompt, schema, or model version changes.

## Blockers or open questions

No product-scope blocker is currently approved. Before public launch, implementation still needs to establish:

- actual token usage and provider cost at 20-, 60-, and 90-minute inputs;
- the selected Gemini model and initial free-tier quota;
- exact source retention/deletion implementation;
- a representative 90-minute generation-duration benchmark;
- the final provider-secret deployment configuration;
- evaluator-owned golden-set materials and scoring workflow.

Do not silently resolve a decision that materially changes scope, privacy, cost, security, schema compatibility, or user experience. Record the decision here and in the relevant planning document.

## Validation and commit

At each handoff, record:

- commands/tests run and their outcome;
- the current branch and latest commit;
- whether the working tree is clean;
- the next task and any blocker.

**Current handoff:** This context file is being added before implementation begins. Update this section after the first build step is completed.
