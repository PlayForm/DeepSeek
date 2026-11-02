---
title: The Skill-Learn Plugin - the Hermes learning loop as one fenced package
category: Plans
kind: queued-plan
date: 2026-11-02
status: planned
registry: Documentation/Plans/SKILL-LEARN-PLUGIN.md
index: Documentation/INDEX.md
statuses:
    - name: the design of the skill-learn package (one service, one trigger, one bundle)
      state: open
      evidence: this document only - no package directory exists
    - name: the two-phase review protocol and the structural read-before-write
      state: open
      evidence: this document sections 4 and 5 - no code exists
    - name: the fenced write path (create, patch, support) with the ledger and the revert
      state: open
      evidence:
          this document section 6 - the fence is declared at dsh-fs lib types types.d.ts 111-116
    - name: the deterministic curator, the archive, and the restore
      state: open
      evidence: this document section 7 - the rules are ported from agent curator.py 209-261
    - name: the usage store and the use seam
      state: open
      evidence: this document section 8 - the seam is declared at dsh-tools lib types index.d.ts 70
    - name: the census (registry, summary, marketplace, index)
      state: open
      evidence:
          this document section 12 - the counts are read from Documentation Plugins PLUGIN-FAMILY.md
    - name: the ETS twin of the package
      state: deferred
      evidence: the twin is a non-goal of this delivery, section 13
    - name: the consolidation merge (absorbed_into)
      state: deferred
      evidence:
          the evidence model needs the agent loop, section 7.3 and the parent amendment of
          2026-11-02
    - name: prune_builtins
      state: rejected
      evidence: the flag has no reader in the two files the recon scoped, section 13
---

# SKILL-LEARN PLUGIN - the Hermes learning loop as one fenced package

## 0. The short answer

`@playform/plugin-dsh-skill-learn` is one bundle that carries both halves of the Hermes learning
loop as one service: the post-turn review that turns a finished session into skill edits, and the
curator that ages the corpus. The service registers its own trigger on the harness idle edge
(`agent/status` with `status === "idle"`, `dsh-agent/lib/types/runtime-types.d.ts:252-255`), reads
the transcript from `Agent.session.deriveMessages()` (`dsh-session/lib/types/index.d.ts:347`), reads
the catalog from `ctx.skills.list` and `ctx.skills.get` (`dsh-skill/lib/index.js:224`, `:250`), and
writes through `ctx.fs` behind an explicit `FsWriteIntent` (`dsh-fs/lib/types/types.d.ts:111-116`).
The review is two `ctx.llm.stream` calls with a strict JSON reply: a plan call carrying the digest
and the skill index, and a confirm call carrying the exact bodies the plan asked to see, so a patch
can only target text the model was handed.

The one sentence: it is the first package in this family whose review actually runs on a live
session - the existing `@playform/plugin-dsh-lesson-review` reads `Session.surface.messages`, which
does not exist, so its 35 recorded reviews all ended `unavailable` at the empty-snapshot gate
(`Classic/packages/plugin-dsh-lesson-review/Source/Function/Snapshot.ts:90`,
`Source/Library.ts:282`, ledger `/Users/nikola/.dsh/playform/hook-dsh-lesson-nudge.log:1-112`).

## 1. The identity

### 1.1 Three name candidates, in the family's `@`-sentence form

| Candidate                            | `@`-sentence                   | What it claims                                | Risk                                                                                         |
| ------------------------------------ | ------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `@playform/plugin-dsh-skill-learn`   | Plugin @ DSH @ Skill @ Learn   | the corpus as subject, learning as the action | none; reads as one idea                                                                      |
| `@playform/plugin-dsh-skill-capture` | Plugin @ DSH @ Skill @ Capture | the write half only                           | the curator is not capture, so the name under-claims                                         |
| `@playform/plugin-dsh-corpus-learn`  | Plugin @ DSH @ Corpus @ Learn  | the whole corpus as subject                   | "corpus" is the plugin's internal word, not the user's; the harness calls it a skill catalog |

**Recommendation: `@playform/plugin-dsh-skill-learn`.** It names the subject the user names
(`~/.dsh/skills`, the `skill` tool) and the action, and it does not collide with `lesson-review`,
which stays untouched. "Learn" is the verb the Hermes block already uses for a foreground create
(`created_by: "learn"`, `tools/skill_usage.py:531-532`), so the word carries the right provenance.

### 1.2 The identity places

The four identity places must agree, and a fifth (the loader entry id) must agree with the package's
short name.

| Place                          | Value                                           | Where it lives                                                                                                                                   |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Package name                   | `@playform/plugin-dsh-skill-learn`              | `package.json` `name`                                                                                                                            |
| Name compiled into the build   | the same string, via `process.env.NAME_PACKAGE` | `Configuration/ESBuild.ts` `define` block, the pattern at `Classic/packages/plugin-dsh-lesson-review/Configuration/ESBuild.ts:45-48`             |
| Service name and ledger prefix | `skillLearn`                                    | `super(Context, "skillLearn")` and the `skillLearn: <message> (logFile <path>)` line builder, the pattern at `Source/Library.ts:109-110`, `:137` |
| Log file default               | `~/.dsh/playform/plugin-dsh-skill-learn.log`    | `Variable/Configuration.ts`, the family convention `~/.dsh/playform/<identity>.log` (`DESIGN-BRIEF.md:41`)                                       |
| Loader entry id                | `plugin-dsh-skill-learn`                        | `cordis.patch.yml` `insert:` row `id`, the pattern at `Classic/packages/plugin-dsh-lesson-review/cordis.patch.yml:26`                            |

The class is `SkillLearnService`; Cordis reports the class name in diagnostics, and the four
agreeing places above are the ones the ledger and the loader read.

### 1.3 Every path the plugin owns

| Path           | What it is                                                   | Default                                         |
| -------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| Log file       | the family ledger, one line per event, through `ctx.logger`  | `~/.dsh/playform/plugin-dsh-skill-learn.log`    |
| Audit ledger   | append-only JSONL, one row per mutation, the revert handle   | `~/.dsh/skill-learn/ledger.jsonl`               |
| Blob store     | content-addressed before and after bytes                     | `~/.dsh/skill-learn/blobs/<sha256>`             |
| Snapshot store | one JSON manifest per whole-tree snapshot                    | `~/.dsh/skill-learn/snapshots/<id>.json`        |
| Usage store    | one JSON object keyed by skill name, plus the curator clock  | `~/.dsh/skill-learn/usage.json`                 |
| Curator clock  | `curatedAt` and `seededAt`, persisted INSIDE the usage store | the same file, top level                        |
| Report root    | one directory per run                                        | `~/.dsh/skill-learn/reports/<YYYYMMDD-HHMMSS>/` |
| Report files   | `run.json` and `REPORT.md`                                   | under the report root                           |
| Corpus root    | the skills the plugin may read and write                     | `~/.dsh/skills`                                 |
| Archive root   | the worst outcome any pass may produce                       | `~/.dsh/skills/.archive`                        |
| Agreement      | read-only, never written                                     | `~/.dsh/AGENTS.md`                              |
| Standard       | named by the prompt, never copied                            | `~/.dsh/skills/STANDARD.md`                     |

The archive root sits inside the corpus root but is never discovered as a skill: the filesystem
provider discovers `<root>/<name>/SKILL.md` or `<root>/<name>.md` at one directory level only, so
`~/.dsh/skills/.archive/<name>/SKILL.md` is invisible to the catalog
(`dsh-skill-filesystem/lib/index.js:589-595`).

## 2. The public surface

`ctx.skillLearn`, 13 methods. Every method that can touch the disk returns a value rather than
throwing; the two exceptions are `Configure` (pure assignment) and `Prompt`/`Digest` (pure
functions).

| #   | Method        | Arguments                       | Returns                                                                               | Failure it reports                                                                  |
| --- | ------------- | ------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | `Configure`   | `Partial<Configuration>`        | `void`                                                                                | none; a bad config already failed loud at load (`plugin-development`, Config)       |
| 2   | `Trigger`     | `agent: Agent`                  | `Promise<Trigger>` = `{outcome, due, count, writes}`                                  | never throws; `outcome` is one of the 12 classes in section 3.2                     |
| 3   | `Review`      | `{agent, signal, reason?}`      | `Promise<Review>` = `{outcome, applied, refused, report, detail}`                     | never throws; every degradation is an `outcome` plus a `detail`                     |
| 4   | `Curate`      | `now?: Date`                    | `Promise<Curation>` = `{checked, seeded, markedStale, archived, reactivated, dryRun}` | never throws; an unreadable store is quarantined and reported as `detail`           |
| 5   | `Consolidate` | `{signal?, dryRun?}`            | `Promise<Consolidation>` = `{outcome, proposed, applied, refused, snapshot, report}`  | `outcome: "unavailable"` when `consolidate` is false                                |
| 6   | `Record`      | `name: string, agent?: Agent`   | `Promise<void>`                                                                       | a store failure writes one ledger line and returns                                  |
| 7   | `Revert`      | `identifier: string`            | `Promise<Revert>` = `{ok, outcome, restored, retained, detail}`                       | `ok:false` with `outcome` in `missing`, `blob-missing`, `stale`, `staging-retained` |
| 8   | `Status`      | none                            | `Status` = `{total, active, stale, archived, pinned, tracked, lastRunAt}`             | always answers; the store is quarantined before the read when it is corrupt         |
| 9   | `Pin`         | `name: string, pinned: boolean` | `Promise<Lifecycle>` = `{ok, outcome, detail}`                                        | `ok:false` with `outcome` in `foreign-root`, `not-tracked`                          |
| 10  | `Restore`     | `name: string`                  | `Promise<Lifecycle>`                                                                  | `ok:false` with `outcome` in `not-archived`, `destination-exists`, `foreign-root`   |
| 11  | `Digest`      | `messages: readonly Message[]`  | `Digest` = `{text, kept, collapsed}`                                                  | none; pure                                                                          |
| 12  | `Prompt`      | `phase: 1 \| 2`                 | `string`                                                                              | none; pure, byte-stable                                                             |
| 13  | `Save`        | none                            | `Promise<void>`                                                                       | swallows and ledgers; the smoke seam                                                |

`Trigger` is the trigger method; `Review` is the review; `Curate` and `Consolidate` are the curator;
`Record` is the usage record; `Revert` is the undo; `Status` is the status. `Pin`, `Restore`,
`Digest`, `Prompt`, `Save`, and `Configure` are the supporting surface the trigger and the smokes
need.

The service is the only export the loader reads:
`export default class SkillLearnService extends Service` with `static inject: string[] = []` and
`static Config = Definition`, the class form the family uses
(`Classic/packages/plugin-dsh-lesson-review/Source/Library.ts:112-116`).

## 3. The pipeline

### 3.1 The sequence from the idle edge to the ledger line

| #   | Step                                                                                    | Seam and coordinate                                                                                                                                                             |
| --- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `agent/status` fires with `{agent, status}`                                             | `emit` mode, `dsh-agent/lib/types/runtime-types.d.ts:252-255`, emitted at `dsh-agent-loop/lib/index.js:798`                                                                     |
| 2   | Keep only `status === "idle"`, the edge                                                 | `dsh-agent/lib/types/runtime-types.d.ts:90` for the status union                                                                                                                |
| 3   | Return immediately, and run `Trigger` detached                                          | an `emit` listener is a synchronous recorder; the promise is `void`-ed with a `catch`, the pattern at `Classic/packages/hook-dsh-lesson-nudge/Source/Function/Apply.ts:190-192` |
| 4   | Gate: `enabled`                                                                         | `outcome: disabled`, one ledger line                                                                                                                                            |
| 5   | Gate: session write cap on SUCCESSES                                                    | `outcome: capped`                                                                                                                                                               |
| 6   | Gate: the iteration counter                                                             | `Tick`: `outcome: below-threshold`                                                                                                                                              |
| 7   | Claim the idle phase with `agent.runMaintenance`                                        | `dsh-agent/lib/types/runtime-types.d.ts:165-174`; a synchronous throw means a turn or another maintenance owns the agent, `outcome: busy`                                       |
| 8   | Read the transcript                                                                     | `Agent.session.deriveMessages()`, `dsh-session/lib/types/index.d.ts:347`; empty is `outcome: empty-transcript`                                                                  |
| 9   | Build the digest                                                                        | `Function/Digest`, section 4.4                                                                                                                                                  |
| 10  | Probe `ctx.llm`                                                                         | `ctx.llm.stream`, `dsh-llm/lib/types/index.d.ts:433`; absent is `outcome: no-llm`                                                                                               |
| 11  | Resolve the route                                                                       | `Agent.options` (`dsh-agent/lib/types/runtime-types.d.ts:141`) with the config override; absent is `outcome: no-route`                                                          |
| 12  | Build the catalog index                                                                 | `ctx.skills.list({cwd, scope, signal})`, `dsh-skill/lib/index.js:224`                                                                                                           |
| 13  | Phase 1 request, one `ctx.llm.stream`                                                   | `dsh-llm/lib/types/index.d.ts:433`; a throw is `outcome: model-failed`                                                                                                          |
| 14  | Strict parse of the plan reply                                                          | `Function/Parse`, section 4.3; a failure is `outcome: unparsable`                                                                                                               |
| 15  | Compute the view set: the model's `views` unioned with every patch and support target   | the plugin, not the model, decides what must be read                                                                                                                            |
| 16  | Load each view: `ctx.skills.get` for a `SKILL.md`, `ctx.fs.readText` for a support file | `dsh-skill/lib/index.js:250`, `dsh-fs/lib/types/index.d.ts:162`                                                                                                                 |
| 17  | Phase 2 request carrying those bodies, when the view set is non-empty                   | `dsh-llm/lib/types/index.d.ts:433`                                                                                                                                              |
| 18  | Strict parse of the confirm reply                                                       | `Function/Parse`; a failure is `unparsable`                                                                                                                                     |
| 19  | Judge every operation, J1 to J16                                                        | `Function/Judge`, section 4.5                                                                                                                                                   |
| 20  | Apply each accepted operation through the fence, re-checking the cap before each        | `Function/Write`, section 6                                                                                                                                                     |
| 21  | One audit-ledger row per write, with the before and after blobs                         | `Function/Ledger`, section 6.5                                                                                                                                                  |
| 22  | Write `run.json` and `REPORT.md`                                                        | `Function/Report`                                                                                                                                                               |
| 23  | One ledger line naming the outcome, the counts, and the report path                     | the byte-stable strings in section 6.7                                                                                                                                          |

The curator rides the same edge: step 2 leads to `Curate` when the interval since the persisted
`curatedAt` is at least `curateIntervalHours`, and `Consolidate` runs inside `Curate` when
`consolidate` is true. The first pass seeds the clock and transitions nothing, the Hermes first-run
rule (`agent/curator.py:160-176`). The clock lives in the usage store, so a restart does not reset
it; a clock in memory would make a frequently restarted machine never curate at all, because every
pass would be the seeding pass.

### 3.2 The outcome classes

Twelve, each with one ledger string. A run ends in exactly one.

| Outcome            | When                                                          | Counts as a write |
| ------------------ | ------------------------------------------------------------- | ----------------- |
| `disabled`         | `enabled` is false                                            | no                |
| `below-threshold`  | the counter has not reached `intervalIterations`              | no                |
| `capped`           | the session has spent `maxWritesPerSession` successes         | no                |
| `busy`             | `runMaintenance` threw; a turn or another task owns the agent | no                |
| `no-llm`           | `ctx.llm` or `ctx.llm.stream` is absent                       | no                |
| `no-route`         | no provider or model resolves                                 | no                |
| `empty-transcript` | `deriveMessages()` returned nothing                           | no                |
| `model-failed`     | the stream threw                                              | no                |
| `unparsable`       | the reply failed the strict parse                             | no                |
| `nothing`          | the reply parsed and asked for no operation                   | no                |
| `refused`          | every parsed operation was refused by the judge or the fence  | no                |
| `applied`          | at least one write succeeded                                  | yes               |

`refused` and `nothing` are distinct because the ledger must tell a silent model from a model the
judge stopped, which is the distinction the existing hook's ledger cannot make.

## 4. The review protocol

### 4.1 Phase 1, the plan call

One `ctx.llm.stream` request, no tools, no loop:

| Field               | Value                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `system`            | `Prompt(1)`, the byte-stable text of section 5                                                                                    |
| `messages`          | one user message: the digest text, then the skill index, then the phase marker                                                    |
| `provider`, `model` | the resolved route                                                                                                                |
| `maxTokens`         | `maxTokens`, default 4000                                                                                                         |
| `signal`            | the maintenance signal                                                                                                            |
| `purpose`           | unset; the union is closed to `'compaction'` and `'session-title'` (`dsh-llm/lib/types/types.d.ts:547`), and a review has no slot |

The index is one line per skill: `name` and `description`, filtered by the model-invocability rule
the plugin applies itself because it bypasses the `skill` tool (`dsh-skill/lib/index.js:37-47`,
`DESIGN-BRIEF.md:52-54`). The reply is read from `text-delta` frames only
(`dsh-llm/lib/types/types.d.ts:439-442`), the pattern at
`Classic/packages/plugin-dsh-lesson-review/Source/Library.ts:302-311`.

### 4.2 Phase 2, the confirm call

One more request, the same shape, whose user message carries the digest, the index, and then one
fenced body per view: the exact current `SKILL.md` text from `ctx.skills.get(...).content`, or the
exact support-file text from `ctx.fs.readText`. The reply is the final operation list.

Two calls maximum. There is no third call, no repair pass, and no iteration loop; a failed parse is
`unparsable` and the run ends. The one-shot limit is what the Hermes translation cannot keep (its
fork has 16 iterations, `agent/background_review.py:173`), so breadth moves into the request and the
run stops where it stops.

The view set is computed by the plugin as `views` union
`{op.skill for op in operations where kind is patch or support}`. When the union is empty the
confirm call is skipped and phase 1's operations are judged as they stand, which is only reachable
when every operation is a create.

### 4.3 The exact reply schemas

Phase 1:

```json
{
	"views": ["<skill-name>"],
	"operations": [
		{
			"kind": "patch",
			"skill": "<skill-name>",
			"oldString": "<exact text from a body>",
			"newString": "<replacement>",
			"reason": "<one sentence>"
		},
		{
			"kind": "create",
			"skill": "<skill-name>",
			"content": "<the whole SKILL.md>",
			"reason": "<one sentence>"
		},
		{
			"kind": "support",
			"skill": "<skill-name>",
			"filePath": "references/<topic>.md",
			"newString": "<the whole file>",
			"reason": "<one sentence>"
		}
	]
}
```

Phase 2: the same `operations` array, and no `views` key.

The parse rules, with one failure id each:

| Id            | Rule                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| `empty`       | the reply is blank after trimming                                                                        |
| `fence`       | text precedes or follows a fenced block, or the fence is not ` ```json `                                 |
| `json`        | `JSON.parse` threw                                                                                       |
| `shape`       | the value is not a plain object, or `operations` is not an array                                         |
| `unknown-key` | a top-level key other than `views` and `operations` (phase 1) or `operations` (phase 2)                  |
| `field`       | a required field is missing, is not a string, or is blank                                                |
| `kind`        | `kind` is not exactly `patch`, `create`, or `support`                                                    |
| `count`       | more than `maxOperations` operations                                                                     |
| `name`        | a `skill` or a `views` entry does not match `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` (`dsh-skill/lib/index.js:17`) |

A bare object and one ` ```json ` fence are both accepted; everything else is `fence`. The parser
never repairs, never retries, and never coerces a number into a string.

### 4.4 The digest

The digest is a pure function of the derived messages, ported from `_digest_history`
(`agent/background_review.py:332-362`) with these rules:

| Rule                    | Value                                                                                                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tail size               | `digestTail` messages kept verbatim, default 24                                                                                                                                                                                                                                                  |
| Tail boundary           | the tail grows by one until its first message is not a `role: "tool"` message, so the kept run never starts on a tool result (`agent/background_review.py:337-341`)                                                                                                                              |
| No-op case              | when the transcript already fits in the tail it is returned unchanged (`agent/background_review.py:342-343`)                                                                                                                                                                                     |
| Collapse                | every older message becomes ONE summary section behind one header, prepended to the tail (`agent/background_review.py:357-362`)                                                                                                                                                                  |
| User lines              | `USER: ` plus the text with newlines flattened, capped at `digestUserChars`, default 300                                                                                                                                                                                                         |
| Assistant tool lines    | `ASSISTANT[tools: a, b]` from the `tool-call` block names, `?` when a name is absent (`agent/background_review.py:351-354`)                                                                                                                                                                      |
| Assistant text lines    | `ASSISTANT: ` plus the text, capped at `digestAssistantChars`, default 200                                                                                                                                                                                                                       |
| Other roles             | `<ROLE>: ` plus the text, capped like a user line. Hermes drops `system` and `tool` from the prefix because its digest is a fallback for cache parity; here the digest is the ONLY transcript the reviewer sees, so a capped line of a tool result is evidence the reviewer would otherwise lose |
| Dropped from the prefix | empty text only                                                                                                                                                                                                                                                                                  |
| Header                  | one bracketed line naming the digest and why it exists                                                                                                                                                                                                                                           |
| Total cap               | none beyond the tail bound and the two per-line caps                                                                                                                                                                                                                                             |

The projection from `Message` to text reads the content blocks of
`dsh-llm/lib/types/types.d.ts:85-126`: `text` contributes its text, `tool-call` contributes its
name, everything else contributes nothing. The digest is a string, and `Digest` returns the string
plus the kept and collapsed counts so the report can prove the shape.

### 4.5 The judge rules

Sixteen, one id each, deterministic, evaluated over the operation plus the corpus snapshot. The
first refusal wins and its string is the ledger and report detail.

| Id                    | Refuses when                                                                                           | Refusal string                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `operation-known`     | `kind` is not `patch`, `create`, or `support`                                                          | `operation kind '<kind>' is not one of patch, create, support`           |
| `name-grammar`        | `skill` fails the corpus grammar or exceeds 64 characters                                              | `skill name '<name>' does not match the corpus grammar`                  |
| `target-absent`       | a `create` names a skill the catalog resolves                                                          | `skill '<name>' already exists; create refuses an existing path`         |
| `target-present`      | a `patch` or `support` names a skill the catalog does not resolve                                      | `skill '<name>' is not in the catalog; patch needs an existing skill`    |
| `body-carried`        | the target body was not in the confirm prompt, or is not the body fetched at write time                | `skill '<name>' was not loaded in the confirm prompt; read before write` |
| `anchor-unique`       | `oldString` occurs zero times or more than once in that body                                           | `oldString occurs <n> times in '<name>'; the anchor must be unique`      |
| `anchor-changed`      | `oldString` or `newString` is blank, or they are equal                                                 | `oldString and newString are identical or blank`                         |
| `frontmatter-valid`   | the result would not parse as a skill file: no `---` fence, no `name`, no body                         | `the result would not parse as a skill file: <reason>`                   |
| `description-present` | the result's frontmatter `description` is empty                                                        | `the frontmatter description is empty`                                   |
| `support-path`        | `filePath` is not under `references/`, `templates/`, or `scripts/`, or has fewer than two parts        | `support path '<path>' is not a support file`                            |
| `never-agreement`     | the target path is `agreementPath`                                                                     | `the target is the working agreement; it is never written`               |
| `never-archive`       | the target path is inside `archiveRoot`                                                                | `the target is inside the archive; it is never written`                  |
| `narrative-free`      | the new text carries a date, a PR or issue number, or a quoted user sentence longer than 40 characters | `the text carries a date, a reference number, or quoted user text`       |
| `negative-claim`      | the new text asserts a tool or feature does not work and names no fix                                  | `the text asserts a tool is broken without the fix that makes it work`   |
| `duplicate-rule`      | a non-blank line of `newString` already occurs verbatim in the target body                             | `the text repeats a line already present in '<name>'`                    |
| `size-bound`          | the result exceeds `maxSkillChars`                                                                     | `the result is <n> characters; the bound is <m>`                         |

`frontmatter-valid` is the harness's own contract, not a new one: a `---` fence, a non-empty `name`
matching `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, a non-empty `description`, and a non-empty body, with the
legacy camelCase keys rejected because the loader throws on them
(`dsh-skill-filesystem/lib/index.js:667-708`, `dsh-skill/lib/index.js:17`, `DESIGN-BRIEF.md:56-62`).
The judge re-implements only the check, never the parse: the corpus is always read through
`ctx.skills.get` (`DESIGN-BRIEF.md:48-50`).

### 4.6 Read-before-write as a structural property

The Hermes guard is a ContextVar read-mark consulted by the write tool inside one review turn
(`tools/skill_manager_guards.py:55-73`, `:211-221`), and the recon records that it does not survive
a one-shot translation (`Hermes-Review-Prompt.md:697`). The replacement here is not a promise but an
identity:

1. The model cannot name a patch target the plugin does not load, because the plugin unions the
   target into the view set (section 4.2, step 15).
2. The model cannot invent an anchor, because the judge requires `oldString` to occur exactly once
   in the body that was carried (`body-carried`, `anchor-unique`).
3. The model cannot patch a body that moved, because the plugin re-fetches the body immediately
   before the write and compares it byte for byte to the carried body; a difference is
   `body-carried` with `detail: body-drifted`, and the write is not attempted.
4. The harness enforces the last inch: `editText` with a version guard fails `FS_STALE_VERSION`
   before matching and `FS_AMBIGUOUS_EDIT` when the anchor is not unique
   (`dsh-fs/lib/types/index.d.ts:222-237`, codes at `dsh-fs/lib/types/types.d.ts:162`).

So the read is structural in the sense that matters: a patch that was not preceded by a carried body
cannot pass the judge, and a patch whose body changed cannot pass the fence.

## 5. The prompt

The shipped text, byte-stable, ASCII. It is adapted from the five Hermes blocks
(`_MEMORY_ROUTING_BLOCK` `agent/background_review.py:370-389`, `_LESSON_LAYER_BLOCK` `:401-428`,
`_DO_NOT_CAPTURE_BLOCK` `:431-454`, `_SKILL_REVIEW_PROMPT` `:456-525`, `_COMBINED_REVIEW_PROMPT`
`:527-577`) with three changes: the memory-routing block is dropped because this plugin owns no
memory store and never writes `~/.dsh/AGENTS.md` (`DESIGN-BRIEF.md:90-91`); the tool-iteration and
whitelist instructions are dropped because there is no tool loop
(`Hermes-Review-Prompt.md:696-700`); and the four questions, the section order, and the naming law
are named through the corpus standard rather than restated
(`/Users/nikola/.dsh/skills/STANDARD.md:12-21`, `:47-82`). The source's em dashes become ASCII
hyphens, per the standard's ASCII rule (`STANDARD.md:134-136`).

`Prompt(1)` and `Prompt(2)` are identical up to the closing schema section: phase 1 describes both
requests and asks for `views` plus a plan, phase 2 describes only the confirm request and asks for
the final list.

```text
You are the background skill learner of a DeepSeek Harness session. The session you are reading has already ended. Your job is to leave the skill corpus of this profile a little better than you found it, and then to stop.

Be active. Most sessions produce at least one skill update, even a small one. A pass that writes nothing is a missed learning opportunity, not a neutral outcome. "Nothing to save." is a real answer, but it is not the default.

The corpus standard is ~/.dsh/skills/STANDARD.md, and it owns the shape of a skill: the four questions in order (should I use this skill at all, what do I do and in what order, what must I never do, how do I know I am done), the SKILL.md as the operating manual with references/ as depth, the single owner per rule, and the section order. This prompt carries only the content rules that the standard does not spell out for a learner. Do not restate the standard inside a skill; point to it.

What a skill is: the instructions for doing a class of task the most efficient and correct way, for this user - the procedure, the tools and commands that work, the order, the preferences for how the result should look, and the pitfalls that cost time. A future session should be able to follow it and produce what the user wants on the first try.

Target shape: CLASS-LEVEL skills, each with a SKILL.md of always-on rules and a small references/ set of topical depth. Not a flat list of narrow one-session skills, and not an umbrella that hoards one references/ file per session. This shapes how you write, not whether you write.

How to write:
- Procedure first: the steps in the order they are done, with the concrete commands, tool calls, and decision points. A lesson or a pitfall attaches to the step it affects.
- A pitfall is a generalizable rule plus one clause of WHY, imperative. "Run the type check before the build, because the build reports type errors as warnings and exits zero." Not a narrative of what happened in this session.
- No dates, no pull-request or issue numbers, no ticket ids, and no quoted user text as content. The rule must stand without the incident behind it.
- The same lesson learned twice is ONE rule. Search the skill you are about to change for the rule already stated, and strengthen or clarify it instead of appending a second copy.
- Fix the sentence that misled. When a skill is wrong, edit that sentence; do not append "UPDATE: actually ..." underneath it.
- Always-on rules live in SKILL.md, whole. references/ is for depth that is needed only sometimes: a decision table, a recipe, a domain note, named by topic. Prefer extending an existing references/ file over creating one.
- Do not restate what the environment already teaches: a repository AGENTS.md, a tool's schema description, or another always-loaded document. A skill carries the workflow and the pitfalls.

The naming law: a new skill's name is class level, kebab-case, lowercase letters, digits and single hyphens, at most 64 characters, and it names the class of task. It is never a pull-request number, an error string, a codename, a library name alone, or a session artifact such as fix-x, debug-y, or audit-z-today. If the name only makes sense for today's task, the skill does not belong in the corpus.

Preference order - take the earliest action that fits, and take one when a signal below fired:
1. Patch a skill that was loaded in this session. It was in play, so it is the right place to extend it.
2. Patch an existing class-level skill that covers the territory.
3. Add a support file under an existing skill: references/<topic>.md for topical depth, templates/<name>.<ext> for a starter file, scripts/<name>.<ext> for a re-runnable action. A new support file needs a one-line pointer in the skill's SKILL.md.
4. Create a new class-level skill, only when no existing skill covers the class.

Signals that warrant an update, any one of them enough:
- The user corrected your style, tone, format, legibility, verbosity, or approach. Frustration is a first-class signal: "stop doing x", "do not format like this", "you always do y". Embed the correction in the skill that governs that task, so the next session starts already knowing.
- A non-trivial technique, fix, workaround, or debugging path emerged that a future session would want.
- A skill that was loaded or consulted turned out wrong, missing a step, or outdated. Patch it now.

Do NOT capture:
- Environment-dependent failures: a missing binary, a fresh-install error, a path mismatch after a migration, "command not found", an unconfigured credential, an uninstalled package. The user can fix these; they are not durable rules.
- Negative claims about tools or features: "the browser tools do not work", "tool x is broken", "cannot use y from z". These harden into refusals the agent cites against itself long after the problem was fixed.
- Transient errors that resolved before the session ended. If retrying worked, the lesson is the retry pattern, not the original failure.
- One-off task narratives. "Summarize today's report" is not a class of work.
- Unresolved failures: when the session never found a working method, do not write the attempts up as a reliable workflow or a recommended approach. Either return no operations, or, only when you are independently confident of a real working alternative, capture that alternative alone - never the dead ends, and never dressed up as best practice.
- A failed tool call whose cause was setup state: capture the FIX (the install command, the config step, the environment variable) under an existing setup or troubleshooting skill, never "this tool does not work" as a standing constraint.

Hard limits:
- Never delete a skill. The most destructive thing available to you is an archive, and it is not yours to perform: this reply has no delete operation and no archive operation.
- Never write ~/.dsh/AGENTS.md. That file is the user's working agreement. You may report a proposed agreement change in your reply; nothing applies it.
- Never write a file outside the skill you name, and never name a path inside .archive/.
- Patch only text you can see in this prompt. An old string you return must occur exactly once in the body you were shown; a body you were not shown cannot be patched, and the caller will refuse the operation.

Reply with one JSON object and nothing else: no prose before it, no prose after it. One fenced json block around the object is accepted; anything else is rejected unread.

The first request asks for a plan:
{
  "views": ["<skill-name>"],
  "operations": [
    {"kind": "patch", "skill": "<name>", "oldString": "<exact text from a body>", "newString": "<replacement>", "reason": "<one sentence>"},
    {"kind": "create", "skill": "<name>", "content": "<the whole SKILL.md, frontmatter included>", "reason": "<one sentence>"},
    {"kind": "support", "skill": "<name>", "filePath": "references/<topic>.md", "newString": "<the whole file>", "reason": "<one sentence>"}
  ]
}

"views" names the skills whose current body you need before you can write them. The caller loads them and sends a second request that carries those bodies; only that second request may return the final list. Return an empty views array when you already have everything you need.

The second request asks for the final list, and it carries the bodies you asked for:
{
  "operations": [ ... the same three shapes ... ]
}

Rules for both replies:
- operations is an array of at most eight objects. An empty array means nothing to save.
- kind is exactly one of patch, create, support. No other kind exists, and there is no delete.
- skill is a kebab-case name. For patch and support it must already exist; for create it must not.
- oldString is copied from a body in this prompt, character for character, and occurs exactly once in it.
- content is the whole SKILL.md: the --- fence, name, description, and the body, in the standard's section order.
- filePath starts with references/, templates/, or scripts/ and names a file.
- reason is one sentence naming the lesson, not the incident.
```

The text carries no placeholder and no computed value, so the smoke can assert it byte for byte: the
operation bound is stated as "eight" and the parser enforces the configured `maxOperations`, which
defaults to 8 and may only be lowered, making the parser stricter than the text rather than the text
wrong.

## 6. The write path

### 6.0 The filesystem seam, measured

The declarations and the shipped runtime were read before this section was written
(`Temporary/Research/DSH-Write-Path.md`), and six facts decide its shape.

| Fact                                                                                                                                                       | Consequence                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `ctx.fs` has fifteen methods and NO delete, move, rename, mkdir, or copy (`dsh-fs/lib/types/index.d.ts:61-240`)                                            | a skill can be written and patched, never moved or removed through the seam |
| `writeText` creates the parent directory recursively (`dsh-fs-local/lib/index.js:514-515`)                                                                 | a new `<skillsRoot>/<name>/SKILL.md` needs no separate directory call       |
| the guarded-write version is `stat(target).version` (`FsInfo.version`, `dsh-fs/lib/types/types.d.ts:67-74`), and `readText` returns no version             | a patch always stats immediately before it writes                           |
| `resolve` is a resolution default and NOT a containment boundary (`dsh-fs-local/lib/index.js:719-723`)                                                     | the plugin's own `contains` check is the fence, never the resolver          |
| a write into `~/.dsh/skills` under a `workspace-write` sandbox fails `FS_SANDBOX_DENIED` (`dsh-fs-sandbox/lib/index.js:157`, `:164`)                       | the outcome class is `sandbox-denied`, reported once, never retried         |
| the catalog is stale after a write until `ctx.skills.invalidateCache()` runs (`dsh-skill/lib/index.js:376-380`), and the provider's watcher is best-effort | the plugin invalidates explicitly after every mutation                      |

Two consequences follow, and they are the only places this plan departs from a literal port.

**The plugin's own bookkeeping uses `node:fs/promises`.** The ledger, the blobs, the snapshots, and
the usage store are the plugin's private files; they need an append and a prune that the harness
does not offer, and the family's own sibling already writes its corpus that way
(`Classic/packages/plugin-dsh-lesson-review/Source/Function/Apply.ts:19`, `:44-47`). The use is
bounded to `<stateRoot>` and `<blobRoot>`, it never touches a skill path, and every skill mutation
still goes through `ctx.fs` with an intent.

**Archive is neutralize-and-copy, not move.** Section 7.3 states it.

### 6.1 The three operations

| Kind                 | Target                              | Harness call                        | Intent                                |
| -------------------- | ----------------------------------- | ----------------------------------- | ------------------------------------- |
| `create`             | `<skillsRoot>/<name>/SKILL.md`      | `ctx.fs.resolve` then `writeText`   | `{kind: "createIfAbsent"}`            |
| `patch`              | the existing `SKILL.md` of `<name>` | `resolve`, `stat`, then `editText`  | `{version}` from `stat`               |
| `support` (new)      | `<resourceBase>/<filePath>`         | `resolve` then `writeText`          | `{kind: "createIfAbsent"}`            |
| `support` (existing) | `<resourceBase>/<filePath>`         | `resolve`, `stat`, then `writeText` | `{kind: "replaceIfVersion", version}` |

`createIfAbsent` rejects an existing target with `FS_NOT_OBSERVED`; `replaceIfVersion` rejects
absence or a version mismatch with `FS_STALE_VERSION` (`dsh-fs/lib/types/types.d.ts:106-116`, codes
at `:162`). Omitting the intent would be an unconditional overwrite, which this plugin never does
(`types.d.ts:108-110`).

`patch` uses `editText`, not a hand-rolled replacement, because that call already performs the
literal match, requires exactly one match unless `replaceAll` is true, checks the version before
matching, and returns `before` and `after` (`dsh-fs/lib/types/index.d.ts:222-237`,
`types.d.ts:135-156`). `replaceAll` is always `false`, which is the harness's own enforcement of
`anchor-unique`.

### 6.2 The guard precedence

Every guard runs only when every earlier one passed, and the first refusal is the only error the
model and the ledger see.

| #   | Guard                                                                                                          | Failure                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `enabled`                                                                                                      | `disabled`                                                                      |
| 2   | the session write cap, counted on successes                                                                    | `capped`                                                                        |
| 3   | the per-run cap `maxOperationsPerRun`                                                                          | the remaining operations are `refused` with `detail: run cap`                   |
| 4   | J1 `operation-known`                                                                                           | judge refusal                                                                   |
| 5   | J2 `name-grammar`                                                                                              | judge refusal                                                                   |
| 6   | J3 `target-absent` or J4 `target-present`                                                                      | judge refusal                                                                   |
| 7   | J11 `never-agreement`, J12 `never-archive`                                                                     | judge refusal                                                                   |
| 8   | J10 `support-path`                                                                                             | judge refusal                                                                   |
| 9   | J5 `body-carried`, J6 `anchor-unique`, J7 `anchor-changed`                                                     | judge refusal                                                                   |
| 10  | J13 `narrative-free`, J14 `negative-claim`, J15 `duplicate-rule`                                               | judge refusal                                                                   |
| 11  | J8 `frontmatter-valid`, J9 `description-present`                                                               | judge refusal                                                                   |
| 12  | J16 `size-bound`                                                                                               | judge refusal                                                                   |
| 13  | the root fence: the resolved target must be contained by `skillsRoot` and not by `archiveRoot`, via `contains` | `foreign-root`                                                                  |
| 14  | the body re-fetch and byte comparison                                                                          | `body-carried`, `detail: body-drifted`                                          |
| 15  | `stat` and the intent                                                                                          | `FS_NOT_OBSERVED`, `FS_STALE_VERSION`, `FS_EDIT_NOT_FOUND`, `FS_AMBIGUOUS_EDIT` |

The root fence uses `contains(parent, child)`, which tests canonical containment without parsing
target keys (`dsh-fs/lib/types/index.d.ts:124-131`). A skill whose catalog entry resolves outside
`skillsRoot` - a project root at rank 100, `~/.agents/skills` at rank 500, or a bundled root at rank
600 (`dsh-skill-filesystem/lib/index.js:151-186`) - is `foreign-root` and is never written or
archived. v1 writes only the user corpus.

### 6.3 The fence

There is no delete operation and no archive operation in the reply schema, which is how the Hermes
rule "never delete a skill here" (`agent/background_review.py:519-520`) becomes structural rather
than advisory (`Hermes-Review-Prompt.md:689`). The worst outcome a review can produce is a patch, a
new file, or a new skill. The worst outcome the curator can produce is an archive, which by section
7.3 is a copy plus a frontmatter flag and never a removal.

### 6.4 The ledger row

One row per successful mutation, appended to `~/.dsh/skill-learn/ledger.jsonl`, best-effort: an
append failure logs and never blocks the write, the Hermes contract "TELEMETRY, NOT A GATE"
(`tools/skill_ledger.py:8`, `Hermes-Curator-Pass.md:274-282`).

```json
{
	"id": "<12 hex>",
	"ts": "<ISO-8601 UTC>",
	"actor": "curator | agent | user",
	"action": "create | patch | support | archive | restore | revert",
	"skill": "<name>",
	"evidence": {
		"session": "<agent id>",
		"reason": "<the model's sentence>",
		"rule": "<judge id>"
	},
	"before": [{ "path": "<absolute>", "sha256": "<hex>" }],
	"after": [{ "path": "<absolute>", "sha256": "<hex>" }]
}
```

`before` and `after` are delta manifests: a path whose hash is identical on both sides is dropped,
and a path present on one side only is kept, which is how a creation and a deletion stay visible
(`tools/skill_ledger.py:286-295`, `:307-308`). The bytes are written to the blob store as `<sha256>`
files, deduplicated, before the row is appended; `FsWriteOutcome.before` and `after` supply them
without a second read (`dsh-fs/lib/types/types.d.ts:118-134`).

### 6.5 The revert

`Revert(identifier)` restores exactly the files one ledger row touched, and it is the same mechanism
as the backup: the row names the blobs, and the blobs are the content.

| Step | Action                                                                                                                                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Find the row by `id`; absent is `outcome: "missing"`                                                                                                                                                                     |
| 2    | Pre-check every referenced blob; a missing blob aborts before anything changes, `outcome: "blob-missing"` - the fail-closed rule of the Hermes rollback (`Hermes-Consolidation.md:390-392`, `curator_backup.py:409-427`) |
| 3    | Write a safety snapshot of the whole corpus and a `pre-rollback` ledger row; if either fails, nothing changes (`curator_backup.py:420-427`)                                                                              |
| 4    | For each `before` path: `resolve`, `stat`, and `writeText` with `replaceIfVersion` from the blob                                                                                                                         |
| 5    | For a row whose `action` is `create`: archive the skill by the neutralize-and-copy rule of section 7.3 instead of removing files, because the plugin never deletes                                                       |
| 6    | For a row whose `action` is `support` and the file did not exist before: leave the file in place and mark the row `reverted (file retained)`, because a single file has no archive form                                  |
| 7    | Append the `revert` ledger row and one log line; a staging failure retains its manifest and reports `outcome: "staging-retained"` with the path (`curator_backup.py:361-375`)                                            |

Step 5 is the deliberate divergence from Hermes, whose rollback removes files it created
(`curator.md:166-169`): this plugin's "never delete" is absolute, so an undone create becomes an
archived skill and the user still holds the bytes.

### 6.6 The caps

| Cap                   | Default | Counted on                  | Effect                                                |
| --------------------- | ------- | --------------------------- | ----------------------------------------------------- |
| `maxWritesPerSession` | 6       | successes, per agent object | the run is `capped` before any model call             |
| `maxOperationsPerRun` | 4       | successes within one run    | the surplus operations are refused, `detail: run cap` |
| `maxOperations`       | 8       | parsed operations           | the parse fails `count`                               |

The existing hook increments before the work and never decrements, which is why its ledger holds
eight `cap reached (3 reviews)` lines against zero completed reviews
(`Classic/packages/hook-dsh-lesson-nudge/Source/Function/Apply.ts:155-171`,
`DSH-Skill-Surface.md:153-157`). Both new caps increment only after `writeText` or `editText`
resolved, and `Status` reports the spent count so the next run can prove it.

Hermes has no per-run cap at all: its fork runs `max_iterations=9999` and nothing counts the skills
one pass touches (`agent/curator.py:1118`, `Hermes-Consolidation.md:444`). The per-run cap is the
port's addition.

### 6.7 The ledger strings

Byte-stable, module-owned, asserted by the smokes. `<logFile>` is the configured path.

| Event             | Line                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Activation        | `skillLearn: <activation cells> (logFile <logFile>)`, through `Activate` from `@playform/lib-dsh-core` (`Classic/packages/plugin-dsh-lesson-review/Source/Library.ts:148-157`) |
| Disabled          | `skillLearn: disabled (enabled=false) (logFile <logFile>)`                                                                                                                     |
| Below threshold   | `skillLearn: skipped (below-threshold <n>/<m>) (logFile <logFile>)`                                                                                                            |
| Capped            | `skillLearn: skipped (cap reached <n>/<m> writes) (logFile <logFile>)`                                                                                                         |
| Busy              | `skillLearn: skipped (busy: the agent is not idle) (logFile <logFile>)`                                                                                                        |
| No llm            | `skillLearn: unavailable (no llm service) (logFile <logFile>)`                                                                                                                 |
| No route          | `skillLearn: unavailable (no model route) (logFile <logFile>)`                                                                                                                 |
| Empty transcript  | `skillLearn: unavailable (empty transcript) (logFile <logFile>)`                                                                                                               |
| Model failed      | `skillLearn: failed (model call: <message>) (logFile <logFile>)`                                                                                                               |
| Unparsable        | `skillLearn: failed (unparsable <id>: <detail>) (logFile <logFile>)`                                                                                                           |
| Nothing           | `skillLearn: reviewed nothing (<n> views, 0 operations) (logFile <logFile>)`                                                                                                   |
| Refused           | `skillLearn: reviewed refused (<n> refused: <first id>) (logFile <logFile>)`                                                                                                   |
| Applied           | `skillLearn: reviewed applied <n> (<m> refused) (logFile <logFile>)`                                                                                                           |
| Curated           | `skillLearn: curated checked=<n> seeded=<n> stale=<n> archived=<n> reactivated=<n> (logFile <logFile>)`                                                                        |
| Reverted          | `skillLearn: reverted <id> (<n> file(s), <m> retained) (logFile <logFile>)`                                                                                                    |
| Store quarantined | `skillLearn: usage store unreadable (<error>); quarantined to <path> (logFile <logFile>)`                                                                                      |

## 7. The curator

### 7.1 The deterministic transitions

`Curate(now)` ports `apply_automatic_transitions` (`agent/curator.py:209-261`) rule for rule. Eight
of the ten rules survive; two do not, and each absence is stated with its reason.

| #   | Rule                           | Ported | Predicate and action                                                                                                                                          |
| --- | ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Pinned exemption               | yes    | `pinned` is truthy: `continue`, no write, no seeding (`agent/curator.py:230-231`)                                                                             |
| R2  | Referenced-elsewhere exemption | **no** | Hermes reads a cron job store (`cron/jobs.py:3385-3400`); this harness exposes no skill-reference store, so v1 has no equivalent and says so in the non-goals |
| R3  | Unpersisted record             | yes    | no store key: seed `firstSeenAt = now`, count `seeded`, `continue` (`agent/curator.py:232-236`, `tools/skill_usage.py:412-418`)                               |
| R4  | Bundled zero-use re-anchor     | **no** | bundled skills are out of jurisdiction in v1, so the re-anchor has no subject (`agent/curator.py:237-242`)                                                    |
| R5  | Anchor selection               | yes    | `anchor = lastActivityAt or createdAt or now`, forced to UTC (`agent/curator.py:243-246`)                                                                     |
| R6  | Zero-use grace floor           | yes    | `useCount == 0` and `anchor > staleCutoff`: force `active` when `stale`, count `reactivated`, then `continue` unconditionally (`agent/curator.py:248-253`)    |
| R7  | Archive                        | yes    | `anchor <= archiveCutoff` and `state != archived`: archive, count `archived` only on success (`agent/curator.py:254-256`)                                     |
| R8  | Stale                          | yes    | `anchor <= staleCutoff` and `state == active`: `state = stale` (`agent/curator.py:257-258`)                                                                   |
| R9  | Reactivate                     | yes    | `anchor > staleCutoff` and `state == stale`: `state = active` (`agent/curator.py:259-260`)                                                                    |
| R10 | Archived is terminal           | yes    | no arm reaches `archived`; only `Restore` leaves it (`agent/curator.py:254`, `:257`, `:259`)                                                                  |

R1 to R6 are `continue` guards and R7 to R9 are one `if/elif/elif` chain, so at most one transition
happens per skill per pass (`Hermes-Curator-Pass.md:109`). `lastActivityAt` is the maximum of
`lastUsedAt` and `lastPatchedAt` and deliberately excludes `createdAt`
(`tools/skill_usage.py:123-127`), and it is computed at read time, never stored.

The thresholds are `staleAfterDays` 14 and `archiveAfterDays` 30, both floored at 1, because a
cutoff at or past now would transition the whole corpus on one bad config (`agent/curator.py:31-32`,
`:122-135`).

### 7.2 Jurisdiction

The candidate set is a record with `createdBy === "agent"` - the plugin's own create - or `pinned`
truthy, and the skill's directory must still resolve under `skillsRoot`. That is
`curated_report()`'s two clauses (`tools/skill_usage.py:699-704`) with the local-dir guard.
`createdBy` is a POLICY FLAG and not a provenance claim, which the Hermes code says in as many words
(`tools/skill_usage.py:290-297`); the plugin documents it the same way and never infers authorship.

A record for a skill the plugin did not create is telemetry only. A foreground create in this
harness has no `skill_manage` path, so the `"learn"` marker exists in the store's vocabulary for
completeness and opens no jurisdiction.

Every lifecycle write re-checks the predicate at write time, the second gate
(`tools/skill_usage.py:433-445`), and `archive` re-checks a third time before moving anything
(`tools/skill_usage.py:620-632`).

### 7.3 Archive and restore

The harness has no move and no delete, so an archive is a COPY plus a NEUTRALIZATION. Together they
preserve the bytes and take the skill out of the model's catalog, and both are reversible through
the same fence.

| Step        | Rule                                                                                                                                                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Destination | `<archiveRoot>/<name>/` holding `SKILL.md` and one copy per support file, keyed by the frontmatter name (`tools/skill_usage.py:633-635`)                                                                                                                                                                            |
| Collision   | `<name>-<YYYYMMDDHHMMSS>` when the destination exists (`tools/skill_usage.py:640-641`)                                                                                                                                                                                                                              |
| Copy        | one `ctx.fs` `writeText` with `createIfAbsent` per file, so an existing archive is never overwritten                                                                                                                                                                                                                |
| Neutralize  | `ctx.fs` `writeText` with `replaceIfVersion` on the live `SKILL.md`, adding `disable-model-invocation: true` to the frontmatter; the loader honors the key (`dsh-skill-filesystem/lib/index.js:852-881`) and the `skill` tool filters on it (`dsh-skill/lib/index.js:37-47`)                                        |
| Record      | the record survives; `state = archived`, `archivedAt = now` (`tools/skill_usage.py:556-562`, `:610`)                                                                                                                                                                                                                |
| Ledger      | one row `action: "archive"` whose `after` manifest is the archive copy and whose `before` is the live package                                                                                                                                                                                                       |
| Restore     | read the archived `SKILL.md`, `writeText` the live path with `replaceIfVersion`, drop the `disable-model-invocation` line, then set `state = active` and `archivedAt = null`; refuse on a live file the store does not know, on a name outside `skillsRoot`, and on a bundled name (`tools/skill_usage.py:647-671`) |

The live package stays where it is. That is the honest reading of a filesystem seam that cannot move
a file: the corpus keeps the bytes, the catalog stops offering them to the model, and `Restore` puts
the frontmatter back. Reaching for `node:fs.rename` instead would put a skill move outside the
governed seam the rest of this design is built on, and an interrupted move would leave two copies
with no record of which is live.

### 7.4 The consolidation pass

`Consolidate` is config-gated by `consolidate`, which ships **false**. The default is the code
default in Hermes too (`DEFAULT_CONSOLIDATE = False`, `agent/curator.py:35`), while the live config
on this machine sets `consolidate: true` (`config.yaml:448`); the plugin ships the safe default and
states the live value in the README, so the difference is a choice the user makes, not a surprise.

The pass is one survey plus one call, and the survey is the nine-field candidate row
(`agent/curator.py:832-861`): name, createdBy, state, pinned, activity count, use count, patch
count, last activity, and whether the record is seeded.

The reply is a plan whose rows may only be `keep`, `patch`, `create`, or `write_file`. There is no
`delete` row and no `absorbed_into` field in the schema at all. Five guards:

| Id                     | Guard                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `consolidate-enabled`  | `consolidate` must be true, and a dry run renders the plan without applying it (`agent/curator.py:266-287`, `:928-929`)                      |
| `consolidate-survey`   | an empty candidate list skips the call entirely (`agent/curator.py:885-888`)                                                                 |
| `consolidate-budget`   | at most `maxOperationsPerRun` rows, counted on successes                                                                                     |
| `consolidate-target`   | every `patch` and `write_file` target is judged by the same 16 rules, so a consolidation patch is a normal patch                             |
| `consolidate-snapshot` | a whole-tree snapshot is taken before the first write and pruned to `snapshotKeep` (`agent/curator.py:935-942`, `curator_backup.py:195-197`) |

### 7.5 Why the merge is deferred

The Hermes merge decision is `delete` with `absorbed_into=<umbrella>`, and its authority is not the
model's summary. Three of the four classification signals are artifacts of execution: the per-delete
declaration captured from a tool call (`agent/curator.py:569-579`), the tool-call audit
(`:505-541`), and the before/after diff of the skill set (`:636-646`). The fourth, the model's YAML
block, is explicitly the least trusted (`:586-592`), and `_classify_removed_skills` returns `pruned`
for every removal when the audit has no tool calls (`:540`, `Hermes-Consolidation.md:466`). A
two-call design keeps only the weakest signal, so a merge would be built on prose.

The decision taken for v1 is therefore: no merge, no delete, no `absorbed_into`. The deterministic
transitions plus archive, restore, and pin are the whole lifecycle, and the worst outcome any pass
can produce is an archive, which section 7.3 defines as a copy plus a frontmatter flag rather than a
removal. The Hermes safety direction - a hallucinated umbrella degrades to a prune, never to a
phantom merge (`agent/curator.py:619-620`, `Hermes-Consolidation.md:274`) - holds trivially here,
because no merge exists to be hallucinated. The merge is deferred, not rejected, because its
evidence model needs an agent loop this package deliberately does not have.

### 7.6 The backup rotation

One mechanism, three uses: the blobs and the ledger rows are the content, and a snapshot is a
manifest that names them.

| Element          | Rule                                                                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Snapshot id      | `<YYYY-MM-DD>T<HH-MM-SSZ>`, with `-01`, `-02` for a same-second collision (`curator_backup.py:54-55`, `:103-106`, `:168`)                                                                                                         |
| Snapshot content | `{id, reason, createdAt, files: [{path, sha256}], skillFiles, bytes}` at `<snapshotRoot>/<id>.json`; the bytes live in the blob store, so a snapshot of an unchanged corpus costs one small file                                  |
| When             | before a consolidation pass, before a revert, and on a manual call; never on a dry run (`agent/curator.py:928-945`, `curator_backup.py:422`)                                                                                      |
| Rotation         | keep the newest `snapshotKeep`, default 5 (the live `backup.keep: 5`, `config.yaml:452`), and never prune the snapshot just written or the one being restored (`curator_backup.py:188-211`)                                       |
| Blob sweep       | after a rotation, delete blobs referenced by no retained snapshot and no retained ledger row, and keep any blob younger than one hour, because a capture may be in flight before its row exists (`tools/skill_ledger.py:485-497`) |
| Failure posture  | the snapshot is best-effort except where a revert requires it, and a revert fails closed (`curator_backup.py:425-427`)                                                                                                            |

Rotation deletes the plugin's own snapshots and blobs, never a skill. That is the one place the word
delete appears in this design, and it is bounded to `<snapshotRoot>` and `<blobRoot>`.

## 8. The usage store

### 8.1 The record

One JSON object keyed by skill name at `storagePath`, never inside a `SKILL.md`
(`tools/skill_usage.py:51-52`). Thirteen fields.

| Field                       | Type                                | Meaning                                                                                           | Written by                                                        |
| --------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `createdBy`                 | `null \| "agent" \| "learn"`        | the curation opt-in policy flag, not an authorship claim (`tools/skill_usage.py:290-297`)         | `create` writes `"agent"`; a record seeded by a use writes `null` |
| `useCount`                  | int                                 | observed loads through the `skill` tool                                                           | `Record`                                                          |
| `patchCount`                | int                                 | successful `patch` and `support` writes                                                           | `patch`, `support`                                                |
| `patchGeneration`           | int                                 | monotonic, incremented with `patchCount`                                                          | `patch`, `support`                                                |
| `lastReusedPatchGeneration` | int                                 | the generation at the last use, clamped to `patchGeneration` on read (`tools/skill_usage.py:502`) | `Record`                                                          |
| `lastUsedAt`                | ISO-8601 or null                    | last use                                                                                          | `Record`                                                          |
| `lastPatchedAt`             | ISO-8601 or null                    | last write                                                                                        | `patch`, `support`                                                |
| `createdAt`                 | ISO-8601                            | creation stamp; the anchor fallback                                                               | `create`, and `Record` on first sight                             |
| `firstSeenAt`               | ISO-8601 or null                    | when the curator anchored the clock; null means never seen (`tools/skill_usage.py:353`, `:417`)   | `Curate`                                                          |
| `state`                     | `"active" \| "stale" \| "archived"` | lifecycle, closed set                                                                             | `Curate`, `archive`, `restore`                                    |
| `pinned`                    | bool                                | exempts the skill from every transition                                                           | `Pin`                                                             |
| `archivedAt`                | ISO-8601 or null                    | set on archive, cleared on any move to active or stale                                            | `archive`, `restore`                                              |
| `lastActivityAt`            | computed, never stored              | max of `lastUsedAt` and `lastPatchedAt` (`tools/skill_usage.py:123-127`)                          | nobody; derived at read time                                      |

A use is not a plain increment: `Record` writes `useCount + 1`, `lastUsedAt = now`,
`lastReusedPatchGeneration = patchGeneration` when `useCount > 0` and the generation moved, and
returns the fact so the report can say whether the skill was reused after a patch
(`tools/skill_usage.py:497-508`).

### 8.2 The use seam

The seam is the `tools/post-execute` waterfall. Its declared shape is
`(exec, result, next) => Promise<PostToolDecision>` (`dsh-tools/lib/types/index.d.ts:59-70`), and
the listener contract is exact:

1. `exec.name === "skill"` is the only case that matters; every other call returns `next()`
   untouched.
2. The loaded skill's name is `exec.arguments.name`, a string; a missing or non-string name returns
   `next()`.
3. The listener enqueues `Record(name, exec.agent)` on the store chain and does not await it, so the
   tool pipeline keeps its latency.
4. The listener returns `next()`. A waterfall observer that omits `next()` silently swallows the
   downstream default (`plugin-development`, the five dispatch modes), so the omission would break
   every `skill` call rather than merely skipping a record.
5. The listener never throws: the body is one `try`/`catch` that logs and returns `next()`.

The listener is registered at apply time on the agent-scoped context, so `exec.agent` is the agent
whose session spent the use.

### 8.3 The corrupt-store posture

Hermes reads a corrupt or unreadable store as `{}` and the next successful bump rewrites the whole
file with a map holding one record, which silently loses every other record
(`tools/skill_usage.py:369-377`, `:406`, `Hermes-Curator-Pass.md:406`). That behaviour is not
copied.

The rule here:

1. A read failure (`OSError` equivalent or a JSON parse failure) moves the file to
   `<storagePath>.corrupt-<YYYYMMDDHHMMSS>` and starts from an empty store.
2. One ledger line names the error and the quarantine path.
3. The next write creates a fresh store; the quarantined bytes stay on disk for inspection and for a
   manual merge.
4. A store that parses but holds a non-object root is treated the same way, and a record that is not
   an object is dropped from the in-memory map with one ledger line rather than being coerced.
5. Writes are atomic: write a temp file beside the target and rename it over, the
   `atomic_write_text` pattern (`tools/skill_usage.py:384`), and serialize every mutation on one
   promise chain so a load always precedes a write (the pattern at
   `Classic/packages/plugin-dsh-lesson-review/Source/Library.ts:130-172`).

## 9. The config schema

`Variable/Configuration.ts` follows the family shape: `Compose(false, {...})` from
`@playform/plugin-dsh-factory` plus `@deepseek-ai/schemastery`, every knob `.volatile()` so a hot
edit lands on the next call without a remount, and `policy: Policy()` composed last
(`Classic/packages/plugin-dsh-lesson-review/Source/Variable/Config.ts:20-51`). Thirty keys: 29
scalar knobs plus the composed policy block.

| #   | Key                    | Default                                      | Effect                                                                                                                                                                   |
| --- | ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `enabled`              | `false`                                      | the master switch; false is the shipped posture and a cold mount logs `disabled (enabled=false)`                                                                         |
| 2   | `logFile`              | `~/.dsh/playform/plugin-dsh-skill-learn.log` | the family ledger path, identity place four                                                                                                                              |
| 3   | `domain`               | `"skillLearn"`                               | the declared storage domain; the JSON sidecar is the wired store, the same posture as `domain: "lesson"` in the sibling                                                  |
| 4   | `storagePath`          | `~/.dsh/skill-learn/usage.json`              | the usage store                                                                                                                                                          |
| 5   | `statePath`            | `~/.dsh/skill-learn/state.json`              | RESERVED and unread: the curator clock lives in the usage store, because a second store would be a second failure mode for one number                                    |
| 6   | `ledgerPath`           | `~/.dsh/skill-learn/ledger.jsonl`            | the audit ledger                                                                                                                                                         |
| 7   | `blobRoot`             | `~/.dsh/skill-learn/blobs`                   | the content-addressed before and after bytes                                                                                                                             |
| 8   | `snapshotRoot`         | `~/.dsh/skill-learn/snapshots`               | the snapshot manifests                                                                                                                                                   |
| 9   | `reportsRoot`          | `~/.dsh/skill-learn/reports`                 | one directory per run                                                                                                                                                    |
| 10  | `snapshotKeep`         | `5`                                          | how many snapshots survive a rotation                                                                                                                                    |
| 11  | `skillsRoot`           | `~/.dsh/skills`                              | the only writable corpus root                                                                                                                                            |
| 12  | `archiveRoot`          | `~/.dsh/skills/.archive`                     | the worst outcome a pass may produce                                                                                                                                     |
| 13  | `agreementPath`        | `~/.dsh/AGENTS.md`                           | read-only; J11 refuses any write to it                                                                                                                                   |
| 14  | `intervalIterations`   | `15`                                         | tool-call blocks since the last review before one is due; the live Hermes value is 15 (`config.yaml:437`) while its code default is 10 (`agent/agent_init.py:1286-1288`) |
| 15  | `maxOperations`        | `8`                                          | the parsed operation bound; the parse fails `count` above it                                                                                                             |
| 16  | `maxOperationsPerRun`  | `4`                                          | the applied bound for one run, counted on successes                                                                                                                      |
| 17  | `maxWritesPerSession`  | `6`                                          | the session bound, counted on successes                                                                                                                                  |
| 18  | `digestTail`           | `24`                                         | messages kept verbatim (`agent/background_review.py:332`)                                                                                                                |
| 19  | `digestUserChars`      | `300`                                        | the user-line cap (`agent/background_review.py:349-350`)                                                                                                                 |
| 20  | `digestAssistantChars` | `200`                                        | the assistant-line cap (`agent/background_review.py:355-356`)                                                                                                            |
| 21  | `maxInputChars`        | `120000`                                     | the request's digest budget; the Hermes fallback for an unknown window (`agent/background_review.py:258`)                                                                |
| 22  | `maxTokens`            | `4000`                                       | the reply budget                                                                                                                                                         |
| 23  | `maxSkillChars`        | `100000`                                     | the resulting-file bound; the Hermes constant (`tools/skill_manager_tool.py:110`)                                                                                        |
| 24  | `staleAfterDays`       | `14`                                         | the stale cutoff, floored at 1                                                                                                                                           |
| 25  | `archiveAfterDays`     | `30`                                         | the archive cutoff, floored at 1                                                                                                                                         |
| 26  | `curateIntervalHours`  | `168`                                        | the minimum age of `lastRunAt` before a pass (`config.yaml:444`)                                                                                                         |
| 27  | `consolidate`          | `false`                                      | the opt-in second half of the curator                                                                                                                                    |
| 28  | `provider`             | `""`                                         | the route override; empty reads `Agent.options.provider`                                                                                                                 |
| 29  | `model`                | `""`                                         | the route override; empty reads `Agent.options.model`                                                                                                                    |
| 30  | `policy`               | `Policy()`                                   | the shared D6 block: `read`, `index`, `record`, `suggest`, `write`, `commit`, `spawn`, `message`                                                                         |

The shipped policy verdicts: `read: auto`, `index: auto`, `record: auto`, `suggest: auto`,
**`write: auto`**, `commit: approve`, `spawn: approve`, `message: auto`. `write: auto` is the
decision already taken - Hermes parity, autonomous writes behind the fence
(`DESIGN-BRIEF.md:80-81`) - and it is the one verdict that differs from the sibling's
`write: approve`. `commit` and `spawn` stay `approve` because this plugin never commits and never
spawns an agent.

## 10. The files

`Classic/packages/plugin-dsh-skill-learn/`, one definition per file, nameless default exports except
the loader contract and the service entry (`code-authoring` rules 13-15).

```text
Classic/packages/plugin-dsh-skill-learn/
  package.json                          the bundle manifest and the dsh.bundle patch pointer
  cordis.patch.yml                      the insert row, enabled: false, the policy block in full
  README.md                             the operator prose: what it does, the posture, the wiring
  SCHEME.md                             the contract: identity, surface, pipeline, rules, seams
  tsconfig.json                         the house base
  Configuration/
    ESBuild.ts                          the build, the name and version defines, the Target wipe
    Test-ESBuild.ts                     the test build
  Source/
    Library.ts                          the service class: 13 methods, the two listeners, the loader names
    Run.sh                              the dev twin
    prepublishOnly.sh                   the release build and the selfcheck
    Function/
      Trigger.ts                        the idle-edge gate: the counter, the threshold, the caps, the claim
      Transcript.ts                     deriveMessages to the plugin's message shape, with the tool-call count
      Digest.ts                         the bounded digest and its three counts
      Catalog.ts                        ctx.skills.list to index rows, with the model-invocability filter
      Route.ts                          the route resolution from Agent.options and the config override
      Prompt.ts                         the phase prompt assembled from Variable/Blocks
      Plan.ts                           the phase-1 request and its text-delta read
      Confirm.ts                        the phase-2 request carrying the view bodies
      Parse.ts                          the strict JSON parse, both phases, nine failure ids
      Judge.ts                          the 16 rules over one operation and the corpus
      Write.ts                          the fence: create, patch, support, the intent, the outcome
      Ledger.ts                         the audit row append and the blob capture
      Snapshot.ts                       the snapshot manifest, the rotation, the blob sweep
      Revert.ts                         one row to files, fail-closed, with the archive for a create
      Curate.ts                         the deterministic transitions R1-R10 as adapted
      Consolidate.ts                    the opt-in survey, the plan, the five guards
      Usage.ts                          the store: load, mutate, save, quarantine, the chain
      Report.ts                         run.json and REPORT.md
      Knobs.ts                          the config validation and the defaults
    Interface/
      Configuration.ts                  the knob type
      Operation.ts                      one operation, discriminated on kind
      Reply.ts                          the two reply shapes and the parse result
      Review.ts                         the review input and the review result
      Trigger.ts                        the trigger verdict
      Curation.ts                       the transition counters
      Consolidation.ts                  the consolidation plan and its result
      Record.ts                         one usage record
      Corpus.ts                         the judge's read-only view of the catalog
      Ledger.ts                         one ledger row
      Snapshot.ts                       one snapshot manifest
    Variable/
      Configuration.ts                  the Schemastery schema, section 9
      Blocks.ts                         the two prompt texts, byte-stable, section 5
      Version.ts                        the build-time version
    Test/
      Harness.ts                        the fake context and the real built library
      Trigger-And-Cap/                  README.md and Test.ts
      Transcript-And-Digest/            README.md and Test.ts
      Plan-And-Confirm/                 README.md and Test.ts
      Parse-And-Judge/                  README.md and Test.ts
      Write-And-Revert/                 README.md and Test.ts
      Curate-And-Archive/               README.md and Test.ts
      Usage-And-Ledger/                 README.md and Test.ts
      Policy-Defaults/                  README.md and Test.ts
```

Two files share the basename `Configuration` in `Interface/` and `Variable/`, which is the family's
existing split for a knob type and its schema
(`Classic/packages/plugin-dsh-lesson-review/Source/Interface/Config.ts`,
`Source/Variable/Config.ts`) with the full-word name the authoring rule requires.

`Library.ts` holds the class and the two listener bodies because a listener is wiring, and the
family keeps wiring in the entry (`code-authoring` rule 13). Every other behaviour is a leaf.

## 11. The smoke plan

Eight folders, one `README.md` per folder declaring `## Expected count` as `<N> PASS.`, which the
aggregate compares against the printed `N PASS - <Name>` line
(`Maintain/Run/Smokes/Function/Run.mjs:6-39`). The aggregate discovers folders from
`Target/Test/*/Test.js`, so a folder with no `Test.js` is silently absent
(`Maintain/Run/Smokes/Function/Folders.mjs:15-31`).

| Folder                  | Asserts                                                                                                                                                                                                                                | Expected count |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `Trigger-And-Cap`       | the idle edge only; the counter from the tool-call count; below-threshold; the cap on successes and never on attempts; busy; the 12 outcome classes reachable without a model                                                          | 11             |
| `Transcript-And-Digest` | `deriveMessages` projection; the tool-call count; the tail that never starts on a tool result; the no-op case; the 300 and 200 caps; the collapse to one message                                                                       | 10             |
| `Plan-And-Confirm`      | phase 1 carries the index and no bodies; the view set is the union; phase 2 carries every body; a second call only when the union is non-empty; two calls maximum                                                                      | 12             |
| `Parse-And-Judge`       | the nine parse ids and the 16 judge ids, each one refusal string byte-exactly; `frontmatter-valid` against a real file shape                                                                                                           | 22             |
| `Write-And-Revert`      | `createIfAbsent` refuses an existing path; `replaceIfVersion` refuses a stale version; `editText` refuses a non-unique anchor; the root fence; the ledger row's delta manifests; a revert restores bytes and archives an undone create | 14             |
| `Curate-And-Archive`    | R1, R3, R5, R6, R7, R8, R9, R10; the one-transition-per-pass rule; the 14 and 30 cutoffs and the floor at 1; the archive collision suffix; the flat restore; the pinned exemption                                                      | 12             |
| `Usage-And-Ledger`      | the 13 fields and their writers; the reuse watermark; the corrupt store quarantined and never overwritten; the atomic write; the blob dedup; the rotation keeps `snapshotKeep` and protects the newest                                 | 11             |
| `Policy-Defaults`       | `enabled: false`; `write: auto`; `commit` and `spawn` at `approve`; every default of section 9; the four identity places agree; the logFile default matches the package name                                                           | 9              |

Total: 101 checks across 8 folders. The suite loads the real built `Target/Library.js` against a
fake context that provides `on`/`emit`, `get`, `fs`, `llm`, `skills`, `logger`, and
`workingDirectory`, the harness pattern of `smoke-writing` and
`Classic/packages/plugin-dsh-lesson-review/Source/Test/Harness.ts:1-38`. The fake `fs` records every
intent and version so the fence is asserted as data, not as a message string.

The `Write-And-Revert` folder carries the replay gate's obligation: one replay against a recorded
transcript sample and a recorded corpus, printing the digest counts and the applied operations,
because a pipeline of more than four stages gets one replay before it is called done
(`smoke-writing`, the replay gate). That replay is not a ninth folder; it is one printed run inside
the folder, so the count stays honest.

## 12. The census

Adding one Classic package moves the registry and the generated catalogs, and it does not move the
site's checks. The prior plan promised a drift guard that measured package counts through the site's
content library (`Documentation/Plans/LESSON-REVIEW-PLUGIN.md:364-399`); that guard and that census
do not exist in this checkout. `Site/Scripts/` holds `Prepare.ts`, `Design.ts`, `Library.ts`,
`Diagram.ts`, and `Check.ts`, and `Check.ts` names seven checks - links, structure, spacing, plural,
islands, library, design - none of which reads the package tree (`Site/Scripts/Check.ts:1-20`). The
drift guard that does exist is scoped to the six normalize stream flavors and hashes their transform
files against a baseline (`Maintain/Check/Overpass-Drift/Index.mjs:1-10`), so it does not move
either.

| Check                                                           | Current value                                                                        | Value after                                                                                           |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `Documentation/Plugins/PLUGIN-FAMILY.md` package count          | 119 (59 Classic + 60 EffectTS), `PLUGIN-FAMILY.md:2`                                 | 120 (60 Classic + 60 EffectTS)                                                                        |
| `PLUGIN-FAMILY.md` ETS twin count                               | 59, `PLUGIN-FAMILY.md:24-25`                                                         | 59 (no twin; a non-goal)                                                                              |
| `PLUGIN-FAMILY.md` twin-less Classic packages                   | 0 - the registry states that every Classic package has a twin, `PLUGIN-FAMILY.md:60` | 1, so that sentence must be amended in the same pass                                                  |
| `PLUGIN-FAMILY.md` registry rows and the per-package paragraphs | one row and one paragraph per package                                                | one row and one paragraph added                                                                       |
| `Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md`                 | no row for the package                                                               | one row, and the "new since the last release" list gains the name (`PLUGIN-SUITE-SUMMARY.md:127-128`) |
| `Documentation/Plugins/MARKETPLACE.md`                          | the generator's output                                                               | regenerated, no prose edit unless the count is quoted                                                 |
| `marketplace.json` (root)                                       | the generator's output                                                               | one entry added by `pnpm marketplace` (`package.json:17`)                                             |
| `Site/Public/marketplace.json`                                  | a byte-identical copy of the root file                                               | the same copy, regenerated (`Documentation/Plugins/MARKETPLACE.md:54-55`)                             |
| `marketplace:check`                                             | passes                                                                               | passes after regeneration (`package.json:18`)                                                         |
| `Documentation/INDEX.md`                                        | no row for this plan                                                                 | one row under Plans                                                                                   |
| `pnpm test` smoke folders                                       | every `Target/Test/*/Test.js` across both trees                                      | plus 8 folders, 101 checks (`Maintain/Run/Smokes/Function/Folders.mjs:5-31`)                          |
| `pnpm test:wiring`                                              | the wiring suites                                                                    | unchanged; the package is not wired into a profile by this delivery (`package.json:23`)               |
| `pnpm test:types`                                               | the type suites                                                                      | plus the package's own build, which is the type gate (`package.json:22`)                              |
| `pnpm format:check`                                             | passes                                                                               | passes after formatting (`package.json:11`)                                                           |
| `Site` `pnpm Check`                                             | 7 checks pass                                                                        | unchanged                                                                                             |
| `Maintain/Check/Overpass-Drift`                                 | the six normalize flavors                                                            | unchanged                                                                                             |
| `Storage.Domains` and the catalog fallback rows                 | not measurable in this checkout                                                      | not claimed; the prior plan's figures are withdrawn                                                   |

Two of these are worth stating plainly. The twin-less count moves from zero to one, which
contradicts a sentence the registry states about itself, so the registry edit is part of the
delivery rather than an afterthought. And the marketplace is generated, so the delivery regenerates
it and never hand-edits it.

## 13. Non-goals

- **No merge and no delete.** The consolidation pass has no `delete` row and no `absorbed_into`
  field; the merge is deferred because its evidence model needs the agent loop (section 7.5). The
  worst outcome any pass produces is an archive, which is a copy plus a frontmatter flag (section
  7.3), never a removal. The plugin has no filesystem delete of a skill at all, because the harness
  seam offers none (`dsh-fs/lib/types/index.d.ts:61-240`).
- **No `prune_builtins`.** The flag has no reader in the two Hermes files the recon scoped - only
  two comments define it (`agent/curator.py:835-841`, `:890-893`) - and its consumer is the usage
  store, which was not read (`Hermes-Consolidation.md:321`, `:496`). v1 excludes every bundled-root
  skill from jurisdiction instead of guessing the flag's behaviour.
- **No cron-reference protection.** Hermes protects a skill named by a cron job
  (`cron/jobs.py:3385-3400`); this harness exposes no skill-reference store, so R2 is not adapted
  and the protection is `Pin`.
- **No write to `~/.dsh/AGENTS.md`.** A proposed agreement change may appear in the reply's `reason`
  and in the report; the file is never opened for writing, and J11 refuses a target that resolves to
  it.
- **No proposal queue.** The posture is autonomous writes behind the fence, not the sibling's
  `pending.jsonl` + `Accept` (`Classic/packages/plugin-dsh-lesson-review/Source/Library.ts:37-42`).
  There is no `Accept` method and no pending path.
- **No memory store.** The Hermes `_MEMORY_ROUTING_BLOCK` has no subject here, because this plugin
  owns no `USER.md` and no `MEMORY.md` and never writes the agreement.
- **No subagent and no tool loop.** The review is two hand-built `ctx.llm.stream` requests with no
  tools, so the model cannot wander and every write is an operation the judge has already seen.
- **No ETS twin.** The family's parity rule is deferred for this delivery; when the twin lands, the
  ledger strings and the smoke counts must match this tree byte for byte (`plugin-system`, the
  ledger-string law).
- **No other corpus root.** Only `skillsRoot` is writable; a skill from a project root,
  `~/.agents/skills`, or a bundled root is `foreign-root`.
- **No KV-primary storage.** `domain` is declared for the family's vocabulary and the JSON sidecar
  is the wired store, the same posture the sibling documents
  (`Documentation/Plans/LESSON-REVIEW-PLUGIN.md:320-323`).
- **No commit and no spawn.** `policy.commit` and `policy.spawn` stay `approve`; the plugin never
  runs a command and never creates an agent.

## 14. The open questions

Three remain, each with a recommended default and the evidence in hand. Questions 1 and 2 of the
first draft were ANSWERED by the filesystem recon (`Temporary/Research/DSH-Write-Path.md`) and are
now facts in section 6.0, not questions: `writeText` creates the parent directory recursively
(`dsh-fs-local/lib/index.js:514-515`), and the version a guarded write needs comes from
`stat(target).version` (`dsh-fs/lib/types/types.d.ts:67-74`).

| #   | Question                                                                                                                                           | Evidence                                                                                                                                                   | Recommended default                                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | What exactly does a `ctx.skills.list` row carry? The index needs `name` and `description`, and the invocability flags may or may not be on the row | `DESIGN-BRIEF.md:34` gives the call shape; the recon cites the call at `dsh-skill/lib/index.js:224` but not the row type                                   | read `row.name` and `row.description`; render the name alone when the description is absent, rather than calling `get` per row; apply the invocability filter only when the row carries the flag, and otherwise rely on the `skill` tool's own gate for the model path and on J4 for the write path |
| 2   | Is the session write cap keyed by the agent object or by a session id? The cap map is keyed by `Agent`, so a resumed session starts a fresh budget | `agent/status` carries `{agent, status}` (`dsh-agent/lib/types/runtime-types.d.ts:252-255`); no session id appears in the cited agent surface (`:139-149`) | key it on the agent object, state the reset-on-resume cost in the README, and keep the per-run cap as the tighter bound                                                                                                                                                                             |
| 3   | Should a skill that another package or a job references be exempt from archiving, the way a Hermes cron reference is?                              | no skill-reference store is documented; `ctx.jobs` is the job runner (`plugin-development`, the API map) and no skill field is documented on it            | ship without the exemption; make `Pin` the protection, and revisit only when a real reference store appears                                                                                                                                                                                         |

Question 5 of the first draft - whether a support file may be overwritten in place - is answered by
the same recon: `stat` gives the version, `writeText` with `replaceIfVersion` makes the overwrite
safe, and the body is carried in the confirm prompt exactly as a `SKILL.md` body is, so the read
stays structural. Overwriting is allowed.

## Acceptance

| Item                                                        | Value                                                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Output path                                                 | `Documentation/Plans/SKILL-LEARN-PLUGIN.md`                                                                        |
| Recommended package                                         | `@playform/plugin-dsh-skill-learn`                                                                                 |
| Service name                                                | `skillLearn`                                                                                                       |
| Service methods                                             | 13                                                                                                                 |
| Judge rules                                                 | 16                                                                                                                 |
| Parse failure ids                                           | 9                                                                                                                  |
| Outcome classes                                             | 12                                                                                                                 |
| Config keys                                                 | 30 (29 scalars plus the composed `policy` block)                                                                   |
| Usage-store fields                                          | 13                                                                                                                 |
| Source files                                                | 37                                                                                                                 |
| Smoke folders and checks                                    | 8 folders, 101 checks                                                                                              |
| Open questions                                              | 3                                                                                                                  |
| Implementation-ready for a coder who has not read the recon | yes - sections 4, 5, 6, and 9 are the exact text, the exact schemas, the exact guard order, and the exact defaults |
| Lines                                                       | 822                                                                                                                |
