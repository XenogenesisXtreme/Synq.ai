# Synq.ai Database Design Plan

## Design status

This is a conceptual schema for review. It is not a Supabase migration and must not be applied to a production database without an implementation review.

## Ownership model

Supabase Auth remains the source of truth for identity. A public profile record may reference `auth.users.id`, but the application should not replace Supabase Auth with an independently managed users table. All user-owned rows should carry an owner identifier or derive ownership through a parent relationship.

Provider API keys are deliberately outside this database design. Under the initial BYOK model, Gemini and ElevenLabs keys belong in the desktop client's OS-backed secure credential store and must not be stored in profiles, notebooks, settings tables, logs, or Supabase Storage.

## Core entities

| Entity | Purpose | Important relationships |
|---|---|---|
| profiles | User-facing profile preferences | One profile belongs to one Auth user. |
| lecture_sources | Original transcript or imported lecture material | Owned by one user; may produce one or more processing runs. |
| processing_runs | Durable status for AI transformations | Belongs to a source and records model/version metadata. |
| notebooks | Generated learning document and notebook metadata | Belongs to a user and source. |
| notebook_blocks | Structured content blocks inside a notebook | Belongs to a notebook; ordered by position. |
| podcasts | Audio recap metadata | Belongs to a notebook and user; references private storage. |
| assessments | Review checks generated for a notebook | Belongs to a notebook and user. |
| assessment_attempts | Learner answers and outcomes | Belongs to a user and assessment. |
| mastery_items | Concept-level learner progress | Belongs to a user and concept or notebook block. |
| revisions | Recommended or completed review events | Belongs to a user and mastery item. |

## Notebook representation

A notebook should not be stored only as one large markdown string. The canonical representation should be structured blocks with a stable type, order, title, content payload, and optional interaction metadata. A rendered markdown or export format can be generated from those blocks. This allows the interface to display a definition card, example, comparison, quiz, or visual relationship differently without losing the source structure.

A conceptual `notebook_blocks` record contains `id`, `notebook_id`, `block_type`, `position`, `title`, `content_json`, `difficulty`, `source_reference_json`, `created_at`, and `updated_at`. The JSON payload should be validated against a versioned block schema before insertion.

## Suggested status values

Lecture sources and processing runs should use `pending`, `processing`, `completed`, and `failed`. Podcasts should use `queued`, `generating`, `ready`, and `failed`. Assessment attempts should preserve whether an answer was `submitted`, `evaluated`, or `invalidated`.

## Row Level Security plan

RLS must be explicitly enabled on every user-owned table. A user may select, create, update, or delete a row only when its owner is the authenticated user. Child tables must enforce ownership through their direct `user_id` where practical and through parent relationships where necessary. Policies must prevent a user from changing ownership to another user. Service-side operations should use a narrowly scoped privileged path only when the authenticated user has already been verified.

Storage should use a private bucket. A storage path should include an ownership-safe namespace, but path naming alone is not a security control. Storage policies and signed URL generation must verify the authenticated owner through the related podcast or source record.

## Future considerations

Collaborative notebooks will require a separate membership and role model rather than weakening personal ownership policies. Deletion should be designed as a deliberate cascade or soft-delete policy because raw sources may be needed for regeneration and audit history. Retention, export, and account deletion requirements should be resolved before production launch.
