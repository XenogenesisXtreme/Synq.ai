# Synq.ai Deployment Modes and Provider Credentials

## Decision recorded

The initial Synq.ai release is planned as a **managed cloud service with a downloadable client**. Ordinary users sign in and use Gemini-powered learning and ElevenLabs audio without sourcing or entering provider API keys. Synq.ai manages provider credentials on the server side and controls usage through authentication, quotas, rate limits, and abuse prevention.

## How the user experience works

The user opens the web application or installs the desktop client, creates an account, and signs in. No provider-key setup is required. The application should explain service availability and usage limits through the account experience rather than exposing provider configuration.

When the user starts generation, the client sends an authenticated request through Vercel. The server uses the protected Synq.ai provider credential for that call. The resulting notebook, audio metadata, and processing status are synchronized through Supabase, but the secrets are never sent to or stored by the client.

## Deployment modes

| Mode | Who supplies provider credentials? | Intended use |
|---|---|---|
| Synq.ai Cloud | Synq.ai operator | Default user experience through web and downloadable clients |
| Institutional | A school, lab, or organization | Isolated deployment with institution-managed server credentials |
| Operator self-hosted | The deployment operator | Open-source deployment for technical users |
| BYOK client mode | Not supported for ordinary users | Explicitly not part of the first-release user experience |
| Local AI | No cloud provider required | Later offline mode using locally hosted models |

## Trade-offs

Managed cloud hosting removes API-key setup and gives Synq.ai one place to enforce safety, quality, usage limits, and provider configuration. It creates operating costs, so the service needs quotas, abuse prevention, cost monitoring, and eventually a sustainable funding or pricing model. A user should never experience a provider-key error as a required setup step.

Institutional and operator self-hosting can provide the open-source deployment path. Those operators may configure provider credentials in their own server environment, but this is an administrative deployment decision and not BYOK inside the downloadable client.

A local-AI mode can remove cloud key requirements, but it is not a small configuration change. It requires model packaging, hardware detection, local speech-to-text and text-to-speech, licensing review, larger downloads, and offline data design.

## Security requirements

Provider keys must not be committed to source control, shipped in the desktop client, stored in Supabase, included in notebook content, written to ordinary logs, or placed in URLs. Vercel deployment secrets or an equivalent server-side secret manager should protect them. The serverless relay should avoid persistence and return sanitized errors. Self-hosting documentation must explain that operators are responsible for protecting their own server credentials and deployments.
