# hook-dsh-normalize-ellipsis

## The claim

The model writes a single code point and the reader sees three ASCII dots. The page answers: **which
code point, replaced with what, and where in the stream does it happen?**

## The sources

| Read | Taken |
| --- | --- |
| `Classic/packages/hook-dsh-normalize-ellipsis/Source/Function/Apply.ts` | the seam, the chunk dispatch, the flags, the ledger line |
| the same package's `Config.ts` | `replacement`, its default, and the empty-string rule |
| `lib-dsh-core/Source/Function/Normalize.ts` | the table shape: one code point, one replacement, no context rule |
| `Diagram/03-normalize/Classic/ellipsis.mmd` | the flow: seam, dispatch, kind, replace, count, yield, ledger |
| `Temporary/Corca/Specimens/Plugin.html` | the triptych frame, which the page does not repeat |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/` | the glyph pair geometry from `detail-list` and `bullet-chart` |

## The copy

The page prints, in this order: the package name, the version line, one sentence, the five view names,
and then - inside Architecture - exactly these strings and no others:

- the glyph pair's two labels: `U+2026` and `...`
- the table's four column heads: `Code point`, `Becomes`, `Name`, `Rule`
- the rule, one line: `A single-character replace is boundary-safe, so this family has no context rule.`
- the reach row: `text`, `reasoning`, `tool args`, each with its flag
- the knob: `replacement`, its default, and `an empty string removes the code point instead`
- the no-op branch: `when the stream held nothing to rewrite, no count line is written`

## The layout

```
+--------------------------------------------------------------------------+
| hook-dsh-normalize-ellipsis                             [hook] [Classic] |
| The ellipsis code point, rewritten to three ASCII dots as it streams     |
+--------------------------------------------------------------------------+
| [01 CONVERSATION] [02 HARNESS] [03 FAMILY] [04 PERSON] [05 ARCHITECTURE*]|
+--------------------------------------------------------------------------+
| ARCHITECTURE                                                             |
|                                                                          |
|   +------------------------+        +------------------------+           |
|   |  U+2026                |   ->   |  ...                   |           |
|   |  the code point        |        |  three ASCII dots      |           |
|   |  arrives in a chunk    |        |  the reader sees       |           |
|   +------------------------+        +------------------------+           |
|                                                                          |
|   THE TABLE                                                              |
|   +-----------+-----------+-----------+------------------------------+   |
|   | Code point| Becomes   | Name      | Rule                         |   |
|   | U+2026    | ...       | ellipsis  | no context rule: a single    |   |
|   |           |           |           | character is boundary-safe   |   |
|   +-----------+-----------+-----------+------------------------------+   |
|                                                                          |
|   WHERE IT REACHES      text [on]   reasoning [on]   tool args [off]     |
|                                                                          |
|   THE KNOB              replacement = "..."   empty string removes it    |
|                                                                          |
|   THE NO-OP             nothing to rewrite -> no count line, no write    |
+--------------------------------------------------------------------------+
```

The architecture view is five machines and no paragraphs: the glyph pair, the table, the reach row,
the knob, and the no-op. Each answers a question the prose used to answer badly.

## The machines

| Machine | What it adds | Component |
| --- | --- | --- |
| Glyph pair | the code point and its replacement at display size, side by side | `Normalizer` in its pair form |
| The table | every code point the family maps, with its name and rule | `Normalizer` |
| Reach | which chunk kinds the rewrite touches, and which flags gate them | a new `Reach` machine |
| The knob | the configurable replacement, its default, and the empty-string rule | `Schema` or a `Value` atom |
| The no-op | what happens when there is nothing to rewrite | `Absence` |

## The decisions

- **The glyph pair is not a Difference.** A `Difference` marks one changed span inside a longer string;
  here the whole string is one character, so a diff would draw a one-character line and a sea of white.
  The pair, at display size, is the honest form.
- **The reach row is a machine, not a sentence.** "Reaches text and reasoning, and the block ends the
  stream assembles" is three facts and a condition; drawn as a row of channels with lamps it is read in
  one glance, and as a sentence it is read twice and still doubted.
- **The table keeps one row.** A one-row table is not a table; the family has one code point. The
  machine renders the row large rather than padding it, and the caption says why there is one.
- **No flow in Architecture.** The flow is Conversation's machine; repeating it here would be the
  second picture of one fact.

## The history

### v1 - 2026-10-31

Built. The page carries five views; Architecture holds the portrait, the shape machine, the table, the
Transform sample, and the flow's rule - and between them, four paragraphs of prose. This v1 is the
record of what shipped, including that failure.

### v2 - the rewrite, not yet built

Architecture becomes five machines and no paragraphs: the glyph pair, the table at display size, the
reach row, the knob, and the no-op. The portrait's `Does` bullets become the reach row and the no-op;
the "Plugs into" line becomes the seam chip on the glyph pair; the table's caption loses its sentence.

The test this version must pass: hide the prose, and the page still says which code point, what it
becomes, where it reaches, what the knob does, and what happens when there is nothing to do.

## What the page must show, checked against the source

Read from `Source/Function/Apply.ts`, `Normalize.ts`, `Chunk.ts`, `Overpass.ts`, `StepBatch.ts`,
`Command.ts`, `Source/Variable/Config.ts`, and the test suites. Each bullet is a claim the page must
carry, and the file it comes from.

**The registration (Apply.ts).**

- It registers **three listeners**, not one: `llm/stream` (always), `tools/post-execute` **prepended**
  (the overpass arm), and `agent/pre-step` (the step-batch arm).
- The two arms are gated at **runtime** on volatile scope cells, so their listeners exist even while
  the scopes are off - a scope flipped on later lands without re-registration.
- The registration is the plain `ctx.on` pattern, **fiber-owned**, removed on unload - not the
  factory's `Wire`, because this family's silence is `fs/observed` and this plugin's rewrite must be
  visible.
- `inject: ["pluginFactory"]` - the factory is a required service; the loader's PENDING state orders
  the load.
- `apply` returns **nothing**: a returned value silently kills event delivery.

**The waterfall discipline (Normalize.ts).**

- `next()` is **always called first**, unconditionally; omitting it short-circuits the waterfall and
  the model call never happens.
- `options` is a loop-built deep-frozen request; the plugin **never touches it** - listeners read, never
  rewrite.
- **Chunk order is preserved**: one in, one out, strictly sequential.
- The stream is **never buffered**: each chunk is yielded before the next `next()`, so consumers see
  deltas live.
- An upstream throw **propagates**, and a thrown-away stream writes **no ledger line** - the count
  line follows only a normal completion.
- The ledger line is `hook-dsh-normalize-ellipsis: normalized N ellipsis char(s) in one stream`, and
  `N` counts **replaced code points**, not emitted characters - the default replacement emits three
  characters but counts once.

**The per-call state (Normalize.ts).**

- `CurrentCall` and the raw-marker state are **local to the generator invocation**, never module-level:
  two concurrent streams must not share them, and an HMR reload must not inherit stale state.
- The tool-call id on every delta is the per-call boundary.

**The config (Config.ts).**

- `replacement`, default `"..."`, **volatile** - hot edits commit without remounting.
- `normalizeReasoning`, default **true**.
- `normalizeToolArguments`, default **false**, **deprecated in favour of `scopes.toolInput`** and
  OR-ed in, so every existing profile keeps working.
- `scopes` - the granular gates, including `toolInput`.
- `toolResultsExempt` - the exemption list, an array of strings.
- `log` and `logFile` are volatile too.

**The activation line (Apply.ts).**

- `activated (replacement=..., reasoning=on, toolArgs=off, logFile=...)`, composed by the core's
  `Activate`.
- `toolArgs` on the line is the **effective** gate: `normalizeToolArguments || scopes.toolInput`.
- The **scopes themselves are not on the line**, because they are volatile - the line reports the
  mount-time effective values only.

**The overpass (Overpass.ts, StepBatch.ts, Command.ts).**

- `tools/post-execute` is **prepended**: the family's bundle order places the CCR hook before the
  normalize hooks, so the arm that prepends later is **outermost**, and CCR compresses the
  **normalized** bytes; the CCR marker guard makes any load order safe.
- `agent/pre-step` carries the step-batch scope plus a one-shot `Overpass` flag.
- The human command is `normalize-overpass` with the grammar
  `files <path...> | batch | results on|off | scopes`.
- The command is registered through a **probe-once seam**: a missing commands service skips the
  registration, because the command is a convenience, not a requirement.
- The **fail-open duplicate gate**: seven flavours share one global command name, so the second mount
  throws "already registered"; the plugin logs one ledger line and continues the mount, because the
  stream listeners and the tool registration must still attach.

**The journal (Normalize.ts).**

- Its only journal traffic is the stream count record - the `normalized` event of the shared
  governance domain - written **best-effort** when the storage facility is present; the human ledger
  stays the complete record.

**What the page must therefore show, in the study sheet's grammar.**

- The three listeners as three arms on the canvas, with the two scope-gated arms drawn as **off by
  default** and their gates as diamonds.
- The waterfall discipline as the spine the hook sits on, with `next()` first and the frozen options
  labelled.
- The count law as a card: `N` counts code points, not characters.
- The volatile scopes as a distinct card from the mount-time activation line, because the line cannot
  report them.
- The prepend interplay with CCR as an explicit band, since that is the one place where this plugin's
  behaviour depends on another plugin's position.
- The command grammar as a small register, and the duplicate gate as a one-line note on it.

**The dispatch (Chunk.ts).**

- The per-chunk dispatch lives in the **core** (`Stream/Chunk`); this package supplies only the
  flavour: a closure that applies the `Ellipsis` class and the configured replacement to one text
  segment.
- The dispatch is **three-way**, not two: the edit exemption (a delta whose `name` is `"edit"` passes
  by identity) and the per-call raw marker (a call whose arguments open with `{"__normalize":false`
  passes unnormalized **with the marker stripped**) sit beside the reasoning and tool-args gates.
- A sixth gate exists that the page never showed: **`conversation`**, default on, which passes
  text-delta text and text/reasoning blocks by identity while off.
- The behaviour is **byte-identical** to a hand-rolled in-file implementation; the ellipsis smoke is
  the arbiter.

**The six scopes (Config.ts).**

`conversation` on, `reasoning` on, `toolInput` off, `toolResults` off, `files` on, `batch` off - and
the scope **object** carries the volatile marker while its leaves stay plain, because schemastery
rejects volatile leaves under an enclosing volatile field. One leaf change commits one update whose
whole object the refresh listener re-reads. `files` is inert in the stream flavours so that one patch
override drives the whole family.

**The exemption list (Config.ts).**

The default is seven names, and each has a reason: `read` and `edit` are byte-contracted, `raw-write`
and `normalize-file` own their normalization, `ccr_retrieve`'s bytes are the retrieval contract, and
`subagent` and `ask_user_question` carry prompt material matched verbatim. A listed result passes by
identity.

**The overpass arm (Overpass.ts).**

- It is a **thin delegate** over the core's `ToolResults` factory: the generic machinery - next()
  first, the scope gate, the exemption list, the accepted/non-value rules, the content basis, the
  text-only block rewrite, the CCR marker guard, the fail-open, the identity-preserving no-op - lives
  in the core; the package supplies the transform, the ledger line, the ledger sink, the module
  identity, and the default exemption list.
- Its ledger line is its own string, byte-identical to the pre-delegate arm:
  `overpass: normalized N char(s) in tool result <name> <callId>`.
- The module identity is `State.Module`, which the factory's `Append` prefixes - the delegate never
  hardcodes it.
- The registration with `{ prepend: true }` is what makes the arm **outermost** in the family's bundle
  order; the core's marker guard makes any load order safe.
- `DefaultScopes` is exported because the `normalize-overpass scopes` command reports it - the
  fallback for a hand-built config.

**What this adds to the sheet.**

- The dispatch is **six gates**, and the sheet must draw all six, with `conversation` and the two
  edit/raw markers as diamonds the page did not have.
- The **scope matrix** is its own machine: six leaves, their defaults, and the note that the object is
  volatile while the leaves are plain.
- The **exemption list** is seven names with a reason each - a register, not a sentence.
- The **overpass ledger line** is a second, different string from the stream line; the sheet must show
  both, because a reader who sees one will misread the other.
- The **thin-delegate split** is itself a fact: what lives in the core and what lives here is the
  package's architecture, and it explains why the file is small.

**The step-batch arm (StepBatch.ts).**

- It is a **second thin delegate**, over the core's `Overpass/StepBatch` factory: next() first, the
  continuous scope gate, the one-shot `Overpass` flag and its consumption, the text-only block
  rewrite, the CCR marker guard, the fail-open, the identity-preserving no-op - all in the core.
- Its ledger line is a **third string**, distinct from the other two:
  `overpass: normalized N char(s) in step batch (turn T step S)`.
- The one-shot flag is **consumed** by the arm: it fires once and is gone, which is why the command
  that arms it is a one-shot command.

**The replace law (Replace.ts).**

- The mechanism lives in the core: the function replacer, the per-call regex construction, the
  `{ text, count }` contract.
- This package supplies exactly two arguments: the `Ellipsis` class - a **one-member class** holding
  U+2026 - and the configured replacement.
- So the family is a **table plus a closure**, not a fork of the dispatch. That is the fact that
  explains why six normalizers are six small packages rather than one large one.

**The three ledger strings, side by side.**

| Arm | The line |
| --- | --- |
| the stream | `hook-dsh-normalize-ellipsis: normalized N ellipsis char(s) in one stream` |
| the tool results | `overpass: normalized N char(s) in tool result <name> <callId>` |
| the step batch | `overpass: normalized N char(s) in step batch (turn T step S)` |

Each is asserted byte-identically by the smoke suites, and the count is always of **replaced code
points**, never of emitted characters.

**The activation, once more, with the reason.**

`activated (replacement=..., reasoning=on, toolArgs=off, logFile=...)` - four fields, and the scopes
are absent **on purpose**: they are volatile, so the line can only report the mount-time effective
values. The `toolArgs` field is the OR of the deprecated flag and the scope, which is why the line
stays byte-identical to the pre-scope version.

**What the sheet must therefore add.**

- Three ledger lines, not one, in a register with their arms beside them.
- The one-shot flag as a consumed token, drawn as a token that leaves the board after use.
- The class-and-closure split as a small diagram: the core's machinery on one side, this package's two
  arguments on the other, with the six siblings sharing the same left half.
- The mount-time line versus the volatile scopes as two cards, because a reader who assumes the line
  reports the live config will misread every profile.
