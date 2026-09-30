# Cost Model and Free-Tier Quotas

## Why this exists

`08-deployment-modes-and-provider-credentials.md` states that quotas, rate limits, and cost controls are required, but doesn't attach a number to any of them. Since Synq.ai is not BYOK — the product pays for every Gemini and ElevenLabs call — that number is what decides whether the free tier is sustainable, not a detail to fill in later.

## Method

1. **Establish real token counts.** Take three lecture-length buckets — 20, 60, and 90 minutes — and run each through the actual ingestion + Master Pedagogy pipeline once the schema is stable. Record the real input token count (transcript + prompt + schema overhead) and real output token count (the generated notebook), read directly from the API response's usage object. Don't estimate this from word counts.
2. **Price it at the tier you'll actually run.** Gemini's free tier only covers Flash and Flash-Lite models — the Pro-class model is paid-only. If the quality bar from `09-quality-evaluation-plan.md` needs Pro-class reasoning, price against Pro rates, not free-tier rates.
3. **Add audio cost.** ElevenLabs bills per character, not per minute: roughly $0.05 per 1,000 characters on the Flash/Turbo model, $0.10 per 1,000 on the higher-quality Multilingual model. A rough conversion is ~850 characters per finished minute of audio (150 spoken words/minute × ~5.7 characters/word), so a 10-minute podcast script is roughly 8,500 characters — about $0.43 on Flash or $0.85 on Multilingual. Recompute this once you know your actual podcast script length relative to lecture length, since a summary script is shorter than the source transcript.
4. **Multiply into a per-user number.** cost-per-notebook × assumed notebooks-per-free-user-per-month = $ exposure per free user. That's the number that actually determines the quota — decide what $ exposure per free user you can sustain, then back into the notebook allowance, rather than picking an allowance first and hoping it's affordable.

## A calculator to move this from guesswork to numbers

The companion tool published alongside this doc lets you plug in real token counts and current per-token rates and see cost-per-notebook and cost-per-free-user-per-month update live, so this stays a five-minute exercise instead of a spreadsheet you rebuild every time a rate changes.

## Open items this doesn't resolve

- What happens when a free user hits quota mid-notebook — fail the generation outright, or silently fall back to Flash-tier quality? Decide this explicitly rather than letting it fall out of whatever the code happens to do.
- Gemini's Batch and Flex pricing tiers offer meaningful discounts for non-urgent generation — worth revisiting once background job processing (see `11-operational-decisions-addendum.md`) is in place, since notebook generation isn't a real-time interaction.
