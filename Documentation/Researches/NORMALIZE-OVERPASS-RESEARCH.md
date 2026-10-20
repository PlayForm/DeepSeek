---
title: Normalize Overpass Research
category: Researches
kind: research-output
date: 2026-10-19
status: complete
registry: Documentation/Researches/NORMALIZE-OVERPASS-RESEARCH.md
index: Documentation/INDEX.md
statuses:
  - name: the overpass design (the tools/post-execute + agent/pre-step arms)
    state: implemented
    evidence: landed via Archive/Normalize/NORMALIZE-GRANULAR-PLAN.md; live and smoke-verified
  - name: the normalize-overpass command
    state: implemented
    evidence: registered by every flavor; the I9 fail-open keeps the mount
  - name: the open questions (section 5)
    state: open
    evidence: five questions listed, unresolved
---

# NORMALIZE-OVERPASS-RESEARCH - post-hoc normalization design for the DSH plugin family

Date: 2026-10-19
Author: explorer subagent (session-6111eae9 delegate), read-only research.
Status: research deliverable - no code changed anywhere except this document.

---

## 1. Executive summary

"OVERPASS" is the family concept for **post-hoc normalization**.
Content that was produced WITHOUT normalization (or under a different config) gets normalized LATER, at a natural boundary, WITHOUT destructively rewriting history.
This document answers five questions: which harness boundaries can rewrite what, whether the normalize-file pattern generalizes, whether the durable transcript may be rewritten, what the trigger surface should be, and what the safe design is.

Core verdicts:

1. **The best tool-result boundary is `tools/post-execute`**.
   It is a waterfall whose listener may `accept` with replaced `content`/`value`.
   It can normalize a tool result *before* the result re-enters the model context and is appended to the durable log (live Event contract, `tools/post-execute`, `PostToolDecision` union: `{ kind: 'accept', content? } | { kind: 'accept', value } | { kind: 'block', feedback }`).
2. **The best incoming-message boundary is `agent/pre-step`**.
   It is a waterfall that may return `{ kind: 'enter', messages: UserMessage[] }`, replacing the messages that enter the next step (the last chance before the model sees them).
   It sees ONLY the incoming batch (UserMessage[]), NOT full history.
3. **`llm/stream` cannot overpass history.**
   The request side (`options`) of a LOOP-built call is deep-frozen and "a pure function of the session log ... listeners read it, never rewrite it".
   It ONLY sees/rewrites response deltas - which is exactly what the six stream flavors already do.
4. **The durable session log is append-only in practice.**
   Surface events are appended at the tail (`SurfaceOp = 'append'` is "the normal path for user/assistant/tool messages").
   A `{ op: 'replace', startSeq, endSeq }` surface op exists but is used by compaction and requires `sourceEventSeqs` to include EVERY shadowed node - it is NOT a plugin overpass mechanism.
   NEVER rewrite the transcript.
5. **Recommended design**: an overpass that normalizes (a) files via the existing normalize-file pattern, (b) tool results via a `tools/post-execute` listener gated by the volatile config cells, (c) the incoming message batch via `agent/pre-step`.
   Plus a `normalize: apply overpass to <scope>` human command and a `normalize-history`-style tool for explicit sweeps.
   Trigger surface: config toggle (volatile `get()`), command, tool.
   NEVER touch the durable log; ONLY what re-enters the model or lands in a file.

---

## 2. Boundary-hook findings: which events can rewrite what

ALL contracts below were verified LIVE through the host `Event` inspect provider (`cordis_inspect_query`, platform host, provider `Event`) plus the harness docs in `/Users/nikola/Developer/Documentation/Module/deepseek-harness/docs/`.

### 2a. `llm/stream` - response-side only; request side frozen

- Contract: `'llm/stream'(this: LlmRuntime, options: GenerateOptions, next: () =>
  AsyncIterable<StreamChunk>): AsyncIterable<StreamChunk>` - "Waterfall around
  every streaming model call (retry, replay, routing)" (live Event contract).
- The `options` parameter carries the full request (`GenerateOptions.messages: RequestMessage[]`).
  A listener DOES see the assembled request including past tool results.
  But for a "LOOP-built request" it "arrives deep-frozen (mutation throws): its content is a pure function of the session log (the reconstructability Agent Note), so listeners read it, never rewrite it" (live `llm/stream` options parameter description).
  The dash flavor encodes the same discipline: "`options` (the request, `_Request` - never read, NEVER touched) is a LOOP-built deep-frozen object" - `Classic/packages/hook-dsh-normalize-dash/Source/Function/Apply.ts:91-95` (comment block; the listener itself at `Apply.ts:101`: `Context.on("llm/stream", (_Request, Next) => Normalize(Next(), State))`).
- Hand-built calls do NOT carry the loop marker.
  "Callers own their request inputs" (live contract).
  But a plugin must NOT rely on that for overpass; the loop is the consumer we care about.
- Conclusion: `llm/stream` sees the request side but may ONLY rewrite the RESPONSE deltas.
  It is the existing in-flight normalization seam, NOT an overpass seam.
  Docs anchor: `subsystems/llm-streaming.md:34` (durable Message values / request assembly) and the adapter/replay rules at `subsystems/llm-streaming.md:306` (replay state ONLY when the same adapter instance is registered - another reason rewriting request history would break replay).

### 2b. `tools/post-execute` - CAN normalize a result before it re-enters the model

- Contract (live): `'tools/post-execute'(this: Scoped<ToolRuntime>, exec:
  ToolExecution, result: Readonly<ToolExecutionResult>, next: () =>
  Promise<PostToolDecision>): Promise<PostToolDecision>` - "Accept, replace,
  enrich, or block a normalized dispatch result. `next()` accepts it
  unchanged; thrown tools still reach this waterfall as errors."
- `PostToolDecision` (live): `{ kind: 'accept', content?: ContentBlock[],
  additionalContexts?: UserMessage[] } | { kind: 'accept', value: JsonValue } |
  { kind: 'block', feedback }` - an accept with new `content` (or `value`)
  REPLACES the model-visible result content.
- Pipeline position: `tools/pre-execute` -> guards -> `tools/execute` -> `projectContent` -> `tools/post-execute` ("inspect/replace the result") -> definition-owned `finalizeContent` -> `tools/result` ("the immutable authoritative outcome") - `docs/subsystems/tools.md:182`; pipeline overview `docs/tool-execution-pipeline.md:6,22,25`.
  After the waterfall settles, the result content becomes model context and is appended to the log as a `tool/result` event.
  So a replacement here normalizes the copy that BOTH re-enters the model AND lands in the transcript going forward (NOT retroactively).
- This is the overpass seam for tool results.
  Note the timing semantics: "after they settle, caller cancellation replaces only a successful accepted outcome" (live contract) - listeners must honor `exec.signal`.

### 2c. `tools/pre-execute` - decision only, no content rewriting

- Contract (live): "Allow, deny, cancel, or ask before dispatch" (`PreToolDecision`).
  It runs BEFORE the tool body; there is NO result to normalize.
  It is NOT an overpass seam.
  Anchor: `docs/subsystems/tools.md:182`.

### 2d. `agent/pre-step` - CAN rewrite the messages entering the next step

- Contract (live): `'agent/pre-step'(this: Scoped<Agent>, payload: { agent;
  messages: UserMessage[]; turn; step; signal }, next: () =>
  Promise<PreStepDecision>): Promise<PreStepDecision>` - "Reject a proposed
  step or replace the messages that enter it."
- `PreStepDecision` (live): `{ kind: 'reject' } | { kind: 'enter', messages:
  UserMessage[], startsRequestSeries?: true }`.
- Scope: ONLY the incoming batch of UserMessages for this step (user-authored text plus user-role injected content such as deferred context), NOT the assistant/tool history.
  That still makes it the LAST CHANCE boundary.
  An overpass listener can normalize user-pasted unicode and injected user-role content before the model sees it.
  It CANNOT fix assistant or tool-result history (those are already durable).
- Observation-only relative: `session/event` is "Post-commit, fire-and-forget append feed" (live) - NO rewriting.
  `tools/result` is observe-only ("deep-frozen snapshot", live) - a ledger/probe point, NOT a rewrite point.

### 2e. A sanctioned durable-rewrite precedent: `tools/ptc-dispatch-log`

- Contract (live): "Allow a listener to replace content in the DURABLE LOG COPY of one `run_code` sub-dispatch outcome before the bridge appends its `tool/ptc-dispatch` event."
  It is a waterfall returning `ContentBlock[]`.
- This proves the harness CAN expose log-copy rewriting as a deliberate, narrow waterfall.
  It is the design precedent an overpass should imitate (narrow scope, explicit event).
  It is also the precedent that says: do NOT invent a general transcript rewriter.
  NONE exists outside compaction.

---

## 3. The normalize-file precedent (`Classic/packages/hook-dsh-normalize-file/`)

The file normalizer is the family's first listener-less flavor.
"Everything happens inside one explicit agent tool call - there is NO event listener behind it" (`Source/Function/Normalize.ts:1-7`).
Its pipeline is the overpass pattern in miniature:

1. **READ** - `State.Context.fs.readText(Target, Exec.signal)`.
   Failures are re-thrown with a context prefix; NO write, NO ledger line (`Normalize.ts:121-131`).
2. **COUNT** - the six-fold chain (dashes -> quotes -> ellipsis -> spaces -> invisible -> fullwidth), daisy-chaining `{ text, count }` and summing (`Normalize.ts:92-114`).
   It is pure, shared with the stream flavors via `@playform/hook-dsh-core` (`Normalize.ts:29-33`).
3. **CONDITION** - N = 0 -> NO write at ALL, byte-identical file, NO ledger line (`Normalize.ts:134-137`).
4. **WRITE via the ONE shared executor** - `State.Factory.Write(...)` owns fs/write-intent, standing policy, writeText, and the `fs/observed` emit with the call's exec as actor.
   The governance trio's gate NEVER matches because the tool name is deliberately NOT in any `mutationTools` pin (`Normalize.ts:138-150`, comment `Normalize.ts:43-50`).
5. **LEDGER** - `normalized N char(s) in <path>` via `Factory.Append`, plus the P5 journal record `Factory.Journal(State, "normalized", path, Line)`, N > 0 ONLY (`Normalize.ts:143-148`).

Generalization:

- **(a) Files** - already answered: normalize-file IS file-overpass, on demand.
  Its `Apply` deliberately rejected a watch/background arm because a silent rewriter "would break the edit tool's old_string contract" - `Source/Function/Apply.ts:12-20`.
  Any overpass must respect that: NO background file rewriting; explicit call or command ONLY.
- **(b) Conversation history** - the durable session log is append-only.
  Surface events enter by `'append'` ("added to the tail - normal path for user/assistant/tool messages").
  The alternative `SurfaceOp` is `{ op: 'replace', startSeq, endSeq }`, "Used by compaction; any surface-replacing producer may use it".
  But a replacing node must carry `sourceEventSeqs` covering EVERY shadowed node (`docs/persistence-catalog.md:111-125`).
  Format authority: `docs/session-format-status.md:20,32,45` (writer constant `SESSION_FORMAT_VERSION`, finalized/released V4).
  Verdict: **past transcript messages must NOT be rewritten by an overpass.**
  Compaction is the ONLY sanctioned surface-replacing producer.
  Even it rewrites the model-visible surface under strict invariants, NOT raw history.
- **(c) Tool results in the current batch** - yes, via `tools/post-execute` (section 2b).
  The result is NOT yet durable when the waterfall runs, so normalizing there is pre-commit, NOT history rewriting.

---

## 4. Trigger mechanisms

### 4a. Config-change (volatile cells)

The family's volatile config semantics: "`log`, `logFile` and `replacement` are `.volatile()` in the schema - the loader hands them to apply as stable `{ get() }` references ... Hot edits to the volatile fields commit WITHOUT remounting the plugin" (`hook-dsh-normalize-dash/Source/Interface/Config.ts:8-11`; same wording in `hook-dsh-normalize-file/Source/Interface/Config.ts:8-11`).
The factory's State builder unwraps them defensively, so EVERY read of `State.Replacement` re-reads the current value at the moment of use.

Consequence for overpass: a user toggles a config knob (e.g. `normalizeToolResults: on`).
The NEXT natural boundary - the next `tools/post-execute` or `agent/pre-step` dispatch - reads the fresh value through the volatile cell and applies normalization.
NO re-subscribe, NO remount, NO explicit "reload" step.
This is the zero-cost trigger.

### 4b. Command trigger (explicit sweep)

The host `commands` service (live Service contract): `register(definition: CommandDefinition): () => void` - "Register a global or calling-agent-scoped command".
`execute(agent, line, ...)` parses and runs it "without sending it to the model", logging `command/run` and `command/done` lifecycle events into the log.
`ctx.commands` is the seam: "Plugins register direct human commands without sending invocations to the model" (`docs/capability-seams.md:675`).
A family plugin (or the shared core) can register `normalize: apply overpass to <scope>` with scopes like `files`, `results`, `batch`.
The handler gets a `CommandInvocation` with `agent` and `signal` (live types) and can:
- Run the file sweep over declared targets (reusing the normalize-file pipeline per file), and/or
- Normalize the agent's NEXT incoming batch by arming a one-shot flag that the `agent/pre-step` listener consumes and clears.
  A command CANNOT rewrite already-durable history (see section 3b).

### 4c. Tool trigger

The normalize-file tool already exists as the file arm (`Apply.ts` registers `normalize-file` via `Context.tools.register`).
The same shape generalizes: a `normalize-history`-style tool is possible ONLY in its honest form.
It can normalize files and report what the next pre-step/post-execute passes will do; it CANNOT rewrite the transcript.
A tool CANNOT reach future results by definition, so the tool arm is mostly a reporting/sweep arm.

---

## 5. Recommended OVERPASS design

**Principle: overpass normalizes ONLY what re-enters the model or lands in a file.
It NEVER rewrites the durable transcript, and it NEVER runs silently in the background.**

### 5.1 Scopes

| Scope | Boundary hook | Rewritable? | Mechanism |
|---|---|---|---|
| Files | none (explicit) | yes | normalize-file pipeline (existing) + command sweep |
| Tool results | `tools/post-execute` | pre-commit content | accept-with-content waterfall |
| Incoming batch | `agent/pre-step` | yes (UserMessage[]) | enter-with-messages waterfall |
| Assistant/tool HISTORY | none | **no** | append-only; compaction-only replace op |

### 5.2 Hooks

1. **`tools/post-execute` listener** (per flavor or in the core): on EACH dispatch, if the volatile overpass config is on and the result's ContentBlocks contain text matching the transform, return `{ kind: 'accept', content: <normalized blocks> }`; N = 0 -> plain `next()`.
   Honor `exec.signal`.
   Text-block-ONLY: NEVER touch tool-call arguments blocks post-hoc (execution-critical raw JSON - the same risk the stream flavor gates behind `normalizeToolArguments`, dash `Source/Interface/Config.ts:24-29`).
2. **`agent/pre-step` listener**: if the overpass batch knob is on (or a one-shot arm from the command is set), map the payload `messages` (UserMessage[]) through the six-fold chain and return `{ kind: 'enter', messages: <normalized> }`; unchanged -> plain `next()`.
   Clear one-shot arms after use.
3. **`normalize-file` unchanged**; the command sweep reuses `Function/Normalize` per target.

### 5.3 Triggers

- **Config toggle** (volatile cells, e.g. `overpassResults`, `overpassBatch`): the next boundary picks it up automatically (section 4a).
- **Command** `normalize: apply overpass to <scope>` registered via `ctx.commands.register` (section 4b): file sweep and/or one-shot batch arm.
- **Tool** `normalize-file` (existing): explicit agent-driven file overpass.

### 5.4 Safety classification

- SAFE: post-execute content normalization (pre-commit); pre-step batch normalization (messages NOT yet durable); file normalization through `Factory.Write` (write-intent waterfall, standing policy, observed emit - `Normalize.ts:43-50`).
  ALL with N = 0 -> no-op no-write.
- DESTRUCTIVE / FORBIDDEN: rewriting the durable session log; background file watching (breaks edit old_string contract - `Apply.ts:12-20`); post-hoc rewriting of tool-call argument JSON; using `SurfaceOp.replace` for overpass (compaction-owned).

### 5.5 EffectTS parity note

The `ets-hook-dsh-*` twins must mirror the design: same scope targets, same boundary events, same volatile-config trigger semantics, same N=0 no-op rule, and the same "never rewrite history" invariant.
The transform tables stay in `@playform/hook-dsh-core`; the twins consume the same core composition.
So the ONLY parity work is the two listeners (post-execute, pre-step), the command registration, and the ledger strings.
The strings are identical, so the smokes can assert byte-equality across BOTH stacks.

---

## 6. Ledger / smoke plan

### 6.1 Ledger strings (family convention: one log per module, "one log per module" strings owned by the module, never the factory - `Apply.ts:5`, dash `Apply.ts:69-84`)

- Activation proof, overpass extended:
  `hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, results=on, batch=off, logFile=...)`
  - the field list is the module's own; the `activated (` mechanics stay in the core's `Activate` composer (dash `Apply.ts:70-84`).
- Overpass count lines, N > 0 ONLY (mirroring `Normalize.ts:146`):
  - `overpass: normalized N char(s) in tool result <toolName> <callId>`
  - `overpass: normalized N char(s) in step batch (turn T step S)`
  - command sweep: `overpass: swept K file(s), normalized M char(s)`
- Journal records: reuse the shared `normalized` event of the package_governance v2 domain (`Normalize.ts:148`) with the scope in the path slot; NO new event type.

### 6.2 Smoke assertions (fake ctx + real factory pattern)

1. Byte-identical activation line with the new overpass fields (asserted against the exact string).
2. post-execute: a fake ctx fires `tools/post-execute` with a result whose content holds an em-dash/curly-quote payload.
   Assert the decision is `accept` with normalized content and count N.
   Assert the N = 0 payload passes through via bare `next()` unchanged.
3. pre-step: fake ctx with messages containing curly quotes.
   Assert `enter` with normalized messages.
   Assert the one-shot arm from the command clears after ONE use.
4. Config volatility: flip the volatile cell between two dispatches on the same mounted plugin.
   Assert behavior changes WITHOUT remount.
5. History safety: assert NO listener ever writes to a session log.
   The fake harness asserts ZERO `session/event`-appending calls from overpass paths.
6. Parity: the ets twin smoke asserts the same strings and the same normalized outputs (byte-equality of content blocks).

---

## 7. Open questions

1. Should the post-execute listener be per-flavor (six tiny listeners) or ONE shared listener in `hook-dsh-core` gated by EACH flavor's enabled cell?
   (Family "one log per module" suggests per-flavor ownership of strings, but a shared dispatcher could still route to per-flavor transforms.)
2. Does `agent/pre-step` fire for EVERY model step in a turn (multi-step tool loops) or ONLY at turn entry?
   If EVERY step, the batch arm would re-see injected user-role context EACH step - one-shot arming must be per-step or per-turn (needs a LIVE trace to confirm).
3. Does the `commands` service suffice for a "sweep files" UX (which files? a path argument in the rawInput line?), or should the sweep be a tool?
4. Cost model: post-execute normalization rewrites `content` but the registry has already snapshotted the candidate result ("losslessly snapshots the candidate result" - `tool-execution-pipeline.md:63`).
   Confirm a replaced content is what lands in the log snapshot, NOT merely the UI.
5. Interaction with the governance trio's Gate: confirm overpass writes (if the file sweep ever writes through paths other than `Factory.Write`) NEVER need the `mutationTools` pin (design rule: NEVER add the tool to any list - `Normalize.ts:46-50`).
