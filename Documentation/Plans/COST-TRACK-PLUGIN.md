---
title: The cost-track plugin - per-file inference pricing
category: Plans
kind: living-plan
date: 2026-10-27
status: active
registry: Documentation/Plans/COST-TRACK-PLUGIN.md
index: Documentation/INDEX.md
statuses:
    - name: the measurement seam (session log, not the conversation)
      state: resolved
      evidence: section 1
    - name: the attribution model (direct + amortized, conserving)
      state: resolved
      evidence: section 2
    - name: the ledger schema (SQLite, STRICT, WAL, effective-dated prices)
      state: resolved
      evidence: section 3
    - name: the package anatomy and the one-definition-per-file layout
      state: resolved
      evidence: section 4
    - name: the human surface (commands, never tools)
      state: resolved
      evidence: section 5
    - name: the annotation writer and its idempotence rule
      state: open
      evidence: section 7
    - name: the export shapes for a client
      state: open
      evidence: section 8
    - name: the backfill of sessions that predate the plugin
      state: open
      evidence: section 6
---

# The cost-track plugin - per-file inference pricing

> A telemetry-only plugin that prices every model call in a conversation, splits that price across
> the files the conversation touched, keeps the whole ledger in SQLite, and can later write the
> accumulated price back into a file as a comment or export it as a client invoice. It never adds a
> tool, never edits the prompt, and never changes a model's behavior.

## 0. The one law

The plugin is a **reader** of the session log. It observes; it does not participate. The moment it
needs a tool, a prompt section, or a system-prompt context to do its job, it has changed the
conversation it is measuring, and the measurement becomes a lie. Everything below follows from that.

Corollary: the plugin registers **no tool**. Its human surface is the `commands` service (slash
commands), which is not part of the model-visible tool list.

## 1. The measurement seam

Three durable facts exist already; the plugin computes from them rather than re-deriving them.

| Fact                               | Source                                                                                                | Why it is the right source                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Tokens per model call              | `assistant/message` event's `usage: TokenUsage`                                                       | The provider's own numbers, already durable in the session log, with `turn` and `step` on the same record. |
| Which files a step touched         | `tool/call` event's `name` + `arguments`                                                              | Durable, ordered, and carries the same `turn`/`step`.                                                      |
| What the request surface contained | surface events (`system/message`, `user/message`, `assistant/message`, `tool/result`) before the call | The context that produced the call, recoverable by replay.                                                 |

The listener set is exactly two, both on the session log:

- `session/event` (`emit`, post-commit): a synchronous recorder. It pushes the event into an
  in-memory queue keyed by session. No awaits, no I/O, no throws, no logging per event.
- `session/flush` (`parallel`): the durability checkpoint. It drains the queue into SQLite.

A debounced timer and `session/disposed` are the two safety drains, so a session that ends without a
flush still lands.

`TokenUsage` is
`{ inputTokens, outputTokens, totalTokens?, cacheReadTokens?, cacheWriteTokens?, reasoningTokens? }`.
Live verification on 2026-10-27: `totalTokens = inputTokens + cacheReadTokens + outputTokens`, so
`inputTokens` is the **uncached** remainder and `cacheReadTokens` is a separate, discounted bucket.
Pricing must never treat `inputTokens` as the whole input.

The surface weights come from `tokenMeter`:

- `ctx.tokenMeter.estimateMessage(message)` prices one model-visible message under the fixed
  heuristic. It is pure and cheap, so it is the estimator for replay and for history.
- `ctx.tokenMeter.measure(session)` prices the live surface with the provider's anchor when it
  applies. It is O(surface) and is used once per drain for the newest step only.

Weights are ratios, so the estimator's absolute error cancels; the **cost** always uses the
provider's `usage`, never the estimator.

## 2. The attribution model

Two halves, stored separately, so an export can show either and an invoice can defend both.

A step `S` in session `X` has one `Call` row. Its cost is split into an input side and an output
side:

    inputCost(S)  = inputTokens*inputRate + cacheReadTokens*cacheReadRate
                  + cacheWriteTokens*cacheWriteRate
    outputCost(S) = outputTokens*outputRate + reasoningTokens*reasoningRate

The split is a statement about causality, not a preference:

- The **output** is the model's decision to act. It belongs to the files the step then touched.
- The **input** is the context that made the decision possible. It belongs to whatever occupied the
  context, in proportion to how much of the context each file occupied.

### 2.1 Direct

    direct(F, S) = outputCost(S) * weight(F, S)

`weight(F, S)` is the share of changed bytes, over the files the step **wrote**:

    weight(F, S) = |bytesDelta(F, S)| / sum over written files of |bytesDelta|

When the step wrote nothing, the touched files share equally. When the step touched nothing, the
whole output cost goes to the unattributed bucket (`FileId IS NULL`).

Byte deltas come from the touch itself: `bytesAfter - bytesBefore` when both are known, `1` per
written file when neither is.

### 2.2 Amortized

    amortized(F, S) = inputCost(S) * (contextTokens(F, S) / surfaceTokens(S))

`contextTokens(F, S)` is the token mass of the surface nodes before `S` that carry `F`'s content: a
`tool/result` message whose originating `tool/call` targeted `F`, plus any `user/message` that
attached `F`. `surfaceTokens(S)` is the sum over every surface node before `S`.

A file that was read early and never again still carries its mass into every later step, which is
the honest answer to "a single line change can cost a whole conversation".

### 2.3 Conservation

    sum over F of (direct(F, S) + amortized(F, S)) + unattributed(S) = costTotal(S)

within a cent per call. The drain asserts this in a smoke; a violation is a bug in the allocator,
not a rounding artifact to be waved through.

### 2.4 Recalculation

Every number that a formula consumes is stored: `Call` holds the raw usage and the `PriceId` it was
priced with; `Touch` holds the byte deltas; `ContextMass` holds `contextTokens(F, S)` and `Call`
holds `surfaceTokens`. So `cost.recompute` can drop `Allocation` and `Rollup`, rebuild them from
those three tables alone, and land byte-identical totals. No session log is read during a recompute.

## 3. The ledger schema

One file, `~/.dsh/cost/ledger.db`, opened with `journal_mode=WAL`, `foreign_keys=ON`,
`synchronous=NORMAL`. Every table is `STRICT`. Money is `REAL` in one currency per row (the
`Currency` column), with rates stored per million tokens so the arithmetic is exact in the units the
providers publish.

The dimensions exist so one ledger serves many projects and many clients:

- `Client` - the paying party.
- `Project` - one workspace root, with a `ClientId`. The plugin resolves the project from the
  session's `cwd` and creates it on first sight.
- `Session` - the conversation, with `ParentSessionId` so a subagent's cost rolls into its parent.
- `File` - the path within the project; `FileVersion` - the content hash and size at a touch.
- `Price` - append-only and effective-dated: `(Provider, Model, EffectiveFrom)` unique,
  `EffectiveTo` open until a later row closes it. A price row is never updated; a change inserts a
  new row. That is what makes a historical invoice reproducible after a provider raises its rates.
- `Call` - one model request, with the usage, the resolved `PriceId`, and the computed cost columns.
- `Touch` - one file interaction from one `tool/call`.
- `ContextMass` - the per-file token mass of one call's surface.
- `Allocation` - the money, one row per `(Call, File)` plus one unattributed row per call.
- `Rollup` - the materialized `(Scope, Key, Day)` aggregate, rebuildable.
- `Annotation` - what was written into which file version, and when.
- `Cursor` - how far each session has been folded in, so a drain is idempotent.

The DDL lives in `Source/Function/Schema.ts` as one string constant per table, executed in order
inside one transaction on open, guarded by `PRAGMA user_version` for migrations.

```sql
CREATE TABLE Price (
    PriceId INTEGER PRIMARY KEY,
    Provider TEXT NOT NULL, Model TEXT NOT NULL, Currency TEXT NOT NULL DEFAULT 'USD',
    InputRate REAL NOT NULL, OutputRate REAL NOT NULL,
    CacheReadRate REAL, CacheWriteRate REAL, ReasoningRate REAL,
    EffectiveFrom INTEGER NOT NULL, EffectiveTo INTEGER,
    Source TEXT NOT NULL, Note TEXT,
    UNIQUE (Provider, Model, EffectiveFrom)
) STRICT;

CREATE TABLE Client (
    ClientId INTEGER PRIMARY KEY, Name TEXT NOT NULL UNIQUE
) STRICT;

CREATE TABLE Project (
    ProjectId INTEGER PRIMARY KEY, ClientId INTEGER REFERENCES Client (ClientId),
    Name TEXT NOT NULL, Root TEXT NOT NULL UNIQUE
) STRICT;

CREATE TABLE Session (
    SessionId TEXT PRIMARY KEY, ProjectId INTEGER REFERENCES Project (ProjectId),
    ParentSessionId TEXT, Origin TEXT, DelegationDepth INTEGER, AgentPreset TEXT,
    Cwd TEXT, Title TEXT, CreatedAt INTEGER NOT NULL, EndedAt INTEGER
) STRICT;

CREATE TABLE File (
    FileId INTEGER PRIMARY KEY, ProjectId INTEGER NOT NULL REFERENCES Project (ProjectId),
    Path TEXT NOT NULL, Language TEXT, FirstSeenAt INTEGER NOT NULL,
    UNIQUE (ProjectId, Path)
) STRICT;

CREATE TABLE FileVersion (
    VersionId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    Hash TEXT, Bytes INTEGER, Lines INTEGER, ObservedAt INTEGER NOT NULL
) STRICT;

CREATE TABLE Call (
    CallId INTEGER PRIMARY KEY, SessionId TEXT NOT NULL REFERENCES Session (SessionId),
    Turn INTEGER NOT NULL, Step INTEGER NOT NULL, Seq INTEGER NOT NULL,
    Provider TEXT NOT NULL, Model TEXT NOT NULL, PriceId INTEGER REFERENCES Price (PriceId),
    InputTokens INTEGER NOT NULL, OutputTokens INTEGER NOT NULL,
    CacheReadTokens INTEGER NOT NULL DEFAULT 0, CacheWriteTokens INTEGER NOT NULL DEFAULT 0,
    ReasoningTokens INTEGER NOT NULL DEFAULT 0, TotalTokens INTEGER,
    CostInput REAL NOT NULL, CostOutput REAL NOT NULL, CostCacheRead REAL NOT NULL DEFAULT 0,
    CostCacheWrite REAL NOT NULL DEFAULT 0, CostReasoning REAL NOT NULL DEFAULT 0,
    CostTotal REAL NOT NULL, Currency TEXT NOT NULL,
    SurfaceTokens INTEGER NOT NULL DEFAULT 0, Purpose TEXT, At INTEGER NOT NULL,
    UNIQUE (SessionId, Turn, Step)
) STRICT;

CREATE TABLE Touch (
    TouchId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    SessionId TEXT NOT NULL, Turn INTEGER NOT NULL, Step INTEGER NOT NULL,
    CallKey TEXT NOT NULL, Tool TEXT NOT NULL, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Kind TEXT NOT NULL,
    BytesBefore INTEGER, BytesAfter INTEGER, BytesDelta INTEGER, LinesDelta INTEGER,
    Seq INTEGER NOT NULL, At INTEGER NOT NULL,
    UNIQUE (SessionId, CallKey, FileId)
) STRICT;

CREATE TABLE ContextMass (
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId), Tokens INTEGER NOT NULL,
    PRIMARY KEY (CallId, FileId)
) STRICT;

CREATE TABLE Allocation (
    AllocationId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId),
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL,
    ContextTokens INTEGER NOT NULL, SurfaceTokens INTEGER NOT NULL, Weight REAL NOT NULL,
    Method TEXT NOT NULL, At INTEGER NOT NULL,
    UNIQUE (CallId, FileId)
) STRICT;

CREATE TABLE Rollup (
    Scope TEXT NOT NULL, Key TEXT NOT NULL, Day TEXT NOT NULL,
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL, Cost REAL NOT NULL,
    Calls INTEGER NOT NULL, Tokens INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL,
    PRIMARY KEY (Scope, Key, Day)
) STRICT;

CREATE TABLE Annotation (
    AnnotationId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Marker TEXT NOT NULL,
    Body TEXT NOT NULL, Cost REAL NOT NULL, At INTEGER NOT NULL
) STRICT;

CREATE TABLE Cursor (
    SessionId TEXT PRIMARY KEY, LastSeq INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL
) STRICT;
```

Views: `FileCost` (file, direct, amortized, total, calls), `ModelCost`, `SessionCost`,
`ClientCost` - each a `GROUP BY` over `Allocation` joined to `Call`, so an export never re-derives
money in TypeScript.

## 4. The package anatomy

`Classic/packages/plugin-dsh-cost/`, following the family bundle anatomy exactly. One definition per
file, nameless default exports, PascalCase names.

```text
Source/
  Library.ts                 name, apply, Config, inject, default object
  Variable/Config.ts         the schemastery schema
  Interface/Config.ts        the validated config shape
  Interface/Usage.ts         the priced usage record
  Interface/Price.ts         the price row
  Interface/Touch.ts         the touch record
  Interface/Allocation.ts    the allocation row
  Function/Apply.ts          wiring only: listeners, effect, commands
  Function/Schema.ts         the DDL
  Function/Open.ts           the database effect (open, migrate, close)
  Function/Project.ts        cwd -> project/client resolution
  Function/Capture.ts        the synchronous event recorder
  Function/Drain.ts          the queue -> SQLite transaction
  Function/Price.ts          rate resolution and cost arithmetic
  Function/Touch.ts          tool/call arguments -> file touches
  Function/Mass.ts           surface replay -> per-file context tokens
  Function/Allocate.ts       direct + amortized split
  Function/Rollup.ts         the materialized aggregate refresh
  Function/Recompute.ts      the drop-and-rebuild
  Function/Backfill.ts       sessionQuery replay for sessions that predate the plugin
  Function/Report.ts         the read queries
  Function/Export.ts         CSV and JSON bundles
  Function/Annotate.ts       the comment writer
  Function/Language.ts       extension -> comment syntax
  Test/<Case>/Test.ts        the smokes
Configuration/               ESBuild.ts, ESBuild.js, TypeScript.noemit.json
cordis.patch.yml
README.md, CHANGELOG.md, package.json
```

Dependencies: `@playform/lib-dsh-core` and `@playform/plugin-dsh-factory` for the ledger and the
write executor, exactly like the rest of the family. The SQLite driver is `node:sqlite`
(`DatabaseSync`), which is Node core and therefore needs no native build; the import is dynamic and
guarded so a runtime without it fails loud at apply with one actionable line instead of a crash.

## 5. The human surface

No tool. Three slash commands, registered through `ctx.commands`:

- `/cost report [scope] [range]` - the rollup for `file`, `project`, `client`, `model`, or
  `session`.
- `/cost export <csv|json> [path]` - the client-facing bundle.
- `/cost annotate [path]` - write the cost comment into the named files, or into every file the
  ledger knows for the current project when no path is given.

`annotate` is off by default (`annotate.enabled: false`); it is the one toggle the user asked for.

## 6. Backfill

On first run the ledger is empty and every past conversation is unpriced. `Backfill.ts` walks
`ctx.sessionQuery.listSessions()`, replays each session's events through the same `Capture`/`Drain`
path, and writes the same rows. The `Cursor` table makes it resumable and idempotent. Backfill runs
as a job (`ctx.jobs.start`), never on the boot path, and its progress is a ledger line.

Open: whether a backfilled call should be priced with the price that was effective at the call's
`time` (correct for history) or with the current price (wrong for history, right for a live
invoice). The plan is the call's own time, with a config switch.

## 7. Annotation

The comment is a marker-delimited block, so writing it twice is a no-op and writing it after a hand
edit replaces only the block:

```text
// dsh-cost:begin
// Inference cost: 12.4183 USD (direct 3.1022 + amortized 9.3161)
// Models: deepseek-v4.1-flash-1017 9.8821 | glm-5.3-flash 2.5362
// Calls: 41 | First: 2026-10-21 | Last: 2026-10-27
// dsh-cost:end
```

The syntax follows the file: `//` for Rust, TypeScript, JavaScript, Go, C, C++, Java, Kotlin, Swift;
`#` for Python, Ruby, Shell, TOML, YAML; `--` for SQL, Lua, Haskell; `<!-- -->` for Markdown, HTML,
XML, SVG. An unknown extension is skipped, never guessed.

The write goes through the factory's write executor so the fresh-stat version guard applies: if the
file changed under the plugin, the annotation is refused and retried, never forced. The block is
appended after one blank line at end of file when absent; when present it is replaced in place, and
its line count is allowed to change.

Open: whether the block belongs at the end of the file (the user's words) or under the frontmatter
for Markdown, where an end-of-file block is invisible to a reader.

## 8. Export

- `csv` - one row per `(Day, Project, File, Model)` with direct, amortized, total, calls, tokens.
  RFC 4180 quoting.
- `json` - one bundle: `{meta, priceBook, projects, files, calls, allocations, rollups}` with
  ISO-8601 UTC timestamps (RFC 3339), so a client can re-derive every number.
- `markdown` - a one-page invoice per client: totals, per-project, per-file top-N, and the model
  mix.

Open: whether the export should carry the raw call rows (large, auditable) or only the rollups
(small, unverifiable). Plan: both, behind a flag.

## 9. Verification

The arbiter is the package's own smoke suite, run by
`pnpm --filter @playform/plugin-dsh-cost run prepublishOnly` and the harness selfcheck.

The cases that must exist:

1. **Conservation** - a synthetic session with two files and three calls allocates to the cent.
2. **Price resolution** - an effective-dated price table prices a call at the row in force at the
   call's time, not the newest row.
3. **Idempotence** - draining the same events twice writes the same rows and no duplicates.
4. **Recompute** - drop and rebuild produces byte-identical `Allocation` and `Rollup` totals.
5. **Annotation** - the block is appended once, replaced on a second run, and a file with an
   unrelated trailing comment is untouched outside the markers.
6. **Silence** - the plugin registers no tool, adds no prompt section, and its listeners never
   throw; a throw in `session/event` is the one failure mode that could damage a tool call.
