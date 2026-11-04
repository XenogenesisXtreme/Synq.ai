import { meetingNoteSchema, type MeetingNote } from "@shared/lecture";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio, type TranscriptionResponse } from "./_core/voiceTranscription";

const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;
const MEETING_HINTS = /meeting|recording|replay|call|session|sync|standup|planning|review|retro|agenda|loom|zoom|teams|meet|drive|video|webinar/i;
const AUDIO_HINTS = /\.(mp3|wav|m4a|webm|ogg)(?:[?#].*)?$/i;
const MAX_MEETINGS_PER_DOCUMENT = 8;
const MAX_PAGE_CONTEXT = 24_000;

type MeetingLink = { url: string; title: string };

type GeneratedMeeting = Omit<MeetingNote, "id">;

function cleanUrl(raw: string) {
  return raw.replace(/[),.;:!?]+$/, "");
}

export function extractMeetingLinks(content: string): MeetingLink[] {
  const seen = new Set<string>();
  const links: MeetingLink[] = [];
  const lines = content.split(/\r?\n/);
  const allMatches = [...content.matchAll(URL_PATTERN)];
  const hasMeetingHints = lines.some(line => MEETING_HINTS.test(line));

  for (const match of allMatches) {
    const url = cleanUrl(match[0]);
    if (!/^https?:\/\//i.test(url) || seen.has(url)) continue;
    const line = lines.find(candidate => candidate.includes(match[0])) ?? "";
    if (hasMeetingHints && !MEETING_HINTS.test(line) && !MEETING_HINTS.test(url)) continue;
    seen.add(url);
    const label = line.replace(match[0], "").replace(/^[\s*#\-\d.)]+/, "").trim();
    links.push({ url, title: label || `Recorded meeting ${links.length + 1}` });
    if (links.length >= MAX_MEETINGS_PER_DOCUMENT) break;
  }
  return links;
}

function extractPageText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_PAGE_CONTEXT);
}

async function readRecording(url: string): Promise<{ text: string; durationSeconds?: number; accessMessage?: string }> {
  const isLikelyAudio = AUDIO_HINTS.test(url);
  try {
    const head = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(12_000) });
    const mime = head.headers.get("content-type")?.toLowerCase() ?? "";
    if (isLikelyAudio || mime.startsWith("audio/")) {
      const result = await transcribeAudio({ audioUrl: url, prompt: "Transcribe this recorded meeting with accurate timestamps and speaker changes." });
      if ("text" in result) {
        const transcription = result as TranscriptionResponse;
        const segments = transcription.segments.map(segment => `[${formatSeconds(segment.start)}] ${segment.text.trim()}`).join("\n");
        return { text: segments || transcription.text, durationSeconds: Math.round(transcription.duration) };
      }
      return { text: "", accessMessage: result.error };
    }
  } catch {
    // Some hosts reject HEAD; try the page route below.
  }

  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15_000), headers: { accept: "text/html,text/plain" } });
    if (!response.ok) return { text: "", accessMessage: `The recording returned HTTP ${response.status}.` };
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (contentType.startsWith("audio/")) {
      const result = await transcribeAudio({ audioUrl: url, prompt: "Transcribe this recorded meeting with accurate timestamps and speaker changes." });
      if ("text" in result) {
        const transcription = result as TranscriptionResponse;
        return { text: transcription.segments.map(segment => `[${formatSeconds(segment.start)}] ${segment.text.trim()}`).join("\n"), durationSeconds: Math.round(transcription.duration) };
      }
      return { text: "", accessMessage: result.error };
    }
    const pageText = extractPageText(await response.text());
    return pageText.length >= 80
      ? { text: pageText }
      : { text: "", accessMessage: "The recording page did not expose a transcript or readable meeting content." };
  } catch (error) {
    return { text: "", accessMessage: error instanceof Error ? error.message : "The recording could not be reached." };
  }
}

function formatSeconds(total: number) {
  const seconds = Math.max(0, Math.floor(total));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return [hours, minutes, remainder].map(value => String(value).padStart(2, "0")).join(":");
}

function normalizeTimestamp(value: unknown) {
  const raw = String(value ?? "00:00:00").trim();
  const parts = raw.split(":").map(Number);
  if (parts.length === 3 && parts.every(Number.isFinite)) return parts.map(part => String(Math.max(0, Math.floor(part))).padStart(2, "0")).join(":");
  if (parts.length === 2 && parts.every(Number.isFinite)) return `00:${String(Math.max(0, Math.floor(parts[0]))).padStart(2, "0")}:${String(Math.max(0, Math.floor(parts[1]))).padStart(2, "0")}`;
  return "00:00:00";
}

function extractJson(content: string) {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try { return JSON.parse(trimmed); } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Meeting note generation returned no JSON object");
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function normalizeGenerated(value: unknown, link: MeetingLink): GeneratedMeeting {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const topics = Array.isArray(raw.topics) ? raw.topics.map((item, index) => {
    const topic = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    return { timestamp: normalizeTimestamp(topic.timestamp), title: String(topic.title ?? `Topic ${index + 1}`), summary: String(topic.summary ?? "No summary provided."), bullets: Array.isArray(topic.bullets) ? topic.bullets.map(String) : [] };
  }) : [];
  const actionItems = Array.isArray(raw.actionItems) ? raw.actionItems.map(item => {
    const action = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    return { owner: String(action.owner ?? "Unassigned"), task: String(action.task ?? "Follow up on this item"), ...(action.dueDate ? { dueDate: String(action.dueDate) } : {}) };
  }) : [];
  return {
    sourceUrl: link.url,
    title: String(raw.title ?? link.title),
    status: "ready",
    overview: String(raw.overview ?? "Meeting notes generated from the linked recording."),
    attendees: Array.isArray(raw.attendees) ? raw.attendees.map(String) : [],
    topics,
    decisions: Array.isArray(raw.decisions) ? raw.decisions.map(String) : [],
    actionItems,
    followUps: Array.isArray(raw.followUps) ? raw.followUps.map(String) : [],
  };
}

async function summarizeMeeting(link: MeetingLink, sourceText: string, durationSeconds?: number): Promise<GeneratedMeeting> {
  const result = await invokeLLM({
    model: "gpt-5-mini",
    maxTokens: 7000,
    responseFormat: { type: "json_object" },
    messages: [
      { role: "system", content: "You create faithful, detailed meeting notes. Use only the supplied recording transcript or page text. Preserve timestamps exactly when present; if a page has no timestamps, use 00:00:00 rather than inventing them. Return JSON only with title, overview, attendees, topics (timestamp, title, summary, bullets), decisions, actionItems (owner, task, optional dueDate), and followUps. Do not invent attendees, decisions, dates, or action owners." },
      { role: "user", content: JSON.stringify({ meetingLink: link.url, suggestedTitle: link.title, durationSeconds, recordingOrTranscript: sourceText }) },
    ],
  });
  const content = result.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Meeting note generation returned empty content");
  return normalizeGenerated(extractJson(content), link);
}

export async function generateMeetingNotes(content: string): Promise<MeetingNote[]> {
  const links = extractMeetingLinks(content);
  const notes: MeetingNote[] = [];
  for (const [index, link] of links.entries()) {
    const id = `meeting-${index + 1}`;
    const recording = await readRecording(link.url);
    if (!recording.text) {
      notes.push({ id, sourceUrl: link.url, title: link.title, status: recording.accessMessage ? "needs_access" : "failed", overview: "Synq found this meeting link but could not read a transcript or recording from it yet.", attendees: [], topics: [], decisions: [], actionItems: [], followUps: [], ...(recording.accessMessage ? { accessMessage: recording.accessMessage } : {}) });
      continue;
    }
    try {
      const generated = await summarizeMeeting(link, recording.text, recording.durationSeconds);
      const validated = meetingNoteSchema.parse({ id, ...generated, ...(recording.durationSeconds ? { durationSeconds: recording.durationSeconds } : {}) });
      notes.push(validated);
    } catch (error) {
      notes.push({ id, sourceUrl: link.url, title: link.title, status: "failed", overview: "Synq reached the meeting content but could not produce validated notes.", attendees: [], topics: [], decisions: [], actionItems: [], followUps: [], accessMessage: error instanceof Error ? error.message : "Meeting note generation failed." });
    }
  }
  return notes;
}
