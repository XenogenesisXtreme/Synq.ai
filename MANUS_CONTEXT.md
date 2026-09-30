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

Branch separation is complete. The `build` branch is based on `main` and contains no numbered planning documents. The `planning` branch retains the complete planning package. The first implementation step has not started.

## Next concrete task

Initialize the browser app foundation in this branch, then add the `LectureNote` fixture and schema validation before connecting any provider.

## Blockers

Managed Webdev initialization was attempted twice and failed at the platform's internal `git_push` stage. No managed project or preview is ready. Do not claim managed initialization succeeded or silently switch hosting mode; retry through the Webdev flow or report the blocker.

## Validation and commit

At every handoff record commands/tests, current branch and commit, clean-tree status, completed work, next task, and blockers. Update this file in the same commit as the implementation it describes whenever possible.

**Latest handoff:** Branch separation was validated with `git ls-tree` and pushed. Current branch is `build` at commit `cafeeb3`; the working tree is clean. The numbered planning documents are on `planning` at `4135b31`. No application code has been added yet because managed Webdev initialization failed twice at its internal `git_push` stage.
