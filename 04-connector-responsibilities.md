# Synq.ai Connector Responsibilities

## Responsibility principle

Each connector should perform one kind of work and return a small, stable contract. Synq.ai application code should own orchestration, validation, user authorization, and product decisions. Providers should not become the source of truth for Synq.ai domain state.

## Connector matrix

| Connector or runtime | Job | Credential model | Must not own |
|---|---|---|---|
| Tauri + Vite + React | Desktop client, local settings, UI, and native secure-key bridge | No provider credential ownership in the UI bundle | Pedagogical truth, cloud ownership, or raw provider secrets in ordinary storage |
| Google Gemini | Transform lecture material into pedagogical structures and learning activities | User-provided BYOK Gemini key | Authentication, ownership, storage, or direct uncontrolled browser access |
| Supabase Auth and Database | Identity, PostgreSQL persistence, RLS, and cloud synchronization | User-controlled Supabase project credentials | Pedagogical reasoning or audio synthesis |
| Supabase Storage | Private audio and learning-asset storage | User-controlled Supabase project | Access decisions without application and storage policies |
| ElevenLabs | Convert an approved audio-ready script into speech | User-provided BYOK ElevenLabs key | Notebook structure, mastery state, or user permissions |
| Vercel | Secure serverless routing intermediary | Deployment owner configures server environment | Long-term data ownership or provider-specific product logic |
| Synq Extension | Capture permitted browser context and submit it to Synq.ai | No provider API keys | Authoritative learning records or secret storage |

## Gemini contract

Input should include the source transcript, a versioned Master Pedagogy instruction set, desired learner context when available, and output constraints. Output should be validated structured content, not blindly trusted markdown. The response should preserve uncertainty and source references when the model cannot establish a claim confidently.

## Supabase contract

The application should use Supabase through typed data-access functions. These functions should expose domain actions such as create lecture source, update processing status, save notebook, create podcast record, synchronize notes, and record assessment attempts. Provider-specific database details should remain inside the data-access layer. Provider API keys must not be stored in Supabase.

## ElevenLabs contract

The audio layer should accept a clean spoken script rather than arbitrary interface markdown. It should return an audio object or provider response that can be uploaded to private storage. If no ElevenLabs key is configured, the application should explain how to configure one and leave the notebook available.

## Vercel contract

Vercel server routes should authenticate the caller, validate payload size and shape, receive a BYOK credential only for the current provider call, invoke the provider, and return stable application responses. They should not persist, log, or expose provider keys. They should not expose provider error bodies directly. Long-running generation should eventually move to a queue or background job if serverless execution limits make synchronous processing unreliable.

## Local key-management contract

The Tauri layer should expose a minimal command or plugin interface for storing, retrieving, testing, and deleting provider keys from an OS-backed secure store. React components should never write keys to ordinary localStorage as the final implementation. The key manager should return a masked status such as configured or not configured, not the raw secret.

## Extension contract

Synq Extension should submit an authenticated capture package containing source type, title, URL where permitted, captured text or transcript, timestamps, and user-selected metadata. Recording permissions, platform restrictions, and consent handling must be explicit. The extension should be replaceable without changing the notebook or mastery domain contracts.
