# Delta

What each of the ten plugins removes from the default turn, and what it puts there instead.

Citations are `path:line` relative to `Classic/packages/`, except `Turn.md:NN`, which is the sibling
file in this directory and supplies the "without" state for every seam. Every Example line is taken
from the package's own test or README; where no such example exists the field says so. All strings
are quoted exactly, with Unicode code points written as `<U+XXXX>` so the file stays ASCII.

## 1. hook-dsh-normalize-dash

- **Seam** - `"llm/stream"`, plain registration
  (`hook-dsh-normalize-dash/Source/Function/Apply.ts:129-130`); a prepended `"tools/post-execute"`
  arm (`Apply.ts:143-145`) and a plain `"agent/pre-step"` arm (`Apply.ts:146`).
- **Without** - With no listener at `llm/stream` the waterfall hands the bound call's `StreamChunk*`
  straight through, so every character the adapter emits reaches the UI and the log as written
  (`Turn.md:52`).
- **With** - Every Unicode dash in a text or reasoning delta, and in the assembled block that
  follows it, arrives as the configured `replacement`, counted once per stream
  (`Normalize.ts:86-95`, `Normalize.ts:97-99`).
- **Payload in** - `type`, `id` and `argumentsDelta` of a chunk (`Normalize.ts:66-68`); the `text`
  field and the `block` field inside the pure dispatch (`lib-dsh-core/Source/Stream/Chunk.ts:5-9`);
  the config cells `Replacement`, `Reasoning`, `ToolArgs` and `Scopes` (`Normalize.ts:86-93`).
- **Payload out** - The `text` of a `text-delta`, a `reasoning-delta`, and an assembled text or
  reasoning block; the `argumentsDelta` when the tool-input gate is on; every other chunk by
  identity (`Normalize.ts:95`, `lib-dsh-core/Source/Stream/Chunk.ts:5-9`).
- **Example** - before `a <U+2014> b <U+2013> c <U+2011> d <U+2015> e`, after `a - b - c - d - e`
  (`hook-dsh-normalize-dash/Source/Test/Stream-Contract/Test.ts:22`, `:124`).
- **Knob** - `replacement`, default `-` (`hook-dsh-normalize-dash/README.md:46`); it is the single
  substitution character, so changing it changes every rewritten codepoint (`Normalize.ts:88`).
- **Property** - deterministic output.
- **Limit** - The source cannot show which call or which turn a count belongs to: the ledger line
  carries one total per stream and no tool or call identifier (`Normalize.ts:99`).

## 2. hook-dsh-ccr

- **Seam** - `"tools/post-execute"`, prepended (`hook-dsh-ccr/Source/Function/Apply.ts:196-197`,
  `:260`); a plain `"agent/pre-step"` listener exists only when `contextEngine` is on
  (`Apply.ts:277-278`).
- **Without** - With no listener the post-execute waterfall returns the settled result unchanged, so
  the full tool output becomes model content (`Turn.md:57`).
- **With** - A result over `thresholdBytes` times its classified type's multiplier is replaced by a
  preview line plus a `<<<CCR:hash|type|size>>>` marker, and the full bytes go to the store
  (`Compress.ts:55-98`, `Apply.ts:234-246`).
- **Payload in** - `Decision.kind`, the presence of a `value` key, `Decision.content`,
  `Result.content`, `Result.isError` and `Exec.name` (`Apply.ts:203-208`); `Threshold`,
  `Multipliers`, `AutoExpand`, `AutoExpandLimit`, `PreviewMaximum` and `Ttl` (`Compress.ts:69-87`).
- **Payload out** - A new decision `{ kind: "accept", content: [ { type: "text", text } ] }`
  (`Apply.ts:234-246`); a pass returns the downstream decision unchanged (`Apply.ts:214-216`).
- **Example** - before the full `make` output (5231 bytes), after
  `[terminal:exit 0 | 142 lines | make: *** Error 1]` and
  `<<<CCR:9d3c1f0a7b2e4d5c6a8b9c0d|terminal|5231>>>` (`hook-dsh-ccr/README.md:15-16`).
- **Knob** - `thresholdBytes`, default `1024` (`hook-dsh-ccr/README.md:82`); the gate is
  `Size > Threshold * Multiplier`, so raising it compresses fewer results (`Compress.ts:71`).
- **Property** - bounded context.
- **Limit** - The source cannot show whether the model ever calls `ccr_retrieve`, so the retrieval
  half of the contract is unproven by reading the package; the tool exists and matches a hash
  exactly (`hook-dsh-ccr/README.md:50-55`).

## 3. hook-dsh-workspace-govern

- **Seam** - `"tools/pre-execute"`, plain
  (`hook-dsh-workspace-govern/Source/Function/Apply.ts:150-151`); a plain `"tools/post-execute"`
  observer (`Apply.ts:198-199`). The shipped default `enabled=false` wires neither
  (`Apply.ts:134-138`).
- **Without** - With no listener at `tools/pre-execute` the downstream decision stands, so the call
  runs if the harness's own guardrails allow it (`Turn.md:55`).
- **With** - A gated call whose proposal fails `contributes`, `scope`, `policy` or `preconditions`
  returns `{ kind: "deny", reason: "govern: ..." }` or `{ kind: "ask", reason: "govern: ..." }`
  (`Apply.ts:174-185`).
- **Payload in** - `Exec.name`, `Exec.agent`, `Exec.callId` and `Exec.arguments`
  (`Apply.ts:162-169`); the attached `proposal` object or the first string among `path`, `target`,
  `file`, `filePath`, `notePath`, plus `instruction` and `scope` (`Extract.ts:12`, `:22`, `:49-63`).
- **Payload out** - The returned decision only, and only on a hit; every other branch returns the
  downstream decision unchanged (`Apply.ts:179-184`).
- **Example** - before, a proposal with a contribution passes and the ledger reads
  `govern: passed op:1 (write /repo/src/a.ts)`; after, the same gate with an empty contribution
  returns `{ kind: "deny", reason: "govern: contributes" }` and the ledger reads
  `govern: denied op:1 (contributes)`
  (`hook-dsh-workspace-govern/Source/Test/Wiring-And-Decisions/Test.ts:109-128`, `Apply.ts:180`).
- **Knob** - `enabled`, default `false` (`hook-dsh-workspace-govern/README.md:61`); it is the master
  switch, and off means the cold mount returns before any registration (`Apply.ts:134-138`).
- **Property** - a write guard.
- **Limit** - The source cannot show the approval round trip behind an `ask`, because the plugin
  returns the decision and a separate approval surface answers it (`Turn.md:61`).

## 4. hook-dsh-comment-filter

- **Seam** - `"tools/post-execute"`, prepended
  (`hook-dsh-comment-filter/Source/Function/Apply.ts:113-115`); a plain `"agent/pre-step"` intent
  stash (`Apply.ts:119`).
- **Without** - With no listener the `read` result arrives with every comment byte intact
  (`Turn.md:57`).
- **With** - A `read` or `ccr_retrieve` result loses its comment spans while every line-number
  prefix and the footer stay byte-identical, and an omission notice is appended when `notice` is on
  (`Strip.ts:88-91`).
- **Payload in** - `Exec.name` and `Exec.agent` (`Gate.ts:35`, `:39-40`); `Active`, `Targets`,
  `Exempt`, `IntentOn`, `Keywords` and `Notice` (`Gate.ts:43-59`, `Strip.ts:89`); the result's text
  blocks (`Overpass.ts:50-54`).
- **Payload out** - The rebuilt `read` envelope text, and only when the replacement count is
  positive (`Strip.ts:83-91`).
- **Example** - before `1: // leading comment` and `3: const b = 2; // trailing comment`, after
  `1: ` and `3: const b = 2; ` (`hook-dsh-comment-filter/Source/Test/Overpass/Test.ts:102-117`).
- **Knob** - `intent`, default `true` (`hook-dsh-comment-filter/README.md:82`); with it on, a task
  text that mentions a comment keyword leaves the result untouched (`Gate.ts:49-62`), and turning it
  off strips unconditionally (`Gate.ts:49-50`).
- **Property** - comment-free tool results.
- **Limit** - The scanner has named v1 blind spots (regex literals, JSX text, Rust raw strings, Lua
  long strings, shell `${...}`), so the source cannot show that every comment form is caught
  (`hook-dsh-comment-filter/README.md`, "The transform").

## 5. hook-dsh-tool-coach

- **Seam** - `"tools/post-execute"`, plain (`hook-dsh-tool-coach/Source/Function/Apply.ts:291-292`);
  `"tools/pre-execute"`, plain (`Apply.ts:393-394`); `"agent/pre-step"` (`Apply.ts:469`);
  `"system-prompt/assemble"` (`Apply.ts:512-513`); `"tools/change"` (`Apply.ts:576`).
- **Without** - With no listener the terminal result returns with no note and the prompt carries no
  coaching section (`Turn.md:57`, `Turn.md:49`).
- **With** - After `threshold` same-class offenses inside `window`, the tool result gains a labeled
  `additionalContexts` note that names the correct tool, and at `escalateThreshold` the prompt gains
  a persistent section (`Apply.ts:333-353`, `:553-557`).
- **Payload in** - `Exec.name` and `Exec.arguments` (`Apply.ts:301-305`); the downstream decision's
  `additionalContexts` (`Apply.ts:344-353`); `Payload.messages[].source.kind` (`Apply.ts:474-481`);
  `AssembleContext.agent` (`Apply.ts:525`).
- **Payload out** - `additionalContexts` on the post-execute decision (`Apply.ts:344-353`); a new
  entry in `sections` (`Apply.ts:553-557`); a `deny` at pre-execute (`Apply.ts:415`, `:448`).
- **Example** - before the 4th `cat a.md` returns its content, after the result carries
  `Tool-coach note (strike 4, read-class bash pattern):` and the four-line body naming `read`
  (`hook-dsh-tool-coach/Source/Test/Notes-And-Cooldown/Test.ts:83-90`).
- **Knob** - `threshold`, default `3` (`hook-dsh-tool-coach/README.md:94`); `enforce`, default `off`
  (`README.md:99`), where `write` or `all` turns the pre-execute arm into a deny
  (`Apply.ts:417-448`).
- **Property** - tool-use coaching.
- **Limit** - The source cannot show that the model obeys a note, and the strike counters live per
  agent in memory, so a new user message resets them (`Apply.ts:469-493`).

## 6. hook-dsh-live-containers

- **Seam** - `"system-prompt/assemble"`, plain
  (`hook-dsh-live-containers/Source/Function/Apply.ts:688-689`); plus plain `"tools/post-execute"`
  (`Apply.ts:754`), `"agent/pre-step"` (`Apply.ts:796`), `"tools/change"` (`Apply.ts:833`), and,
  only when the jobs stack is composed, `"tools/pre-execute"` (`Apply.ts:875`), `"tools/execute"`
  (`Apply.ts:889`) and `"session/event"` (`Apply.ts:950`).
- **Without** - With no listener the assembly returns the sections the harness built, and the prompt
  carries no container state (`Turn.md:49`).
- **With** - One section named `sectionName` is appended, holding a
  `--- LIVE CONTAINER <id> ... ---` frame per enabled block, recomputed per request
  (`Apply.ts:726-732`, `Render.ts:12-14`).
- **Payload in** - `AssembleContext.scope` (`Apply.ts:701`); `Exec.name` and `Exec.agent`
  (`Apply.ts:769-771`); `Payload.messages[].source.kind` (`Apply.ts:801-806`).
- **Payload out** - The `sections` array gains `{ name, text, interpolate: false }` and nothing else
  on the assembly changes (`Apply.ts:726-732`).
- **Example** - before, the assembly carries only the sections the harness built; after,
  `Out1.sections.length` is 2 and the second is
  `--- LIVE CONTAINER n (recomputed each request; not harness state) ---`, `hello`,
  `--- END LIVE CONTAINER n ---`
  (`hook-dsh-live-containers/Source/Test/Render-And-Frames/Test.ts:36-43`, `:69-76`).
- **Knob** - `enabled`, default `false` (`hook-dsh-live-containers/README.md:86`); `refresh`,
  default `request` (`README.md:88`), where `ttl` holds the text for `ttlCalls` assemblies
  (`Apply.ts:706-709`).
- **Property** - live state in the system prompt.
- **Limit** - The source cannot show the token cost of the section per request: the byte count is
  logged per block, not per assembly (`Render.ts:18-21`).

## 7. plugin-dsh-batch-edit

- **Seam** - A tool registration, `batch_edit`
  (`plugin-dsh-batch-edit/Source/Function/Apply.ts:160-165`); a plain `"tools/pre-execute"` only
  when `interceptBash` is on (`Apply.ts:181-183`); `"fs/observed"` through the factory Wire
  (`Apply.ts:172-174`); a plain `"agent/pre-step"` (`Apply.ts:221`).
- **Without** - With no registration the `batch_edit` schema is never admitted to the step tool set,
  so a multi-file change costs one tool call per file (`Turn.md:49`).
- **With** - One tool holds files as processes and applies a transition table across all of them in
  a single commit through the version-fenced write executor (`Apply.ts:164`,
  `plugin-dsh-batch-edit/README.md:31-38`).
- **Payload in** - `action`, `machine`, `files`, `searches`, `ops`, `opfile`, `preview`, `monitors`,
  `persistent` and `deadlineMs` (`Tools.ts:83-130`); `Exec.name` and `Exec.arguments.command`
  (`Apply.ts:85-90`).
- **Payload out** - The tool's JSON output with per-file diffs, the held files themselves, and a
  `batchEditOffer` string on the execution when the advisory intercept fires (`Apply.ts:195`,
  `Ops.ts:289`).
- **Example** - before `a.txt` is `hello\nworld\n`; after one commit with `world` replaced by `HI`
  it is `hello\nHI\n`, the diff is `- world\n+ HI`, and the write carries `replaceIfVersion` version
  `v1` (`plugin-dsh-batch-edit/Source/Test/Commit-And-Ops/Test.ts:52-78`).
- **Knob** - `policy.write`, default `approve` (`plugin-dsh-batch-edit/README.md:100-103`);
  `approve` refuses the commit with `apply refused <id> (policy write=approve)` before any read or
  write, and `auto` lets the commit proceed.
- **Property** - a batched multi-file edit with an atomic gate.
- **Limit** - The source cannot show the settle of a commit that overruns `deadlineMs`: the tool
  returns a `jobId` and the outcome arrives later through `state` (`Tools.ts:127-130`).

## 8. plugin-dsh-cost

- **Seam** - `"session/event"` and `"session/flush"`, both plain, registered inside the ledger
  effect (`plugin-dsh-cost/Source/Function/Apply.ts:116-118`, `:119-138`).
- **Without** - With no listener the committed event is broadcast to the consumers the docs list and
  nothing prices it (`Turn.md:63`, `Turn.md:64`).
- **With** - Each event is queued at `session/event` and folded into a SQLite ledger at
  `session/flush`, priced per provider and model (`Apply.ts:116-138`, `Drain.ts:252-267`).
- **Payload in** - `Subject.id` (`Apply.ts:121`) and `Event.time` (`Apply.ts:131`); the usage
  record's `inputTokens` and `outputTokens` and the source's `provider` and `model`
  (`Drain.ts:252-267`).
- **Payload out** - `nothing`; both listeners return void (`Apply.ts:116-119`).
- **Example** - before a file carries no cost block, after `/cost annotate` it carries
  `// dsh-cost:begin`, `// Inference cost: 12.4183 USD (direct 3.1022 + amortized 9.3161)`, and
  `// dsh-cost:end` (`plugin-dsh-cost/README.md:110-115`).
- **Knob** - `databasePath`, default `~/.dsh/cost/ledger.db`
  (`plugin-dsh-cost/Source/Variable/Config.ts:98-99`); pointing it elsewhere starts a separate
  ledger.
- **Property** - cost visibility.
- **Limit** - The source cannot show that the attribution is true: the split is a configured policy
  (`bytes` for direct, `context` for amortized), not a measurement of what a file caused
  (`plugin-dsh-cost/README.md:119-121`).

## 9. hook-dsh-workspace-journal

- **Seam** - `"fs/observed"`, plain, on the root context through the factory Wire
  (`hook-dsh-workspace-journal/Source/Function/Apply.ts:109-114`).
- **Without** - `fs/observed` is not in the turn's seam table (`Turn.md:43-64`), so with no listener
  a write leaves only its durable `tool/result` and no pre-image (`Turn.md:58`).
- **With** - The listener counts writes landing against open batches and persists the progress, and
  `revert` replays the stored pre-images backward through the fenced write executor
  (`Observe.ts:41-55`, `RevertFile.ts:11-45`).
- **Payload in** - `Target.displayPath` and the `Actor` identity (`Observe.ts:24-30`); the in-memory
  batch records (`Observe.ts:41-55`).
- **Payload out** - `nothing`; the listener mutates only its own batch records (`Observe.ts:52-55`).
- **Example** - before `/a` holds the bytes the batch wrote; after `revert("b1")` the pre-image
  `ORIGINAL` is written with `replaceIfVersion` version `1`, and the ledger reads
  `journal: reverted b1 /a (fence ok)`
  (`hook-dsh-workspace-journal/Source/Test/Lifecycle-And-Revert/Test.ts:117-143`).
- **Knob** - `enabled`, default `false` (`hook-dsh-workspace-journal/README.md:62`);
  `maxEntryBytes`, default `65536` (`README.md:67`), above which a pre-image is skipped with a
  ledger line (`Lifecycle-And-Revert/Test.ts:189-201`).
- **Property** - a write journal with revert.
- **Limit** - The source cannot show that a batch is ever sealed, because `seal` is called by the
  caller and the journal only records what it is handed (`hook-dsh-workspace-journal/README.md`,
  "The surfaces").

## 10. hook-dsh-workspace-merge

- **Seam** - No event listener at all; the package registers the `workspaceMerge` service
  (`hook-dsh-workspace-merge/Source/Function/Apply.ts:47`) and one tool, `workspace_merge`
  (`Apply.ts:68-70`).
- **Without** - With no tool registration the model has no merge verb, so a multi-file write is one
  tool call per file (`Turn.md:49`).
- **With** - One tool whose `commit` runs the atomic gates and writes each file through the
  version-fenced executor, returning a per-file reply union (`Commit.ts:39-149`).
- **Payload in** - `operations[]` with `path`, `content` and `version` (`Tools.ts:23-36`), plus the
  `preview`, `commit`, `batch`, `list` and `stats` verbs (`Tools.ts:43`).
- **Payload out** - The files themselves, and the reply union with `applied`, `conflict`, `denied`,
  `rejected`, `recovery-required` or `outcome-unknown` per file (`Commit.ts:105-130`).
- **Example** - before `/repo/src/a.ts` holds its previous bytes; after `commit` with
  `{ path: "/repo/src/a.ts", content: "one\n", version: "v1" }` the reply is
  `{ path: "/repo/src/a.ts", status: "applied", version: "v2" }` and the ledger reads
  `merge: applied /repo/src/a.ts version v2 (batch b1)`
  (`hook-dsh-workspace-merge/Source/Test/Commit-And-Replies/Test.ts:42-64`).
- **Knob** - `mode`, default `all-or-nothing` (`hook-dsh-workspace-merge/README.md:102`);
  `survivors` makes a per-file failure a reply instead of a batch stop. `policy.commit`, default
  `approve`, holds the whole batch first (`Commit.ts:51-54`).
- **Property** - an atomic batch commit.
- **Limit** - No three-way merge exists in v1, so the source cannot show a conflict being resolved;
  it is reported with expected and observed versions and never overwritten
  (`hook-dsh-workspace-merge/README.md`, "What it does not do").

## 11. The matrix

| Plugin                     | Seam                                                                | Changes the model | Writes to disk                  | Property                        |
| -------------------------- | ------------------------------------------------------------------- | ----------------- | ------------------------------- | ------------------------------- |
| hook-dsh-normalize-dash    | `llm/stream` (+ prepended `tools/post-execute`)                     | yes               | ledger only                     | deterministic output            |
| hook-dsh-ccr               | `tools/post-execute` (prepended)                                    | yes               | store journal + ledger          | bounded context                 |
| hook-dsh-workspace-govern  | `tools/pre-execute` (+ plain observer)                              | yes               | ledger only                     | a write guard                   |
| hook-dsh-comment-filter    | `tools/post-execute` (prepended)                                    | yes               | ledger only                     | comment-free tool results       |
| hook-dsh-tool-coach        | `tools/post-execute`, `tools/pre-execute`, `system-prompt/assemble` | yes               | ledger only                     | tool-use coaching               |
| hook-dsh-live-containers   | `system-prompt/assemble` (+ tool and job observers)                 | yes               | monitor records + ledger        | live state in the system prompt |
| plugin-dsh-batch-edit      | `batch_edit` tool (+ `tools/pre-execute`, `fs/observed`)            | yes               | the edited files + ledger       | batched atomic edit             |
| plugin-dsh-cost            | `session/event`, `session/flush`                                    | no                | SQLite ledger + annotations     | cost visibility                 |
| hook-dsh-workspace-journal | `fs/observed` (root)                                                | no                | batch records + reverted files  | a write journal with revert     |
| hook-dsh-workspace-merge   | `workspace_merge` tool, no listener                                 | yes               | the committed files + KV domain | an atomic batch commit          |

## 12. The composition note

Six of the ten share the post-execute chain and see each other's output there, and the source fixes
their order in one sentence: on `tools/post-execute` a later prepend is outermost, so the bundle
order that places the CCR hook before the normalize hooks makes the CCR gate compress
already-normalized bytes (`hook-dsh-normalize-dash/Source/Function/Apply.ts:133-137`), while the
plain listeners of the coach and the live containers run after every prepended arm and therefore see
the compressed, filtered result (`hook-dsh-tool-coach/Source/Function/Apply.ts:288-289`,
`hook-dsh-live-containers/Source/Function/Apply.ts:747-752`); the comment filter prepends for the
same reason, so its stripped bytes are what the CCR size gate measures
(`hook-dsh-comment-filter/Source/Function/Apply.ts:11-15`). Before that, `agent/pre-step` fires for
the comment filter's intent stash, the coach's counter reset, the live containers' counters,
batch-edit's boundary and the CCR engine when its flag is on
(`hook-dsh-comment-filter/Source/Function/Apply.ts:119`,
`hook-dsh-tool-coach/Source/Function/Apply.ts:469`,
`hook-dsh-live-containers/Source/Function/Apply.ts:796`,
`plugin-dsh-batch-edit/Source/Function/Apply.ts:221`,
`hook-dsh-ccr/Source/Function/Apply.ts:277-278`); then `system-prompt/assemble` runs for the coach
and the live containers (`hook-dsh-tool-coach/Source/Function/Apply.ts:512`,
`hook-dsh-live-containers/Source/Function/Apply.ts:688`), then `tools/pre-execute` for the write
guard, the coach and the batch-edit intercept
(`hook-dsh-workspace-govern/Source/Function/Apply.ts:150`,
`hook-dsh-tool-coach/Source/Function/Apply.ts:393`,
`plugin-dsh-batch-edit/Source/Function/Apply.ts:182`), then `llm/stream` for the dash normalizer
(`hook-dsh-normalize-dash/Source/Function/Apply.ts:129`). Two plugins sit outside that chain and see
its results only as committed facts: cost reads `session/event` and `session/flush`
(`plugin-dsh-cost/Source/Function/Apply.ts:116-119`), and the journal and batch-edit both read the
`fs/observed` that the write executor emits
(`hook-dsh-workspace-journal/Source/Function/Apply.ts:109-114`,
`plugin-dsh-batch-edit/Source/Function/Apply.ts:172-174`), while the merge registers no listener and
is reached only through its tool (`hook-dsh-workspace-merge/Source/Function/Apply.ts:68-70`).
