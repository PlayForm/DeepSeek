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
    - name: the cross-conversation file identity (project key, alias, branch)
      state: resolved
      evidence: section 10
    - name: the cost rings (direct, context, credit)
      state: resolved
      evidence: section 11
    - name: assessment versus discount (the billing policy)
      state: resolved
      evidence: section 12
    - name: the discount policies built
      state: open
      evidence: section 12 and section 16 - designed, deliberately unbuilt
    - name: the contribution plugin as a second package
      state: resolved
      evidence: section 13
    - name: the migration v2 columns and tables
      state: open
      evidence: section 14
    - name: the analytics surface as the deliverable, the invoice deferred
      state: resolved
      evidence: section 16
    - name: the semantic pipeline stages per file
      state: resolved
      evidence: section 16.1
    - name: the inside, outside, and cross metric catalogue
      state: resolved
      evidence: sections 16.2-16.4
    - name: the three classes of factor (pricing, attribution, classification)
      state: resolved
      evidence: section 17.1
    - name: the modifier product and the marginal tier interpolation
      state: resolved
      evidence: section 17.2
    - name: the edit grain (hunk rows)
      state: resolved
      evidence: section 17.3
    - name: the telemetry the session log already carries
      state: resolved
      evidence: section 17.4
    - name: the forecast view for the on-demand invoice
      state: resolved
      evidence: section 17.5
    - name: the v3 factor pass and the v4 edit and telemetry pass
      state: open
      evidence: section 17.7
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

Refined per bucket, because a single ratio misprices a file whose tokens are cached against one
whose tokens are not: prompt caching is prefix-based, so the surface is walked in order and the
first `cacheReadTokens` worth of nodes are the cached ones. Each file then carries an uncached mass
and a cached mass, and the input cost splits as `inputRate` on the uncached mass plus
`cacheReadRate` on the cached mass. The same walk produces `Call.CacheSaving`.

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
- `Price` - append-only and effective-dated: `(Provider, Model, EffectiveFrom, Window)` unique,
  `EffectiveTo` open until a later row closes it, and `Window` a label such as `any`, `peak`, or
  `offpeak` resolved from the call's own timestamp against the config's `priceWindows` (DeepSeek
  charges double inside its peak window, so the date alone is not enough). A price row is never
  updated; a change inserts a new row. That is what makes a historical invoice reproducible after a
  provider raises its rates.
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

## 10. Across conversations, projects, and renames

The ledger is **global** (`~/.dsh/cost/ledger.db`), not per session and not per project. A file's
cost is therefore an aggregate over every conversation that ever touched it, and the question "what
did this file cost me" has one answer no matter how many sessions, subagents, or restarts were
involved.

Three identity rules make that hold:

- **The file is keyed by `(ProjectId, Path)`, not by session.** `Allocation` hangs off `Call`,
  `Call` hangs off `Session`, and `File` is independent of both. A new conversation is one more
  `Session` row and more `Call` rows against the same `FileId`; nothing needs to be merged
  afterwards.
- **A rename does not split the cost.** When a move or rename is observed, an `Alias` row records
  `(FileId, FromPath, ToPath, At)` and the `FileId` survives. `File.Path` is the current path; the
  lifetime query joins through `Alias` so history follows the file, not the string.
- **The project is resolved from the session `cwd`, not from a config field.** Two projects that
  contain a `src/index.ts` are two files, because a client is billed per project. The optional
  `Touch.Branch` column records the branch at the touch, so a file's cost can be split per branch or
  merged across them, and a worktree does not create a phantom second file.

Subagent sessions are ordinary sessions with a `ParentSessionId`; their cost is recorded against the
files they touched and rolls up to the parent through the session tree, so a delegated lane's spend
is never lost and never double-counted.

## 11. What can be factored into the cost of one file

Three rings, from the certain to the estimable. Every ring is stored; the export decides which rings
a client sees.

**Ring A - direct, the step that touched the file.**

1. The output tokens of the step: the model's decision to change this file and the payload of the
   change itself, which for an edit tool is the JSON of the patch.
2. Reasoning tokens, where the provider bills them (DeepSeek and GLM bill them as output).
3. The retry cost of a failed attempt: a step that errored and was re-issued burned tokens that
   delivered nothing, and they belong to the file the failed attempt was aimed at.
4. The echo of the write: the diff the tool returns enters the _next_ step's input, so a large edit
   pays again in context. It is Ring A in origin and Ring B in billing.

**Ring B - context, the input side, amortized.**

5. The file's content in the request: the first read, every later read, and the diffs of its own
   earlier edits.
6. The file's content carried forward into every subsequent step. This is the dominant term and the
   reason a one-line change can cost a whole conversation.
7. Cache economics: `cacheReadTokens` are billed at 2-20% of the input rate depending on the
   provider, and `cacheWriteTokens` carry a premium on some providers and none on others.
8. Shared context that belongs to no file: the system prompt, the tool schemas, the conversation
   history, the working agreement. It is either allocated proportionally or informed-ignored, and
   the choice is recorded rather than implied.
9. Other files' content in the same request: the cross-subsidy that makes a single-file invoice
   wrong if it ignores it.
10. Compaction summaries: a real model call, billed in full, whose content is derived from the files
    it summarized, so it is allocable to them.
11. Subagent calls: the delegated conversation's own calls, priced identically and rolled up.

**Ring C - credit and second order, the contribution side.**

12. **Read credit.** Reading a file warms the prompt cache, so every later step that carries it pays
    the cache-read rate instead of the full input rate. The saving is exact and computable from the
    same rows: `cacheReadTokens * (inputRate - cacheReadRate) / 1e6`, minus any cache-write premium.
    It is a _negative_ cost contribution attributable to the file that was read.
13. **Avoided rework.** A file read before it was edited tends to be edited once instead of three
    times. The counterfactual is not in the ledger, but the two facts that make it estimable are:
    whether the file was read before its first edit (`Touch.ReadBeforeEdit`), and what the retries
    cost. The estimate belongs to the analysis plugin, not to the ledger.
14. **Survivorship.** A file touched whose change was later reverted, or never committed, delivered
    nothing to the client. That is the discount the export applies, and it is a verdict on the
    session, not a rewrite of the history.

## 12. Assessment and discount are different objects

The user's instinct is right and the two must not be fused.

**Assessment** is descriptive and always stored. For one session it buckets the spend:

| Bucket      | Meaning                                                              |
| ----------- | -------------------------------------------------------------------- |
| `delivered` | the file's change survived to the end of the session                 |
| `explored`  | the file was read or searched but never changed                      |
| `reverted`  | the file was changed and then undone inside the session              |
| `overhead`  | retries, compaction, title generation, tooling                       |
| `carry`     | the amortized input mass, which is the part a client always disputes |

From those buckets the ledger derives the numbers a client actually argues about: cost per surviving
line, cost per delivered file, exploration ratio, rework ratio, and cache hit ratio.

**Discount** is a policy applied at export, never at capture. Three policies:

- `all-touched` - every touched file pays its share; nothing is discounted. The honest default for
  internal analysis.
- `surviving-only` - only `delivered` files are billable per file; `explored`, `reverted`, and
  `overhead` move to a single named overhead line that the client sees but does not pay per file.
  The recommended default for a client invoice.
- `capped` - a file's amortized share is capped at `k` times its direct share and the excess is
  redistributed across the other delivered files. For clients who object to context carry in
  principle but accept it in moderation.

The ledger always stores the undiscounted truth. A discount is a view over it, so an invoice can be
re-derived, disputed, and reversed without losing a row.

## 13. The contribution plugin is a second package

The ledger records facts; it should not acquire opinions. The analysis that turns facts into
judgements - read credit, read-before-edit effectiveness, cost per surviving line, cache efficiency
per file, exploration overhead, the counterfactual "did reading this file make the later edit
cheaper" - belongs in `plugin-dsh-cost-analysis`, a second package that reads the same database and
writes nothing to it.

That split is deliberate: the ledger must stay cheap enough to run on every session, and an analysis
pass is allowed to be expensive, occasional, and wrong in interesting ways. It also means the
analysis can be re-run against history whenever its model improves, without re-instrumenting
anything.

The three columns the ledger must store **now** for that plugin to exist later are
`Call.CacheSaving`, `Touch.ReadBeforeEdit`, and `Touch.Branch`. Everything else it needs is already
in the schema.

## 14. The schema additions (migration v2)

Additive only; `PRAGMA user_version` goes from 1 to 2 on first open of the new build.

```sql
ALTER TABLE Call ADD COLUMN CacheSaving REAL NOT NULL DEFAULT 0;
ALTER TABLE Touch ADD COLUMN Branch TEXT;
ALTER TABLE Touch ADD COLUMN ReadBeforeEdit INTEGER NOT NULL DEFAULT 0;

CREATE TABLE Alias (
    AliasId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    FromPath TEXT NOT NULL, ToPath TEXT NOT NULL, At INTEGER NOT NULL
) STRICT;

CREATE TABLE Verdict (
    SessionId TEXT NOT NULL REFERENCES Session (SessionId),
    FileId INTEGER NOT NULL REFERENCES File (FileId),
    State TEXT NOT NULL, LinesAdded INTEGER NOT NULL DEFAULT 0,
    LinesRemoved INTEGER NOT NULL DEFAULT 0, At INTEGER NOT NULL,
    PRIMARY KEY (SessionId, FileId)
) STRICT;

CREATE VIEW FileLifetime AS
SELECT f.FileId, f.Path, count(DISTINCT c.SessionId) AS Sessions,
       sum(a.DirectCost) AS Direct, sum(a.AmortizedCost) AS Amortized,
       sum(a.DirectCost + a.AmortizedCost) AS Cost
FROM File AS f
JOIN Allocation AS a ON a.FileId = f.FileId
JOIN Call AS c ON c.CallId = a.CallId
GROUP BY f.FileId;
```

`Verdict` is written at session end (`turn/end` with a terminal reason, or `session/disposed`) from
the touch log: a file with a write-kind touch and no later revert is `changed`; a file with only
read-kind touches is `read`; a file written and then restored to its earlier hash is `reverted`. The
verdict is the input to the `surviving-only` discount, and it is recomputable from `Touch` and
`FileVersion` alone.

## 15. What the research changed

The digest at [INFERENCE-COST-ATTRIBUTION.md](../Researches/INFERENCE-COST-ATTRIBUTION.md) was
written from 35 cited sources after the schema was drafted. Four of its findings amend this plan,
and three of them are already folded into the sections above.

1. **The bucket convention is exclusive, and it is converted once.** OpenTelemetry's
   `gen_ai.usage.input_tokens` is inclusive - it "SHOULD include all types of input tokens,
   including cached tokens" - while Langfuse stores exclusive buckets and converts at ingest. This
   ledger stores the exclusive form, which is also what the harness's own `TokenUsage` already
   reports (`inputTokens` is the uncached remainder, verified live on 2026-10-27). Any inclusive
   source is converted at the boundary, in one function, and the conversion is asserted by a smoke.
   Storing an inclusive total into an exclusive schema double-counts every cached call.
2. **Time of day is a price dimension, not just a date.** DeepSeek bills cache-hit input at
   $0.003/$0.006 and output at $0.60/$1.20 inside and outside its peak window, so the same tokens
   cost double depending on wall clock. `Price.Window` and `config.priceWindows` exist for that
   reason, and `Price.Resolve` takes the call's timestamp rather than the current time.
3. **Cache storage is a duration, not a token count.** Gemini prices context-cache storage per
   million tokens per hour. A pure per-call model cannot express it, so the ledger books storage as
   a separate `Call`-adjacent row when a provider charges it, and leaves the field null otherwise
   rather than inventing an hourly rate.
4. **A file touch is not a priced event in any provider's vocabulary.** No fetched source meters
   cost per file; the finest native grains are Claude Code's component percentages and Copilot's
   per-prompt premium requests. That is the justification for the whole plugin, and it is why the
   allocation is this repository's own synthesis rather than a reimplementation of a vendor metric.

Two smaller consequences: CSV export uses CRLF line endings per RFC 4180 (readers accept LF, the RFC
does not promise it), and the price book can optionally be seeded from the LiteLLM
`model_prices_and_context_window.json` map, whose rows are already USD per token with a `source` URL
and a `deprecation_date` - the shipped defaults stay the three Cloudflare rows so the plugin works
offline.

## 16. Analytics first, invoice later

The invoice is an on-demand or monthly artifact, not the product. What has to exist now is the
measurement: the fullest set of metrics for every file, from inside its own history and from outside
it, so that any later invoice, comparison, or client conversation is a query rather than a rebuild.
The discount policies in section 12 stay designed but unbuilt; the export stays but is not the
deliverable of this pass.

### 16.1 The semantic pipeline, per file

A file does not "get touched"; it moves through stages, and each stage has a different cost shape.
The stage is derivable from the tool and the file's own history in the session, so `Touch.Stage` is
recorded rather than inferred at report time:

| Stage      | Detected from                                         | What it means                       |
| ---------- | ----------------------------------------------------- | ----------------------------------- |
| `discover` | `glob`, `grep`, a search result naming the file       | the file was located, not read      |
| `read`     | `read`, or a `grep` with line matches                 | the content entered the context     |
| `reread`   | a second `read` after an `edit`                       | the model went back to check itself |
| `edit`     | `write`, `edit`, `multi_edit`, `batch_edit`           | the content changed                 |
| `verify`   | a `read` or `grep` after the last `edit` of that file | the change was checked              |
| `revert`   | an `edit` whose result restores an earlier hash       | the change was undone               |

`ReadBeforeEdit` is then just "a `read` stage exists earlier in the session than the first `edit`",
which is why it is a stored column and not a report-time join.

### 16.2 Inside metrics - the file's own history

Versions (count, first and last hash, bytes and lines over time); stage counts and the tokens spent
in each stage; direct cost and amortized cost per stage; cached versus uncached mass and the cache
saving the file's reads produced; churn (lines added and removed, edits per session, the number of
sessions that edited it); lifespan (first seen, last touched, active days); and the per-version
cost, so the question "what did version 7 of this file cost" has an answer.

### 16.3 Outside metrics - the file in its context

The sessions, turns, models, tools, projects and clients that touched it; per-model cost for this
file specifically; whether the touch came from a user session or a delegated subagent; and the
file's rank within each session, which separates the file the conversation was about from the file
that happened to be in the way.

### 16.4 Cross metrics - the ones that answer the user's question

Cost per surviving line; the read-before-edit delta (what an edit costs in sessions where the file
was read first versus sessions where it was not); the exploration ratio (read-only spend over total
spend for this file); the rework ratio (edits followed by a revert or a second edit of the same
lines); the carry ratio (amortized over direct, the number that says how much of this file's cost is
context rather than change); and the cache hit ratio, which is the measurable half of "did reading
this file make the later edit cheaper".

Every one of them is a view over `Call`, `Touch`, `ContextMass`, `Allocation` and `FileVersion`.
None of them requires a new event, which is the test of whether the ledger was designed at the right
grain.

## 17. The factor model - everything the price depends on

A file's cost is not one number computed from one rate. It is a product of dimensions, and a model
that stores only `(model, tokens)` will misprice every call that ran in a batch, near a context-tier
boundary, inside a peak window, under a residency flag, or after a retry. The factor model makes
each dimension explicit, typed, and effective-dated, so the arithmetic is auditable and a new
dimension is a row rather than a migration.

### 17.1 Three classes of factor

- **Pricing factors** change the rate, so they are typed columns and participate in the arithmetic:
  `Provider`, `Model`, `PriceId`, `Mode` (`standard | batch | flex | priority`), `Region`, `Window`
  (`any | peak | offpeak`), `Tier`, and the four token buckets.
- **Attribution factors** change which file pays, so they are typed columns on `Touch`: `Tool`,
  `Kind`, `Stage`, `Branch`, `ReadBeforeEdit`.
- **Classification factors** only slice the reports, so they live in a generic dimension: `origin`
  (user or subagent), `delegationDepth`, `agentPreset`, `language`, `retry`, `compaction`,
  `tokenizer`, `purpose`. They are stored as `Factor` + `CallFactor` rows, which means a new
  classifier never needs a migration.

### 17.2 Modifiers, tiers, and the interpolation rule

A base rate is multiplied by every modifier that applies at the call's own time:

    cost(call) = SUM over buckets of ( bucketTokens / 1e6 * baseRate(bucket, tier) )
                 * PRODUCT over applicable modifiers

Modifiers are rows, not code: `batch 0.5`, `flex 0.5`, `priority 2.0`, `ultrafast 6.0`,
`residency-us 1.1`, `regional-uplift 1.1`. Each is effective-dated like a price, so a historical
invoice is reproducible.

Tiers are the part that needs real interpolation, because the providers do not charge one rate for a
whole prompt that crosses a threshold. Gemini prices input at $2.00 up to 200k prompt tokens and
$4.00 above it; Anthropic tiers by prompt length on several models. The rule is **marginal**: the
tokens below the threshold are priced at the lower tier and only the excess at the higher one, which
is the only reading that does not produce a cliff where one extra token doubles a bill. `Price`
gains `TierFrom` and `TierTo`, and `Price.Cost` walks the tiers in order:

    for each tier in ascending TierFrom:
        portion = clamp(promptTokens - tier.TierFrom, 0, tier.TierTo - tier.TierFrom)
        cost += portion / 1e6 * tier.InputRate

Cache reads and writes are interpolated the same way, against their own rates, because a cached
prefix that crosses a tier boundary is priced per portion rather than per call.

### 17.3 The edit grain

A touch is too coarse to answer "what did this hunk cost". Every edit tool call produces one or more
hunks, and the ledger records each one:

```sql
CREATE TABLE Edit (
    EditId INTEGER PRIMARY KEY,
    TouchId INTEGER NOT NULL REFERENCES Touch (TouchId),
    Ordinal INTEGER NOT NULL, LinesAdded INTEGER NOT NULL DEFAULT 0,
    LinesRemoved INTEGER NOT NULL DEFAULT 0, BytesAdded INTEGER NOT NULL DEFAULT 0,
    BytesRemoved INTEGER NOT NULL DEFAULT 0, BeforeHash TEXT, AfterHash TEXT,
    At INTEGER NOT NULL, UNIQUE (TouchId, Ordinal)
) STRICT;
```

With `Edit` rows the direct half of the allocation can be weighted by hunk size instead of by whole
file delta, and three new numbers become answerable: cost per added line, cost per hunk, and the
distribution of spend across the hunks of one file (which is how a 40-line refactor that cost $4
becomes visible next to the one-line fix that cost $0.30).

### 17.4 Telemetry the log already carries

None of this needs new instrumentation; the session log records it and the plugin only has to read
it.

| Signal              | Source in the log                                                         | Use                      |
| ------------------- | ------------------------------------------------------------------------- | ------------------------ |
| first-token latency | `assistant/message.stream[].time0` minus the step start                   | perceived speed          |
| total latency       | the last `dt` accumulation in the stream record                           | throughput               |
| tokens per second   | output tokens over total latency                                          | model comparison         |
| attempts            | count of `assistant/attempt` between `step/start` and `assistant/message` | retry cost               |
| failure code        | `tool/result.error.code`, `turn/end` reason                               | wasted spend             |
| context window      | `request/context.contextWindow`                                           | utilization              |
| utilization         | `surfaceTokens / contextWindow`                                           | near-limit behavior      |
| tool duration       | `tool/call.time` to `tool/result.time`                                    | tool cost without tokens |
| result size         | the tool result's rendered bytes                                          | context mass per touch   |
| compaction          | the `purpose: 'compaction'` call                                          | overhead bucket          |

The `Call` table gains `LatencyMs`, `FirstTokenMs`, `TokensPerSecond`, `Attempts`, `ErrorCode`,
`ContextWindow`, and `Utilization`; `Touch` gains `DurationMs` and `ResultBytes`. A call that
retried three times is one `Call` with `Attempts = 3` and the wasted tokens still in its buckets, so
the rework ratio is a division rather than a join.

### 17.5 Forecast and the on-demand invoice

The invoice is produced on demand or monthly, so the ledger needs a projection that is a query, not
a stored guess: for each project and client, the daily rate over a chosen window (mean, median, and
the last seven days), projected to the period end with the observed weekday shape. The forecast is a
view over `Rollup`, labelled as an estimate in every export, and it never writes a row. A month that
is half over produces a projection with a stated confidence band (min and max daily rate), because a
single-number forecast is the thing clients distrust.

### 17.6 The DDL for the factor layer

Additive again, `user_version` 2 to 3.

```sql
ALTER TABLE Price ADD COLUMN TierFrom INTEGER NOT NULL DEFAULT 0;
ALTER TABLE Price ADD COLUMN TierTo INTEGER;
ALTER TABLE Price ADD COLUMN Mode TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE Price ADD COLUMN Region TEXT;

CREATE TABLE Modifier (
    ModifierId INTEGER PRIMARY KEY, Provider TEXT NOT NULL, Model TEXT,
    Kind TEXT NOT NULL, Value TEXT NOT NULL, Multiplier REAL NOT NULL,
    EffectiveFrom INTEGER NOT NULL, EffectiveTo INTEGER, Source TEXT NOT NULL
) STRICT;

CREATE TABLE Factor (
    FactorId INTEGER PRIMARY KEY, Scope TEXT NOT NULL, Key TEXT NOT NULL, Value TEXT NOT NULL,
    UNIQUE (Scope, Key, Value)
) STRICT;

CREATE TABLE CallFactor (
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FactorId INTEGER NOT NULL REFERENCES Factor (FactorId), Weight REAL NOT NULL DEFAULT 1,
    PRIMARY KEY (CallId, FactorId)
) STRICT;

ALTER TABLE Call ADD COLUMN Mode TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE Call ADD COLUMN Region TEXT;
ALTER TABLE Call ADD COLUMN Tier INTEGER;
ALTER TABLE Call ADD COLUMN LatencyMs INTEGER;
ALTER TABLE Call ADD COLUMN FirstTokenMs INTEGER;
ALTER TABLE Call ADD COLUMN TokensPerSecond REAL;
ALTER TABLE Call ADD COLUMN Attempts INTEGER NOT NULL DEFAULT 1;
ALTER TABLE Call ADD COLUMN ErrorCode TEXT;
ALTER TABLE Call ADD COLUMN ContextWindow INTEGER;
ALTER TABLE Call ADD COLUMN Utilization REAL;

ALTER TABLE Touch ADD COLUMN Stage TEXT;
ALTER TABLE Touch ADD COLUMN DurationMs INTEGER;
ALTER TABLE Touch ADD COLUMN ResultBytes INTEGER;
```

### 17.7 Build order

Three additive passes, each one green before the next starts, because a ledger that half-knows a
dimension is worse than one that does not know it at all:

1. **v2 - the analytics grain**: `Alias`, `Verdict`, `Touch.Stage`, `Touch.Branch`,
   `Touch.ReadBeforeEdit`, `Call.CacheSaving`, `Price.Window`, the stage classifier, the report
   queries, `/cost assess`.
2. **v3 - the factor layer**: `Modifier`, `Factor`/`CallFactor`, tiers, modes, regions, and the
   marginal interpolation in `Price.Cost`.
3. **v4 - the edit and telemetry grain**: `Edit`, the latency and retry columns, the stream-record
   parser, and the forecast view.

Each pass ships with its own smokes, and the conservation smoke from section 9 runs after every one
of them, because the one thing that must never drift is that the allocations still sum to the bill.
