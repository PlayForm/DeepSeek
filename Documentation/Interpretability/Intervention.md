# Intervention

## 1. The frame

In this family an "intervention" is a listener that is registered on one named event, called a seam,
and that either rewrites the payload that the seam carries or only watches it. Three of the ten
rewrite what the model receives: `hook-dsh-normalize-dash` rewrites streamed chunks at `llm/stream`,
`hook-dsh-ccr` replaces a large tool result with a preview and a retrieval marker at
`tools/post-execute`, and `hook-dsh-comment-filter` strips comment spans from `read` results at the
same seam. Two of the ten rewrite what the harness decides: `hook-dsh-workspace-govern` returns a
deny or an ask at `tools/pre-execute`, and `hook-dsh-tool-coach` returns a deny there and prepends
advice at `tools/post-execute`. One adds a whole tool that writes many files in one call,
`plugin-dsh-batch-edit`, and two add tools without touching any payload,
`hook-dsh-workspace-operate` and the retrieval tool inside `hook-dsh-ccr`. Three only observe:
`plugin-dsh-cost` records the session log, `hook-dsh-workspace-journal` records file observations,
and `hook-dsh-live-containers` observes tools and jobs but also appends a section to the system
prompt. No listener here can change the request object; every waterfall listener reads it and
returns a wrapped stream or a decision.

## 2. The plugins

### hook-dsh-normalize-dash

- **Seam** - `"llm/stream"`, registered as `Context.on("llm/stream", ...)`
  (`hook-dsh-normalize-dash/Source/Function/Apply.ts:129`), plus a prepended `"tools/post-execute"`
  arm (`Apply.ts:143`) and a `"agent/pre-step"` arm (`Apply.ts:146`).
- **Reads** - the chunk discriminant `type`, the `text` field of `text-delta` and `reasoning-delta`,
  the `id`, `name` and `argumentsDelta` of `tool-call-delta`, and the assembled `block` of
  `block-end` (`hook-dsh-normalize-dash/Source/Function/Normalize.ts:64-68`, `Normalize.ts:86-93`,
  dispatch in `lib-dsh-core/Source/Stream/Chunk.ts:129-151`); the config `replacement`,
  `normalizeReasoning`, `normalizeToolArguments` and `scopes` (`Normalize.ts:88-92`).
- **Writes** - the `text` field of a text or reasoning delta, the `text` of an assembled text or
  reasoning block, the `argumentsDelta` of a tool-call delta when the tool-args gate is on, and a
  leading `{"__normalize":false` marker entry when a call opts out
  (`lib-dsh-core/Source/Stream/Chunk.ts:132`, `:139`, `:168`, `:189`). With `scopes.toolResults` on
  it also rewrites text blocks of tool results
  (`hook-dsh-normalize-dash/Source/Function/Overpass.ts:31-38`).
- **Changes for the model** - every Unicode dash in streamed text, reasoning, and (when enabled)
  tool arguments arrives as the configured ASCII replacement, while calls named `edit`, `raw-write`
  and `normalize-file` pass through by identity (`lib-dsh-core/Source/Stream/Chunk.ts:182-186`).
- **Changes for the conversation** - the listener returns the wrapped iterable that every downstream
  consumer reads, so the stored transcript holds the normalized characters rather than the original
  ones (`hook-dsh-normalize-dash/Source/Function/Apply.ts:113-116`, `:129-130`).
- **Changes on disk** - one append to the ledger log file, only when at least one character was
  replaced (`hook-dsh-normalize-dash/Source/Function/Normalize.ts:99`), plus a best-effort journal
  record (`Normalize.ts:103`).
- **The property it adds** - deterministic output.

### hook-dsh-ccr

- **Seam** - `"tools/post-execute"`, prepended (`hook-dsh-ccr/Source/Function/Apply.ts:196`,
  `:260`); an `"agent/pre-step"` listener exists only when `contextEngine` is on
  (`Apply.ts:277-278`).
- **Reads** - `Decision.kind`, the presence of a `value` key on the decision, `Decision.content`,
  `Result.content`, `Result.isError` and `Exec.name`
  (`hook-dsh-ccr/Source/Function/Apply.ts:203-212`); the config `targets`, `exempt`,
  `thresholdBytes`, `multipliers` and `compressFailures` (`Compress.ts:57-71`).
- **Writes** - it returns a new decision
  `{ kind: "accept", content: [ { type: "text", text: "[type:preview]\n<<<CCR:hash|type|size>>>" } ] }`
  (`hook-dsh-ccr/Source/Function/Apply.ts:234-246`, marker format in `Marker.ts:23-25`) and inserts
  the full content into its own store (`Compress.ts:77-85`).
- **Changes for the model** - a tool result over the byte gate is replaced by a short preview line
  and a `<<<CCR:hash|type|size>>>` marker, and the model must call `ccr_retrieve` with that hash to
  see the original bytes (`Retrieve.ts:1-20`).
- **Changes for the conversation** - the replacement content is what the tool result carries, so the
  transcript stores the preview and marker; the original bytes survive only in the plugin store
  (`Apply.ts:234-246`).
- **Changes on disk** - the optional JSONL store journal, appended per entry and compacted on boot
  (`hook-dsh-ccr/Source/Function/Store.ts:212`, `:106`), plus the ledger log file.
- **The property it adds** - bounded context.

### hook-dsh-workspace-govern

- **Seam** - `"tools/pre-execute"` (`hook-dsh-workspace-govern/Source/Function/Apply.ts:150-151`)
  and `"tools/post-execute"` as a plain observer (`Apply.ts:198-199`).
- **Reads** - `Exec.name`, `Exec.agent`, `Exec.callId` and `Exec.arguments` (`Apply.ts:162-169`,
  extraction in `Extract.ts:21-49`: the attached `proposal` object, else the first string among
  `path`, `target`, `file`, `filePath`, `notePath`, plus `instruction` and `scope`);
  `Result.success` in the observer (`Apply.ts:212`).
- **Writes** - the returned decision, and only on a hit: `{ kind: "deny", reason: "govern: ..." }`
  or `{ kind: "ask", reason: "govern: ..." }` (`Apply.ts:179-182`); every other branch returns the
  downstream decision unchanged.
- **Changes for the model** - a denied call comes back as a failure carrying the reason string, and
  an escalated call becomes an approval request (`Apply.ts:180-182`).
- **Changes for the conversation** - the deny reason or the approval request appears on the tool
  call, while the post-execute observer adds only a ledger line (`Apply.ts:213-216`).
- **Changes on disk** - the ledger log file only; the decision ring is in memory
  (`Decide.ts:52-56`).
- **The property it adds** - a write guard. Note the shipped default is `enabled=false`, and a cold
  mount wires nothing (`Apply.ts:135-138`).

### hook-dsh-workspace-operate

- **Seam** - no tool-call seam at all: the package contains no `Context.on` registration. It
  registers `Context.root.on("fs/observed", ...)` through the factory Wire
  (`hook-dsh-workspace-operate/Source/Function/Apply.ts:67-69`, registration in
  `plugin-dsh-factory/Source/Function/Wire.ts:39`) and two tools on the registry (`Apply.ts:75-77`).
- **Reads** - from `fs/observed`: `Target.displayPath`, `Observation.kind`, `Observation.version`
  and the `Actor` identity (`Observe.ts:24-40`); from the tools: `kind`, `path`, `name`, `to`,
  `fromPath`, `toPath`, `edge`, `startLine`, `endLine`, `content`, `version` (`Tools.ts:103-135`).
- **Writes** - nothing on any payload; it adds `workspace_propose` and `workspace_proposals` to the
  tool registry (`Apply.ts:76-77`).
- **Changes for the model** - two new tool definitions are visible, and a proposal attempt returns
  either a recorded proposal or a typed refusal (`Tools.ts:86-99`).
- **Changes for the conversation** - the tool calls and their JSON results appear as ordinary tool
  results.
- **Changes on disk** - proposal records go to the storage domain when one is present
  (`Apply.ts:81-103`, `Persist.ts`), otherwise memory only; the ledger log file.
- **The property it adds** - a proposal surface with refusal-to-guess rules. The "tool-call advisor"
  label is not supported by the source: no listener reads a tool call, and the only gate is the rule
  set inside `workspace_propose` (`Rules.ts:1-25`).

### plugin-dsh-batch-edit

- **Seam** - a tool registration, `batch_edit`
  (`plugin-dsh-batch-edit/Source/Function/Apply.ts:160-165`); `"tools/pre-execute"` only when
  `interceptBash` is on (`Apply.ts:181-183`); `"fs/observed"` through the factory Wire
  (`Apply.ts:172-174`); `"agent/pre-step"` (`Apply.ts:221`).
- **Reads** - `Exec.name`, `Exec.arguments.command` (`Apply.ts:85-90`), the tool arguments `action`,
  `machine`, `files`, `searches`, `ops`, `opfile`, `preview`, `deadlineMs` (`Tools.ts:204-294`), and
  the observed `displayPath` and version (`Machine.ts:364-391`).
- **Writes** - a `batchEditOffer` string on the execution object (`Apply.ts:195`), the tool's JSON
  output, and the held files through the factory write executor (`Ops.ts:289`).
- **Changes for the model** - one new tool whose commit returns per-file diffs and counts
  (`Tools.ts:137-171`); the advisory offer is attached to the execution and ledgered
  (`Apply.ts:195-198`), and the source does not show it reaching the model.
- **Changes for the conversation** - the tool call and its JSON result, including diffs when
  `preview` is true (`Tools.ts:172-180`).
- **Changes on disk** - the held files themselves (`Ops.ts:289`), plus the ledger log file.
- **The property it adds** - a batched multi-file edit tool with an atomic gate. The shipped
  `policy.write` default refuses `commit` before any write (`Tools.ts:260-264`).

### hook-dsh-comment-filter

- **Seam** - `"tools/post-execute"`, prepended
  (`hook-dsh-comment-filter/Source/Function/Apply.ts:113-114`), and `"agent/pre-step"` for the
  intent stash (`Apply.ts:119`).
- **Reads** - `Exec.name`, `Exec.agent`, the result's text blocks (`Overpass.ts:50-54`), the last
  user message text (`Intent.ts:35-40`), and the config `enabled`, `targets`, `exempt`, `intent`,
  `intentKeywords`, `notice` (`Gate.ts:1-40`).
- **Writes** - the text of the result's text blocks, through the core arm (`Overpass.ts:58-89`),
  with the rebuilt `read` envelope in `Strip.ts:88-91`.
- **Changes for the model** - a `read` or `ccr_retrieve` result loses its comment spans, line
  numbering is preserved byte for byte, and an omission notice is appended when `notice` is on
  (`Strip.ts:88-91`).
- **Changes for the conversation** - the stripped text is what the tool result stores, so the
  transcript keeps no comment bytes from those results.
- **Changes on disk** - the ledger log file only; the plugin has no file machinery
  (`Apply.ts:23-32`).
- **The property it adds** - comment-free tool results.

### plugin-dsh-cost

- **Seam** - `"session/event"` (`plugin-dsh-cost/Source/Function/Apply.ts:116`) and
  `"session/flush"` (`Apply.ts:119`), both registered inside the ledger effect.
- **Reads** - the session subject's `id` and `origin`, and the session header record's `id` and
  `origin` (`Capture.ts:38-64`); each event's `time` (`Apply.ts:133-137`); the usage record's
  `inputTokens` and `outputTokens` and the source block's `provider` and `model`
  (`Drain.ts:253-270`).
- **Writes** - nothing on any payload; both listeners return void (`Apply.ts:116-121`).
- **Changes for the model** - nothing.
- **Changes for the conversation** - nothing; the report verbs render outside model history
  (`Apply.ts:18-20`).
- **Changes on disk** - a SQLite ledger at the configured `databasePath`, opened with WAL and
  migrated on first open (`Open.ts:21-32`), plus file annotation blocks written through the factory
  executor when the annotate verb runs (`Annotate.ts:220`).
- **The property it adds** - cost visibility.

### hook-dsh-workspace-journal

- **Seam** - `"fs/observed"` on the root context through the factory Wire
  (`hook-dsh-workspace-journal/Source/Function/Apply.ts:109-114`,
  `plugin-dsh-factory/Source/Function/Wire.ts:39`).
- **Reads** - `Target.displayPath` and the `Actor` identity (`Observe.ts:24-30`); the batch records
  in memory (`Observe.ts:41-55`).
- **Writes** - nothing on any payload; the listener only mutates its own batch records and appends
  ledger lines (`Observe.ts:52-55`).
- **Changes for the model** - nothing.
- **Changes for the conversation** - nothing.
- **Changes on disk** - batch and revert records in its own storage domain tables `batches`,
  `entries` and `ring` (`Record.ts:14`, `Storage.ts:1-30`); a revert writes the pre-image back or
  unlinks a file that did not exist (`RevertFile.ts:16-40`).
- **The property it adds** - a write journal with revert.

### hook-dsh-tool-coach

- **Seam** - five registrations: `"tools/post-execute"`
  (`hook-dsh-tool-coach/Source/Function/Apply.ts:291`), `"tools/pre-execute"` (`Apply.ts:393`),
  `"agent/pre-step"` (`Apply.ts:469`), `"system-prompt/assemble"` (`Apply.ts:512`) and
  `"tools/change"` (`Apply.ts:576`).
- **Reads** - `Exec.name`, `Exec.arguments` for the command text (`Apply.ts:305`, `:431`),
  `Exec.agent`, the downstream decision and its `additionalContexts` (`Apply.ts:320`, `:344-353`),
  the step's `messages[].source.kind` (`Apply.ts:474-481`), and the assembly context's `agent`
  (`Apply.ts:519`).
- **Writes** - the `additionalContexts` array of the downstream post-execute decision
  (`Apply.ts:344-353`), a new section on the assembly (`Apply.ts:553-557`), and a deny decision at
  pre-execute (`Apply.ts:415`, `:448`).
- **Changes for the model** - after repeated offenses the model sees a labeled note prepended to the
  tool result contexts, and at the escalated tier it sees a persistent prompt section listing better
  tools (`Apply.ts:340-353`, `:553-557`).
- **Changes for the conversation** - the notes ride on the tool result contexts, so they are part of
  the stored result; the prompt section is not.
- **Changes on disk** - the ledger log file only (`Apply.ts:33-35`).
- **The property it adds** - tool-use coaching.

### hook-dsh-live-containers

- **Seam** - `"system-prompt/assemble"` (`hook-dsh-live-containers/Source/Function/Apply.ts:688`),
  `"tools/post-execute"` (`Apply.ts:754`), `"agent/pre-step"` (`Apply.ts:796`), `"tools/change"`
  (`Apply.ts:833`), and, only when the jobs stack is present, `"tools/pre-execute"`
  (`Apply.ts:875`), `"tools/execute"` (`Apply.ts:889`) and `"session/event"` (`Apply.ts:950`).
- **Reads** - `AssembleContext.scope` (`Apply.ts:701`), `Exec.name` and `Exec.agent`
  (`Apply.ts:769-771`), the step's `messages[].source.kind` (`Apply.ts:801-806`), session event
  `type`, `data` and `seq` (`Apply.ts:955`), and the jobs subscription's event `type`
  (`Apply.ts:912-925`).
- **Writes** - one appended section on the assembly, marked `interpolate: false`
  (`Apply.ts:728-731`); the `tools/execute` arm can return a fabricated result in place of the
  dispatch (`Apply.ts:889-895`).
- **Changes for the model** - the system prompt gains a framed live section, one
  `--- LIVE CONTAINER <id> ... ---` block per container, recomputed on each request
  (`Render.ts:67-69`).
- **Changes for the conversation** - nothing; the section is prompt input and the counters live in
  memory.
- **Changes on disk** - monitor check records in the `live_containers_monitors` storage domain when
  present (`Storage.ts:1-30`, `:149-186`), plus the ledger log file.
- **The property it adds** - live state in the system prompt.

## 3. The matrix

| Plugin                     | Seam                                                                       | Changes the model    | Changes the conversation | Writes to disk                 | Property                 |
| -------------------------- | -------------------------------------------------------------------------- | -------------------- | ------------------------ | ------------------------------ | ------------------------ |
| hook-dsh-normalize-dash    | `llm/stream` (+ prepended `tools/post-execute`)                            | yes                  | yes                      | ledger only                    | deterministic output     |
| hook-dsh-ccr               | `tools/post-execute` (prepended)                                           | yes                  | yes                      | store journal + ledger         | bounded context          |
| hook-dsh-workspace-govern  | `tools/pre-execute` (+ observer)                                           | yes (deny/ask)       | yes (reason)             | ledger only                    | a write guard            |
| hook-dsh-workspace-operate | `fs/observed` (root), no tool seam                                         | yes (two new tools)  | yes (tool results)       | storage domain + ledger        | proposal surface         |
| plugin-dsh-batch-edit      | `batch_edit` tool (+ `tools/pre-execute`, `fs/observed`, `agent/pre-step`) | yes (new tool)       | yes (diffs)              | the edited files + ledger      | batched atomic edit      |
| hook-dsh-comment-filter    | `tools/post-execute` (prepended)                                           | yes                  | yes                      | ledger only                    | comment-free results     |
| plugin-dsh-cost            | `session/event`, `session/flush`                                           | no                   | no                       | SQLite ledger                  | cost visibility          |
| hook-dsh-workspace-journal | `fs/observed` (root)                                                       | no                   | no                       | batch records + reverted files | a write journal          |
| hook-dsh-tool-coach        | `tools/post-execute`, `tools/pre-execute`, `system-prompt/assemble`        | yes                  | yes (notes)              | ledger only                    | tool-use coaching        |
| hook-dsh-live-containers   | `system-prompt/assemble` (+ tool and job observers)                        | yes (prompt section) | no                       | monitor records + ledger       | live state in the prompt |

## 4. The composition story

In one turn the seams fire in a fixed order. `agent/pre-step` runs first and is shared by five
plugins: the comment filter stashes the task text
(`hook-dsh-comment-filter/Source/Function/Apply.ts:119`), the tool coach resets its counters
(`hook-dsh-tool-coach/Source/Function/Apply.ts:469`), the live containers advance their counters
(`hook-dsh-live-containers/Source/Function/Apply.ts:796`), batch-edit holds its boundary
(`plugin-dsh-batch-edit/Source/Function/Apply.ts:221`), and the CCR engine decides at the step only
when its flag is on (`hook-dsh-ccr/Source/Function/Apply.ts:278`). `tools/pre-execute` follows,
where the write guard and the coach can deny and batch-edit only tags
(`hook-dsh-workspace-govern/Source/Function/Apply.ts:150`,
`hook-dsh-tool-coach/Source/Function/Apply.ts:393`,
`plugin-dsh-batch-edit/Source/Function/Apply.ts:182`), then `tools/execute` where the live
containers may fabricate a detached result
(`hook-dsh-live-containers/Source/Function/Apply.ts:889`), then `tools/post-execute`, where the
three prepended arms run outside the plain observers: the source states that a later prepend is
outermost, so the CCR gate compresses bytes that the arms registered after it have already shaped
(`hook-dsh-normalize-dash/Source/Function/Apply.ts:133-137`,
`hook-dsh-ccr/Source/Function/Apply.ts:260`,
`hook-dsh-comment-filter/Source/Function/Apply.ts:113`). The prompt is assembled before the model
call by the coach and the live containers, and the model's own output passes last through
`llm/stream` (`hook-dsh-tool-coach/Source/Function/Apply.ts:512`,
`hook-dsh-live-containers/Source/Function/Apply.ts:688`,
`hook-dsh-normalize-dash/Source/Function/Apply.ts:129`). Two plugins are independent of that chain
entirely: cost reads the committed session log at `session/event` and `session/flush`
(`plugin-dsh-cost/Source/Function/Apply.ts:116-119`), and the journal reads file observations at
`fs/observed` (`hook-dsh-workspace-journal/Source/Function/Apply.ts:109-114`).

## 5. The honest limits

The source cannot show whether a gate actually fires in a live turn, because every listener here is
fail-open and returns the downstream decision on any error: the deny, the ask, the note and the
compression are all conditional on runtime state that only a session produces. The source cannot
produce any number that a session would produce: the strike counts, the cooldown windows, the byte
and token savings, the number of archived results, the per-file cost, and the retrieval hit rate all
depend on real calls and real results. The source cannot show which listener wins when two prepends
claim the same seam in a given bundle, because that order is a property of the loaded bundle and not
of the packages; the only ordering evidence is the comments that describe the intended bundle order.
The source cannot show whether the model obeys a note, calls `ccr_retrieve`, or reads the live
section. The source cannot show the approval round trip that turns a govern `ask` or a batch-edit
policy refusal into a user decision. And the source cannot show the effect of a volatile config
flip, because the factory refreshes those cells in place and no static read of the package observes
the refreshed value.

## 6. Three visual concepts

**The seam timeline with a default-versus-plugin split.** A horizontal turn lane labeled with the
seam names in their firing order, `agent/pre-step`, `tools/pre-execute`, `tools/execute`,
`tools/post-execute`, `system-prompt/assemble`, `llm/stream`, and two rows over it: one row is the
default harness, one is the harness with the plugin. At the chosen seam the plugin row shows the
payload entering and leaving, and a side panel diffs the two payloads byte by byte. The data it
needs is one captured turn's event payloads before and after each listener, plus the config that was
active. The sentence the reader leaves with: "at this seam, this plugin turned these bytes into
those bytes, and nothing else in the turn moved."

**The result pipeline as a funnel with a retrieval loop.** Every tool result enters a funnel whose
gates are drawn as labeled filters in decision order, empty, exempt, failure, target, byte gate
(`hook-dsh-ccr/Source/Function/Compress.ts:57-71`); the results that pass every filter exit as a
small preview card with a hash token, and a curved arrow labeled `ccr_retrieve` brings the full
bytes back on demand. The data it needs is the per-call tool name, byte size, classified type and
verdict, plus the later retrieval events for each hash. The sentence the reader leaves with: "the
model saw a preview, the original bytes stayed on disk, and the model could ask for them back by
hash."

**The prompt section as a before-and-after frame.** The system prompt is rendered as a stack of
sections; the plugin's contribution appears as one extra framed block that is visibly recomputed at
each request, with a switch that shows the prompt with and without it and a counter of the bytes it
adds. The data it needs is the assembly's section list per request, the section name, its text, and
the section budget. The sentence the reader leaves with: "this section is not harness state, it is
the plugin's own live view, and it costs this many bytes on every request."
