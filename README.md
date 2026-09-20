# Synq.ai Design Plan

**Status:** Planning artifact only. No application code, infrastructure, database migrations, or external integrations are implemented by this package.

Synq.ai is an open-source, downloadable desktop AI learning workspace for students, online class attendees, and heavy note-takers. It combines lecture capture, pedagogical transformation, guided study, audio recaps, coding assistance, and learner mastery tracking.

## Authoritative product direction

The first application is planned as a cross-platform **Tauri + Vite + React desktop client**. Vercel serverless functions provide secure request routing. Supabase provides authentication, PostgreSQL persistence, Row Level Security, private storage, and cloud synchronization. Google Gemini supplies pedagogical transformation. ElevenLabs supplies optional audio recap generation.

The initial AI access model is **Bring Your Own Key (BYOK)**. Users configure their own Gemini and ElevenLabs keys through the desktop Settings flow. Keys are intended to remain local to the user's device using secure platform-backed storage and must not be written to Supabase or source control. A future managed Synq.ai Cloud mode may provide centrally managed credentials under quotas, but it is not the default assumption for the first release.

## Product names

- **Synq.ai:** Product and repository name.
- **Lecture Lens:** Lecture capture, transcript ingestion, and notebook generation.
- **Master Pedagogy:** Adaptive teaching engine that transforms raw content into guided learning.
- **Synq Extension:** Browser extension for lecture and webpage capture.
- **Synq Workspace:** Main web application for notebooks, study sessions, and content management.
- **Synq Mastery:** Progress, revision, assessment, and knowledge-gap layer.
- **Code Bar:** Coding-task workspace inside Synq Workspace.

## Planning principles

The generated notebook should feel like a guided interactive lesson, not a transcript with headings. The interface should be spacious, engaging, and easy to scan. It should use visual variety only when that variety improves understanding. Dense content should be progressively disclosed through expandable explanations, examples, comparisons, checks, and summaries.

## Package contents

- `00-directory-structure.txt` — planned Tauri desktop repository layout.
- `01-product-and-feature-plan.md` — product scope, desktop experience, and first-release functionality.
- `02-system-architecture.md` — Tauri, Vercel, Supabase, Gemini, ElevenLabs, and BYOK data flow.
- `03-database-design.md` — conceptual data model, ownership rules, and RLS plan.
- `04-connector-responsibilities.md` — role and responsibility of every connector.
- `05-notebook-experience-spec.md` — notebook generation and interface principles.
- `06-build-roadmap.md` — staged implementation plan and decisions still to make.
- `07-open-questions.md` — unresolved design questions and assumptions.
- `08-deployment-modes-and-byok.md` — explanation of BYOK, self-hosted, institutional, managed-cloud, and local-AI modes.

## What is deliberately excluded

This package does not include a working frontend, backend route, Supabase migration, browser extension, API call, deployment configuration, or production secret. Those belong to a later implementation phase after the design is reviewed.
