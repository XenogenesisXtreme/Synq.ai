import type { LectureNote } from "./lecture";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function toLectureMarkdown(note: LectureNote): string {
  const sections = note.sections
    .map(section => {
      const points = section.keyPoints.map(point => `- ${point}`).join("\n");
      const definitions = section.definitions.map(item => `- **${item.term}:** ${item.meaning}`).join("\n");
      return [`## ${section.heading}`, `_${section.timeStart}–${section.timeEnd}_`, section.explanation, "### Key points", points, definitions ? `### Definitions\n${definitions}` : ""].filter(Boolean).join("\n\n");
    })
    .join("\n\n");
  return [`# ${note.title}`, `**${note.course} · ${note.date}**`, note.overview, "## Learning objectives", note.learningObjectives.map(item => `- ${item}`).join("\n"), sections, "## Review questions", note.reviewQuestions.map(item => `- ${item}`).join("\n")].join("\n\n");
}

export function toLectureHtml(note: LectureNote): string {
  const sections = note.sections
    .map(section => `<section><p class="timestamp">${escapeHtml(section.timeStart)}–${escapeHtml(section.timeEnd)}</p><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.explanation)}</p><ul>${section.keyPoints.map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul>${section.definitions.length ? `<dl>${section.definitions.map(definition => `<dt>${escapeHtml(definition.term)}</dt><dd>${escapeHtml(definition.meaning)}</dd>`).join("")}</dl>` : ""}</section>`)
    .join("");
  const terms = note.keyTerms.map(term => `<dt>${escapeHtml(term.term)}</dt><dd>${escapeHtml(term.meaning)}</dd>`).join("");
  return `<article><header><p>${escapeHtml(note.course)} · ${escapeHtml(note.date)}</p><h1>${escapeHtml(note.title)}</h1><p>${escapeHtml(note.overview)}</p></header>${sections}<footer><h2>Key terms</h2><dl>${terms}</dl></footer></article>`;
}
