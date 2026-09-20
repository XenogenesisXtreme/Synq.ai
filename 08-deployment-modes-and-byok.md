# Synq.ai Deployment Modes and BYOK

## Decision recorded

The initial Synq.ai release is planned around **Bring Your Own Key (BYOK)**. Users download or self-host the application, create or connect the required Supabase project, and enter their own Gemini and ElevenLabs credentials in the desktop Settings flow. This prevents Synq.ai from absorbing unlimited provider costs while keeping the project open-source and self-hostable.

## How the user experience works

The user installs Synq.ai, signs in or connects the configured Supabase project, opens Settings, and enters a Gemini key. An ElevenLabs key is optional until the learner requests audio. The desktop client stores the secrets locally using a Tauri-backed secure credential mechanism. The application displays only whether a key is configured and may offer a safe test action; it should never display the full key after saving.

When the user starts generation, the client sends the request through the configured Vercel routing function. The relevant key is used for that provider call without being written to Synq.ai records. The resulting notebook, audio metadata, and processing status are synchronized through Supabase, but the secrets are not.

## Deployment modes

| Mode | Who supplies provider credentials? | Intended use |
|---|---|---|
| BYOK self-hosted | The individual user | Default open-source and privacy-focused deployment |
| Institutional | A school, lab, or organization | Centrally managed deployment for a defined group |
| Synq.ai Cloud | Synq.ai operator | Simplest user experience, subject to quotas or billing |
| Local AI | No cloud provider required | Later offline mode using locally hosted models |

## Trade-offs

BYOK keeps the first release financially sustainable and gives users control over provider accounts and usage. It adds setup friction, requires careful local secret storage, and means the product cannot promise that AI features work before keys are configured. The Settings flow should make this understandable and should allow the rest of the Workspace, including existing notebooks, to remain usable without an audio key.

A managed Synq.ai Cloud mode can remove setup friction later, but it would require quota enforcement, abuse prevention, privacy and retention policies, provider cost controls, and potentially paid or sponsored access. It should be treated as a separate operating model rather than silently mixed into the self-hosted release.

A local-AI mode can remove cloud key requirements, but it is not a small configuration change. It requires model packaging, hardware detection, local speech-to-text and text-to-speech, licensing review, larger downloads, and offline data design.

## Security requirements

Provider keys must not be committed to source control, stored in Supabase, included in notebook content, written to ordinary logs, or placed in URLs. The desktop client should use the operating system's secure credential store through Tauri. The serverless relay should accept a key only for a validated request, avoid persistence, and return sanitized errors. Self-hosting documentation must explain that users are responsible for protecting their own keys and deployments.
