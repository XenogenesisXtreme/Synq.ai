# Dynamic Master Pedagogy Model Routing Plan

## Purpose

The Dynamic MPS Router is the provider-neutral orchestration layer between Synq.ai learning workflows and external language models. It chooses an appropriate model for ingestion, deep pedagogical transformation, or fast interaction; validates the result; retries transient failures; and fails over to a compatible provider when necessary.

This is a design document only. It does not commit Synq.ai to one provider, one free tier, or one model name. Provider availability, pricing, limits, privacy terms, and model quality must be verified before implementation and rechecked during operation.

## Recommended provider abstraction

Synq.ai should integrate providers through adapters that implement one internal contract. The application should depend on capabilities rather than provider-specific response formats.

```text
MPS task
  |
  v
MPSModelRouter
  |
  +--> capability policy
  +--> provider health and rate-limit state
  +--> model selection
  +--> retry and backoff
  +--> structured-output validation
  +--> fallback chain
  |
  v
Provider adapter
  |
  v
Normalized MPS result
```

The initial adapter candidates are:

| Capability tier | Candidate route | Responsibility |
|---|---|---|
| Ingestion and long context | Google Gemini through Google AI Studio | Normalize long transcripts, PDFs, and unstructured source material; preserve source references and timestamps where available. |
| Deep pedagogical reasoning | OpenRouter model route, initially a DeepSeek or Llama reasoning model if approved | Execute first-principles decomposition, concept mapping, misconception audits, and structured notebook generation. |
| Fast interaction | Groq model route | Power short Socratic turns, instant knowledge checks, and low-latency feedback. |
| Fallback reasoning | Cerebras or another approved compatible provider | Continue a compatible task when the primary reasoning route is unavailable or rate-limited. |

These are candidate roles, not guaranteed free infrastructure. Free tiers can change, impose quotas, queue requests, restrict commercial usage, or provide different privacy terms. The router must be able to disable a provider without changing the notebook or mastery domain contracts.

## OpenRouter versus DeepSeek

For the proposed use of a DeepSeek model through OpenRouter, Synq.ai needs an **OpenRouter provider adapter**, not a separate DeepSeek connector. OpenRouter is the transport and model-routing service; DeepSeek is the model vendor or model identifier selected within that route.

A separate DeepSeek adapter becomes useful only if Synq.ai calls a DeepSeek-hosted API directly. Direct access may provide different pricing, limits, data handling, or model availability, but it would create another integration and operational surface. The first implementation should keep one `OpenRouterAdapter` and represent the selected model as configuration.

## Task classes

The router should classify work into explicit task classes:

- `ingest_source`: clean, normalize, chunk, and map source material.
- `generate_notebook`: produce validated pedagogical blocks.
- `generate_assessment`: produce quizzes and answer explanations.
- `generate_cheat_sheet`: compress completed learning material.
- `socratic_turn`: respond to a learner interaction quickly.
- `evaluate_answer`: assess an answer and update concept evidence.
- `code_assistance`: explain, generate, or review code within Code Bar.

Each class should declare a context budget, latency preference, reasoning level, required output schema, retry policy, and allowed fallback chain.

## Routing policy

The router should select a provider using task requirements, not a hard-coded preference. Relevant signals include context size, expected output length, structured-output capability, latency target, current queue or rate-limit state, recent error rate, privacy policy, and estimated cost. A provider should be marked unavailable when its credentials, quota, health check, or policy configuration makes it unsuitable.

The router should return routing metadata such as provider adapter, model identifier, attempt number, fallback reason, and latency. This metadata is for sanitized observability and must not contain provider secrets or unnecessary source content.

## Resilience circuit

Transient provider failures should use bounded exponential backoff with jitter. Rate-limit responses should respect provider retry hints when available. A failed primary route should move to a compatible fallback rather than blindly retrying the same unavailable provider. The router must avoid a fallback loop and should stop after a bounded number of attempts.

Heavy notebook, quiz, and cheat-sheet jobs should use durable processing states: `pending`, `processing`, `completed`, and `failed`. Fast Socratic turns may be synchronous, but mastery updates should be persisted idempotently so a repeated request does not double-count evidence.

## Contract enforcement

Every model response must be normalized and validated against a versioned Synq.ai schema. The router must reject malformed JSON, unknown block types, missing required fields, invalid source references, and unsafe oversized output. A repair attempt may be allowed under a separate bounded budget, but the client must never receive unvalidated model output as canonical notebook data.

The canonical notebook block vocabulary includes `orientation`, `objective`, `definition`, `explanation`, `example`, `comparison`, `process`, `formula`, `misconception`, `connection`, `knowledge_check`, `summary`, and `revision_prompt`.

## Socratic interaction loop

```text
Learner response
      |
      v
Socratic task classifier
      |
      v
Fast interaction route
      |
      v
Feedback + next question + concept evidence
      |
      +--> client response
      +--> idempotent mastery event
```

The under-500ms target should be treated as a product goal for eligible short interactions, not a guaranteed provider property. End-to-end latency includes network time, model generation, validation, persistence, and rendering. The client should show immediate state feedback and support cancellation or continuation when a response takes longer.

## Implementation boundary

The router should be a server-side service class or module such as `MPSModelRouter`. It should expose domain-level methods and hide provider SDK details. A conceptual interface is:

```text
route(taskClass, input, options) -> NormalizedMPSResult
health() -> ProviderHealthSnapshot
```

The first implementation should not hard-code free-tier claims, expose provider keys to clients, or couple the notebook renderer to OpenRouter, DeepSeek, Groq, Cerebras, or Gemini response formats.
