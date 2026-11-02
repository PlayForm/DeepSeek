# @playform/plugin-dsh-skill-learn

The post-turn skill learning loop, as a service.

**Plugin @ DSH @ Skill @ Learn.**

The service owns both halves of the Hermes learning loop: the post-turn review that turns a finished
session into skill edits, and the curator that ages the corpus.

It registers its own trigger on the harness idle edge (`agent/status` with `status === "idle"`),
claims the true idle phase through `agent.runMaintenance`, reads the transcript from
`Agent.session.deriveMessages()`, reads the catalog through `ctx.skills`, writes through `ctx.fs`
behind an explicit intent, and makes exactly TWO hand-built `ctx.llm.stream` requests with a strict
JSON reply.

## What a run does

1. **The edge.**

    The review runs only when the agent becomes idle, because that is the phase
    `agent.runMaintenance` can claim. A turn or another maintenance task already holding the agent
    is the `busy` class, and it is reported rather than retried.

2. **The gates.**

    In order: `enabled`, the session write cap, and the iteration counter, which counts the
    tool-call blocks since the last review against `intervalIterations`.

3. **The transcript and the digest.**

    The derived history becomes a bounded digest: a verbatim tail of `digestTail` messages, which
    grows until it does not start on a tool result, and one collapsed line per older turn.

4. **The plan call.**

    One request carrying the digest, the skill index, and `Prompt(1)`.

5. **The read.**

    The reply names the bodies it wants to see. The plugin unions the model's `views` with every
    patch and support target, so a target the model never asked for is still carried.

6. **The confirm call.**

    One more request carrying the exact current text of every body in that union. This is the
    read-before-write property: a patch can only target text the model was handed.

7. **The judge.**

    Sixteen deterministic rules run over every operation before anything is written.

8. **The fence.**

    Each accepted operation lands as a `create`, a `patch`, or a `support` write, behind an intent,
    and appends one audit row with the before and after blobs.

9. **The report and the line.**

    `run.json` and `REPORT.md` under the reports root, and exactly one byte-stable ledger line.

## The two-call protocol

Two requests maximum. There is no third call, no repair pass, and no iteration loop, so a reply that
fails the strict parse ends the run as `unparsable` rather than being retried.

Phase 1 returns `views` and `operations`. Phase 2 returns `operations` and no `views`, and it is
skipped entirely when the union is empty, which only happens when every operation is a `create`.

## The posture: autonomous writes behind a fence

`policy.write` ships `auto`, so a judged operation publishes instead of queueing for approval. That
is the one verdict that differs from the lesson-review sibling, and it is the Hermes parity
decision.

`enabled` ships `false`, which is the idle-forever posture of the family: the service stays
resolvable, the trigger keeps answering `disabled`, and a cold mount logs
`disabled (enabled=false)`.

## The fence

The reply schema has three operation kinds - `create`, `patch`, `support` - and no delete and no
archive at all. That is how "never delete a skill" becomes structural rather than advisory: a reply
cannot express a removal, so no rule has to remember to refuse one.

`create` writes with `createIfAbsent`, which refuses an existing path. `patch` edits with `editText`
behind the version `stat` just returned, which refuses a moved file before it matches a character.
`support` overwrites only with `replaceIfVersion`. Omitting the intent would be an unconditional
overwrite, which this plugin never performs.

## The caps

| Cap                   | Default | Counted on                  | Effect                                    |
| --------------------- | ------- | --------------------------- | ----------------------------------------- |
| `maxWritesPerSession` | `6`     | successes, per agent object | the run is `capped` before any model call |
| `maxOperationsPerRun` | `4`     | successes within one run    | the surplus operations are skipped        |
| `maxOperations`       | `8`     | parsed operations           | the parse fails `count`                   |

Both write caps count successes and never attempts, so a refused operation never spends the budget a
real write needs.

## The archive rule

The harness seam has no move and no delete, so an archive is a COPY plus a NEUTRALIZATION.

The bytes are copied into `~/.dsh/skills/.archive/<name>/` with `createIfAbsent`, and the live
`SKILL.md` gains `disable-model-invocation: true` in its frontmatter. The live package stays where
it is, the catalog stops offering it to the model, and `Restore` puts the frontmatter back.

An existing archive is never overwritten: the collision takes a `<name>-<YYYYMMDDHHMMSS>` suffix.

## The revert

Every mutation except a `Restore` appends at least one row to `~/.dsh/skill-learn/ledger.jsonl`
naming the content addresses of its before and after bytes.

`Revert(id)` pre-checks every blob before anything changes, takes a whole-tree snapshot, and only
then writes the files back. A missing blob aborts the whole revert, because restoring four of five
files would leave a package nobody asked for. An undone `create` is archived rather than removed,
because the plugin never deletes.

## The curator

`Curate` is the always-on, token-free half: it moves `active` to `stale` at `staleAfterDays` and
anything not yet archived to `archived` at `archiveAfterDays`, with the pinned exemption, a zero-use
grace floor, and at most one transition per skill per pass. Its jurisdiction is a record the plugin
created, or a pinned one; a record for a skill the plugin did not create is telemetry only.

`consolidate` ships `false`, so the model-gated survey pass is opt-in. The live Hermes config on
this machine sets it true; the shipped default is the safe one, and the difference is a choice you
make rather than a surprise.

## The config

| Key                    | Default                                      | Effect                                                                                                |
| ---------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `enabled`              | `false`                                      | the master switch; false is the shipped posture                                                       |
| `logFile`              | `~/.dsh/playform/plugin-dsh-skill-learn.log` | the family ledger path                                                                                |
| `domain`               | `"skillLearn"`                               | the declared storage domain; the JSON sidecar is the wired store                                      |
| `storagePath`          | `~/.dsh/skill-learn/usage.json`              | the usage store                                                                                       |
| `statePath`            | `~/.dsh/skill-learn/state.json`              | reserved and unread; the curator clock lives in the usage store                                       |
| `ledgerPath`           | `~/.dsh/skill-learn/ledger.jsonl`            | the audit ledger                                                                                      |
| `blobRoot`             | `~/.dsh/skill-learn/blobs`                   | the content-addressed before and after bytes                                                          |
| `snapshotRoot`         | `~/.dsh/skill-learn/snapshots`               | the snapshot manifests                                                                                |
| `reportsRoot`          | `~/.dsh/skill-learn/reports`                 | one directory per run                                                                                 |
| `snapshotKeep`         | `5`                                          | how many snapshots survive a rotation                                                                 |
| `skillsRoot`           | `~/.dsh/skills`                              | the only writable corpus root                                                                         |
| `archiveRoot`          | `~/.dsh/skills/.archive`                     | the worst outcome a pass may produce                                                                  |
| `agreementPath`        | `~/.dsh/AGENTS.md`                           | read-only; J11 refuses any write to it                                                                |
| `intervalIterations`   | `15`                                         | tool-call blocks since the last review before one is due                                              |
| `maxOperations`        | `8`                                          | the parsed operation bound                                                                            |
| `maxOperationsPerRun`  | `4`                                          | the applied bound for one run                                                                         |
| `maxWritesPerSession`  | `6`                                          | the session bound, keyed by the agent object                                                          |
| `digestTail`           | `24`                                         | messages kept verbatim                                                                                |
| `digestUserChars`      | `300`                                        | the user-line cap                                                                                     |
| `digestAssistantChars` | `200`                                        | the assistant-line cap                                                                                |
| `maxInputChars`        | `120000`                                     | declared and never enforced                                                                           |
| `maxTokens`            | `4000`                                       | the reply budget                                                                                      |
| `maxSkillChars`        | `100000`                                     | the resulting-file bound                                                                              |
| `staleAfterDays`       | `14`                                         | the stale cutoff, floored at 1                                                                        |
| `archiveAfterDays`     | `30`                                         | the archive cutoff, floored at 1                                                                      |
| `curateIntervalHours`  | `168`                                        | the minimum age of `lastRunAt` before a pass                                                          |
| `consolidate`          | `false`                                      | the opt-in second half of the curator                                                                 |
| `provider`             | `""`                                         | the route override; empty reads the agent's own provider                                              |
| `model`                | `""`                                         | the route override; empty reads the agent's own model                                                 |
| `policy`               | the shipped block below                      | the per-action allowlist: `read`, `index`, `record`, `suggest`, `write`, `commit`, `spawn`, `message` |

The shipped policy verdicts are `read: auto`, `index: auto`, `record: auto`, `suggest: auto`,
`write: auto`, `commit: approve`, `spawn: approve`, `message: auto`. The plugin never commits and
never spawns an agent, which is why those two stay `approve`.

## The stores

| Path                                         | What it is                                                      |
| -------------------------------------------- | --------------------------------------------------------------- |
| `~/.dsh/playform/plugin-dsh-skill-learn.log` | the family ledger, one line per event                           |
| `~/.dsh/skill-learn/usage.json`              | one record per skill, and the curator's whole input             |
| `~/.dsh/skill-learn/ledger.jsonl`            | the audit ledger, one row per mutation, the revert handle       |
| `~/.dsh/skill-learn/blobs/<sha256>`          | the content-addressed before and after bytes                    |
| `~/.dsh/skill-learn/snapshots/<id>.json`     | one manifest per whole-tree snapshot                            |
| `~/.dsh/skill-learn/state.json`              | reserved and unread; the curator clock lives in the usage store |
| `~/.dsh/skill-learn/reports/<stamp>/`        | `run.json` and `REPORT.md`                                      |
| `~/.dsh/skills/<name>/SKILL.md`              | the corpus                                                      |
| `~/.dsh/skills/.archive/<name>/`             | the archive; never discovered as a skill                        |
| `~/.dsh/AGENTS.md`                           | the working agreement; read-only, never written                 |

A corrupt usage store is moved to `<storagePath>.corrupt-<YYYYMMDDTHHMMSS>` and the next write
starts a fresh one. The quarantined bytes stay on disk for inspection; nothing is silently
overwritten.

## The wiring

1. **The bundle row.**

    Add `@playform/plugin-dsh-skill-learn` to the `dsh.profile.bundles` of the profile and to its
    `link:` dependencies.

2. **The patch row.**

    Add the patch row to `cordis.patch.yml` of the profile. The bundle ships its own row, so a
    profile that installs the package as a bundle needs no hand-written config.

3. **The restart.**

    Restart the host. A `file:` dependency alone is not activation.

4. **The ledgers.**

    Read `~/.dsh/playform/plugin-dsh-skill-learn.log` for the one line per event, and
    `~/.dsh/skill-learn/reports/<stamp>/REPORT.md` for the detail of one run.

## What is not implemented

The first eleven are non-goals of plan section 13; the last two are stated gaps:

- **No merge and no delete.** The consolidation pass has no `delete` row and no `absorbed_into`
  field. The worst outcome any pass produces is an archive, which is a copy plus a frontmatter flag.
- **No `prune_builtins`.** Bundled-root skills are out of jurisdiction entirely, so the flag has no
  subject.
- **No cron-reference protection.** The harness exposes no skill-reference store, so `Pin` is the
  protection.
- **No write to `~/.dsh/AGENTS.md`.** A proposed agreement change may appear in a `reason` and in
  the report; the file is never opened for writing.
- **No proposal queue.** There is no `Accept` method and no pending path. The posture is autonomous
  writes behind the fence.
- **No memory store.** The plugin owns no `USER.md` and no `MEMORY.md`.
- **No subagent and no tool loop.** Two hand-built requests, no tools, so the model cannot wander
  and every write is an operation the judge has already seen.
- **No ETS twin.** The family's parity rule is deferred for this delivery.
- **No other corpus root.** Only `skillsRoot` is writable; a skill from a project root,
  `~/.agents/skills`, or a bundled root is `foreign-root`.
- **No KV-primary storage.** `domain` is declared for the family's vocabulary and the JSON sidecar
  is the wired store.
- **No commit and no spawn.** `policy.commit` and `policy.spawn` stay `approve`.
- **The consolidation model call is unwired.** No leaf owns a consolidation prompt or a plan parser,
  so an enabled `consolidate` reports `model-failed` rather than inventing a text the plan does not
  specify.
- **`statePath` is reserved and unread.** The curator's clock is the usage store's one reserved
  top-level key, so a restart does not reset the interval and no second store owns one number.

## Contract

- [SCHEME.md](./SCHEME.md) covers the identity, the service surface, the pipeline, the judge rules
  with their strings, the parse failure ids, the ledger strings, the fence, the archive rule, and
  the seams that were measured rather than assumed.
- The plan is `Documentation/Plans/SKILL-LEARN-PLUGIN.md`.
- The corpus standard that this review writes to is `~/.dsh/skills/STANDARD.md`.
