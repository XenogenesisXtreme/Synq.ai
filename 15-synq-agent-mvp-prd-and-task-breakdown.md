# Synq Agent — MVP PRD and Vertical-Slice Breakdown

**Status:** Proposed, pending product decisions  
**Branch:** `planning`  
**Source docs:** `13-synq-agent-capability-and-architecture.md`, `14-claude-prompt-source-audit-and-synq-requirements.md`  
**Existing app:** `build` branch (React/Vite, TypeScript, Zod, Supabase-oriented server routes, existing MPS router)

## 1. Product definition

Synq Agent is an agent runtime and user-facing task mode within Synq.ai. It accepts a task, creates and executes a bounded plan using permitted tools, observes tool results, verifies the outcome, and returns artifacts and evidence. It is a software capability, not a new foundation model.

### MVP outcome

A user can submit one bounded coding/workspace task and see Synq Agent:
1. understand the requested outcome and constraints;
2. produce a short plan;
3. inspect files in a user-authorized workspace;
4. make file changes through controlled tools;
5. run an allowed validation command;
6. inspect the result and recover from an ordinary tool error;
7. show a diff and verification evidence;
8. stop on cancellation, permission denial, or budget exhaustion.

## 2. Proposed MVP choices (not yet approved)

These defaults are recommended to keep the first slice narrow and testable. They are not adopted decisions.

| Decision | Proposed default | Why |
|---|---|---|
| User surface | Code Bar / coding workspace | Existing Synq product module; clear task boundary |
| First task domain | Coding tasks on a user-provided workspace/repository | Observable outputs and tests make verification possible |
| Model | Use an existing configured server-side provider adapter after checking its contract; no hard-coded model identity | Reuse infrastructure while keeping the runtime provider-neutral |
| Execution | Mock tools in tests; actual shell/file actions in a separate sandboxed runner | Avoid executing untrusted model-generated commands in the Vercel request process |
| MVP tools | workspace list/read, write patch, diff, run approved command, test result | Small, useful, verifiable tool set |
| Task persistence | Durable task record + event log + checkpoint | Required for progress, cancellation, retries, and future long-running jobs |
| Approval | Read-only calls can proceed in the authorized workspace; writes and commands follow explicit permission profile; destructive or external side effects require approval | Bound capability and prevent silent side effects |
| Initial integration | Additive agent module; no replacement of MPS or notebook generation | Keep learning workflow stable |

## 3. User stories

- As a user, I can create an agent task with a goal and optional constraints.
- As a user, I can review the plan before execution when the task is risky or ambiguous.
- As a user, I can see task status, tool activity, and approval requests.
- As a user, I can cancel the task.
- As a user, I can inspect the files changed and see what checks passed.
- As a user, I can understand when Synq Agent could not complete the task and what remains.
- As a user, I can choose whether an agent may write to my workspace and which commands it may run.

## 4. Runtime contracts

### Task
- `id`, `ownerId`, `goal`, `constraints`, `status`, `createdAt`, `updatedAt`
- `plan[]`, `currentStep`, `completionCriteria[]`
- `toolBudget`, `tokenBudget`, `timeBudget`
- `workspaceRef`, `permissionProfile`
- `checkpoint`, `result`, `error`

### Event
- `task.created`, `task.plan.updated`, `task.step.started`
- `tool.call.requested`, `tool.call.approved`, `tool.call.denied`, `tool.call.completed`, `tool.call.failed`
- `task.checkpoint.saved`, `task.approval.required`
- `task.completed`, `task.failed`, `task.cancelled`

Every event is timestamped, tied to a task, and redacted before logging. Tool outputs are marked as untrusted observations.

### Tool result
Return a normalized shape with `ok`, `output`, `error`, `durationMs`, and bounded metadata. Provider-specific tool-call JSON must not leak into app/domain contracts.

## 5. Initial module boundaries

- `agent/contracts`: Zod schemas and TypeScript types for tasks, events, tools, plans, approvals, results.
- `agent/model`: provider-neutral adapter interface; adapters translate native provider responses into normalized assistant/tool-call messages.
- `agent/runtime`: bounded loop and state transitions.
- `agent/tools`: registry, validation, policy gate, dispatcher.
- `agent/workspace`: file operations, patch application, diff, sandbox runner interface.
- `agent/persistence`: task/event/checkpoint persistence abstraction and Supabase implementation only after RLS/ownership is reviewed.
- `agent/ui`: task composer, plan, progress timeline, approvals, result/diff.
- `agent/eval`: deterministic mocked scenarios and safety/quality regression cases.

Keep MPS types, prompts, provider routing, and notebook schemas separate. An agent may call an MPS capability through a deliberate adapter, but MPS must not be embedded inside the general task loop.

## 6. Implementation task breakdown

### A0 — Repository and contract audit
- Inspect current `build` tree, server routes, MPS router, persistence, auth assumptions, UI navigation, and test setup.
- Identify provider adapter shape and whether it supports tool calls.
- Review Supabase schema and RLS implications for agent tasks/events.
- Output: file-level integration plan and list of required migrations.
- Gate: no existing MPS/notebook behavior changed.

### A1 — Runtime contracts and tests
- Define task/event/tool/result schemas.
- Define state transitions and invariants.
- Define budget and cancellation contracts.
- Add unit tests for valid/invalid transitions and budget exhaustion.
- Gate: types and tests compile without live provider credentials.

### A2 — Model adapter and mocked runtime
- Normalize model responses into assistant messages, tool calls, usage, and errors.
- Add deterministic fake model for test cases.
- Implement loop: plan → tool call → observation → continue/replan → verify/finish.
- Add loop/step/token/time limits and bounded retries.
- Gate: mocked task completes, errors recover, infinite loops stop, and completion is not asserted without verification.

### A3 — Tool registry and policy gate
- Register typed tools with input/output validation.
- Enforce permission scope and tool risk tier before dispatch.
- Add approval-required/denied states.
- Treat tool outputs as untrusted data.
- Gate: malformed/unauthorized calls never reach the tool handler.

### A4 — Workspace tools and sandbox adapter
- Implement authorized workspace list/read.
- Implement patch/write with path validation and diff.
- Implement runner interface for approved checks/commands.
- Connect to a separately isolated execution environment; do not execute model-authored commands in the app server process.
- Gate: workspace boundary, path traversal, command timeout, network restriction, and resource-limit tests pass.

### A5 — Persistence and task API
- Persist task, events, checkpoint, and artifact references.
- Add create/status/cancel/result endpoints with auth and owner isolation.
- Ensure idempotency for task creation and event handling.
- Gate: cross-user access denied; cancel and resume state transitions tested.

### A6 — Code Bar UI
- Add task composer and constraint input.
- Render plan, status, progress, tool summaries, approval cards, result, diff, and check results.
- Add cancellation and clear failed/cancelled states.
- Gate: UI never presents an unapproved/failed tool action as completed.

### A7 — Evaluation and security hardening
- Build test cases for tool choice, arguments, recovery, verification, and honesty.
- Add prompt injection cases from source files/tool output.
- Add permission bypass, path traversal, cross-user data, secret leakage, and budget exhaustion cases.
- Measure task success, duration, token/cost use, and error recovery.
- Gate: all critical security tests pass; task success and quality targets are agreed and met.

## 7. MVP acceptance checklist

- [ ] Task create/status/cancel endpoints enforce authentication and ownership.
- [ ] Model adapter can request tools using validated schemas.
- [ ] Agent loop is bounded and deterministic under test.
- [ ] Tool registry blocks unknown, malformed, or unauthorized tools.
- [ ] Workspace operations are confined to user-authorized paths.
- [ ] Command execution occurs only through a separate sandbox.
- [ ] User can inspect planned work, approvals, changes, and verification.
- [ ] Tool output is treated as untrusted content.
- [ ] Completion is based on observable checks.
- [ ] Task events and artifacts are persisted with retention and deletion rules.
- [ ] MPS/notebook routes and schema remain unchanged.
- [ ] Tests run without requiring live secrets.

## 8. Explicitly out of MVP

- General web browsing/research;
- arbitrary browser/computer-use automation;
- external connector writes (email, calendar, cloud files);
- parallel subagents;
- autonomous long-running jobs without user review;
- broad personal memory;
- unrestricted network access;
- self-hosted/local model support;
- claiming equivalence with Claude Fable 5.1 or Codex.

These may be added as separate capability gates after the first coding agent meets acceptance.

## 9. Product sequencing conflict

The existing Synq planning docs state that the lecture-to-notebook core loop and its quality gate are the top implementation priority, with Code Bar sequenced afterward. The user has also requested a complete agent software capability. These priorities can coexist only if the team chooses one of:
- finish the MPS notebook quality gate first, then implement this agent MVP;
- explicitly amend the roadmap and run agent implementation in parallel;
- deliver a smaller agent foundation without disrupting the MPS gate.

**No sequencing change is approved in this document.** Record the user's decision before starting implementation on `build`.

## 10. Proposed first milestone

The first milestone should be **A0 + A1 + A2**: audit current code, land contracts/tests, and demonstrate a mocked bounded agent loop. This proves the core orchestration without selecting a live model provider or exposing the app to arbitrary command execution.

After this milestone, approve the sandbox and provider choices before A3/A4 connect real tools.
