# Synq.ai

> **A cloud-hosted, downloadable AI learning workspace that turns lectures and study questions into guided, interactive learning.**

**Status:** Product and architecture planning. This repository currently contains design documents only. Application implementation, production deployment, and public client downloads will follow design approval.

## Contents

- [Product summary](#product-summary)
- [Who Synq.ai is for](#who-synqai-is-for)
- [Product vocabulary](#product-vocabulary)
- [The learner experience](#the-learner-experience)
- [How a lecture becomes a notebook](#how-a-lecture-becomes-a-notebook)
- [Notebook content model](#notebook-content-model)
- [Hosting and client distribution](#hosting-and-client-distribution)
- [System architecture](#system-architecture)
- [Security, privacy, and ownership](#security-privacy-and-ownership)
- [Extensibility principles](#extensibility-principles)
- [Repository guide](#repository-guide)
- [Planned release](#planned-release)
- [Current status](#current-status)

## Product summary

Synq.ai is designed for students, online class attendees, and heavy note-takers who need more than a transcript. It accepts learning material, explains it through a structured pedagogical engine, presents it as an engaging notebook, creates revision activities, and tracks what the learner should study next.

The core product idea is simple:

> **Synq.ai should turn captured information into a learning path, not merely into a longer document.**

The product combines the source awareness of Lecture Lens, the teaching methodology of Master Pedagogy, the study interface of Synq Workspace, and the progress loop of Synq Mastery. Audio recaps, quizzes, cheat sheets, and the Code Bar extend the same underlying learning data rather than operating as unrelated tools.

Synq.ai is **not a Bring Your Own Key product for ordinary users**. Users sign in and use the hosted service without sourcing or entering Gemini or ElevenLabs API keys. Provider credentials are managed on the Synq.ai server side. An operator or institution running its own deployment may configure its own infrastructure later, but that is not part of the normal downloadable-client experience.

## Who Synq.ai is for

Synq.ai is intended for a learner who is attending a live class, watching a recorded lecture, studying from notes, or trying to understand a difficult topic independently. It is particularly useful when the learner has information but lacks time to organize it, identify the important concepts, connect ideas, or plan revision.

The first release is not intended to replace teachers, verify every academic claim automatically, or make high-stakes decisions about a learner. It is a study and organization system. Generated explanations should remain reviewable, source-aware, and open to correction.

## Product vocabulary

| Name | Meaning in Synq.ai |
|---|---|
| **Synq.ai** | The product and repository. |
| **Lecture Lens** | The lecture capture, upload, transcript, timestamp, and source-notebook module. |
| **Master Pedagogy** | The adaptive teaching engine, also referred to as MPS in the interface. |
| **Synq Workspace** | The main browser and desktop learning environment. |
| **Synq Mastery** | The progress, assessment, knowledge-gap, and revision layer. |
| **Synq Extension** | The planned browser extension for sending permitted browser and lecture context into Synq.ai. |
| **Code Bar** | The coding-focused workspace for understanding, writing, testing, and revising code. |
| **Notebook** | The structured learning document generated from a source or an MPS session. |
| **Knowledge check** | A short interaction that asks the learner to recall, explain, compare, or apply a concept. |

## The learner experience

After signing in, the learner enters Synq Workspace and sees a focused welcome surface such as:

> **Hi, [username]. What do you want to learn today?**

The main panel offers direct actions including **Record**, **Upload transcript**, **Upload lecture file**, **Learn instantly**, **Continue learning**, and **Review due concepts**. The side navigation provides **Notebook**, **Quizzes**, **Lectures**, **Cheat Sheet**, **MPS**, **Code Bar**, **Mastery**, and **Settings**.

The interface takes inspiration from the clarity of Manus, the workspace feel of Odysseus, and the lesson-oriented structure of the reference notebook. It should be spacious, engaging, and easy to scan rather than crowded with simultaneous controls. The notebook remains the visual center. Secondary explanations, source details, audio, and progress appear through compact panels and progressive disclosure.

The experience should make the next useful action obvious. A new learner should understand how to submit material. A returning learner should see what is unfinished or due for revision. A learner who only wants to ask a question should be able to start MPS without first creating a lecture project.

## Product flows

### Flow A: Upload a transcript

The learner uploads or pastes text. Lecture Lens records the source and creates a processing state. Master Pedagogy analyzes the text using the versioned notebook contract. Synq.ai validates and stores the resulting blocks. Synq Workspace renders the notebook and makes quizzes, a cheat sheet, audio, and mastery actions available.

### Flow B: Upload a lecture file

The learner uploads a supported lecture file. Lecture Lens preserves the file metadata and any available transcript or timestamp information. The processing pipeline links notebook sections to relevant source positions where possible. The learner can move between the lesson explanation and the original lecture context rather than losing the relationship between them.

### Flow C: Learn instantly with MPS

The learner enters a topic, question, or body of text without uploading a lecture. Master Pedagogy runs a text-based teaching session. At the end, Synq.ai generates a complete notebook from the session so the learning is not lost when the conversation ends.

### Flow D: Review and mastery

The learner opens a notebook or the Mastery section. Synq.ai presents short knowledge checks, records outcomes, identifies concepts needing attention, and recommends revision. The first mastery model should be transparent and understandable before more complex adaptive behavior is introduced.

### Flow E: Audio recap

The learner requests an audio recap from a completed notebook. Synq.ai converts suitable notebook content into a natural spoken script, sends it through the protected ElevenLabs service integration, stores the audio privately, and presents it through the workspace audio player. A failed audio job never invalidates the notebook.

## How a lecture becomes a notebook

```text
Source text or file
        |
        v
Lecture Lens source record
        |
        v
Transcript, context, and timestamps
        |
        v
Master Pedagogy contract
        |
        v
Validated structured notebook blocks
        |
        +--> rendered Markdown
        +--> interactive notebook view
        +--> quizzes and cheat sheet
        +--> audio-ready script
        +--> mastery concepts and revision events
```

For an uploaded lecture or transcript, Lecture Lens preserves the source and creates a processing record. Master Pedagogy then transforms the content into structured notebook blocks. The notebook can include an overview, objectives, definitions, explanations, examples, comparisons, processes, formulas, misconceptions, relationships, knowledge checks, summaries, and revision prompts. When a lecture source contains timestamps, relevant blocks link back to the source position.

If the learner starts an MPS text-based session without uploading a lecture, Master Pedagogy still produces a complete notebook at the end of the session. If a lecture is uploaded, Lecture Lens and MPS work together: Lecture Lens preserves what was captured, while MPS explains, teaches, assesses, and organizes it.

## Notebook content model

Structured blocks are the canonical content format. Rendered Markdown is a readable, editable, and downloadable representation. The same block data can power interactive cards, quizzes, cheat sheets, audio scripts, and future mastery records without reducing the notebook to one large text field.

The initial block vocabulary is intended to include:

| Block type | Learning purpose |
|---|---|
| `orientation` | Explain what the lesson covers and why it matters. |
| `objective` | State what the learner should understand or be able to do. |
| `definition` | Give a precise concept or term definition. |
| `explanation` | Teach the idea in accessible language. |
| `example` | Show the idea in a concrete situation. |
| `comparison` | Distinguish related concepts or approaches. |
| `process` | Show ordered steps, mechanisms, or causal flow. |
| `formula` | Present and explain an equation or symbolic relationship. |
| `misconception` | Warn about a likely misunderstanding. |
| `connection` | Link the current idea to another concept or source point. |
| `knowledge_check` | Ask the learner to recall, explain, compare, or apply. |
| `summary` | Compress the important points at a meaningful boundary. |
| `revision_prompt` | Suggest a later retrieval or practice action. |

The model should choose components according to the content. A technical lecture may need formulas and worked examples. A history lecture may need chronology and causal relationships. A biology lecture may need labeled processes and comparisons. The interface should not force every lesson into an identical visual template.

## Hosting and client distribution

The primary Synq.ai service is cloud hosted. The planned deployment is:

| Layer | Planned service | Responsibility |
|---|---|---|
| Web client | Vercel | Host Synq Workspace and provide Git-based deployments. |
| API layer | Vercel serverless functions | Authenticate, validate, orchestrate, and route requests. |
| Identity | Supabase Auth | Accounts, sessions, and authenticated user identity. |
| Database | Supabase PostgreSQL | User-owned sources, notebooks, blocks, quizzes, mastery, and processing states. |
| File storage | Supabase Storage | Private audio and other user-owned learning assets. |
| Pedagogical engine | Google Gemini | Transform validated source content through Master Pedagogy. |
| Audio engine | ElevenLabs | Generate optional spoken recaps from audio-ready scripts. |
| Desktop client | Tauri + Vite + React | Package the workspace for Windows, macOS, and Linux. |

The web application is the primary hosted client. The downloadable desktop client is built from the same React product surface and packaged with Tauri. It connects to the hosted Synq.ai services, synchronizes with the same account, and does not require users to install AI models or configure provider API keys locally. The download is therefore a client distribution channel, not a separate BYOK product.

The normal end-user path is:

```text
Visit Synq.ai or install the desktop client
        |
        v
Create an account and sign in
        |
        v
Use Synq Workspace without provider-key setup
        |
        v
Cloud services process, store, and synchronize learning content
```

## System architecture

```text
Browser: Synq Workspace       Desktop: Tauri + React
             \                       /
              \                     /
               v                   v
                 Synq.ai cloud API on Vercel
                 |       |        |
                 v       v        v
              Supabase  Gemini  ElevenLabs
              auth/db   MPS AI  audio recap
                 |
                 v
        notebooks, sources, quizzes,
        audio references, mastery data
```

The client authenticates the learner and sends validated requests to Synq.ai serverless routes. The server verifies ownership, applies input limits and quotas, stores source and processing state in Supabase, calls Gemini with the versioned Master Pedagogy contract, validates the structured result, and saves the notebook. When audio is requested, the server prepares a spoken script, calls ElevenLabs, stores the generated audio in private Supabase Storage, and returns secure playback metadata. Supabase Row Level Security ensures that a learner can access only permitted records.

Processing should be represented by durable states such as `pending`, `processing`, `completed`, and `failed`. This makes progress visible, supports retries, prevents confusing duplicate notebooks, and allows the implementation to move from a synchronous serverless request to a background job when necessary.

## Security, privacy, and ownership

Provider API keys are never placed in the desktop bundle, browser code, notebook data, URLs, or user settings. The serverless layer keeps them in protected deployment secrets. Authentication and ownership are enforced through Supabase Auth and Row Level Security. Audio files are private and are delivered through controlled access rather than public permanent links.

Every user-owned record must be connected to the authenticated user. The server must not trust an arbitrary user identifier supplied by a client. Database policies must prevent cross-user reads, updates, inserts, and deletes. A future collaboration feature must introduce explicit memberships and roles rather than weakening personal ownership policies.

Raw lecture material and generated learning content should have explicit retention, export, and deletion behavior. The system should log sanitized processing metadata without logging API keys or unnecessary lecture content. Users should be able to use existing notebooks even when a new generation job is processing, rate limited, or temporarily unavailable.

## Extensibility principles

Synq.ai is designed as a modular product rather than one provider-specific workflow. New capture clients should submit to the Lecture Lens ingestion contract. New AI providers should implement a provider adapter behind the Master Pedagogy service boundary. New notebook components should be added as versioned block types rather than as special cases embedded in the renderer. New assessment strategies should write to the mastery domain without changing the source notebook model.

The following boundaries are intentional:

1. **Lecture Lens owns source context.** It does not own pedagogical interpretation.
2. **Master Pedagogy owns teaching transformation.** It does not own user identity or file permissions.
3. **Synq Workspace owns presentation and interaction.** It does not become the source of truth for learning records.
4. **Synq Mastery owns progress and revision.** It should reference concepts and outcomes rather than duplicate entire notebooks.
5. **Provider adapters own external API details.** Product code should depend on stable internal contracts.
6. **The server owns provider secrets.** Clients should not be responsible for API-key management.

## Repository guide

- `00-directory-structure.txt` — planned Tauri, React, Vercel, Supabase, and module layout.
- `01-product-and-feature-plan.md` — product scope, user journeys, and first-release functionality.
- `02-system-architecture.md` — hosting, services, request flow, security boundaries, and deployment modes.
- `03-database-design.md` — conceptual data model, ownership rules, and RLS plan.
- `04-connector-responsibilities.md` — responsibilities and contracts for each connector and runtime.
- `05-notebook-experience-spec.md` — notebook generation and interface principles.
- `06-build-roadmap.md` — staged implementation plan from foundation to open-source release.
- `07-open-questions.md` — decisions still required before implementation.
- `08-deployment-modes-and-provider-credentials.md` — managed cloud, institutional, operator self-hosting, and local-AI considerations.

The repository is intentionally documentation-first. The design files establish the product vocabulary, data boundaries, user experience, service responsibilities, and implementation order before code is introduced.

## Planned release

The first release is planned to include authentication, Synq Workspace, user-provided text, optional file upload, Lecture Lens, Master Pedagogy sessions, structured notebooks, rendered Markdown, timestamps where available, quizzes, cheat sheets, basic mastery progress, optional audio recaps, downloadable study material, and the initial Code Bar foundation.

Synq Extension, real-time capture, advanced adaptive algorithms, collaboration, broad platform integrations, and local-AI inference can follow after the core notebook loop is reliable. Deferring these areas is intended to keep the first release coherent, testable, and useful rather than limiting the long-term product vision.

## Future self-hosting and operating modes

The ordinary user experience is managed cloud hosting. An institution or technical operator may later deploy an isolated copy of the open-source system and configure its own server-side Supabase, Vercel-compatible hosting, Gemini, and ElevenLabs credentials. That administrative configuration should not be confused with asking every end user to bring provider keys.

A fully local mode is also possible in the long term, but it would require local language models, speech-to-text, text-to-speech, model licensing, hardware detection, larger downloads, and offline synchronization. It is a separate product mode, not a small switch in the cloud client.

## Current status

The repository is private while the product design is being finalized. No working frontend, API route, database migration, browser extension, production deployment, or client installer has been created yet. The intended project direction is open source. License selection, contribution guidance, security reporting, cloud operating costs, quota policy, and the first public release process will be finalized before publication.
