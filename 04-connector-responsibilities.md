# Synq.ai Connector Responsibilities

## Responsibility principle

Each connector should perform one kind of work and return a small, stable contract. Synq.ai application code should own orchestration, validation, user authorization, and product decisions. Providers should not become the source of truth for Synq.ai domain state.

## Connector matrix

| Connector or runtime | Job | Credential model | Must not own |
|---|---|---|---|
| Tauri + Vite + React | Desktop client, local settings, UI, and native desktop capabilities | No provider credential ownership in the UI bundle | Pedagogical truth, cloud ownership, or raw provider secrets in ordinary storage |
| Google Gemini | Transform lecture material into pedagogical structures and learning activities | Synq.ai-managed server credential | Authentication, ownership, storage, or direct uncontrolled browser access |
| OpenRouter | Provide a model-routing gateway for approved reasoning models such as DeepSeek or Llama | Synq.ai-managed server credential | Canonical notebook state, user identity, or provider-independent routing policy |
| Groq | Provide a low-latency route for eligible Socratic turns and knowledge checks | Synq.ai-managed server credential | Long-term mastery truth or unrestricted background execution |
| Cerebras or compatible fallback | Provide an approved fallback reasoning route during primary-provider failure | Synq.ai-managed server credential | Silent schema changes or bypassing validation |
| Supabase Auth and Database | Identity, PostgreSQL persistence, RLS, and cloud synchronization | Synq.ai-managed project configuration | Pedagogical reasoning or audio synthesis |
| Supabase Storage | Private audio and learning-asset storage | Synq.ai-managed project configuration | Access decisions without application and storage policies |
| ElevenLabs | Convert an approved audio-ready script into speech | Synq.ai-managed server credential | Notebook structure, mastery state, or user permissions |
| Vercel | Host the cloud application and secure serverless routing intermediary | Synq.ai deployment secrets | Long-term data ownership or provider-specific product logic |
| Synq Extension | Capture permitted browser context and submit it to Synq.ai | No provider API keys | Authoritative learning records or secret storage |
| Dynamic MPS Router | Select adapters, enforce task policy, validate output, retry, and fail over | Uses server-side provider configuration | Provider-specific response formats or direct client access |

## Gemini contract

Input should include the source transcript, a versioned Master Pedagogy instruction set, desired learner context when available, and output constraints. Output should be validated structured content, not blindly trusted markdown. The response should preserve uncertainty and source references when the model cannot establish a claim confidently.

## Dynamic MPS Router contract

The router should classify work such as source ingestion, notebook generation, assessment generation, cheat-sheet compression, Socratic turns, answer evaluation, and code assistance. It should select a provider based on context size, reasoning needs, latency target, schema capability, current health, rate limits, and policy configuration. It should use bounded exponential backoff with jitter, avoid fallback loops, and return normalized results with sanitized routing metadata.

If DeepSeek is selected through OpenRouter, the implementation needs an OpenRouter adapter rather than a separate DeepSeek connector. A direct DeepSeek adapter is only needed if Synq.ai later calls a DeepSeek-hosted API without OpenRouter.

## Supabase contract

The application should use Supabase through typed data-access functions. These functions should expose domain actions such as create lecture source, update processing status, save notebook, create podcast record, synchronize notes, and record assessment attempts. Provider-specific database details should remain inside the data-access layer. Provider API keys must not be stored in Supabase.

## ElevenLabs contract

The audio layer should accept a clean spoken script rather than arbitrary interface markdown. It should return an audio object or provider response that can be uploaded to private storage. If the managed audio quota is unavailable, the application should explain the service limit and leave the notebook available; it should not ask ordinary users to configure an ElevenLabs key.

## Vercel contract

Vercel server routes should authenticate the caller, validate payload size and shape, apply quotas, invoke the provider using protected deployment secrets, and return stable application responses. They should not persist, log, or expose provider keys. They should not expose provider error bodies directly. Long-running generation should eventually move to a queue or background job if serverless execution limits make synchronous processing unreliable.

## Client credential contract

The Tauri and React clients must not request, store, or display Gemini or ElevenLabs keys. Settings should expose account, privacy, download, and service-status controls instead. Administrative provider credentials belong only in protected server deployment configuration. A separate operator self-hosting package may document server-side provider configuration without adding BYOK to the ordinary client.

## Extension contract

Synq Extension should submit an authenticated capture package containing source type, title, URL where permitted, captured text or transcript, timestamps, and user-selected metadata. Recording permissions, platform restrictions, and consent handling must be explicit. The extension should be replaceable without changing the notebook or mastery domain contracts.
