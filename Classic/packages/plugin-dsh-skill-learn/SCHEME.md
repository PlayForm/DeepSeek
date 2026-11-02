# SCHEME - @playform/plugin-dsh-skill-learn

## 1. Identity

| Place                  | Value                                                     |
| ---------------------- | --------------------------------------------------------- |
| Package name           | `@playform/plugin-dsh-skill-learn`                        |
| Service name           | `skillLearn` (`super(Context, "skillLearn")`)             |
| Loader form            | class (`static Config`, `static inject = []`)             |
| Loader entry id        | `plugin-dsh-skill-learn`                                  |
| Ledger logFile default | `~/.dsh/playform/plugin-dsh-skill-learn.log`              |
| Usage store            | `~/.dsh/skill-learn/usage.json`                           |
| State store            | none; the curator clock is the usage store's reserved key |
| Audit ledger           | `~/.dsh/skill-learn/ledger.jsonl`                         |
| Blob store             | `~/.dsh/skill-learn/blobs/<sha256>`                       |
| Snapshot store         | `~/.dsh/skill-learn/snapshots/<id>.json`                  |
| Reports                | `~/.dsh/skill-learn/reports/<YYYYMMDD-HHMMSS>/`           |
| Corpus                 | `~/.dsh/skills/<name>/SKILL.md`                           |
| Archive                | `~/.dsh/skills/.archive/<name>/`                          |
| Agreement              | `~/.dsh/AGENTS.md` (read-only, never written)             |

The loader contract is the class form the pattern service sets as precedent, so the default export
is `class SkillLearnService extends Service` with `static inject = []` and
`static Config = Definition`, where `Definition` is the schema's default export. A class plugin has
no `apply`: construction IS the load, and both listeners are registered there.

The archive root sits inside the corpus root and is never discovered as a skill: the filesystem
provider discovers `<root>/<name>/SKILL.md` or `<root>/<name>.md` at one directory level only
(`dsh-skill-filesystem/lib/index.js:589-595`).

## 2. The service surface (`ctx.skillLearn`)

| Method        | Arguments                            | Returns                        | Failure it reports                                                                            |
| ------------- | ------------------------------------ | ------------------------------ | --------------------------------------------------------------------------------------------- |
| `Configure`   | `Partial<Configuration>`             | `void`                         | none; a bad config already failed loud at load                                                |
| `Trigger`     | `agent: unknown`                     | `Promise<Trigger>`             | never throws; `outcome` is one of the twelve classes                                          |
| `Review`      | `{agent, signal, reason?, session?}` | `Promise<ReviewResult>`        | never throws; `outcome` is always set and `detail` may be absent                              |
| `Curate`      | `now?: Date`                         | `Promise<Curation>`            | a rejected `ctx.fs` read propagates; the store is quarantined                                 |
| `Consolidate` | `{signal?, dryRun?}`                 | `Promise<ConsolidationResult>` | `outcome: "disabled"` when `consolidate` is false                                             |
| `Record`      | `name: string, agent?: unknown`      | `Promise<void>`                | a store failure writes one ledger line and returns                                            |
| `Revert`      | `identifier: string`                 | `Promise<Reverted>`            | `ok:false` with `outcome` in `missing`, `blob-missing`, `stale`, `staging-retained`, `failed` |
| `Status`      | none                                 | `Status`                       | always answers; the store is quarantined before the read                                      |
| `Pin`         | `name: string, pinned: boolean`      | `Promise<Lifecycle>`           | `ok:false` with `outcome` in `foreign-root`, `not-tracked`                                    |
| `Restore`     | `name: string`                       | `Promise<Lifecycle>`           | `ok:false` with `outcome` in `not-archived`, `destination-exists`, `foreign-root`, `failed`   |
| `Digest`      | `messages: readonly Message[]`       | `DigestResult`                 | none; pure                                                                                    |
| `Prompt`      | `phase: 1 \| 2`                      | `string`                       | none; pure, byte-stable                                                                       |
| `Save`        | none                                 | `Promise<void>`                | swallows and ledgers; the smoke seam                                                          |

`Trigger` takes `unknown` rather than the harness's `Agent` because this package cannot import the
agent package: `Interface/Review.ts:3-7` says the service is the single place that narrows `unknown`
to the structural surface it reads, and `Function/Transcript.ts:13-19` says it does so by cast.

`Review` accepts an optional `session`, which is the write budget `Gate.Run` hands the run
(`Function/Trigger.ts:69-91`). A direct call has no claimed run and spends the `Unbudgeted` session,
so the per-run cap is its tighter bound.

## 3. One run, step by step

```
agent/status (emit, idle only)
  ├─ the listener returns synchronously; the run is DETACHED with a catch
  └─ Trigger(agent)
       └─ Gate.Run({agent, count: Transcript(agent).toolCalls, configuration, review})
            ├─ enabled is false              → "disabled"
            ├─ session writes >= cap         → "capped"          (before any model call)
            ├─ count < intervalIterations    → "below-threshold"
            ├─ runMaintenance throws         → "busy"
            └─ claimed, then review(signal, session)
                 ├─ Transcript(agent)                 → empty is "empty-transcript"
                 ├─ Digest(messages)
                 ├─ ctx.llm probe                     → absent is "no-llm"
                 ├─ Route(agent, knobs)               → absent is "no-route"
                 ├─ Catalog(ctx.skills.list)
                 ├─ Plan(llm, {digest, index, Prompt(1)})
                 │     └─ throws                     → "model-failed"
                 ├─ Parse(reply, 1, maxOperations)    → "unparsable"
                 ├─ view set = views ∪ patch/support targets
                 ├─ load each view (ctx.skills.get) and each support file (ctx.fs)
                 ├─ Confirm(llm, {digest, index, bodies, Prompt(2)}) when the set is non-empty
                 │     ├─ throws                     → "model-failed"
                 │     └─ Parse(reply, 2, ...)       → "unparsable"
                 ├─ Judge(operation, corpus, knobs) over every operation
                 ├─ per accepted operation, re-reading both caps:
                 │     ├─ Write(...)                 → refused, with the fence class in the detail
                 │     ├─ Ledger append (before/after blobs)
                 │     ├─ Usage.Created / Usage.Patched
                 │     └─ ctx.skills.invalidateCache()
                 ├─ Save()                            the usage store
                 └─ Report(...) then ONE ledger line  → "nothing" | "refused" | "applied"
```

`Trigger` logs the four gate classes; the pipeline logs the eight post-model classes. Exactly one
line per run either way, and a direct `Review` call logs its own line too.

## 4. The two-call protocol

Phase 1 asks for a plan and carries no bodies. Phase 2 carries the bodies and asks for the final
list. Two calls maximum: there is no third call, no repair pass, and no iteration loop.

The view set is the PLUGIN's decision: the model's `views` unioned with every `patch` and `support`
target, so a target the model did not name is still carried. When the union is empty the confirm
call is skipped, which is only reachable when every operation is a `create`.

The reply is read from `text-delta` frames only (`dsh-llm/lib/types/types.d.ts:439-442`), and the
request leaves `purpose` unset because its union is closed to `compaction` and `session-title`
(`dsh-llm/lib/types/types.d.ts:547`).

## 5. The judge's rules (deterministic, one id each, first refusal wins)

The ids and the strings are plan section 4.5, byte for byte. The order is section 6.2's guard
precedence, not the table order.

| Id                    | Refuses when                                                                                  | Refusal string                                                           |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `operation-known`     | `kind` is not `patch`, `create`, or `support`                                                 | `operation kind '<kind>' is not one of patch, create, support`           |
| `name-grammar`        | `skill` fails the corpus grammar or exceeds 64 characters                                     | `skill name '<name>' does not match the corpus grammar`                  |
| `target-absent`       | a `create` names a skill the catalog resolves                                                 | `skill '<name>' already exists; create refuses an existing path`         |
| `target-present`      | a `patch` or `support` names a skill the catalog does not resolve                             | `skill '<name>' is not in the catalog; patch needs an existing skill`    |
| `body-carried`        | the target body was not carried, or is not the body fetched at write time                     | `skill '<name>' was not loaded in the confirm prompt; read before write` |
| `anchor-unique`       | `oldString` occurs zero times or more than once in that body                                  | `oldString occurs <n> times in '<name>'; the anchor must be unique`      |
| `anchor-changed`      | `oldString` or `newString` is blank, or they are equal                                        | `oldString and newString are identical or blank`                         |
| `frontmatter-valid`   | the result would not parse as a skill file                                                    | `the result would not parse as a skill file: <reason>`                   |
| `description-present` | the result's frontmatter `description` is empty                                               | `the frontmatter description is empty`                                   |
| `support-path`        | `filePath` is not under `references/`, `templates/`, or `scripts/`                            | `support path '<path>' is not a support file`                            |
| `never-agreement`     | the target path is `agreementPath`                                                            | `the target is the working agreement; it is never written`               |
| `never-archive`       | the target path is inside `archiveRoot`                                                       | `the target is inside the archive; it is never written`                  |
| `narrative-free`      | the new text carries a date, a reference number, or a quoted user sentence over 40 characters | `the text carries a date, a reference number, or quoted user text`       |
| `negative-claim`      | the new text asserts a tool does not work and names no fix                                    | `the text asserts a tool is broken without the fix that makes it work`   |
| `duplicate-rule`      | a non-blank line of `newString` already occurs verbatim in the target body                    | `the text repeats a line already present in '<name>'`                    |
| `size-bound`          | the result exceeds `maxSkillChars`                                                            | `the result is <n> characters; the bound is <m>`                         |

`frontmatter-valid` is the harness's own contract, not a new one: a `---` fence, a non-empty `name`
matching `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, and a non-empty body, with the legacy camelCase keys
rejected because the loader throws on them (`dsh-skill-filesystem/lib/index.js:667-708`).

A FENCE refusal is not a judge rule. The fence's own classes are `foreign-root`, `body-carried`, and
`failed` (plan section 6.2, rows 13 to 15), and `ReviewRefusal.rule` is closed to the sixteen ids
(`Interface/Review.ts:25-42`), so the pipeline reports a fence refusal under the nearest id -
`never-archive` for a foreign root, `body-carried` for everything else - and keeps the fence's class
and detail in the refusal's `detail`.

## 6. The parse failure ids (nine)

| Id            | Rule                                                                                    |
| ------------- | --------------------------------------------------------------------------------------- |
| `empty`       | the reply is blank after trimming                                                       |
| `fence`       | text precedes or follows a fenced block, or the fence is not ` ```json `                |
| `json`        | `JSON.parse` threw                                                                      |
| `shape`       | the value is not a plain object, or `operations` is not an array                        |
| `unknown-key` | a top-level key other than `views` and `operations` (phase 1) or `operations` (phase 2) |
| `field`       | a required field is missing, is not a string, or is blank                               |
| `kind`        | `kind` is not exactly `patch`, `create`, or `support`                                   |
| `count`       | more than `maxOperations` operations                                                    |
| `name`        | a `skill` or a `views` entry does not match `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`              |

A bare object and exactly one ` ```json ` fence are both accepted; everything else is `fence`. The
parser never repairs, never retries, and never coerces a number into a string.

One boundary is deliberate: a blank `oldString` or `newString` is NOT a parse failure. The judge's
`anchor-changed` refuses it, and the two must not both claim it, or a blank anchor would end the run
as `unparsable` instead of `refused` (`Function/Parse.ts:28-33`).

## 7. Config

| Key                    | Default                                      | Effect                                                          |
| ---------------------- | -------------------------------------------- | --------------------------------------------------------------- |
| `enabled`              | `false`                                      | the master switch                                               |
| `logFile`              | `~/.dsh/playform/plugin-dsh-skill-learn.log` | the family ledger path                                          |
| `domain`               | `"skillLearn"`                               | the declared storage domain                                     |
| `storagePath`          | `~/.dsh/skill-learn/usage.json`              | the usage store                                                 |
| `statePath`            | `~/.dsh/skill-learn/state.json`              | reserved and unread; the curator clock lives in the usage store |
| `ledgerPath`           | `~/.dsh/skill-learn/ledger.jsonl`            | the audit ledger                                                |
| `blobRoot`             | `~/.dsh/skill-learn/blobs`                   | the content-addressed bytes                                     |
| `snapshotRoot`         | `~/.dsh/skill-learn/snapshots`               | the snapshot manifests                                          |
| `reportsRoot`          | `~/.dsh/skill-learn/reports`                 | one directory per run                                           |
| `snapshotKeep`         | `5`                                          | how many snapshots survive a rotation                           |
| `skillsRoot`           | `~/.dsh/skills`                              | the only writable corpus root                                   |
| `archiveRoot`          | `~/.dsh/skills/.archive`                     | the worst outcome a pass may produce                            |
| `agreementPath`        | `~/.dsh/AGENTS.md`                           | read-only; J11 refuses any write to it                          |
| `intervalIterations`   | `15`                                         | tool-call blocks since the last review                          |
| `maxOperations`        | `8`                                          | the parsed operation bound                                      |
| `maxOperationsPerRun`  | `4`                                          | the applied bound for one run                                   |
| `maxWritesPerSession`  | `6`                                          | the session bound                                               |
| `digestTail`           | `24`                                         | messages kept verbatim                                          |
| `digestUserChars`      | `300`                                        | the user-line cap                                               |
| `digestAssistantChars` | `200`                                        | the assistant-line cap                                          |
| `maxInputChars`        | `120000`                                     | declared and never enforced                                     |
| `maxTokens`            | `4000`                                       | the reply budget                                                |
| `maxSkillChars`        | `100000`                                     | the resulting-file bound                                        |
| `staleAfterDays`       | `14`                                         | the stale cutoff, floored at 1                                  |
| `archiveAfterDays`     | `30`                                         | the archive cutoff, floored at 1                                |
| `curateIntervalHours`  | `168`                                        | the minimum age of `lastRunAt`                                  |
| `consolidate`          | `false`                                      | the opt-in second half of the curator                           |
| `provider`             | `""`                                         | the route override                                              |
| `model`                | `""`                                         | the route override                                              |
| `policy`               | the shipped block below                      | the per-action allowlist                                        |

The shipped policy verdicts: `read: auto`, `index: auto`, `record: auto`, `suggest: auto`,
**`write: auto`**, `commit: approve`, `spawn: approve`, `message: auto`.

The knobs are fail-loud at load, so a bad `domain`, a `maxOperations` above 8, a
`maxOperationsPerRun` below 1, a `digestTail` below 1, and a day threshold below 1 all throw with a
message that names the knob. `Function/Knobs` applies the same bounds when the class is constructed
bare by a smoke, and it clamps rather than throws, because a bare construction never passed through
Schemastery.

## 8. The ledger strings (module-owned, byte-stable)

Every line is `skillLearn: <clause> (logFile <logFile>)`. The sixteen below are plan section 6.7,
byte for byte.

| Event             | Line                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Activation        | `skillLearn: activated (bundle=<version>, interval=<n> calls, corpus=<root>, write=<verdict>) (logFile <logFile>)` |
| Disabled          | `skillLearn: disabled (enabled=false) (logFile <logFile>)`                                                         |
| Below threshold   | `skillLearn: skipped (below-threshold <n>/<m>) (logFile <logFile>)`                                                |
| Capped            | `skillLearn: skipped (cap reached <n>/<m> writes) (logFile <logFile>)`                                             |
| Busy              | `skillLearn: skipped (busy: the agent is not idle) (logFile <logFile>)`                                            |
| No llm            | `skillLearn: unavailable (no llm service) (logFile <logFile>)`                                                     |
| No route          | `skillLearn: unavailable (no model route) (logFile <logFile>)`                                                     |
| Empty transcript  | `skillLearn: unavailable (empty transcript) (logFile <logFile>)`                                                   |
| Model failed      | `skillLearn: failed (model call: <message>) (logFile <logFile>)`                                                   |
| Unparsable        | `skillLearn: failed (unparsable <id>: <detail>) (logFile <logFile>)`                                               |
| Nothing           | `skillLearn: reviewed nothing (<n> views, 0 operations) (logFile <logFile>)`                                       |
| Refused           | `skillLearn: reviewed refused (<n> refused: <first id>) (logFile <logFile>)`                                       |
| Applied           | `skillLearn: reviewed applied <n> (<m> refused) (logFile <logFile>)`                                               |
| Curated           | `skillLearn: curated checked=<n> seeded=<n> stale=<n> archived=<n> reactivated=<n> (logFile <logFile>)`            |
| Reverted          | `skillLearn: reverted <id> (<n> file(s), <m> retained) (logFile <logFile>)`                                        |
| Store quarantined | `skillLearn: usage store unreadable (<error>); quarantined to <path> (logFile <logFile>)`                          |

Two further lines exist for events section 6.7 does not define, and they keep the same prefix and
suffix:

| Event                | Line                                                        |
| -------------------- | ----------------------------------------------------------- |
| Detached task failed | `skillLearn: failed (task: <message>) (logFile <logFile>)`  |
| Store write failed   | `skillLearn: failed (store: <message>) (logFile <logFile>)` |

The first is the `.catch` of the detached idle-edge task, which must ledger rather than throw into
an `emit`. The second is `Save`'s swallow-and-ledger contract, which plan section 2 states for the
`Save` seam. A refused `Revert` has no line: section 6.7 defines the line for a revert that
happened, and the audit ledger's `pre-rollback` row records the attempt.

## 9. The write fence

| Kind                 | Target                         | Call                                | Intent                                |
| -------------------- | ------------------------------ | ----------------------------------- | ------------------------------------- |
| `create`             | `<skillsRoot>/<name>/SKILL.md` | `resolve` then `writeText`          | `{kind: "createIfAbsent"}`            |
| `patch`              | the existing `SKILL.md`        | `resolve`, `stat`, then `editText`  | `{version}` from `stat`               |
| `support` (new)      | `<resourceBase>/<filePath>`    | `resolve` then `writeText`          | `{kind: "createIfAbsent"}`            |
| `support` (existing) | `<resourceBase>/<filePath>`    | `resolve`, `stat`, then `writeText` | `{kind: "replaceIfVersion", version}` |

`createIfAbsent` rejects an existing target; `replaceIfVersion` rejects an absent or moved one
(`dsh-fs/lib/types/types.d.ts:105-116`). Omitting the intent would be an unconditional overwrite,
which this plugin never performs.

`patch` uses `editText`, not a hand-rolled replacement, because that call checks the version before
it matches a character and requires exactly one match (`dsh-fs/lib/types/index.d.ts:222-237`).
`replaceAll` is always `false`, which is the harness's own enforcement of `anchor-unique`.

The guard precedence, first refusal only:

1. `enabled` -> `disabled`
2. the session write cap, counted on successes -> `capped`
3. the per-run cap -> the surplus operations are not attempted, `detail: run cap`
4. J1 `operation-known`, J2 `name-grammar`
5. J3 `target-absent` or J4 `target-present`
6. J11 `never-agreement`, J12 `never-archive`
7. J10 `support-path`
8. J5 `body-carried`
9. J6 `anchor-unique`, J7 `anchor-changed`
10. J13 `narrative-free`, J14 `negative-claim`, J15 `duplicate-rule`
11. J8 `frontmatter-valid`, J9 `description-present`
12. J16 `size-bound`
13. the root fence: the resolved target must be contained by `skillsRoot` and not by `archiveRoot`,
    and a support path must stay inside its own skill directory -> `foreign-root`
14. the body re-fetch and byte comparison -> `body-carried`, `detail: body-drifted`
15. `stat` and the intent -> `FS_NOT_OBSERVED`, `FS_STALE_VERSION`, `FS_EDIT_NOT_FOUND`,
    `FS_AMBIGUOUS_EDIT`

`resolve` is a resolution default and NOT a containment boundary
(`dsh-fs-local/lib/index.js:719-723`), so the plugin's own `contains` call is the only thing that
refuses a skill whose catalog entry lives outside `skillsRoot`.

## 10. Archive and restore

The seam has no move and no delete, so an archive is a COPY plus a NEUTRALIZATION.

| Step        | Rule                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Destination | `<archiveRoot>/<name>/` holding `SKILL.md` and one copy per support file                                                                                                 |
| Collision   | `<name>-<YYYYMMDDHHMMSS>` when the destination already holds a `SKILL.md`                                                                                                |
| Copy        | one `writeText` with `createIfAbsent` per file, so an existing archive is never overwritten                                                                              |
| Neutralize  | `writeText` with `replaceIfVersion` on the live `SKILL.md`, adding `disable-model-invocation: true` to the frontmatter                                                   |
| Record      | the record survives; `state = archived`, `archivedAt = now`                                                                                                              |
| Ledger      | one row `action: "archive"` whose `after` manifest is the archive copy                                                                                                   |
| Restore     | read the archived `SKILL.md`, drop the `disable-model-invocation` line, `writeText` the live path with `replaceIfVersion`, then `state = active` and `archivedAt = null` |

`Restore` refuses a name outside `skillsRoot` (`foreign-root`), an archive that does not exist
(`not-archived`), and a live file that is not the neutralized copy (`destination-exists`), because
overwriting a live skill would clobber bytes the pass never took.

The copy is text only, which is a limit of the seam: a package carrying a binary asset is left
unarchived with a reported failure rather than copied with a hole in it.

## 11. The caps

| Cap                   | Default | Counted on                  | Effect                                    |
| --------------------- | ------- | --------------------------- | ----------------------------------------- |
| `maxWritesPerSession` | `6`     | successes, per agent object | the run is `capped` before any model call |
| `maxOperationsPerRun` | `4`     | successes within one run    | the surplus operations are not attempted  |
| `maxOperations`       | `8`     | parsed operations           | the parse fails `count`                   |

Both write caps increment only after `writeText` or `editText` resolved, and `Trigger` reports the
spent count so the next run can prove the cap. The session cap is keyed on the agent OBJECT, so a
resumed session starts a fresh budget (plan section 14, question 2).

## 12. The seams that were measured rather than assumed

Every row below was read in this checkout before the wiring was written. The coordinate is the
declaration or the shipped runtime, not the plan's restatement of it.

| Seam                                                                      | Where it was measured                                  | What it decides                                                                                      |
| ------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `agent/status` is `emit` with `{agent, status}`                           | `dsh-agent/lib/types/runtime-types.d.ts:252-255`       | the listener is a synchronous recorder and detaches the run                                          |
| `runMaintenance` throws synchronously when busy                           | `dsh-agent/lib/types/runtime-types.d.ts:164-174`       | the claim is the `busy` class, and it is never awaited to find out                                   |
| `tools/post-execute` is a waterfall returning `Promise<PostToolDecision>` | `dsh-tools/lib/types/index.d.ts:70`                    | the listener must call `next()` exactly once                                                         |
| `exec.arguments` is `unknown`                                             | `dsh-tools/lib/types/index.d.ts:227`                   | the use seam reads `name` through `Reflect.get`, never a cast                                        |
| `deriveMessages()` is the history accessor                                | `dsh-session/lib/types/index.d.ts:347`                 | the transcript has one accessor and no fallback                                                      |
| a reply is read from `text-delta` frames only                             | `dsh-llm/lib/types/types.d.ts:439-442`                 | both phase reads collect that arm and skip every other frame                                         |
| the request's `purpose` union is closed                                   | `dsh-llm/lib/types/types.d.ts:547`                     | a review request leaves `purpose` unset                                                              |
| the catalog is `list` / `get` / `invalidateCache`                         | `dsh-skill/lib/index.js:224`, `:250`, `:376-380`       | the index, the carried body, and the cache drop after every write                                    |
| discovery is one directory level, `SKILL.md` or `<name>.md`               | `dsh-skill-filesystem/lib/index.js:589-595`            | the archive root is invisible to the catalog                                                         |
| `disable-model-invocation` is honored by the loader                       | `dsh-skill-filesystem/lib/index.js:852-881`            | neutralization is what takes a skill out of the model's catalog                                      |
| the two write intents and their typed codes                               | `dsh-fs/lib/types/types.d.ts:105-116`, codes at `:162` | every write is guarded, and no write is unconditional                                                |
| `editText` checks the version before it matches                           | `dsh-fs/lib/types/index.d.ts:222-237`                  | a patch cannot land on a body that moved                                                             |
| `writeText` creates the parent directory recursively                      | `dsh-fs-local/lib/index.js:514-515`                    | a new `<skillsRoot>/<name>/SKILL.md` needs no separate directory call                                |
| `resolve` is not a containment boundary                                   | `dsh-fs-local/lib/index.js:719-723`                    | the plugin's own `contains` check is the fence                                                       |
| `Events` keys exist only where a harness type file was loaded             | `cordis/lib/types/events.d.ts:88`                      | the entry imports `@deepseek-ai/dsh-agent` and `@deepseek-ai/dsh-tools` for their declarations alone |

Two things are ASSUMED rather than measured, and both are confined to one file:

1. **The `ctx.skills.list` row's extra fields.** The index reads `name` and `description` and
   applies the model-invocability filter only when the row carries `modelInvocable`, which is the
   plan's own answer to its open question 1 (`Function/Catalog.ts:13-23`).
2. **The working-directory service.** `ctx.get("workingDirectory")` is probed and the catalog is
   listed from the configured corpus root when it is absent (`Interface/Services.ts:219-220`).

## 13. What this package does not own, and what is not implemented

The trigger, the review, and the curator are one package by design, so a second trigger cannot drive
the same service without editing the entry.

The non-goals of plan section 13 hold here: no merge, no delete, no `prune_builtins`, no
cron-reference protection, no write to `~/.dsh/AGENTS.md`, no proposal queue, no memory store, no
subagent, no tool loop, no ETS twin, no second corpus root, no KV-primary storage, no commit, and no
spawn.

Two further gaps are worth naming because a reader will look for them:

- **The consolidation model call is unwired.** No leaf owns a consolidation prompt or a plan parser,
  so `Consolidate` answers `model-failed` when `consolidate` is true rather than inventing a text
  the plan does not specify. The shipped `consolidate: false` never reaches that line.
- **`statePath` has no reader or writer.** The curator's clock is the usage store's one reserved
  top-level key, so `lastRunAt` survives a restart and no second store owns one number.
