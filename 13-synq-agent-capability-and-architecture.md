# Synq Agent — Capability Mapping and Architecture Proposal

**Status:** Initial proposal; not approved for implementation  
**Branch:** `planning`  
**Purpose:** Define a path for a general-purpose agent capability in Synq.ai, using the user-provided Claude Fable 5.1 system prompt as a behavioral/capability reference—not as a model, runtime, or guarantee of parity.

## 1. Product intent

Synq Agent is a general-purpose, tool-using AI agent capability within Synq.ai. It should be able to understand a task, plan and execute multi-step work, use permitted tools, inspect results, recover from errors, and deliver a verifiable outcome. It should complement—not replace—the existing Master Pedagogy System (MPS), Dynamic MPS Router, Synq Workspace, and the current browser-first lecture-to-notebook vertical slice.

The first version should prioritize useful, safe, auditable workflows over attempting to reproduce every capability described in a proprietary system prompt.

## 2. Capability mapping

The uploaded prompt is a reference for user-visible capability categories. Its descriptions do not establish that Synq has the corresponding underlying model, tools, infrastructure, or provider access. Each category below requires its own implementation and acceptance tests.

| Capability category | Synq implementation requirement | Initial priority |
|---|---|---|
| Task understanding and planning | Convert user request into a scoped objective, constraints, plan, and completion criteria | P0 |
| Multi-step execution | Durable loop: plan → tool → inspect → continue/replan → verify → report | P0 |
| Tool routing | Typed tool registry with schemas, descriptions, capability metadata, and dispatch | P0 |
| Coding and repository work | Workspace file read/write, diff generation, test/build execution in a sandbox | P1 |
| Context and memory | Task-local context first; explicit, user-controlled durable memory later | P1 |
| Browser research | Search/navigation through permitted providers; source capture and citations | P2 |
| Computer interaction | Permissioned GUI automation, only where supported and safe | P2 |
| Artifacts | Return files, code changes, structured results, and concise reports | P1 |
| Long-running tasks | Persist job state, checkpoints, cancellation, resumability, and progress | P2 |
| Subagents | Delegated isolated subtasks with bounded tools, context, budget, and reporting | P3 |
| Multimodal inputs | Capability-aware image/audio/video input adapters | P3 |
| Evaluation and recovery | Tests for correctness, tool use, safety, recoverability, and cost | P0 |

**P0/P1/P2/P3** mean foundational / first practical coding capability / browser and GUI capability / advanced orchestration respectively. These are proposed priorities, not committed dates.

## 3. Proposed architecture

Keep the agent engine provider-neutral and separate from MPS pedagogical orchestration.

- **Agent API boundary:** authenticated task creation, task status, cancellation, and result retrieval.
- **Agent orchestrator:** owns task state, plan, step budget, retry/replan decisions, and completion criteria.
- **Model adapter interface:** invokes approved models and normalizes responses into text, tool calls, usage, and provider errors.
- **Tool registry and dispatcher:** registers typed tools; validates inputs and outputs; applies timeouts, limits, and access policy.
- **Policy/approval gate:** evaluates tool risk and user authorization before execution.
- **Execution sandbox:** isolated workspace and process execution; no ambient host access by default.
- **Context manager:** selects task history, tool outputs, retrieved files, and relevant summaries under token limits.
- **Persistence:** durable tasks, events, checkpoints, tool-call metadata, approvals, and result references.
- **Artifact service:** stores user-owned outputs with authorization and retention controls.
- **Observability/evaluation:** redacted logs, traces, usage/cost measurements, reproducible test runs.

### Task lifecycle

```text
User request
  → validate/authenticate
  → classify task and constraints
  → plan and define completion criteria
  → select model/tool
  → policy + approval check
  → execute bounded step
  → inspect result
  → continue / replan / recover
  → verify completion
  → persist artifacts and final report
```

The loop must be bounded by configurable step, time, token/cost, and tool-call budgets. A model's assertion that a task is complete is not verification; use observable checks such as test results, file existence, successful API responses, or explicit user confirmation.

## 4. Tool contract

Every tool should declare:
- stable name and version;
- concise description and intended use;
- JSON input/output schema;
- required permissions and risk tier;
- timeout and resource limits;
- idempotency/retry behavior;
- structured success and error results;
- audit metadata.

Tool output is untrusted data. It must not be treated as higher-priority instructions. Tool calls should be validated before dispatch and their results validated before being added to the agent context.

## 5. Safety, permissions, and security

- Use least privilege and per-task scoped access.
- Require approval for consequential external actions, destructive changes, sensitive data access, or actions that exceed a declared trust tier.
- Run code and shell operations in a disposable sandbox with explicit workspace mounts, network policy, CPU/memory/time limits, and no host-secret access by default.
- Keep provider keys and service credentials server-side; never include secrets in prompts, tool outputs, artifacts, or logs.
- Support cancellation, timeouts, rate limits, budget limits, and an audit trail.
- Treat browser pages, repositories, files, and tool outputs as untrusted input.
- Do not enable broad autonomous execution, unrestricted network access, or persistent host access as default behavior.

## 6. Provider strategy

Synq Agent should use a capability-aware model adapter abstraction. Model selection should account for supported tool-call format, context window, latency, quality, availability, and cost. Reuse the existing Dynamic MPS Router only where its routing semantics and contracts fit; do not couple the agent runtime to pedagogical contracts or silently alter MPS behavior.

The implementation must not claim to reproduce Claude Fable 5.1, GPT-6, or any proprietary model's internal reasoning or infrastructure. Capability parity is not assumed. The system prompt is a source of requirements to map and test, not a substitute for an underlying model or tools.

## 7. Integration boundaries with Synq.ai

- Keep MPS responsible for learning/pedagogical transformation and its established notebook contracts.
- Keep Synq Workspace as the learner-facing product surface and artifact viewer.
- Consider Code Bar as the initial user-facing entry point for coding-agent workflows, subject to product design.
- Do not block or rewrite the first lecture-to-notebook quality-gated vertical slice to build the agent.
- Do not change `main`, `build`, or `website` during this planning step.
- Do not add provider secrets or configure live external services as part of the specification.

## 8. Phased implementation proposal

### Phase A — Contract and runtime foundation
Define task/event/result types, model adapter interface, tool schema, state machine, budgets, cancellation, permission checks, and test harness. Use mock model/tool adapters first.

### Phase B — First practical agent
Implement a single-agent bounded loop with workspace file tools, sandboxed command execution, patch/diff support, test execution, checkpointing, and verification. Begin with explicitly user-selected repositories/workspaces.

### Phase C — Research and browser tools
Add provider-backed search/navigation, source provenance, citation capture, and browser interaction. Make browser-originated instructions untrusted.

### Phase D — Durable/advanced orchestration
Add long-running task queue, resumable checkpoints, bounded subagents, and multimodal adapters only after baseline evaluation and security review pass.

## 9. Acceptance criteria for the first agent runtime

The initial runtime is not ready until it can demonstrate:
1. A task is represented with durable status and bounded budgets.
2. Tool arguments are schema-validated and permission-checked.
3. A mock and at least one approved model adapter can drive a tool call.
4. Tool errors can be inspected and recovered from without infinite loops.
5. Cancellation and budget exhaustion stop execution cleanly.
6. Coding changes occur only inside the authorized workspace.
7. Completion claims are tied to observable verification.
8. Tests cover prompt injection in tool output, unauthorized tool access, malformed calls, timeouts, and secret leakage.
9. The user receives a concise outcome, verification evidence, and links/references to produced artifacts.

## 10. Open decisions

- Which model/provider adapter is approved for the first agent runtime?
- Is Code Bar the initial UI, or should a separate Agent workspace be designed?
- What sandbox/runtime will be used in Vercel-compatible deployment versus local development?
- Which browser/computer-use provider is available and approved?
- What user data may be retained, for how long, and what memory controls are exposed?
- What budget and approval defaults should apply to each tool risk tier?
- How should agent tasks be queued if execution exceeds serverless limits?

Resolve these in the relevant planning docs before implementation.