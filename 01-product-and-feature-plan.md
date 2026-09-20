# Synq.ai Product and Feature Plan

## Product purpose

Synq.ai is a downloadable desktop AI learning workspace for students, online class attendees, and heavy note-takers. It turns live or copied lecture material into an understandable, revisable learning experience. The system is intended for learners who need more than transcription: it should help them understand what was taught, recognize relationships between ideas, test recall, and return later without reconstructing the lesson manually.

## Product modules

| Module | Product responsibility | Primary user outcome |
|---|---|---|
| Lecture Lens | Capture, timestamp, and organize lecture material | The learner has a reliable source notebook. |
| Master Pedagogy | Explain, structure, and teach the material | The learner understands concepts progressively. |
| Synq Workspace | Desktop interface for notebooks, study, and content management | The learner can read, listen, annotate, and study in one place. |
| Synq Mastery | Track learning and guide revision | The learner knows what to review next. |
| Synq Extension | Capture browser-based lecture context | The learner can send relevant material into Lecture Lens. |
| Code Bar | Support coding tasks inside the learning workspace | The learner can understand, write, and revise code with context. |

## Desktop-first experience

The first release is a cross-platform desktop client built with Tauri, Vite, and React for Windows, macOS, and Linux. After login, the learner enters Synq Workspace. The home panel should greet the learner by name and offer direct actions such as recording, uploading a transcript or lecture file, starting an instant learning session, continuing recent work, and reviewing due concepts.

The side navigation should provide Notebook, Quizzes, Lectures, Cheat Sheet, MPS, Code Bar, Mastery, and Settings. The visual direction may take inspiration from Manus and the referenced Odysseus interface, while remaining recognizably Synq.ai: focused, spacious, engaging, and less crowded than a dashboard that exposes every action at once.

## Core user journey

A learner begins a Lecture Lens session by pasting a transcript, uploading supported text or lecture material, or later sending content from Synq Extension. Synq.ai records the source, timestamps when available, and processing state. Master Pedagogy then creates a structured notebook made of typed blocks and renders it as a guided lesson. The learner reads the notebook, optionally generates an audio recap, answers short checks, and receives revision guidance through Synq Mastery.

If a learner starts an MPS text-only session without a lecture upload, Master Pedagogy should still generate a complete notebook at the end of the session. If a lecture is uploaded, Lecture Lens and MPS should work as one connected flow: Lecture Lens preserves the lecture source and timestamps, while MPS explains, teaches, assesses, and turns that material into the notebook.

## First-release functionality

The first release should include login and account pages, the desktop Synq Workspace, user-provided text input, optional file upload, Lecture Lens processing, Master Pedagogy text sessions, structured notebook generation, rendered Markdown, lesson-style notebook sections, lecture timestamps where available, quizzes, cheat sheets, basic Synq Mastery progress, optional ElevenLabs audio recaps, a lecture library, downloadable learning materials, and an initial Code Bar foundation.

The ordinary application should not require users to source or enter provider API keys. Gemini and ElevenLabs credentials are managed on the Synq.ai server side. The cloud service must apply authentication, quotas, rate limits, abuse prevention, and cost controls. An operator self-hosting the open-source stack may configure provider credentials in deployment secrets, but that is not part of the normal downloadable-client experience.

## Notebook requirements

Structured content blocks are the canonical representation. Rendered Markdown is a reading and export representation. The notebook should support overview, objectives, definitions, explanations, examples, comparisons, processes, formulas, misconceptions, relationships, knowledge checks, summaries, revision prompts, and source timestamps. The block schema and Master Pedagogy contract must be finalized before Gemini integration.

## Experience characteristics

Synq.ai should be calm, focused, and visually alive. It should avoid presenting every control, statistic, and explanation at once. The main reading surface should remain central. Contextual actions such as audio, progress, citations, deeper explanations, and source timestamps should be available without competing with the current concept. The desktop client should support keyboard navigation, readable contrast, semantic structure, reduced motion, and a responsive content area within the desktop window.

## Non-goals for the first build

The first build should not attempt to support every meeting platform, real-time multiplayer collaboration, automatic claims about academic correctness, or a complete adaptive curriculum engine. The architecture should allow those capabilities later without making them mandatory for the initial notebook workflow.
