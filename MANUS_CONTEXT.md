# Synq.ai Manus Build Handoff

> Every Manus session working on the `build` branch must read this file first and update it after every meaningful implementation change, decision, test result, blocker, or handoff.

## Branch layout

- **Build branch:** `build` — implementation work only; branch from `main`.
- **Planning branch:** `planning` — approved planning documents and the full decision record.
- **Repository:** https://github.com/XenogenesisXtreme/Synq.ai
- **Planning branch URL:** https://github.com/XenogenesisXtreme/Synq.ai/tree/planning

The planning documents are intentionally kept on `planning`, not duplicated into the build branch. Read them from the planning branch when needed, especially `12-pre-build-decisions-and-notebook-contract.md`. The build branch should contain implementation files plus this handoff file, not the numbered planning documents.

## Approved implementation target

Build the browser-first vertical slice:

```text
pasted lecture text or .txt/.md upload
  → source record
  → Master Pedagogy generation
  → stored LectureNote-compatible notebook
  → rendered Workspace
```

Start contract-first: fixture notebook, runtime/schema validation, contract tests, then Workspace rendering, source persistence, and server-side generation.

## Constraints

- Initial input is pasted text plus `.txt`/`.md` uploads.
- The learner-facing JSON must remain compatible with the `LectureNote` contract from `lecture-notebook-ai-mvp/client/src/lib/lecture.ts`.
- Markdown and HTML are derived exports, not the source of truth.
- Gemini and ElevenLabs credentials are server-side only.
- Start synchronous generation through a server-side route; benchmark a 90-minute lecture before considering a durable job runner.
- Do not begin Tauri, audio, Extension, collaboration, advanced mastery, local AI, or broad file-format support until the core loop clears the golden-set gate.
- Do not put secrets in this file.

## Quality gate

Use a 15–20 item golden set and score factual accuracy, faithfulness, pedagogical clarity, completeness, and uncertainty handling. The core loop needs no factual-accuracy or faithfulness score below 3/5 and at least a 4.0/5 average across all five dimensions.

## Current status

The `build` branch contains the contract-first browser foundation and the reference-style Synq learning workspace with sidebar navigation, source composer, notebook card, section preview, source context, learning objectives, and review action. It now also contains the server-side provider router, contract-validated generation orchestration, Supabase REST persistence adapter, bearer-token authentication boundary, processing-state transitions, and a root `vercel.json` deployment configuration. The UI remains fixture-backed until the authenticated route is connected to the deployed client.

## Next concrete task

Connect the Workspace source composer to `handleGenerateNotebook`, configure the deployment's Supabase server variables, and run limited live OpenRouter/Groq validation through the server boundary. Then add authenticated source/library queries and begin the fixed 15–20 item golden-set evaluation. Keep Cerebras disabled unless separately approved and configured.

## Blockers

Managed Webdev initialization has now been attempted three times and failed at the platform's internal `git_push` stage each time. No managed project or preview is ready. Do not claim managed initialization succeeded or silently switch hosting mode; report the blocker and wait for the Webdev runtime to recover.

The current secure environment has Gemini, ElevenLabs, OpenRouter, and Groq credentials available; Cerebras is intentionally not configured. Secret values must remain outside Git, handoff files, and browser code.

## Validation and commit

At every handoff record commands/tests, current branch and commit, clean-tree status, completed work, next task, and blockers. Update this file in the same commit as the implementation it describes whenever possible.

**Latest handoff:** The reference-style Workspace was brought into `build`, server-side routing/persistence boundaries plus orchestration tests were added, and `vercel.json` was added for Vite deployment. Validation passes with `npm test` (5 tests), `npm run check`, `npm run build`, and `git diff --check`. The original managed Webdev initialization blocker remains recorded; repository Vite development is not managed hosting. Commit and push this handoff together with the implementation, leave `main` untouched, and record the resulting commit hash here.
