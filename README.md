# Synq.ai

> **A cloud-hosted, downloadable AI learning workspace that turns lectures and study questions into guided, interactive learning.**

**Status:** Product and architecture planning. This repository currently contains design documents only; application implementation will be added after the design is approved.

## What Synq.ai is

Synq.ai is designed for students, online class attendees, and heavy note-takers who need more than a transcript. It captures or accepts learning material, explains it through a structured pedagogical engine, presents it as an engaging notebook, creates revision activities, and tracks what the learner should study next.

The product is available in two connected forms. **Synq Workspace** is the main web application, available through a browser. A downloadable cross-platform desktop client, built with **Tauri, Vite, and React**, provides the same workspace with desktop-native packaging and future capture capabilities. Both clients connect to the same cloud account and synchronized data.

Synq.ai is **not a Bring Your Own Key product for ordinary users**. Gemini and ElevenLabs credentials are managed securely by the Synq.ai cloud service. Users sign in and use the product without sourcing or entering provider API keys. A separate self-hosted or developer deployment may configure its own infrastructure later, but that is not part of the normal user experience.

## Product modules

| Module | What it does |
|---|---|
| **Lecture Lens** | Accepts lecture text or files, preserves source context and timestamps where available, and produces the lecture notebook. |
| **Master Pedagogy** | Transforms source material into explanations, definitions, examples, comparisons, checks, summaries, and revision prompts. |
| **Synq Workspace** | Provides the home screen, notebooks, lectures, quizzes, cheat sheets, audio recaps, settings, and study sessions. |
| **Synq Mastery** | Tracks progress, knowledge gaps, quiz outcomes, and recommended revision. |
| **Synq Extension** | Later browser extension for sending selected text, webpage context, and permitted lecture context into Lecture Lens. |
| **Code Bar** | Coding-focused workspace for understanding, writing, testing, and revising code with learning context. |

## The learner experience

After signing in, the learner enters Synq Workspace and sees a focused welcome surface such as:

> **Hi, [username]. What do you want to learn today?**

The main panel offers direct actions including **Record**, **Upload transcript**, **Upload lecture file**, **Learn instantly**, **Continue learning**, and **Review due concepts**. The side navigation provides **Notebook**, **Quizzes**, **Lectures**, **Cheat Sheet**, **MPS**, **Code Bar**, **Mastery**, and **Settings**.

The interface takes inspiration from the clarity of Manus, the workspace feel of Odysseus, and the lesson-oriented structure of the reference notebook. It should be spacious, engaging, and easy to scan rather than crowded with simultaneous controls. The notebook remains the visual center. Secondary explanations, source details, audio, and progress appear through compact panels and progressive disclosure.

## How learning works

For an uploaded lecture or transcript, Lecture Lens preserves the source and creates a processing record. Master Pedagogy then transforms the content into structured notebook blocks. The notebook can include an overview, objectives, definitions, explanations, examples, comparisons, processes, formulas, misconceptions, relationships, knowledge checks, summaries, and revision prompts. When a lecture source contains timestamps, relevant blocks link back to the source position.

If the learner starts an MPS text-based session without uploading a lecture, Master Pedagogy still produces a complete notebook at the end of the session. If a lecture is uploaded, Lecture Lens and MPS work together: Lecture Lens preserves what was captured, while MPS explains, teaches, assesses, and organizes it.

Structured blocks are the canonical content format. Rendered Markdown provides a readable, editable, and downloadable representation. The same block data can also power interactive cards, quizzes, cheat sheets, audio scripts, and future mastery records without reducing the notebook to one large text field.

## Where Synq.ai is hosted

The primary Synq.ai service is cloud hosted. The web application is planned for **Vercel**, which provides the public frontend deployment, serverless API routes, environment management, and Git-based continuous deployment. **Supabase** provides authentication, PostgreSQL storage, Row Level Security, private file storage, and synchronization across the browser and desktop clients. **Google Gemini** runs the Master Pedagogy transformation, and **ElevenLabs** generates optional audio recaps. Provider credentials remain on the server side under Synq.ai operational control.

The downloadable desktop client is built from the same React interface and packaged with Tauri for Windows, macOS, and Linux. It connects to the hosted Synq.ai services rather than requiring users to run AI models or configure API providers locally. The desktop download is therefore a client distribution channel, not a separate BYOK deployment.

## Working architecture

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

The client authenticates the learner and sends validated requests to Synq.ai serverless routes. The server verifies ownership, stores source and processing state in Supabase, calls Gemini with the versioned Master Pedagogy contract, validates the structured result, and saves the notebook. When audio is requested, the server prepares a spoken script, calls ElevenLabs, stores the generated audio in private Supabase Storage, and returns secure playback metadata. Supabase Row Level Security ensures that a learner can access only permitted records.

## Security and privacy direction

Provider API keys are never placed in the desktop bundle, browser code, notebook data, URLs, or user settings. The serverless layer keeps them in protected deployment secrets. Authentication and ownership are enforced through Supabase Auth and Row Level Security. Audio files are private and are delivered through controlled access rather than public permanent links.

Raw lecture material and generated learning content should have explicit retention, export, and deletion behavior. The system should log sanitized processing metadata without logging API keys or unnecessary lecture content. Users should be able to use existing notebooks even when a new generation job is processing or unavailable.

## Repository contents

- `00-directory-structure.txt` — planned Tauri, React, Vercel, and Supabase repository layout.
- `01-product-and-feature-plan.md` — product scope and first-release functionality.
- `02-system-architecture.md` — hosting, services, request flow, and security boundaries.
- `03-database-design.md` — conceptual data model, ownership rules, and RLS plan.
- `04-connector-responsibilities.md` — responsibility of each external service and runtime.
- `05-notebook-experience-spec.md` — notebook generation and interface principles.
- `06-build-roadmap.md` — staged implementation plan.
- `07-open-questions.md` — decisions still required before implementation.
- `08-deployment-modes-and-provider-credentials.md` — deployment options and managed provider-secret responsibilities.

## Planned release boundary

The first release is planned to include authentication, Synq Workspace, user-provided text, optional file upload, Lecture Lens, Master Pedagogy sessions, structured notebooks, rendered Markdown, timestamps where available, quizzes, cheat sheets, basic mastery progress, optional audio recaps, downloadable study material, and the initial Code Bar foundation. Synq Extension, real-time capture, advanced adaptive algorithms, collaboration, and local-AI inference can follow after the core notebook loop is reliable.

## License and implementation status

The repository is currently private while the product design is being finalized. The intended project direction is open source. License selection, contribution guidance, and the first public release process will be finalized before publication.
