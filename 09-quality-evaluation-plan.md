# Pedagogical Quality Evaluation Plan

## Why this exists

The failure-handling design in `02-system-architecture.md` covers what happens when Gemini is unavailable. It does not cover what happens when Gemini is available and wrong, vague, or misleading. Since the product's entire value rests on explaining lecture material well, that gap needs to close before Phase 3 is considered done — not after launch.

## The golden set

Build a fixed set of 15–20 real source materials before writing a single evaluation script. Spread them deliberately:

- 5–6 formula- or notation-heavy sources (math, physics, chemistry)
- 5–6 fact/date-dense sources (history, law, biology taxonomy)
- 4–5 interpretive or ambiguous sources (philosophy, literature, social science) where "correct" isn't a single fact
- 2–3 edge cases: a lecture with a mistake the instructor corrects mid-recording, a source with poor audio/transcription quality, a source that's mostly slides with sparse narration

Pick sources you already understand well enough to personally judge whether an explanation is right, oversimplified, or fabricated. This set shouldn't grow casually once fixed — its value comes from being a stable baseline you can compare against over time.

## The rubric

Score every generated notebook against five dimensions, 1–5 each, before looking at any aggregate:

1. **Factual accuracy** — does every claim trace back to something actually in the source, or to something true and appropriately caveated as inference?
2. **Faithfulness** — did the model add facts, examples, or specifics that are not in the source and not marked as the model's own addition?
3. **Pedagogical clarity** — would someone without prior background in this specific material actually understand the explanation, not just recognize the vocabulary?
4. **Completeness** — did anything substantive from the source go missing?
5. **Uncertainty handling** — where the source itself was unclear or the model couldn't establish something confidently, does the notebook actually say so, or does it state things with false confidence?

The fifth dimension matters specifically because the README already promises this behavior — this rubric is where you find out whether the prompt actually produces it, rather than assuming it does.

## Running it

- Run the real Master Pedagogy prompt and schema against the full golden set.
- Score blind where you can: don't let the fact that you wrote the prompt bias your reading. If possible, get 1–2 people who match the target user — ideally in a field you're not personally expert in — to score alongside you. You already know the source material, which makes hallucinations easy for you to miss and easy for someone unfamiliar to catch.
- Log scores in a simple table (a spreadsheet is fine at this stage): one row per source, one column per dimension, plus a free-text note for anything a 1–5 score doesn't capture.

## Regression discipline

Re-run the full golden set every time the prompt, schema, or model version changes. Treat a drop in any dimension's average score as a regression, the same way you'd treat a failing test. This is the only way multi-week prompt iteration doesn't quietly erode quality in a direction nobody notices until a user complains.

## Ship gate

Define a numeric bar now, before real scores exist to tempt you into lowering it after the fact. A reasonable starting bar: no source scores below 3 on factual accuracy or faithfulness, and the average across all five dimensions is 4.0 or higher. Until the golden set clears that bar, Phase 3 isn't actually done regardless of what the roadmap's date says.
