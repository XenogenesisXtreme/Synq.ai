# Synq.ai System Architecture Plan

## Authoritative deployment model

Synq.ai is planned as a downloadable desktop client built with **Tauri + Vite + React**. Tauri supplies the lightweight cross-platform desktop wrapper and Rust-backed native capabilities. Vite and React provide the client interface. Vercel serverless functions act as the secure routing intermediary. Supabase provides authentication, PostgreSQL persistence, Row Level Security, and cloud synchronization. Google Gemini performs pedagogical transformation, and ElevenLabs generates audio recaps using credentials supplied by the user through the BYOK flow.

The application is open-source and self-hostable. The initial operating model is not a centrally funded unlimited AI service. Users who want AI processing configure their own Gemini and, when audio is needed, ElevenLabs keys. A future managed Synq.ai Cloud mode may provide centrally managed credentials under quotas or a paid model, but it is a separate deployment mode and is not required for the first release.

## Request flow

```text
Tauri desktop client
  |  local auth session, local BYOK key retrieval
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

The Tauri client owns the desktop interface, local settings, secure local key handling, and user-initiated requests. Vercel validates and routes requests but does not become the source of truth for product data. Supabase owns identity, synchronization, durable records, ownership, and private files. Gemini owns language transformation and pedagogical generation. ElevenLabs owns text-to-speech. The application domain layer owns orchestration, validation, workflow state, and the Master Pedagogy contract.

The Synq Extension remains a later capture client. It should submit to the same ingestion contract as the desktop client and must never contain provider keys.

## BYOK security model

Gemini and ElevenLabs keys are user secrets. They should be entered through a Settings flow and stored locally using an OS-backed secure credential mechanism exposed through Tauri where practical. Plain localStorage should not be treated as the final secure storage design. Keys must never be written to Supabase, notebook records, logs, analytics, crash reports, source control, or client-visible URLs.

The Vercel route should receive a provider credential only for the duration of a validated request, use it to call the relevant provider, and avoid persisting it. The route should not echo the key or provider response containing sensitive headers. If the final implementation uses direct client-to-provider calls for any operation, that choice must be reviewed separately because it increases exposure and bypasses centralized validation.

## Processing strategy

A notebook request should be represented by a durable job state in Supabase, even if the first implementation uses a synchronous Vercel function. Durable state supports retries, user-visible progress, idempotency, and later migration to a queue. The raw source must be retained independently from generated content so prompts and models can improve later. If the user changes or removes a local key, existing notebooks remain available because generated content is stored separately from credentials.

## Failure handling

If Gemini fails, the source record remains available and the notebook job becomes retryable. If ElevenLabs fails after the notebook is complete, the notebook remains usable and only the podcast job is marked failed. If a user has not configured an ElevenLabs key, audio generation should be disabled with a clear setup explanation rather than making the whole notebook fail. If Supabase sync is temporarily unavailable, the desktop client should define whether it provides a local draft queue or clearly reports that cloud sync is pending.

## Self-hosting modes

The default open-source self-hosted mode consists of the Tauri client, a user-controlled Supabase project, a user-controlled Vercel deployment or compatible serverless host, and user-provided provider keys. An institution may run the same stack with institution-owned credentials. A later local-AI mode could replace Gemini and ElevenLabs with local models, but that requires separate planning for model distribution, hardware requirements, speech-to-text, text-to-speech, licensing, and offline storage.
