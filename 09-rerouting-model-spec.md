# Synq.ai Dynamic Rerouting Model Specification

## Document Overview

This specification establishes the architectural contract, evaluation heuristics, prompt parameters, and execution policies for the Synq.ai **Dynamic Multi-Model Rerouting Proxy**.

The Synq.ai backend proxy layer decouples client application interfaces (Synq Workspace, Lecture Lens, Master Pedagogy, Synq Mastery, and Socratic Chat) from external model providers. By analyzing incoming task properties—specifically **query complexity**, **token depth**, and **context limits**—the proxy dynamically routes inference jobs to the optimal model provider tier, enforces strict output contracts, and executes resilient circuit breaker failovers.

```text
               +-------------------------------------------+
               |     Synq.ai Client / Ingestion Request    |
               +-------------------------------------------+
                                     |
                                     v
               +-------------------------------------------+
               |         Dynamic Rerouting Proxy           |
               |  - Complexity Scoring                     |
               |  - Token Depth & Budget Analysis          |
               |  - Context Window Allocation              |
               |  - Latency SLA Matching                   |
               +-------------------------------------------+
                 /                 |                    \
                /                  |                     \
               v                   v                      v
     [Tier 1: Ingestion]   [Tier 2: Reasoning]    [Tier 3: Interactivity]
     Google AI Studio      OpenRouter             Groq Cloud
     (Gemini 1.5 Flash)    (DeepSeek R1)          (Llama 3.3 70B)
               |                   |                      |
               | (Retry)           | (Failover)           | (Failover)
               v                   v                      v
     Exponential Backoff    Groq SpecDec           Cerebras Cloud
     Primary Retry          (Llama 3.3 70B)        (Llama 3.3 70B)
               \                   |                      /
                \                  |                     /
                 v                 v                    v
               +-------------------------------------------+
               |      Circuit Breaker & Fallback Guard     |
               +-------------------------------------------+
                                     |
                                     v
               +-------------------------------------------+
               |    Contract Enforcement & Sanitization    |
               |  (MPSContractEnforcer / Socratic Parser)  |
               +-------------------------------------------+
```

---

## 1. Core Routing Heuristics & Parameters

The rerouting proxy inspects each payload before dispatch, extracting metadata and computing a multi-dimensional routing vector:

$$R = f(\text{Complexity}, \text{TokenDepth}, \text{ContextRequirement}, \text{LatencySLA})$$

### 1.1 Query Complexity Scoring

Query complexity classifies the cognitive workload required to fulfill the request:

| Complexity Class | Score Range | Characteristics | Typical Operations | Assigned Tier |
|---|---|---|---|---|
| **Bulk Ingestion & Extraction** | $C \in [0.0, 0.3)$ | Linear parsing, information filtering, format transformation, low ambiguity. | Processing raw lecture transcripts, slide text dumps, optical character recognition imports. | `ingestion` |
| **Conversational Socratic** | $C \in [0.3, 0.6)$ | High empathy, adaptive questioning, targeted micro-explanations, single-concept guidance. | Real-time Socratic dialogue, quick hint generation, turn-based gap exploration. | `interactivity` |
| **Cognitive Deconstruction** | $C \in [0.6, 1.0]$ | Multi-step causal reasoning, misconception identification, taxonomy mapping, strict JSON schema compilation. | Transforming unstructured notes into structured Master Pedagogy (MPS) blocks. | `reasoning` |

### 1.2 Token Depth Analysis

Token depth measures both the input token volume and the expected output generation budget:

1. **Input Depth ($\text{Token}_{\text{in}}$):**
   - **Shallow ($\le 2\text{k tokens}$):** Interactive chat history, single user questions, localized mastery assessments.
   - **Medium ($2\text{k} - 32\text{k tokens}$):** Lecture chapters, slide decks, condensed study guides, section deconstruction.
   - **Deep ($32\text{k} - 1\text{M}+ \text{tokens}$):** Full-semester transcripts, video audio logs, multi-hour lecture recordings, comprehensive syllabi.
2. **Output Depth ($\text{Token}_{\text{out}}$):**
   - **Micro ($\le 120\text{ tokens}$):** Socratic tutor turns (enforced maximum 2 sentences + gap tag).
   - **Structured Batch ($1\text{k} - 4\text{k tokens}$):** Full pedagogical block compilation (`MPSBlock[]`).

### 1.3 Context Limits & Window Allocation

Providers are matched strictly against their verified reliable context envelopes:

- **Google Gemini 1.5 Flash:** Allocates up to 1,000,000+ tokens. Selected whenever $\text{Token}_{\text{in}} > 64\text{k tokens}$ or when processing unstructured multimedia transcripts.
- **DeepSeek R1 (via OpenRouter):** Allocates up to 64k–128k tokens. Ideal for rigorous reasoning loops where context fits within intermediate buffers.
- **Groq Cloud (Llama 3.3 70B):** Allocates up to 8k–32k active conversation windows with immediate token-to-first-byte delivery.
- **Cerebras Cloud (Llama 3.3 70B):** Wafer-scale inference engine providing immediate throughput when failover is triggered.

### 1.4 Latency SLA Targets

- **Sub-500ms Interactivity SLA:** Enforced for `SocraticAgentLoop`. User cannot perceive delay during study dialogues.
- **Asynchronous Pipeline SLA (<10s):** Enforced for `MPSContractEnforcer`. Prioritizes structural fidelity, deterministic schema validation, and reasoning depth over raw speed.

---

## 2. Multi-Model Provider Delegation Matrix

```text
+-------------------+----------------------------+-----------------------------+--------------------------+
| Tier              | Primary Provider           | Failover Secondary          | Emergency Circuit Breaker|
+-------------------+----------------------------+-----------------------------+--------------------------+
| ingestion         | Google Gemini 1.5 Flash    | Gemini 1.5 Flash (Backoff)  | Tier Exhaustion Alert    |
| reasoning         | DeepSeek R1 (OpenRouter)   | Groq Llama 3.3 70B SpecDec  | Cerebras Llama 3.3 70B   |
| interactivity     | Groq Llama 3.3 70B Versat. | Cerebras Llama 3.3 70B      | Tier Exhaustion Alert    |
+-------------------+----------------------------+-----------------------------+--------------------------+
```

### 2.1 Tier 1: Ingestion (`ingestion`)

- **Primary Provider:** Google AI Studio / Gemini API
- **Model:** `gemini-1.5-flash`
- **Base URL:** `https://googleapis.com`
- **Temperature:** `0.2`
- **Key Responsibilities:**
  - Ingestion of large, messy transcripts from Lecture Lens.
  - Chunk boundary normalization, speaker diarization synthesis, timestamp preservation.
  - Preservation of source integrity without loss of pedagogical context.

### 2.2 Tier 2: Reasoning (`reasoning`)

- **Primary Provider:** OpenRouter
- **Model:** `deepseek/deepseek-r1:free` (with automated failover to paid tier or secondary)
- **Base URL:** `https://openrouter.ai`
- **Secondary Provider:** Groq Cloud
- **Model:** `llama-3.3-70b-specdec`
- **Base URL:** `https://groq.com`
- **Temperature:** `0.1` (deterministic execution)
- **Response Format:** `{ "type": "json_object" }`
- **Key Responsibilities:**
  - Deep cognitive restructuring of raw input.
  - Extraction and compilation into strictly typed `MPSBlock` items:
    - `definition`: Explicit conceptual boundaries and definitions.
    - `explanation`: Clear pedagogical breakdowns.
    - `misconception`: Explicit warnings regarding common cognitive traps.
    - `knowledge_check`: Formative assessment questions with options and rationales.
    - `summary`: High-yield structural summaries.
  - Validated by `MPSContractEnforcer` to guarantee zero hallucinations or malformed schema payloads.

### 2.3 Tier 3: Interactivity (`interactivity`)

- **Primary Provider:** Groq Cloud
- **Model:** `llama-3.3-70b-versatile`
- **Base URL:** `https://groq.com`
- **Temperature:** `0.4`
- **Key Responsibilities:**
  - Real-time conversational guidance via `SocraticAgentLoop`.
  - Enforced two-sentence brevity constraint to maintain dialogue velocity.
  - Dynamic knowledge gap tracking via appended token syntax:
    ```text
    |GAPS: concept_a, concept_b|
    ```
  - Direct integration with Synq Mastery state tracking.

### 2.4 Tier 4: Wafer-Scale Fallback (`fallback`)

- **Emergency Fallback Provider:** Cerebras Cloud
- **Model:** `llama-3.3-70b`
- **Base URL:** `https://api.cerebras.ai/v1`
- **Temperature:** Matched dynamically to incoming tier (`0.1` for reasoning, `0.4` for interactivity).
- **Key Responsibilities:**
  - Instantaneous wafer-scale failover when primary and secondary providers encounter upstream rate limits (HTTP 429), timeouts (HTTP 504), or service degradations.
  - Delivers industry-leading tokens-per-second to prevent pipeline stalling.

---

## 3. Proxy Configuration & Circuit Breaker Logic

The orchestration router (`MPSModelRouter`) implements an automated retry and circuit breaker loop:

```typescript
// Retry Delay Strategy: Exponential Backoff with Jitter
const delayMs = Math.pow(2, retryCount) * 1000;
```

### 3.1 Failure Modes & Recovery Actions

| Failure Mode | Trigger Condition | Router Action |
|---|---|---|
| **Rate Limit (HTTP 429)** | Upstream quota exhausted | Immediately switch to next provider in tier pool without counting against global fault limit. |
| **Timeout / Latency Spike** | Response time $> 2.5\times$ target SLA | Abort stream, log latency violation, route to Cerebras Cloud fallback. |
| **Schema Validation Error** | `MPSContractEnforcer` fails to validate JSON | Reroute to reasoning tier with increased temperature penalty and schema reminder prompt. |
| **Empty Response** | `choices.length === 0` | Trigger exponential backoff retry on alternate provider config. |
| **Tier Exhaustion** | All providers in tier pool fail | Trip circuit breaker: throw `[Circuit Breaker Failure] Exhausted tier: <tier>`. |

---

## 4. Prompt Parameter Schema

Requests dispatched through the proxy encapsulate parameters within standardized envelopes:

### 4.1 Reasoning Tier Envelope (`MPSContractEnforcer`)

```json
{
  "tier": "reasoning",
  "temperature": 0.1,
  "response_format": { "type": "json_object" },
  "messages": [
    {
      "role": "system",
      "content": "You are the core Master Pedagogy Skill (MPS) compiler for Synq.ai. Convert input into a strictly verified JSON object matching this schema exactly: { \"blocks\": Array<{ \"type\": \"definition\" | \"explanation\" | \"misconception\" | \"knowledge_check\" | \"summary\", \"concept\": string, \"content\": string, \"metadata\": { \"source_timestamp\": string, \"trap_warning\": string, \"question_options\": string[] } }> } Answer inside pure JSON format only."
    },
    {
      "role": "user",
      "content": "Deconstruct this text: <raw_source_text>"
    }
  ]
}
```

### 4.2 Interactivity Tier Envelope (`SocraticAgentLoop`)

```json
{
  "tier": "interactivity",
  "temperature": 0.4,
  "messages": [
    {
      "role": "system",
      "content": "You are a sub-500ms real-time Socratic tutor. Address student gaps: [<comma_separated_gaps>]. Keep messages under 2 short sentences. Append exactly this parsing block to the absolute end of your response text: |GAPS: gap1, gap2|"
    },
    {
      "role": "user",
      "content": "<student_response>"
    }
  ]
}
```

---

## 5. Security & Secret Isolation

In alignment with Synq.ai's managed deployment principles:

1. **Server-Side Key Isolation:** All API credentials (`GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `CEREBRAS_API_KEY`) reside exclusively in serverless environment variables.
2. **Zero Client Leakage:** No keys, provider URLs, or raw provider errors are exposed to the browser or Tauri client bundle.
3. **Sanitized Telemetry:** Proxy telemetry records task tier, token latency, and retry counts, while stripping proprietary user learning content and raw transcript tokens from execution logs.
