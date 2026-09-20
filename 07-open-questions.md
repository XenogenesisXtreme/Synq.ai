# Synq.ai Open Questions

This document records decisions that should be answered before implementation or before the phase that depends on them.

## Notebook reference

The example notebook and interface have not yet been included in this workspace. The visual design and block vocabulary should be refined after the reference is supplied as screenshots, a URL, a file, or a repository path.

## Managed provider credentials

The product direction now assumes Synq.ai-managed Gemini and ElevenLabs credentials. The implementation must choose protected Vercel deployment secrets or an equivalent server-side secret manager. The threat model should cover secret rotation, provider outage, account abuse, quota exhaustion, and access separation between application operators.

## Serverless routing with managed credentials

The preferred default is a validated server-side relay that uses protected deployment secrets and never exposes provider keys to clients. Direct calls from browser or desktop clients are out of scope for the ordinary user experience because they would expose credentials and bypass centralized policy.

## Supabase sync and offline behavior

Define whether the first desktop release requires offline drafts. The initial plan assumes cloud synchronization through Supabase, but a desktop application may need a local queue when the network is unavailable. Decide whether local notebooks use SQLite or remain memory/file based until sync succeeds.

## Transcription ownership

The first release supports user-provided text and optional file upload. The system still needs a decision on whether uploaded audio/video is transcribed by a separate service, by a local model, or by a later provider integration.

## Long-running jobs

The first architecture can represent durable processing states. A decision is still needed on whether initial generation is synchronous or handled through a queue, background worker, or hosted job system. The answer depends on input limits, provider latency, and Vercel execution limits.

## Data retention and privacy

Define how long raw transcripts, generated notebooks, audio files, and provider metadata are retained. Define whether source content may be used for debugging, how account deletion cascades, and whether users can export or permanently delete their data.

## Audio policy

Decide which voices, languages, audio lengths, and regeneration rules are supported in the first release. Define whether generated audio is cached per notebook version or regenerated after every content edit.

## Extension permissions

Define the minimum permissions for selected text, page context, meeting metadata, and audio capture. Audio capture should not be assumed to work uniformly across browsers or online-class platforms.

## Adaptive mastery

Define the initial mastery model. A transparent rule-based model is recommended before introducing opaque personalization. Decide which events change mastery, how confidence is represented, and how revision timing is calculated.

## Deployment modes

The initial deployment is managed Synq.ai Cloud accessed through browser and downloadable clients. An institutional or operator self-hosted deployment may use its own server-side provider credentials. A fully local AI mode would require separate planning for local models, hardware, speech-to-text, text-to-speech, model licensing, and offline operation.

## Collaboration

Personal ownership is the initial assumption. If shared notebooks are later introduced, design memberships and roles explicitly rather than weakening individual Row Level Security policies.
