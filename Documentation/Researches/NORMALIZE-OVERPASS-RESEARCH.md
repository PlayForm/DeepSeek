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

Date: 2026-10-19 Author: explorer subagent (session-6111eae9 delegate), read-only research.

Status: research deliverable - no code changed anywhere except this document.

---

## 1. Executive summary

"OVERPASS" is the family concept for **post-hoc normalization**.

Content that was produced WITHOUT normalization (or under a different config) gets normalized LATER,
at a natural boundary, WITHOUT destructively rewriting history.

This document answers five questions: which harness boundaries can rewrite what, whether the
normalize-file pattern generalizes, whether the durable transcript may be rewritten, what the
trigger surface should be, and what the safe design is.

Core verdicts:

1. **The best tool-result boundary is `tools/post-execute`.**

    It is a waterfall whose listener may `accept` with replaced `content`/`value`.

    It can normalize a tool result _before_ the result re-enters the model context and is appended
    to the durable log (live Event contract, `tools/post-execute`, `PostToolDecision` union:
    `{ kind: 'accept', content? } | { kind: 'accept', value } | { kind: 'block', feedback }`).

2. **The best incoming-message boundary is `agent/pre-step`.**

    It is a waterfall that may return `{ kind: 'enter', messages: UserMessage[] }`, which replaces
    the messages that enter the next step (the last chance before the model sees them).

    It sees ONLY the incoming batch (UserMessage[]), NOT full history.

3. **`llm/stream` cannot overpass history.**

    The request side (`options`) of a LOOP-built call is deep-frozen and "a pure function of the
    session log ... listeners read it, never rewrite it".

    It ONLY sees and rewrites response deltas, which is exactly what the six stream flavors already
    do.

4. **The durable session log is append-only in practice.**

    Surface events are appended at the tail (`SurfaceOp = 'append'` is "the normal path for
    user/assistant/tool messages").

    A `{ op: 'replace', startSeq, endSeq }` surface op exists but is used by compaction and requires
    `sourceEventSeqs` to include EVERY shadowed node, so it is NOT a plugin overpass mechanism.

    NEVER rewrite the transcript.

5. **Recommended design.**

    An overpass normalizes (a) files through the existing normalize-file pattern, (b) tool results
    through a `tools/post-execute` listener gated by the volatile config cells, and (c) the incoming
    message batch through `agent/pre-step`.

    The design also adds a `normalize: apply overpass to <scope>` human command and a
    `normalize-history`-style tool for explicit sweeps.

    The trigger surface is a config toggle (volatile `get()`), a command, and a tool.

    It NEVER touches the durable log and normalizes ONLY what re-enters the model or lands in a
    file.

---

## 2. Boundary-hook findings: which events can rewrite what

The host `Event` inspect provider (`cordis_inspect_query`, platform host, provider `Event`) and the
harness docs in `/Users/nikola/Developer/Documentation/Module/deepseek-harness/docs/` verify ALL
contracts below LIVE.

### 2a. `llm/stream` - response-side only; request side frozen

- Contract:
  `'llm/stream'(this: LlmRuntime, options: GenerateOptions, next: () => AsyncIterable<StreamChunk>): AsyncIterable<StreamChunk>` -
  "Waterfall around every streaming model call (retry, replay, routing)" (live Event contract).
- The `options` parameter carries the full request (`GenerateOptions.messages: RequestMessage[]`),
  so a listener DOES see the assembled request including past tool results. For a "LOOP-built
  request", however, it "arrives deep-frozen (mutation throws): its content is a pure function of
  the session log (the reconstructability Agent Note), so listeners read it, never rewrite it" (live
  `llm/stream` options parameter description). The dash flavor encodes the same discipline:
  "`options` (the request, `_Request` - never read, NEVER touched) is a LOOP-built deep-frozen
  object" - `Classic/packages/hook-dsh-normalize-dash/Source/Function/Apply.ts:91-95` (comment
  block; the listener itself at `Apply.ts:101`:
  `Context.on("llm/stream", (_Request, Next) => Normalize(Next(), State))`).
- Hand-built calls do NOT carry the loop marker, and "Callers own their request inputs" (live
  contract), but a plugin must NOT rely on that for overpass, because the loop is the consumer we
  care about.
- Conclusion: `llm/stream` sees the request side but may ONLY rewrite the RESPONSE deltas, so it is
  the existing in-flight normalization seam, NOT an overpass seam (docs anchor:
  `subsystems/llm-streaming.md:34` for durable Message values / request assembly, and the
  adapter/replay rules at `subsystems/llm-streaming.md:306`, which allow replay state ONLY when the
  same adapter instance is registered - another reason rewriting request history would break
  replay).

### 2b. `tools/post-execute` - CAN normalize a result before it re-enters the model

- Contract (live):
  `'tools/post-execute'(this: Scoped<ToolRuntime>, exec: ToolExecution, result: Readonly<ToolExecutionResult>, next: () => Promise<PostToolDecision>): Promise<PostToolDecision>` -
  "Accept, replace, enrich, or block a normalized dispatch result. `next()` accepts it unchanged;
  thrown tools still reach this waterfall as errors."
- `PostToolDecision` (live):
  `{ kind: 'accept', content?: ContentBlock[], additionalContexts?: UserMessage[] } | { kind: 'accept', value: JsonValue } | { kind: 'block', feedback }` -
  an accept with new `content` (or `value`) REPLACES the model-visible result content.
- Pipeline position: `tools/pre-execute` -> guards -> `tools/execute` -> `projectContent` ->
  `tools/post-execute` ("inspect/replace the result") -> definition-owned `finalizeContent` ->
  `tools/result` ("the immutable authoritative outcome") - `docs/subsystems/tools.md:182`; pipeline
  overview `docs/tool-execution-pipeline.md:6,22,25`. After the waterfall settles, the result
  content becomes model context and is appended to the log as a `tool/result` event, so a
  replacement here normalizes the copy that BOTH re-enters the model AND lands in the transcript
  going forward (NOT retroactively).
- This is the overpass seam for tool results, and the timing semantics matter: "after they settle,
  caller cancellation replaces only a successful accepted outcome" (live contract), so listeners
  must honor `exec.signal`.

### 2c. `tools/pre-execute` - decision only, no content rewriting

- Contract (live): "Allow, deny, cancel, or ask before dispatch" (`PreToolDecision`). It runs BEFORE
  the tool body, so there is NO result to normalize and it is NOT an overpass seam (anchor:
  `docs/subsystems/tools.md:182`).

### 2d. `agent/pre-step` - CAN rewrite the messages entering the next step

- Contract (live):
  `'agent/pre-step'(this: Scoped<Agent>, payload: { agent; messages: UserMessage[]; turn; step; signal }, next: () => Promise<PreStepDecision>): Promise<PreStepDecision>` -
  "Reject a proposed step or replace the messages that enter it."
- `PreStepDecision` (live):
  `{ kind: 'reject' } | { kind: 'enter', messages: UserMessage[], startsRequestSeries?: true }`.
- Scope: ONLY the incoming batch of UserMessages for this step (user-authored text plus user-role
  injected content such as deferred context), NOT the assistant/tool history, which still makes it
  the LAST CHANCE boundary. An overpass listener can normalize user-pasted unicode and injected
  user-role content before the model sees it, but it CANNOT fix assistant or tool-result history,
  because those are already durable.
- Observation-only relative: `session/event` is "Post-commit, fire-and-forget append feed" (live),
  which means NO rewriting, and `tools/result` is observe-only ("deep-frozen snapshot", live), so it
  is a ledger/probe point, NOT a rewrite point.

### 2e. A sanctioned durable-rewrite precedent: `tools/ptc-dispatch-log`

- Contract (live): "Allow a listener to replace content in the DURABLE LOG COPY of one `run_code`
  sub-dispatch outcome before the bridge appends its `tool/ptc-dispatch` event." It is a waterfall
  returning `ContentBlock[]`.
- This proves the harness CAN expose log-copy rewriting as a deliberate, narrow waterfall, and it is
  the design precedent an overpass should imitate (narrow scope, explicit event). It is also the
  precedent that says: do NOT invent a general transcript rewriter, because NONE exists outside
  compaction.

---

## 3. The normalize-file precedent (`Classic/packages/plugin-dsh-normalize-file/`)

The file normalizer is the first listener-less flavor of the family, because "Everything happens
inside one explicit agent tool call - there is NO event listener behind it"
(`Source/Function/Normalize.ts:1-7`).

Its pipeline is the overpass pattern in miniature:

1. **Read.**

    `State.Context.fs.readText(Target, Exec.signal)` re-throws failures with a context prefix, so
    there is NO write and NO ledger line (`Normalize.ts:121-131`).

2. **Count.**

    The six-fold chain (dashes -> quotes -> ellipsis -> spaces -> invisible -> fullwidth)
    daisy-chains `{ text, count }` and sums it (`Normalize.ts:92-114`), and it is pure and shared
    with the stream flavors via `@playform/lib-dsh-core` (`Normalize.ts:29-33`).

3. **Condition.**

    N = 0 means NO write at ALL, a byte-identical file, and NO ledger line (`Normalize.ts:134-137`).

4. **Write through the ONE shared executor.**

    `State.Factory.Write(...)` owns fs/write-intent, standing policy, writeText, and the
    `fs/observed` emit with the call's exec as actor, and the gate of the governance trio NEVER
    matches because the tool name is deliberately NOT in any `mutationTools` pin
    (`Normalize.ts:138-150`, comment `Normalize.ts:43-50`).

5. **Ledger.**

    `normalized N char(s) in <path>` goes through `Factory.Append`, plus the P5 journal record
    `Factory.Journal(State, "normalized", path, Line)`, with N > 0 ONLY (`Normalize.ts:143-148`).

Generalization:

- **(a) Files** - normalize-file IS file-overpass, on demand, and its `Apply` deliberately rejected
  a watch/background arm because a silent rewriter "would break the edit tool's old_string contract"
  (`Source/Function/Apply.ts:12-20`). Any overpass must respect that rule: NO background file
  rewriting, explicit call or command ONLY.
- **(b) Conversation history** - the durable session log is append-only, because surface events
  enter by `'append'` ("added to the tail - normal path for user/assistant/tool messages"). The
  alternative `SurfaceOp` is `{ op: 'replace', startSeq, endSeq }`, "Used by compaction; any
  surface-replacing producer may use it", but a replacing node must carry `sourceEventSeqs` covering
  EVERY shadowed node (`docs/persistence-catalog.md:111-125`), and format authority sits in
  `docs/session-format-status.md:20,32,45` (writer constant `SESSION_FORMAT_VERSION`,
  finalized/released V4). Verdict: **past transcript messages must NOT be rewritten by an
  overpass**, because compaction is the ONLY sanctioned surface-replacing producer, and even it
  rewrites the model-visible surface under strict invariants, NOT raw history.
- **(c) Tool results in the current batch** - yes, via `tools/post-execute` (section 2b), because
  the result is NOT yet durable when the waterfall runs, so normalizing there is pre-commit, NOT
  history rewriting.

---

## 4. Trigger mechanisms

### 4a. Config-change (volatile cells)

The volatile config semantics of the family: "`log`, `logFile` and `replacement` are `.volatile()`
in the schema - the loader hands them to apply as stable `{ get() }` references ... Hot edits to the
volatile fields commit WITHOUT remounting the plugin"
(`hook-dsh-normalize-dash/Source/Interface/Config.ts:8-11`; same wording in
`plugin-dsh-normalize-file/Source/Interface/Config.ts:8-11`).

The State builder of the factory unwraps them defensively, so EVERY read of `State.Replacement`
re-reads the current value at the moment of use.

Consequence for overpass: a user toggles a config knob (e.g. `normalizeToolResults: on`), and the
NEXT natural boundary (the next `tools/post-execute` or `agent/pre-step` dispatch) reads the fresh
value through the volatile cell and applies normalization.

There is NO re-subscribe, NO remount, and NO explicit "reload" step, which makes this the zero-cost
trigger.

### 4b. Command trigger (explicit sweep)

The host `commands` service (live Service contract):
`register(definition: CommandDefinition): () => void` - "Register a global or calling-agent-scoped
command". `execute(agent, line, ...)` parses and runs it "without sending it to the model", logging
`command/run` and `command/done` lifecycle events into the log. `ctx.commands` is the seam: "Plugins
register direct human commands without sending invocations to the model"
(`docs/capability-seams.md:675`).

A family plugin (or the shared core) can register `normalize: apply overpass to <scope>` with scopes
like `files`, `results`, `batch`.

The handler gets a `CommandInvocation` with `agent` and `signal` (live types) and can:

- Run the file sweep over declared targets (reusing the normalize-file pipeline per file), and/or
- Normalize the agent's NEXT incoming batch by arming a one-shot flag that the `agent/pre-step`
  listener consumes and clears, because a command CANNOT rewrite already-durable history (see
  section 3b).

### 4c. Tool trigger

The normalize-file tool already exists as the file arm (`Apply.ts` registers `normalize-file` via
`Context.tools.register`), and the same shape generalizes: a `normalize-history`-style tool is
possible ONLY in its honest form.

It can normalize files and report what the next pre-step/post-execute passes will do, but it CANNOT
rewrite the transcript.

A tool CANNOT reach future results by definition, so the tool arm is mostly a reporting/sweep arm.

---

## 5. Recommended OVERPASS design

**Principle: overpass normalizes ONLY what re-enters the model or lands in a file. It NEVER rewrites
the durable transcript, and it NEVER runs silently in the background.**

### 5.1 Scopes

| Scope                  | Boundary hook        | Rewritable?         | Mechanism                                          |
| ---------------------- | -------------------- | ------------------- | -------------------------------------------------- |
| Files                  | none (explicit)      | yes                 | normalize-file pipeline (existing) + command sweep |
| Tool results           | `tools/post-execute` | pre-commit content  | accept-with-content waterfall                      |
| Incoming batch         | `agent/pre-step`     | yes (UserMessage[]) | enter-with-messages waterfall                      |
| Assistant/tool HISTORY | none                 | **no**              | append-only; compaction-only replace op            |

### 5.2 Hooks

1. **`tools/post-execute` listener.**

    Per flavor or in the core, on EACH dispatch, if the volatile overpass config is on and the
    result's ContentBlocks contain text matching the transform, it returns
    `{ kind: 'accept', content: <normalized blocks> }`, and N = 0 means plain `next()`, with
    `exec.signal` honored.

    Text-block-ONLY: NEVER touch tool-call arguments blocks post-hoc (execution-critical raw JSON -
    the same risk the stream flavor gates behind `normalizeToolArguments`, dash
    `Source/Interface/Config.ts:24-29`).

2. **`agent/pre-step` listener.**

    If the overpass batch knob is on (or a one-shot arm from the command is set), it maps the
    payload `messages` (UserMessage[]) through the six-fold chain and returns
    `{ kind: 'enter', messages: <normalized> }`, and unchanged input means plain `next()`, with
    one-shot arms cleared after use.

3. **`normalize-file` unchanged.**

    The command sweep reuses `Function/Normalize` per target.

### 5.3 Triggers

- **Config toggle** (volatile cells, e.g. `overpassResults`, `overpassBatch`), which the next
  boundary picks up automatically (section 4a).
- **Command** `normalize: apply overpass to <scope>` registered via `ctx.commands.register` (section
  4b), for a file sweep and/or a one-shot batch arm.
- **Tool** `normalize-file` (existing), for explicit agent-driven file overpass.

### 5.4 Safety classification

- SAFE: post-execute content normalization (pre-commit), pre-step batch normalization (messages NOT
  yet durable), and file normalization through `Factory.Write` (write-intent waterfall, standing
  policy, observed emit - `Normalize.ts:43-50`), ALL with N = 0 -> no-op no-write.
- DESTRUCTIVE / FORBIDDEN: rewriting the durable session log, background file watching (which breaks
  the edit old_string contract - `Apply.ts:12-20`), post-hoc rewriting of tool-call argument JSON,
  and using `SurfaceOp.replace` for overpass (compaction-owned).

### 5.5 EffectTS parity note

The `ets-hook-dsh-*` twins must mirror the design: same scope targets, same boundary events, same
volatile-config trigger semantics, same N=0 no-op rule, and the same "never rewrite history"
invariant.

The transform tables stay in `@playform/lib-dsh-core`, and the twins consume the same core
composition.

Thus the ONLY parity work is the two listeners (post-execute, pre-step), the command registration,
and the ledger strings, and because the strings are identical, the smokes can assert byte-equality
across BOTH stacks.

---

## 6. Ledger / smoke plan

### 6.1 Ledger strings (family convention: one log per module, strings owned by the module and never by the factory - `Apply.ts:5`, dash `Apply.ts:69-84`)

- Activation proof, overpass extended:
  `hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, results=on, batch=off, logFile=...)`
    - the field list belongs to the module, and the `activated (` mechanics stay in the core's
      `Activate` composer (dash `Apply.ts:70-84`).
- Overpass count lines, N > 0 ONLY (mirroring `Normalize.ts:146`):
    - `overpass: normalized N char(s) in tool result <toolName> <callId>`
    - `overpass: normalized N char(s) in step batch (turn T step S)`
    - command sweep: `overpass: swept K file(s), normalized M char(s)`
- Journal records reuse the shared `normalized` event of the package_governance v2 domain
  (`Normalize.ts:148`) with the scope in the path slot, so NO new event type appears.

### 6.2 Smoke assertions (fake ctx + real factory pattern)

1. **Activation line.**

    The activation line stays byte-identical with the new overpass fields (asserted against the
    exact string).

2. **post-execute.**

    A fake ctx fires `tools/post-execute` with a result whose content holds an em-dash/curly-quote
    payload, the assertion checks that the decision is `accept` with normalized content and count N,
    and the assertion checks that the N = 0 payload passes through via bare `next()` unchanged.

3. **pre-step.**

    A fake ctx carries messages with curly quotes, the assertion checks for `enter` with normalized
    messages, and the assertion checks that the one-shot arm from the command clears after ONE use.

4. **Config volatility.**

    Flip the volatile cell between two dispatches on the same mounted plugin, then assert that the
    behavior changes WITHOUT remount.

5. **History safety.**

    The fake harness asserts ZERO `session/event`-appending calls from overpass paths, so NO
    listener ever writes to a session log.

6. **Parity.**

    The ets twin smoke asserts the same strings and the same normalized outputs (byte-equality of
    content blocks).

---

## 7. Open questions

1. **Listener placement.**

    Decide whether the post-execute listener is per-flavor (six tiny listeners) or ONE shared
    listener in `lib-dsh-core` gated by EACH flavor's enabled cell, since the family rule "one log
    per module" suggests per-flavor ownership of strings while a shared dispatcher could still route
    to per-flavor transforms.

2. **pre-step cadence.**

    Confirm whether `agent/pre-step` fires for EVERY model step in a turn (multi-step tool loops) or
    ONLY at turn entry, because a per-step arm would re-see injected user-role context EACH step and
    one-shot arming must then be per-step or per-turn (needs a LIVE trace to confirm).

3. **Sweep UX.**

    Decide whether the `commands` service suffices for a "sweep files" UX (which files? a path
    argument in the rawInput line?) or the sweep should be a tool.

4. **Cost model.**

    The registry has already snapshotted the candidate result when post-execute normalization
    rewrites `content` ("losslessly snapshots the candidate result" -
    `tool-execution-pipeline.md:63`), so confirm that a replaced content is what lands in the log
    snapshot, NOT merely the UI.

5. **Governance gate.**

    Confirm that overpass writes NEVER need the `mutationTools` pin (design rule: NEVER add the tool
    to any list - `Normalize.ts:46-50`), even when the file sweep ever writes through paths other
    than `Factory.Write`.
