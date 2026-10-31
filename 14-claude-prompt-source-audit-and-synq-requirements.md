# Claude Fable 5.1 Prompt — Source Audit and Synq Agent Requirements

**Status:** Source-grounded requirements draft; not approved for implementation  
**Source:** User-uploaded `Pasted text(1).txt` (8,742 lines)  
**Related proposal:** `13-synq-agent-capability-and-architecture.md`  
**Scope:** Option B — complete agent software, using the uploaded prompt as a reference for behavior and tool capability. This document is an analysis, not a reproduction of the prompt.

## 1. Read this source correctly

The uploaded material is not only a conversational system prompt. It includes:
- behavioral and response requirements;
- safety/refusal and epistemic requirements;
- a persistent memory filesystem contract;
- many tool schemas and usage instructions;
- tool-specific behavior for artifacts, shell, files, web search/fetch, image search, MCP/plugin/skill discovery, visualizations, interactive UI, and connected services;
- product-specific instructions for Anthropic/Claude.

It describes a configured Claude environment. It does **not** prove that Synq has access to the same model weights, API, tools, provider services, UI capabilities, or policies. Treat its tools as reference capabilities to implement, connect, or explicitly defer. Do not lift Anthropic-specific product claims, proprietary model identifiers, or Claude-specific API behavior into Synq's product.

## 2. Capability inventory and traceability

| Source capability cluster | What the source requires the assistant to do | Synq requirement | Proposed component | Priority |
|---|---|---|---|---|
| Behavioral core | Warm, direct, concise by default; adapts depth to request; constructively corrects mistakes; handles multi-turn work | Configurable response policy with task-aware length, tone, clarity, correction, and continuation behavior | Response policy + conversation runtime | P0 |
| Epistemic behavior | Search when facts are current, unfamiliar, or likely changed; distinguish uncertain from verified; use best tool | Query-aware freshness routing, evidence-backed responses, confidence/unknown handling; avoid hallucinated tool state | Evidence planner + search policy | P0 |
| Safety/refusal | Safety constraints, careful handling of minors, harmful requests, privacy, copyright, and respectful refusal | Central policy gate before generation and before tool execution; safety regression suite | Policy service + safety evals | P0 |
| User context/memory | Persistent memory files, relevance-based use, explicit read/write/update/delete, version-aware writes, privacy constraints | User-controlled memory with permissions, provenance, relevance, deletion, version conflict protection, and non-instructional data handling | Memory service | P1 |
| Artifact creation | Publish web artifacts/documents/apps; list/read/update existing artifacts; optional capabilities, database, assets | Synq artifacts for deliverables, with owner checks, versioning, supported types, explicit runtime capabilities, and artifact opening | Artifact service + renderer | P1 |
| Code execution | Shell command tool, file creation, viewing files/directories; code-generated artifacts | Isolated workspace with command execution, file operations, diffs, test/build outputs, and resource limits | Sandbox + workspace tools | P1 |
| Web research | Web search and fetch, search-first URL discipline, current-source validation, citations | Search/fetch adapters, URL validation, provenance and citations, prompt-injection isolation | Web research tools | P2 |
| Visual retrieval | Image search when useful; use visuals to support comprehension | Optional image search/retrieval with source attribution and license/provider constraints | Image search adapter | P2 |
| Tool discovery | Search MCP registry, plugins, skills; connect relevant integrations | Discover tools/connectors/skills based on task; present consent/connection controls; avoid implying unavailable tools exist | Connector registry + capability discovery | P2 |
| Connected app actions | Gmail, Calendar, Drive, and other tool integrations; read/write semantics and user-specific permissions | Typed connector adapters, scoped OAuth, read/write permission levels, confirmations for consequential actions, auditable calls | Connector runtime | P2 |
| Interactive UI | Ask-user-input options, charts, quiz, product/places cards, itineraries, visual widgets | A rendering protocol with typed artifact/UI components; avoid hardcoding source-specific display widgets | UI/Artifact renderer | P2 |
| Delegation | Product descriptions mention agentic coding, knowledge work, browser/spreadsheet/slides agents, remote delegation | Bounded task delegation to worker agents/tools, not merely a single prompt chain | Subagent scheduler | P3 |
| Tool-call communication | Short progress updates during multi-tool work; answer after tools; avoid redundant repetition | Event-based progress updates and concise final outcome with results/evidence | Task event stream + response composer | P0 |
| Context continuity | Persistent memory and long-conversation reminders; memory read when relevant | Task state, summaries, retrieval, context budgets, explicit continuity controls | Context manager + memory | P1 |

### Evidence anchors in the source

The uploaded prompt's relevant sections include:
- `# claude_behavior` and its subsections on product information, refusal handling, tone/formatting, wellbeing, and responding to mistakes;
- `# memory_filesystem`, including memory read/write/append/list/delete and privacy/application rules;
- `# Tools`, with schemas for Artifact and other tools;
- tool sections for `bash_tool`, `create_file`, `image_search`, `present_files`, `search_mcp_registry`, `search_plugins`, `search_skills`, `view`, `web_fetch`, and `web_search`;
- interactive and display tools including `ask_user_input_v0`, `chart_display_v0`, `mcp__visualize__show_widget`, `quiz_display_v0`, and other domain-specific displays;
- later `mcp__...` tool definitions for connected services, including Google Drive, Gmail, and Google Calendar;
- `# anthropic_api_in_artifacts`, which describes an Anthropic-specific capability and is not a provider-neutral Synq requirement.

## 3. Requirements that should become implementation contracts

### A. Agent loop and task state

A task needs durable states and events, at minimum:
- `queued`, `running`, `waiting_for_approval`, `completed`, `failed`, `cancelled`;
- plan/step state, tool-call request and validated arguments;
- result/error observations;
- budget consumption and deadline;
- checkpoints and resume position;
- completion evidence.

The runtime must stop or request approval when limits are reached. Retries must be bounded and respect idempotency. A model-generated "done" is not sufficient proof.

### B. Tool registry and dispatch

Each tool adapter must expose a stable name/version, description, input/output schema, permission scope, risk tier, timeout, budget, network/filesystem boundaries, idempotency, and structured error contract.

The dispatcher must:
1. validate the tool call;
2. check user/task authorization;
3. run policy and approval checks;
4. invoke only the registered adapter;
5. validate and classify the result;
6. add the observation to task context as untrusted data;
7. emit an auditable event.

### C. Memory

Memory must not be a hidden, unbounded chat transcript. Provide explicit user controls and:
- separated profile/preferences/project/task memory;
- source/provenance and timestamps;
- relevance-aware retrieval;
- versioned writes and conflict handling;
- explicit deletion and retention behavior;
- privacy and safety policy enforcement;
- instruction/data separation so stored content cannot override system policy.

### D. Workspace and execution

The source describes shell/file tools, not a secure sandbox architecture. Synq must design the sandbox itself:
- disposable task workspace;
- only explicitly mounted files/repositories;
- no ambient host access;
- network denied by default or allowlisted;
- CPU, memory, process, file-size, and wall-clock limits;
- secret redaction and no secret injection by default;
- user-visible diffs and test output;
- approval gates for destructive writes, external side effects, and privilege escalation.

### E. Research and evidence

Search/fetch tools should preserve the source URL, title, retrieval time, and relevant excerpts. Web content must be treated as untrusted data, not as agent instructions. Use citations in user-facing research results. The agent must not fabricate that it searched, fetched, ran, or verified something.

### F. Artifacts and user-facing UI

Artifacts are a major source capability, not an afterthought. Synq should support a deliverable model that can represent:
- documents and reports;
- code files and diffs;
- structured datasets and exports;
- static or interactive web artifacts;
- charts and visualizations;
- quizzes/learning artifacts when appropriate to Synq's core learning product.

Artifact access, ownership, update, sharing, and embedded capabilities must be explicit. An artifact must not silently gain access to private data or tools.

## 4. Product behavior vs platform capability

The source mixes rules for assistant behavior with actual tool capabilities. Synq should keep these separate:

**Behavioral policy** (model-agnostic):
- clarity, warmth, concision, constructive disagreement;
- refusal and safety handling;
- privacy and memory-use principles;
- freshness/evidence discipline;
- citation and copyright practices;
- progress and final-result communication.

**Platform/tool capability** (must be implemented or connected):
- shell and file access;
- artifact publish/read/update;
- web search/fetch;
- memory filesystem;
- MCP/plugin/skill discovery;
- connected app actions;
- visual/interactive rendering;
- subagent/delegation infrastructure.

The behavior layer must degrade honestly when a tool is absent. It should say it cannot perform a tool action rather than simulate success.

## 5. Proposed rollout mapped to this source

### P0 — Behavior and runtime skeleton
- model adapter interface;
- task state machine and bounded execution loop;
- tool registry/dispatcher;
- policy/permission/approval gate;
- progress events and final response composer;
- eval harness for tool correctness, safety, and honest reporting.

### P1 — Workspace and memory
- sandboxed workspace file tools;
- patch/diff, tests, and command execution;
- durable task checkpoints;
- memory read/write with user controls, provenance, and conflict safety;
- artifact service for files and document-style deliverables.

### P2 — Research and integrations
- web search/fetch and citation provenance;
- connector/plugin/skill discovery;
- first approved external app connector;
- charts, visualizations, and interactive artifact protocol.

### P3 — Advanced delegation
- subagents with explicit task scopes and tool subsets;
- task queue, cancellation, resumability;
- browser/computer-use provider;
- specialized spreadsheet/slides/research agents if demand and product fit justify them.

## 6. Security and evaluation implications

The prompt contains extensive safety, privacy, memory, and untrusted-content instructions. Synq should not implement these solely as prompt text. Enforce critical controls in application code:
- tool permission checks;
- scoped connector credentials;
- policy decisions and approval workflow;
- sandboxing;
- memory write validation;
- data retention and deletion;
- event audit and redaction.

Evaluation should include:
- correct tool choice and argument construction;
- task success with independent verification;
- recoverability from tool errors and partial failures;
- no false claims of execution or success;
- prompt injection in files, pages, connectors, and artifacts;
- authorization bypass and cross-user data isolation;
- memory privacy/relevance/deletion;
- safety regression cases;
- latency and cost per completed task.

## 7. Scope boundaries and non-goals

- This is not a request to copy Claude's prompt or create a Claude-branded clone.
- Synq must not claim to be Claude Fable 5.1, GPT-6, or equivalent.
- The prompt's Claude-specific product facts, internal tool names, Anthropic endpoint behavior, and account-specific tool availability are not portable requirements.
- Do not promise parity with tools that are not implemented and enabled.
- Do not replace the existing MPS pipeline. The general agent runtime is separate and can call MPS as an approved domain tool when the user task requires learning/pedagogical generation.
- Keep the currently approved lecture-to-notebook vertical slice as the implementation priority unless the user explicitly changes that decision.

## 8. Decisions needed before coding

1. Agent UI entry point: Code Bar, separate Agent workspace, or both?
2. Initial model provider/model and supported tool-call format?
3. First workspace execution target and sandbox design?
4. Which tools ship in the first MVP: files/shell, artifact, web search, connectors?
5. What is the first end-to-end task that should pass acceptance tests?
6. Should agent implementation run in parallel with the MPS notebook gate, or wait for it?
7. Which memory classes are in MVP and what is the default retention/deletion behavior?
8. Which external connector is first, and what scopes are allowed?

## 9. Recommended next concrete task

Create an implementation-ready agent PRD and vertical-slice issue breakdown after deciding the initial UI, model, sandbox, and MVP tool set. The first vertical slice should be one bounded, user-authorized task in a workspace: plan → read/write files → run a permitted check → verify output → return diff and evidence. Keep web research, connector write actions, subagents, and computer use behind later gates.

## 10. Validation status

- Read the uploaded source's behavioral sections, memory contract, Artifact tool description, shell/file tool definitions, search/fetch tools, connector/plugin/skill discovery, interactive display tool definitions, and representative connected-service tool definitions.
- This document synthesizes capability requirements; it does not reproduce the uploaded prompt.
- No application code or tests changed as part of this source audit.
