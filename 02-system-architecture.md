# Synq.ai System Architecture Plan

## Authoritative deployment model

Synq.ai is planned as a cloud-hosted learning service with a browser Workspace and a downloadable desktop client built with **Tauri + Vite + React**. Tauri supplies the lightweight cross-platform desktop wrapper and Rust-backed native capabilities. Vite and React provide the shared client interface. Vercel hosts the web application and serverless API routes. Supabase provides authentication, PostgreSQL persistence, Row Level Security, private storage, and synchronization across clients. Google Gemini performs pedagogical transformation, and ElevenLabs generates audio recaps using Synq.ai-managed server credentials.

The normal user experience is not BYOK. Users sign in, use the hosted application, and do not source or enter Gemini or ElevenLabs keys. Synq.ai must control quotas, rate limits, abuse prevention, and provider costs. A later operator or self-hosted deployment may configure its own provider credentials, but that is separate from the ordinary downloadable client experience.

## Request flow

```text
Browser or Tauri desktop client
  |  authenticated session
  v
Vercel serverless routing function
  |  request validation and provider relay
  +--> Gemini: pedagogical transformation
  +--> ElevenLabs: audio synthesis when requested
  |
  v
Supabase Auth / Postgres / Storage
  |  sync notebooks, notes, processing metadata, and audio references
  v
Synq Workspace, Lecture Lens, MPS, Synq Mastery, and Code Bar
```

For a lecture upload, the planned flow is:

```text
User-provided text or optional file
        |
        v
Lecture Lens source record and timestamps where available
        |
        v
Master Pedagogy contract and Gemini processing
        |
        v
Structured notebook blocks + rendered Markdown
        |
        +--> quizzes, cheat sheet, mastery records
        +--> optional ElevenLabs audio recap
```

## Service boundaries

The Tauri client owns the desktop interface, local settings, and user-initiated requests. Vercel validates and routes requests but does not become the source of truth for product data. Supabase owns identity, synchronization, durable records, ownership, and private files. Gemini owns language transformation and pedagogical generation. ElevenLabs owns text-to-speech. The application domain layer owns orchestration, validation, workflow state, and the Master Pedagogy contract.

The Synq Extension remains a later capture client. It should submit to the same ingestion contract as the desktop client and must never contain provider keys.

## Managed-provider security model

Gemini and ElevenLabs keys are Synq.ai operational secrets. They must remain in protected Vercel or deployment-secret storage and must never be exposed to browser code, the Tauri bundle, notebook records, logs, analytics, crash reports, source control, or client-visible URLs.

The Vercel route should use the managed provider credential for the duration of a validated request and avoid exposing or persisting it in application data. The route should not echo the key or provider response containing sensitive headers. Provider calls must pass through the server-side boundary so quotas, validation, and abuse controls remain enforceable.

## Processing strategy

A notebook request should be represented by a durable job state in Supabase, even if the first implementation uses a synchronous Vercel function. Durable state supports retries, user-visible progress, idempotency, and later migration to a queue. The raw source must be retained independently from generated content so prompts and models can improve later. Existing notebooks remain available during provider outages or quota limits because generated content is stored separately from provider operations.

## Failure handling

If Gemini fails, the source record remains available and the notebook job becomes retryable. If ElevenLabs fails after the notebook is complete, the notebook remains usable and only the podcast job is marked failed. If the service quota is reached, the client should show a clear limit state rather than requesting a user key. If Supabase sync is temporarily unavailable, the desktop client should define whether it provides a local draft queue or clearly reports that cloud sync is pending.

## Deployment modes

The default public experience consists of the hosted Vercel and Supabase services plus browser and downloadable Tauri clients. An institutional deployment may run an isolated copy with institution-owned provider credentials. An operator self-hosting the open-source stack may configure its own Gemini and ElevenLabs credentials; this is an administrative deployment concern, not a user-facing BYOK requirement. A later local-AI mode could replace Gemini and ElevenLabs with local models, but that requires separate planning for model distribution, hardware requirements, speech-to-text, text-to-speech, licensing, and offline storage.
