# Synq.ai design brief

## Chosen direction: Guided Learning Studio

Synq uses a **topic-first learning flow, bite-sized lesson framing, rounded editorial cards, learner momentum, and guided path language**. Synq remains a source-aware study workspace where a learner's own lecture becomes the course.

- **Design movement:** Warm editorial education product: optimistic, approachable, and structured around a single learning prompt rather than a dense dashboard.
- **Core principles:** Make the next useful learning action obvious; put the learner's source first; turn complexity into short, scannable lesson moments; make progress feel calm and tangible.
- **Color philosophy:** Warm paper and cloud-white surfaces create a welcoming studio; deep ink anchors reading; soft teal signals trust and knowledge; Synq electric lime is reserved for active learning and generation states.
- **Layout paradigm:** A focused learning prompt and primary action lead the page, followed by rounded lesson/library cards and a slim navigation rail. Supporting context is progressive disclosure rather than equal-weight dashboard panels.
- **Signature elements:** Split-circle Synq mark, lime live pulse, rounded topic/source cards, section index numbers, transcript timestamps, and guided-path progress bars.
- **Interaction philosophy:** A learner can begin with one sentence or one pasted lecture, see clear processing state, then move through short lessons, recall checks, and next-step prompts. No fake completion states.
- **Animation:** Restrained 160–220ms card transitions, subtle pulse for live processing, no decorative infinite motion. Respect reduced motion.
- **Typography system:** Inter/system sans for controls and metadata; a warm serif for the central lesson title and long-form explanation; large, friendly prompt headlines with compact uppercase labels.
- **Brand essence:** Your lecture, turned into a learning path you can actually keep. Personality: grounded, curious, encouraging.
- **Brand voice:** Clear and specific. Example lines: “Bring the next thing you need to understand.” and “Your source stays close while Synq builds the path.”
- **Wordmark/logo:** Lowercase `synq` with a linked split-circle mark representing source and understanding moving into alignment.
- **Signature brand color:** Electric lime `#C8F169`, used only for active learning, primary actions, and live status.

## Implementation guardrails

- Structured `LectureNote` data remains the source of truth; Markdown and HTML are derived exports.
- The browser Workspace is connected to authenticated source/notebook APIs; fixture content is retained only as deterministic fallback/demo content until stored notebook rendering is complete.
- Ordinary users never enter Gemini or ElevenLabs keys. Provider credentials remain server-side.
- All copy, brand, components, and visual assets remain Synq-specific.
