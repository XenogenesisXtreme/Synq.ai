# Synq.ai Build Roadmap

## Phase 0: Design approval

Confirm the product vocabulary, notebook examples, learner experience, BYOK security model, provider limits, privacy expectations, desktop packaging approach, and repository shape. The output is a signed-off design package and a short list of intentionally deferred decisions.

## Phase 1: Desktop foundation

Create the Tauri + Vite + React application, configure cross-platform packaging, establish shared domain types, add environment documentation, configure Supabase Auth, and apply reviewed database migrations. Implement the Settings experience and the minimal Tauri-backed secure key store for Gemini and ElevenLabs credentials.

## Phase 2: Lecture Lens and Synq Workspace

Implement user-provided text submission, optional file upload, source persistence, processing states, timestamp preservation where available, notebook generation, structured block rendering, notebook navigation, and basic editing or annotation. Add observability around request duration, failures, retries, and sync status.

## Phase 3: Master Pedagogy contract

Finalize the notebook block schema, required sections, source-reference format, prompt versioning, output validation, and generation rules before connecting Gemini. Test the contract against text-only MPS sessions and lecture-derived sessions.

## Phase 4: Audio recaps

Generate a clean audio script from completed notebook content. Use the locally configured ElevenLabs BYOK credential through the secure routing path, store the result in private Supabase Storage, create playback metadata, and provide playback in Synq Workspace. Audio failure must not invalidate a completed notebook.

## Phase 5: Synq Mastery, quizzes, cheat sheets, and Code Bar

Add knowledge checks, assessment attempts, concept-level progress, mastery states, revision recommendations, condensed cheat sheets, and the initial coding workspace. Begin with transparent rules before introducing more complex adaptive behavior.

## Phase 6: Synq Extension

After the ingestion contract is stable, build the extension package. Start with selected text and page context. Add audio capture only after permissions, consent, browser support, and storage implications have been reviewed.

## Phase 7: Self-hosting and release hardening

Document Supabase and Vercel setup, provider-key configuration, desktop packaging, privacy, data export and deletion, provider failure tests, accessibility, rate limits, contribution guidance, and deployment instructions. Add institutional and managed-cloud deployment modes only after the BYOK path is reliable.

## Delivery rule

Each phase should produce a usable, testable increment. Do not introduce advanced mastery algorithms, collaboration, or broad extension permissions before the core desktop notebook loop is reliable.
