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
- **Working branch:** `planning`
- **Main branch:** `main`
- **Reference notebook repository:** https://github.com/XenogenesisXtreme/lecture-notebook-ai-mvp

## Current status

Planning is approved and the project is now in active implementation. The `planning` branch remains the durable context/handoff branch; all application implementation belongs on `build`, and `main` remains reserved for the completed product. This branch contains the approved planning set, the Dynamic MPS routing specification, the early orchestration prototype, this handoff, and the authoritative full implementation PDF at `Synq.aifullproductimplementationplan.pdf`.

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
- Branch `planning` was pushed to GitHub and is the branch to use for planning and handoff commits. The current branch tip before this handoff update is `4135b31`.
- The branch already contains `09-rerouting-model-spec.md`, `backend/services/MPSModelRouter.ts`, `backend/services/MPSContractEnforcer.ts`, and `backend/services/SocraticAgentLoop.ts` as an orchestration prototype and specification. These files are not yet production-ready and still require contract tests, provider verification, error hardening, and integration into the application.
- Attempted managed Webdev initialization for `synqai`; attempts failed at the platform internal `git_push` stage and no managed preview should be claimed. The repository Vite preview is usable for local/public development, but managed hosting remains a blocker.

## Next concrete task

After the hosting/build route is confirmed, start implementation with a contract-first browser vertical slice:

1. Inspect the existing repository structure and choose the web app foundation.
2. Add a fixture notebook using the adopted `LectureNote` shape.
3. Add runtime/schema validation for the notebook payload.
4. Render the fixture in a minimal Workspace.
5. Add source creation and persistence boundaries.
6. Add the server-side Master Pedagogy route only after the contract tests exist.
7. Build the golden-set evaluation harness before treating generation quality as complete.

Do not begin with Tauri packaging, audio, Extension work, collaboration, advanced mastery, local AI, or broad file-format support. Do not treat the existing router prototype as a finished provider integration.

## Adopted decisions and constraints

- Initial input: pasted text plus `.txt`/`.md` uploads.
- Audio/video transcription is deferred.
- Start generation synchronously through a server-side Fluid Compute route.
- Benchmark a representative 90-minute lecture; use Inngest or Trigger.dev if the execution ceiling is unreliable.
- Persist durable processing states: `pending`, `processing`, `completed`, `failed`.
- Supabase is now the approved database/auth/storage choice instead of the earlier managed MySQL-compatible assumption. Use Supabase Postgres with Drizzle or the documented server client, RLS, and private Storage buckets.
- The next Manus account has provider and Supabase keys available in its separate secure account/environment. Do not request or paste secret values into this repository, handoff, issue, or chat. Configure them through the secure environment/connector mechanism using `.env.example` as the variable contract. The keys must be configured before testing live Supabase persistence or provider generation; never commit `.env` files or expose service-role/provider keys to browser code.
- Required Supabase variables are `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), and `DATABASE_URL` (server-only).
- Required provider variables when live generation/audio is enabled are `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`, and `ELEVENLABS_API_KEY`; keep all server-side and use mock mode locally when absent.
- The migration is ready for Supabase GitHub integration: repository `XenogenesisXtreme/Synq.ai`, working directory `.`, with production deployment left OFF until the release branch is approved. Supabase watches `supabase/migrations/*.sql`; do not edit the remote production database directly once migration tracking begins.
- Gemini and ElevenLabs credentials are server-side secrets only; never expose them to clients or commit them.
- The Dynamic MPS Router is provider-neutral. Use OpenRouter as the connector when selecting a DeepSeek model through OpenRouter; a separate DeepSeek connector is unnecessary unless Synq.ai later calls DeepSeek directly.
- Candidate routing tiers are Gemini for ingestion and long context, OpenRouter for deep reasoning, Groq for fast Socratic interaction, and Cerebras or another approved compatible provider for fallback. Free-tier limits, privacy terms, commercial usage, and latency must be verified before activation.
- All model output must pass through the versioned MPS contract validator before becoming canonical notebook data. Provider-specific response formats must not leak into the UI or database contracts.
- The learner-facing notebook payload follows the website's `LectureNote` contract. See `12-pre-build-decisions-and-notebook-contract.md` for the full TypeScript shape and compatibility rules.
- Markdown and HTML are derived exports, not the notebook source of truth.
- Browser-first; no full offline-editing promise in the first slice.
- Retain sources and notebooks until user deletion; do not log raw source content by default.
- Export and permanent deletion are required before public launch.
- Audio is on demand, initially one default voice and language, cached per notebook version.
- Mastery starts with transparent quiz correctness and review-history rules.
- Collaboration, Extension, self-hosting, BYOK, and local AI are deferred for the ordinary user experience.
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
- the approved first provider adapter set and verified OpenRouter, Groq, Gemini, and fallback limits;
- end-to-end latency measurement for the Socratic interaction target;
- evaluator-owned golden-set materials and scoring workflow.
- managed Webdev initialization must complete successfully before using its preview or managed checkpoint flow; do not treat the released partial scaffold as a ready project.

Do not silently resolve a decision that materially changes scope, privacy, cost, security, schema compatibility, or user experience. Record the decision here and in the relevant planning document.

## Validation and commit

At each handoff, record:

- commands/tests run and their outcome;
- the current branch and latest commit;
- whether the working tree is clean;
- the next task and any blocker.

**Current handoff:** The active planning branch records that the full implementation PDF is committed here for the next Manus account. Application implementation is on `build` at `5e321d1`, with the reference-style Workspace, locally functional source/file/library/review interactions, `.env.example`, the reference schema at `supabase/001_initial_schema.sql`, and the Supabase-recognized migration at `supabase/migrations/20261002100000_initial_schema.sql`; the build branch passes `npm test`, `npm run check`, and `npm run build`. The `website` branch remains a scoped visual prototype. Supabase/provider secrets are available to the next account through its secure environment, never through Git or this file. Continue from `build`, not from `planning`, and keep `main` untouched until the release gate passes. The working tree must be clean after this handoff commit.
