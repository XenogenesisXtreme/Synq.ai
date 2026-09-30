# Operational Decisions Addendum

Resolves three items left open across `06-build-roadmap.md` and `07-open-questions.md`.

## 1. Synchronous generation vs. background job

**Resolved: start synchronous with Fluid Compute, add a queue only if you outgrow it.**

Vercel functions on the Pro plan default to a 300-second max duration, extendable to 800 seconds with Fluid Compute enabled. Measure your actual 90-minute-lecture generation time against that ceiling before building anything else:

- If it fits inside ~800 seconds including retries, enable Fluid Compute, set `maxDuration` accordingly, and keep the generation route synchronous. The `pending / processing / completed / failed` states already designed in `03-database-design.md` still work fine for the UI to poll or subscribe to via Supabase realtime, even without a separate job runner.
- If it doesn't fit, move generation to a durable job runner — Inngest or Trigger.dev both fit a Vercel + Supabase stack and are built for exactly this shape of problem (a call that may take minutes and needs retries). A rough sketch:

```ts
// Example: Inngest function triggered on notebook creation
export const generateNotebook = inngest.createFunction(
  { id: "generate-notebook", retries: 3 },
  { event: "notebook/created" },
  async ({ event, step }) => {
    await step.run("set-processing", () =>
      db.notebooks.update(event.data.notebookId, { status: "processing" })
    );

    const result = await step.run("call-gemini", () =>
      callMasterPedagogy(event.data.sourceId)
    );

    await step.run("persist-result", () =>
      db.notebooks.update(event.data.notebookId, {
        status: "completed",
        blocks: result.blocks,
      })
    );
  }
);
```

Either path, don't leave this "open" past Phase 3 — it changes how the generation route is written, and retrofitting a queue after the synchronous version ships is more work than deciding now.

## 2. Desktop credential storage

**Resolved: encrypted local storage via Tauri's official Stronghold plugin, PKCE for the OAuth exchange.**

The security section in `02-system-architecture.md` covers server-side secrets thoroughly but doesn't say how the Tauri desktop client stores the user's session on disk. Add this:

- Use `@tauri-apps/plugin-stronghold` (official Tauri plugin, IOTA Stronghold-backed encrypted database) to store the Supabase refresh token — never write it to a plain JSON config file.
- Use Supabase's PKCE OAuth flow so the desktop app exchanges a short-lived code for tokens rather than holding a client secret.
- Keep the access token in memory only for the life of the session; re-derive it from the securely stored refresh token on relaunch.

```rust
// src-tauri/src/lib.rs — registering the plugin
tauri::Builder::default()
    .plugin(tauri_plugin_stronghold::Builder::new(|password| {
        // hash the password with argon2 before using it as the vault key
        hash_password(password)
    }).build())
    .run(tauri::generate_context!())
```

## 3. Roadmap ordering

**Resolved: enforce a single vertical slice as the real Phase 1 exit criteria.**

`06-build-roadmap.md`'s phases are reasonable, but nothing currently stops Workspace, Mastery, Extension, or Code Bar work from starting before the core loop is proven. Add an explicit gate:

- Phase 1 is not "done" until one real lecture can go source → ingestion → Master Pedagogy → stored notebook → viewable in the UI, and that output clears the bar set in `09-quality-evaluation-plan.md`. Nothing else starts until this is true.
- Consider moving the Tauri desktop app and browser extension a phase later than currently scheduled. They're additional platforms, not additional core value — each one adds its own packaging, distribution, and credential-security surface (see item 2 above) on top of a core loop that isn't validated yet.
