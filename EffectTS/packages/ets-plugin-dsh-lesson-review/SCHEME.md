# SCHEME - @playform/ets-plugin-dsh-lesson-review

## 1. Identity

| Place                  | Value                                              |
| ---------------------- | -------------------------------------------------- |
| Package name           | `@playform/ets-plugin-dsh-lesson-review`           |
| Service name           | `lesson` (`super(Context, "lesson")`)              |
| Loader form            | class (`static Config`, `static inject = []`)      |
| Patch entry id         | `plugin-dsh-lesson-review`                         |
| Ledger logFile default | `~/.dsh/playform/ets-plugin-dsh-lesson-review.log` |
| Usage store            | `~/.dsh/lesson/usage.json`                         |
| Pending queue          | `~/.dsh/lesson/pending.jsonl`                      |
| Reports                | `~/.dsh/lesson/reports/<YYYYMMDD-HHMMSS>/`         |
| Corpus                 | `~/.dsh/skills/<name>/SKILL.md`                    |
| Archive                | `~/.dsh/skills/.archive/<name>/`                   |
| Agreement              | `~/.dsh/AGENTS.md` (proposals only, never written) |

The loader contract is the class form that the pattern service sets as precedent, so the default
export is `class LessonService extends Service` with `static inject = []`, and the named `Config`
schema export is also attached as `static Config`.

## 2. The service surface (`ctx.lesson`)

| Method               | Effect                                                          |
| -------------------- | --------------------------------------------------------------- |
| `Configure(options)` | apply validated knobs (volatile cells)                          |
| `Tick(agent)`        | advance one agent's nudge counter → `{ due, count }`            |
| `Reset(agent)`       | clear one agent's counter                                       |
| `Digest(messages)`   | the bounded digest → `{ text, kept, collapsed, trimmed }`       |
| `Prompt(focus?)`     | the byte-stable review prompt (a `promptFile` override wins)    |
| `Parse(reply)`       | the strict reply parse → `{ ok, proposal } \| { ok, error }`    |
| `Judge(proposal)`    | the deterministic acceptance rules → `{ accepted, rejected }`   |
| `Snapshot(agent)`    | the live-session projection (the integration seam)              |
| `Review(input)`      | ONE review → `{ outcome, applied, proposed, rejected, report }` |
| `Curate(now?)`       | the deterministic staleness/archive pass                        |
| `Status()`           | `{ total, active, stale, archived, pinned, pending }`           |
| `Pin(name)`/`Unpin`  | the lifecycle exemption                                         |
| `Restore(name)`      | move an archived skill back and reactivate its record           |
| `Archive(name)`      | archive one skill now (no model involved)                       |
| `Pending()`          | the queued proposals, oldest first                              |
| `Accept(name)`       | land one queued proposal                                        |
| `Save()`/`Flush()`   | the store flush (the smoke seam)                                |

## 3. One review, step by step

```
Review(input)
  ├─ gate: enabled                      → outcome "unavailable" (detail: disabled)
  ├─ probe: ctx.get("llm")              → "unavailable" (no llm service)
  ├─ route: knobs, then agent.options   → "unavailable" (no model route)
  ├─ gate: input.Messages non-empty     → "unavailable" (empty snapshot)
  ├─ Digest(messages)                   → the bounded digest
  ├─ Prompt(focus)                      → the constant instruction
  ├─ ctx.llm.stream({provider, model, messages:[one user message], maxTokens, signal})
  │     └─ throws                      → "failed" (model call failed: <cause>)
  ├─ Parse(reply)                       → "failed" (unparseable reply: <cause>)
  ├─ ops.length === 0                   → "nothing"
  ├─ Judge(proposal)                    → accepted / rejected (with rule ids)
  ├─ per accepted op:
  │     ├─ op === "agreement"           → ALWAYS queued
  │     ├─ policy.write !== "auto"      → queued
  │     └─ Apply(op)                    → applied | rejected (fence reason)
  ├─ Report(...)                        → run.json + REPORT.md
  └─ Save()                             → the usage store
```

The model call is ONE hand-built request.

It carries no agent-loop marker from `markAgentLoopRequest`, so the harness cannot mistake it for a
loop request, and it is not part of the session log, because the review never mutates the transcript
that it is reviewing.

## 4. Config

| Key                  | Default                                            | Effect                                    |
| -------------------- | -------------------------------------------------- | ----------------------------------------- |
| `enabled`            | `false`                                            | the switch (schema; patch row)            |
| `logFile`            | `~/.dsh/playform/ets-plugin-dsh-lesson-review.log` | the ledger                                |
| `domain`             | `lesson`                                           | the usage-store unit name                 |
| `storagePath`        | `~/.dsh/lesson/usage.json`                         | the usage sidecar                         |
| `intervalTurns`      | `10`                                               | turns between reviews (`0` disables)      |
| `idleOnly`           | `true`                                             | review only from the idle phase           |
| `staleAfterDays`     | `14`                                               | the stale line                            |
| `archiveAfterDays`   | `30`                                               | the archive line                          |
| `neverUsedGraceDays` | `14`                                               | the zero-use grace floor                  |
| `digestTail`         | `24`                                               | verbatim tail of the digest               |
| `maxInputChars`      | `120000`                                           | the digest + prompt cap                   |
| `maxProposals`       | `8`                                                | operations admitted from one reply        |
| `consolidate`        | `false`                                            | the LLM umbrella pass (opt-in, not wired) |
| `promptFile`         | `""`                                               | prompt override                           |
| `skillsRoot`         | `~/.dsh/skills`                                    | the corpus                                |
| `archiveRoot`        | `~/.dsh/skills/.archive`                           | where archives move                       |
| `agreementPath`      | `~/.dsh/AGENTS.md`                                 | proposals only                            |
| `reportsRoot`        | `~/.dsh/lesson/reports`                            | per-run reports                           |
| `pendingPath`        | `~/.dsh/lesson/pending.jsonl`                      | the queue                                 |
| `provider`/`model`   | `""`                                               | the review route (empty = the agent's)    |
| `maxTokens`          | `4000`                                             | the reply ceiling                         |
| `policy`             | D6 block                                           | the per-action allowlist                  |

The knobs are fail-loud at load, so a reversed `archiveAfterDays < staleAfterDays`, a non-unit
`domain`, a `digestTail < 2`, a `maxProposals < 1`, and a `maxInputChars < 1000` all throw with a
message that names the knob.

## 5. The judge's rules (deterministic, one id each)

| Rule id            | Refuses                                                          |
| ------------------ | ---------------------------------------------------------------- |
| `name-shape`       | a name that is not kebab-case starting with a letter             |
| `name-artifact`    | a year, an `#issue`, or a `fix-`/`debug-`/`audit-`/`wip-` prefix |
| `exists`           | a `create` whose skill already exists                            |
| `missing`          | a `patch`/`support`/`archive` whose skill does not exist         |
| `pinned`           | any operation on a pinned skill                                  |
| `frontmatter`      | a `create`/`patch` body whose `name:` is not this skill          |
| `narrative`        | `UPDATE:`, `this session`, or a date-stamped heading             |
| `negative-claim`   | "does not work / is broken / not installed" with no fix          |
| `support-path`     | a support file outside `references/`/`templates/`/`scripts/`     |
| `absorbed-missing` | an archive naming an umbrella that does not exist                |
| `absorbed-self`    | an archive naming itself as the umbrella                         |
| `agreement-long`   | an agreement rule longer than 400 characters                     |
| `duplicate`        | the same operation twice in one reply                            |

The write fence is the second half, so `create` refuses an existing `SKILL.md`, `patch` refuses a
missing one, `support` refuses a missing skill directory, and `archive` refuses an existing archive
target.

A refusal is returned and never thrown, so one bad operation cannot discard the run.

## 6. The seams and the known unknowns

1. **The session projection (`Function/Snapshot`).**

    The surface accessors of the harness, such as `agent.session.surface.messages` and its peers,
    have NOT been verified against a live host in this checkout.

    The module probes four candidate shapes, guards every read, and returns `[]` when none answers,
    and the review then reports `unavailable (empty snapshot)`.

    This is the ONE place where a harness upgrade can change behavior, and it is confined to one
    file.

2. **The auxiliary-call classification.**

    `GenerateOptions.purpose` accepts only `'compaction' | 'session-title'`, and a lesson review has
    no slot, so the request leaves `purpose` unset.

    Giving the review its own purpose is an upstream harness change and not a plugin one.

3. **The storage domain.**

    `~/.dsh/lesson/usage.json` is what this cut wires.

    The PoC posture of the family is a KV domain with `domain: "lesson"` as the PRIMARY and the JSON
    as the fallback, which is the shape of the pattern service; that wiring is the next refinement,
    and the knob is already declared.

4. **Consolidation.**

    `consolidate` is declared and unwired, because the deterministic `Curate` pass is the shipped
    maintenance.

    An LLM umbrella pass would reuse `Review` with a different prompt and a corpus-only judge.

## 7. Ledger strings (module-owned, byte-stable)

Every line is `lesson: <message> (logFile <logFile>)`:

- `activated (bundle=0.2.1, interval=<n> turns, corpus=<root>, write=<verdict>)`
- `disabled (enabled=false)`
- `restored <n> usage records` / `usage store unreadable: <reason>; starting empty`
- `due after <n> turns`
- `queued <op> <name>`
- `applied <op> <name> -> <path>`
- `refused <name> (<rule>)`
- `review proposed (<a> applied, <q> queued, <r> refused)`
- `review applied (<a> applied, <q> queued, <r> refused)`
- `review unavailable (<reason>)` / `review failed (<reason>)`
- `nothing to save`
- `stale <name>` / `archived <name> -> <path>` / `archive failed for <name> (<reason>); kept stale`
- `curated <s> stale, <a> archived`
- `pinned <name>` / `unpinned <name>` / `restored <name>`
- `accepted <op> <name> -> <path>` / `accept refused <name> (<reason>)`
- `promptFile unreadable: <reason>; using the shipped prompt`
- `queue write failed: <reason>` / `usage store write failed: <reason>`

## 8. What this package does NOT own

The trigger is outside this package, because the service never listens to an event and never claims
the idle phase, and that work belongs to `@playform/ets-hook-dsh-lesson-nudge`, so a different
trigger can drive the same service.
