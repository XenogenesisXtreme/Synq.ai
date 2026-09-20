# Lecture Lens Notebook Experience Specification

## Experience goal

The notebook should behave like a guided lesson generated from a lecture. It should not resemble a transcript with headings added after the fact. Every structural choice should reduce cognitive load, improve recall, or help the learner decide what to do next.

## Content sequence

A typical notebook may open with a short orientation, learning objectives, and a one-screen big-picture explanation. It can then move through concept sections. Each section may contain a definition, plain-language explanation, example, connection to earlier ideas, misconception warning, and quick recall check. The notebook should close with a compact synthesis, important terms, practice prompts, and recommended revision points.

The model should choose components based on the material. A technical lecture may need formulas and worked examples. A history lecture may need chronology and causal relationships. A biology lecture may need labeled processes and comparisons. The interface must not force every lesson into the same visual template.

## Visual and interaction principles

The central reading column should remain visually dominant. A compact outline can show location and completion without occupying most of the screen. Secondary explanations should be collapsible. Audio controls should be easy to find but should not become a permanent oversized panel. Progress should communicate momentum without turning the lesson into a game dashboard.

Use clear hierarchy, generous spacing, short paragraphs, and restrained color. Callouts should have semantic meaning: definitions, examples, warnings, connections, and checks should be visually distinct but not loud. Motion should be subtle and optional. Empty states and processing states should explain what is happening without pretending that generation is instant.

## Engagement model

Engagement should come from active understanding, not decoration. The learner should occasionally predict, recall, compare, apply, or explain. A correct answer should show a concise explanation. An incorrect answer should identify the relevant concept and offer a retry or reveal path. The system should avoid interrupting every paragraph with a quiz; checks should appear at meaningful concept boundaries.

## Content block vocabulary

The initial block vocabulary should include `orientation`, `objective`, `definition`, `explanation`, `example`, `comparison`, `process`, `formula`, `misconception`, `connection`, `knowledge_check`, `summary`, and `revision_prompt`. Each block should have a stable identifier and optional source references so that edits and future mastery events can remain linked to the concept that produced them.

## Quality criteria

A generated notebook is acceptable when a learner can identify the lecture's main idea quickly, understand why each section matters, distinguish important concepts from supporting detail, test recall without leaving the page, and see what to review next. Visual richness is successful only when it supports those outcomes.
