import type { LectureNote } from "./lecture";
import { validateLectureNote } from "./lecture";

export const fixtureLectureNote: LectureNote = validateLectureNote({
  title: "Why feedback loops make systems learn",
  course: "Systems Thinking · Week 03",
  date: "2026-09-30",
  overview:
    "A compact introduction to feedback loops: how a system’s output can return as an input, amplify change, or stabilize it. The notebook keeps the lecture’s examples and one point of uncertainty visible for review.",
  processingStatus: "fixture-ready",
  learningObjectives: [
    "Distinguish reinforcing loops from balancing loops.",
    "Trace a causal loop using direction and delay.",
    "Explain why a stabilizing intervention can create a new side effect.",
  ],
  sections: [
    {
      id: "section-feedback-basics",
      heading: "Feedback is a loop, not a verdict",
      timeStart: "00:03:12",
      timeEnd: "00:18:40",
      explanation:
        "Feedback occurs when a change in a system travels through a chain of effects and returns to influence the original condition. The return can reinforce the initial direction or counteract it; the loop’s behavior depends on the signs and timing of those links.",
      keyPoints: [
        "A causal loop describes structure, not whether an outcome is good or bad.",
        "Delays can make a balancing loop overshoot before it settles.",
        "The same variable can be reinforced in one loop and balanced in another.",
      ],
      definitions: [
        { term: "Reinforcing loop", meaning: "A feedback structure that amplifies movement in the same direction." },
        { term: "Balancing loop", meaning: "A feedback structure that counteracts movement toward a target or constraint." },
      ],
      formulas: ["Net change ≈ reinforcing influence − balancing influence"],
      workedExamples: [
        {
          title: "A study habit loop",
          steps: [
            "A learner practices a concept.",
            "Practice improves recall confidence.",
            "Confidence makes another practice session more likely.",
          ],
        },
      ],
      teacherEmphasis: ["Name the loop before judging the outcome.", "Mark delays explicitly."],
      commonMistakes: ["Treating every loop as self-reinforcing.", "Ignoring the time needed for an effect to arrive."],
      linkedVisuals: ["visual-causal-loop"],
      intuition: "A loop is the system answering its own previous move.",
      whyItMatters: "Seeing the loop helps you choose an intervention point instead of reacting to a single event.",
      selfCheck: ["Which link would you measure first if the loop was hard to observe?"],
      connections: ["Control systems", "Habit formation"],
    },
    {
      id: "section-intervention",
      heading: "Interventions change the shape of the loop",
      timeStart: "00:18:41",
      timeEnd: "00:34:08",
      explanation:
        "An intervention may reduce a symptom while leaving the structure untouched. Stronger interventions change the information, incentives, or delays that produce the recurring pattern.",
      keyPoints: [
        "Short-term relief can hide a slower balancing response.",
        "Changing a rule or information flow often outperforms adding effort to the same step.",
        "A good intervention states the trade-off it expects to create.",
      ],
      definitions: [],
      formulas: [],
      workedExamples: [],
      teacherEmphasis: ["Ask what the system will do next, not only what it does now."],
      commonMistakes: ["Measuring an intervention only at the first visible outcome."],
      linkedVisuals: ["visual-intervention-map"],
      whyItMatters: "Interventions are more durable when they alter the loop’s information or incentives.",
      stepByStep: ["Describe the recurring pattern.", "Map the feedback links.", "Choose a leverage point.", "Name the likely side effect."],
      selfCheck: ["What delay could make your intervention look ineffective at first?"],
    },
  ],
  visualHighlights: [
    {
      id: "visual-causal-loop",
      timestamp: "00:09:22",
      type: "diagram",
      caption: "A simple causal loop",
      whatItShows: "Practice increases recall confidence, which increases the chance of more practice.",
      relatedSection: "section-feedback-basics",
    },
    {
      id: "visual-intervention-map",
      timestamp: "00:26:15",
      type: "slide",
      caption: "Choose the leverage point",
      whatItShows: "Information flow and delays can be changed without adding another task to the learner.",
      relatedSection: "section-intervention",
    },
  ],
  keyTerms: [
    { term: "Causal loop", meaning: "A chain of cause-and-effect links that eventually returns to influence an earlier variable." },
    { term: "Leverage point", meaning: "A place where a small structural change can alter a system’s behavior." },
  ],
  reviewQuestions: [
    "How would you tell a reinforcing loop from a balancing loop in a new example?",
    "Why can a delay make a balancing policy appear to fail?",
    "Which intervention changes structure rather than effort?",
  ],
  examReview: [
    "Define reinforcing and balancing loops with one concrete example each.",
    "Explain why a feedback diagram needs direction and timing, not only labels.",
  ],
  uncertainItems: [
    { timestamp: "00:31:44", text: "The lecturer refers to a hospital capacity example but does not name the dataset; verify the source before treating the number as evidence." },
  ],
  transcript: [
    { timestamp: "00:03:12", speaker: "Dr. Mira Chen", text: "We are going to treat feedback as a structure before we treat it as a result.", sectionId: "section-feedback-basics" },
    { timestamp: "00:09:22", speaker: "Dr. Mira Chen", text: "Notice that practice comes back as confidence, and confidence changes the probability of practice.", sectionId: "section-feedback-basics" },
    { timestamp: "00:26:15", speaker: "Dr. Mira Chen", text: "The leverage point is often the information arriving between the two visible events.", sectionId: "section-intervention" },
    { timestamp: "00:31:44", speaker: "Dr. Mira Chen", text: "I want to check the dataset behind this example before we make the claim stronger.", sectionId: "section-intervention" },
  ],
});
