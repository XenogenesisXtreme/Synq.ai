import { generateNotebook, type SourceKind } from "./generation";
import { MpsModelRouter } from "./mpsRouter";
import { SupabasePersistence } from "./supabasePersistence";

type Env = Record<string, string | undefined>;

export async function handleGenerateNotebook(request: Request, env: Env = runtimeEnv()): Promise<Response> {
  if (request.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "AUTH_REQUIRED" }, 401);
  const userId = await resolveUserId(token, env);
  if (!userId) return json({ error: "AUTH_INVALID" }, 401);
  let body: { title?: string; kind?: SourceKind; content?: string };
  try { body = await request.json() as typeof body; } catch { return json({ error: "INVALID_JSON" }, 400); }
  if (!body.content?.trim()) return json({ error: "SOURCE_REQUIRED" }, 400);
  if (body.kind !== "pasted_text" && body.kind !== "text_file") return json({ error: "INVALID_SOURCE_KIND" }, 400);
  try {
    const result = await generateNotebook({ ownerId: userId, title: body.title ?? "Untitled source", kind: body.kind, content: body.content }, { persistence: new SupabasePersistence(env), router: new MpsModelRouter(env) });
    return json({ notebookId: result.notebookId, notebook: result.notebook, processingRunId: result.run.id }, 201);
  } catch (error) {
    console.error("[Synq] generation failed", error instanceof Error ? error.name : "unknown");
    return json({ error: "GENERATION_FAILED" }, 502);
  }
}

async function resolveUserId(token: string, env: Env): Promise<string | null> {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY ?? env.SUPABASE_KEY;
  if (!url || !key) return null;
  const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, { headers: { apikey: key, authorization: `Bearer ${token}` } });
  if (!response.ok) return null;
  const user = await response.json() as { id?: string };
  return user.id ?? null;
}

function json(body: unknown, status: number): Response { return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }); }

function runtimeEnv(): Env {
  return ((globalThis as { process?: { env?: Env } }).process?.env ?? {});
}
