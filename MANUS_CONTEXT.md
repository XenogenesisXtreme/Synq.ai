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

The `build` branch contains the contract-first browser foundation. The scoped `website` branch now adds a reference-style Synq learning workspace with sidebar navigation, source composer, notebook card, section preview, source context, learning objectives, and review action. It remains fixture-backed; provider, authentication, and persistence routes are not connected yet.

## Next concrete task

Connect the reference-style Workspace on `website` to authenticated source/library state and add the server-side generation procedure while preserving the validated `LectureNote` contract.

## Blockers

Managed Webdev initialization has now been attempted three times and failed at the platform's internal `git_push` stage each time. No managed project or preview is ready. Do not claim managed initialization succeeded or silently switch hosting mode; report the blocker and wait for the Webdev runtime to recover.

## Validation and commit

At every handoff record commands/tests, current branch and commit, clean-tree status, completed work, next task, and blockers. Update this file in the same commit as the implementation it describes whenever possible.

**Latest handoff:** The scoped `website` branch is pushed at the reference-style Workspace commit. Validation passes with `npm test` (3 tests), `npm run check`, and `npm run build`; the public port-3000 preview returns HTTP 200. The original managed Webdev initialization blocker remains recorded; this preview uses the repository Vite server and does not claim managed hosting.
