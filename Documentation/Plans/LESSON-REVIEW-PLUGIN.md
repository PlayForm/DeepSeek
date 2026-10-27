---
title: The Lesson-Review Plugin - the self-improvement loop, ported
category: Plans
kind: proposal
date: 2026-10-26
status: implemented (mockup)
registry: Documentation/Plans/LESSON-REVIEW-PLUGIN.md
index: Documentation/INDEX.md
statuses:
    - name: the analysis of the Hermes self-improvement review (the post-turn fork + the curator)
      state: implemented
      evidence:
          sections 1-2 of this document; every claim carries its source file and line under
          ~/Developer/Documentation/Module/hermes-agent/
    - name: the lesson-review service (plugin-dsh-lesson-review)
      state: implemented (mockup)
      evidence:
          Classic/packages/plugin-dsh-lesson-review - builds clean, 6 smoke folders / 65 checks
          green; SCHEME.md §1-§8
    - name: the post-turn nudge hook (hook-dsh-lesson-nudge)
      state: implemented (mockup)
      evidence:
          Classic/packages/hook-dsh-lesson-nudge - builds clean, 1 smoke folder / 10 checks green;
          SCHEME.md §1-§7
    - name: the ETS twins
      state: planned
      evidence: section 7 - the parity wave; neither package has an ets-* twin yet
    - name:
          the census and registry integration (PLUGIN-FAMILY, the Site content library,
          marketplace.json, the ETS twin count)
      state: planned
      evidence: section 8 - the exact figures and commands; the Drift-Guard baseline
    - name: the KV storage domain and the LLM consolidation pass
      state: planned
      evidence: SCHEME §6.3-§6.4 - declared knobs, unwired
---

# LESSON-REVIEW PLUGIN - the self-improvement loop, ported

> The ask: how does Hermes do its **self-improvement review** in `~/.hermes/`, and can that be
> proposed (or mocked up) as a plugin for the DeepSeek Harness family in this repo. This document
> answers both halves: sections 1-2 are the analysis, sections 3-6 are the design, section 7 is the
> mockup that exists on disk and passes its smokes, and section 8 is what a delivery would still
> owe.

## 0. The short answer

Hermes runs **two loops**, and they are different mechanisms with different costs:

| Loop                          | When                                      | Cost                                                           | What it writes                                                          |
| ----------------------------- | ----------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| the **post-turn review fork** | every N turns, after the turn ends        | one bounded model round trip (~30K tokens)                     | memory (`USER.md`/`MEMORY.md`) and the skill corpus                     |
| the **curator**               | every `interval_hours` (7 days) when idle | deterministic pass = 0 tokens; the consolidation pass = opt-in | transitions, archives, consolidations, an audit ledger, per-run reports |

This repo already has the _substrate_ that both loops need: `~/.dsh/skills/` with a `STANDARD.md`,
`~/.dsh/AGENTS.md`, the `agent/status` and `agent.runMaintenance` idle phase, a hand-buildable
`ctx.llm.stream`, the D6 policy block, and the `~/.dsh/<identity>.log` ledger convention.

What it does not have is a loop that USES that substrate.

The proposal is therefore two packages, split the way the family splits everything:

- **`@playform/plugin-dsh-lesson-review`** (service `ctx.lesson`) holds the review: the counter, the
  digest, the prompt, the strict parse, the deterministic judge, the guarded write, the usage store,
  the lifecycle, and the reports.
- **`@playform/hook-dsh-lesson-nudge`** holds the trigger: `agent/status` → `idle` →
  `agent.runMaintenance`.

Both ship **disabled**, both are Classic-tree only for now, and the review **proposes** by default,
because `policy.write: approve` means an accepted lesson is queued in `~/.dsh/lesson/pending.jsonl`
and never published.

That single default is what makes an unattended reviewer trustworthy.

## 1. How Hermes does the post-turn review

### 1.1 The trigger is a counter, not a timer

`agent/turn_context.py:758` (`_tick_memory_nudge`) advances a per-agent counter and returns true
when `_turns_since_memory >= _memory_nudge_interval`.

The defaults are `memory.nudge_interval: 10` (`hermes_cli/config_defaults.py:1321`) and
`skills.creation_nudge_interval: 15` (`cli-config.yaml.example:1169`).

The skill nudge is measured in ITERATIONS and the memory nudge in USER TURNS, which is two counters
because a tool-heavy turn deserves a skill review and a chat-only turn does not.

At the end of the turn, `agent/turn_finalizer.py:795-799` checks
`if (_should_review_memory or _should_review_skills)` and calls
`agent._spawn_background_review(messages_snapshot=list(messages), ...)`.

### 1.2 The review is a FORK of the live agent

`agent/background_review.py:1328` (`spawn_background_review_thread`) returns `(target, prompt)`, and
`run_agent.py:757-820` builds the thread.

The fork is a real `AIAgent` (`build_cache_parity_fork`, `background_review.py:969`) that inherits
the provider, model, credentials, and cached system prompt of the parent, so on the SAME model it
replays the transcript as warm cache reads.

When `auxiliary.background_review.{provider,model}` names a different model the cache is cold
anyway, so `_digest_history` (`:332`) replays a compact digest instead.

Three properties make the fork safe, and all three are worth copying:

1. **The transcript is a SNAPSHOT, not a read.**

    The fork is handed `messages_snapshot` and it never re-reads the session, so the live
    conversation and its prompt cache are never touched.

2. **The tool surface is a DISPATCH-side whitelist.**

    `_review_tool_whitelist` (`:1092`) holds the memory and skills toolsets plus `read_file` and
    `search_files`, while the write tools (`write_file`, `patch`, `terminal`) stay denied so that
    autonomous maintenance can only go through the validation of `skill_manage`, and the advertised
    `tools[]` stays byte-identical to the parent's for cache parity.

3. **It is bounded and cancellable.**

    `_REVIEW_MAX_ITERATIONS = 16` (`:173`), an aggregate input budget of 75% of the review model's
    window capped at 600K tokens (`:180-182`), a cancellation handshake (`_BackgroundReviewRun`,
    `:28`) that preempts the fork when a live turn arrives, and, on a managed local endpoint, a
    deferred queue that dispatches the review when the machine is quiet
    (`agent/review_idle_queue.py`).

### 1.3 What the prompt actually says

The prompt is the product.

`agent/background_review.py` carries five blocks: `_MEMORY_ROUTING_BLOCK` (`:370`),
`_LESSON_LAYER_BLOCK` (`:393`), `_DO_NOT_CAPTURE_BLOCK` (`:423`), `_SKILL_REVIEW_PROMPT` (`:448`),
and `_COMBINED_REVIEW_PROMPT` (`:519`).

The rules that matter:

- **Be active**: "most sessions produce at least one skill update... A pass that does nothing is a
  missed learning opportunity, not a neutral outcome."
- **Target shape**: class-level skills, a SKILL.md of always-on rules, and a small `references/` set
  of topical depth, which is "not a flat list of narrow one-session skills, and not an umbrella
  hoarding a references/ file per session."
- **Procedure first; a pitfall is a rule plus one clause of WHY**; no PR or issue numbers, dates, or
  quoted user text as content; the same lesson twice is ONE rule; fix the sentence that misled
  rather than appending `UPDATE: actually...`.
- **A preference order**: patch a loaded skill, then patch an existing umbrella, then add a support
  file, and then create a class-level umbrella. The name must not be a PR number, an error string, a
  codename, or a `fix-X` or `debug-Y` artifact.
- **Read-before-write, ENFORCED** by `skill_manage`, because a patch must be based on a `skill_view`
  taken DURING the review and content quoted earlier in the transcript does not count.
- **Never capture**: environment-dependent failures, negative claims about tools, transient errors
  that resolved, one-off task narratives, and unresolved failures written up as a "reliable
  workflow".

### 1.4 The two stores

`_MEMORY_ROUTING_BLOCK` is explicit about `USER.md` (who the user is) against `MEMORY.md` (facts
about the environment), and it says "one fact goes to ONE store, never both".

The failure it prevents is documented in the block itself, where the reviewer wrote profile data
into `MEMORY.md` and the same lesson into both stores until both hit their size limits.

## 2. How Hermes does the curator

The curator (`agent/curator.py`, `agent/curator_backup.py`,
`website/docs/user-guide/features/curator.md`) is the second loop, and its design is a list of
things that are easy to get wrong:

| Concern                 | Hermes' answer                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| trigger                 | an inactivity check on session start / gateway housekeeping, NOT a cron: `interval_hours` 168 AND `min_idle_hours` 2                                                                                                                             |
| first run               | seeds `last_run_at` and defers one full interval, so nothing is touched before the user can review or opt out                                                                                                                                    |
| deterministic pass      | `active → stale` at `stale_after_days` 14, `→ archived` at `archive_after_days` 30; always on; 0 tokens                                                                                                                                          |
| protections             | pinned skills; skills named by any cron job (even paused); a zero-use grace floor (`use_count == 0` is absence of evidence)                                                                                                                      |
| LLM pass                | `consolidate: false` by DEFAULT (opt-in): survey, patch, merge into umbrellas, archive with `absorbed_into`                                                                                                                                      |
| jurisdiction            | only `.usage.json` entries with `created_by: agent`; a foreground `skill_manage(create)` records `created_by: learn` and is deliberately out of scope; `adopt` is an explicit declaration, because "telemetry cannot establish authorship"       |
| never deletes           | the worst outcome is a move into `~/.hermes/skills/.archive/`                                                                                                                                                                                    |
| undo                    | a tar.gz snapshot before a consolidation pass (`keep: 2`), plus an append-only JSONL ledger at `~/.hermes/skills/.curator_ledger.jsonl` with per-file `{path, sha256}` manifests and content-addressed blobs, so ONE mutation can be rolled back |
| reports                 | `~/.hermes/logs/curator/<ts>/{run.json,REPORT.md}` per run                                                                                                                                                                                       |
| the ledger is telemetry | "if writing an entry fails, the mutation still goes through"                                                                                                                                                                                     |

The single most transferable idea is the last row: **the audit trail must never be a gate**.

A maintenance pass that refuses to run because it could not write its own log is a pass that stops
running.

## 3. The translation: three rules change owner

A literal port would be wrong, because this harness is not that one.

Three Hermes rules have a different owner here, and the ported prompt says so instead of restating
them:

| Hermes rule                                        | This repo's owner                                                                                     | Consequence for the plugin                                             |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| "a skill is a package with SKILL.md + references/" | `~/.dsh/skills/STANDARD.md` (the four questions, the body section order, the single-owner corpus map) | the prompt names the standard and carries only the CONTENT rules       |
| "memory has two stores: USER.md / MEMORY.md"       | the SKILL CORPUS and `~/.dsh/AGENTS.md` (the working agreement)                                       | the routing rule survives; the stores are renamed                      |
| "the curator consolidates at scale"                | this service's deterministic `Curate`                                                                 | the reviewer is told to note overlap and never to archive for tidiness |

Two more differences are structural rather than semantic:

- **No tool loop.** The Hermes fork is an agent with 16 iterations of `skill_view` and
  `skill_manage`, while here the review is ONE `ctx.llm.stream` request whose reply is a strict JSON
  proposal that is judged in process. That trades flexibility for auditability, because the model
  cannot wander and every write is an operation that the judge has already seen.
- **No write path at all by default.** Hermes writes through `skill_manage` under
  `skills.write_approval`, which is off by default, while here the D6 `policy.write: approve` queues
  instead and `Accept` is the only path into the corpus.

## 4. The proposal

### 4.1 The two packages

| Package                              | Archetype        | Surface        | Owns                                                                                       |
| ------------------------------------ | ---------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `@playform/plugin-dsh-lesson-review` | Plugin (service) | `ctx.lesson`   | counter, digest, prompt, parse, judge, write fence, usage store, queue, lifecycle, reports |
| `@playform/hook-dsh-lesson-nudge`    | Hook             | `agent/status` | the idle edge, the service probe, the per-session cap                                      |

The names read as the family's `@`-sentences: **Plugin @ DSH @ Review @ Lesson** and **Hook @ DSH @
Nudge @ Lesson**.

The domain word is "lesson" (a rule plus its why) and not "skill", because the artifact lands in
either store, the corpus OR the agreement, and the plugin should not claim to own the corpus.

### 4.2 The surface mapping

| Hermes mechanism                              | This harness                                      | Where                             |
| --------------------------------------------- | ------------------------------------------------- | --------------------------------- |
| `_turns_since_memory` counter                 | `Lesson.Tick(agent)`                              | `Library.ts`                      |
| `_digest_history`                             | `Function/Digest` (tail + collapse + cap)         | `Function/Digest.ts`              |
| the five prompt blocks                        | `Variable/Blocks` + `Function/Prompt`             | `Variable/Blocks.ts`              |
| the forked `AIAgent` + whitelist              | ONE `ctx.llm.stream` request + the judge          | `Library.ts`, `Function/Judge.ts` |
| `skill_manage` + read-before-write            | the exact-file fence in `Apply`                   | `Function/Apply.ts`               |
| `skills.write_approval`                       | `policy.write: approve` → the pending queue       | `Library.ts`, `Function/Apply.ts` |
| `USER.md` / `MEMORY.md` routing               | corpus vs `AGENTS.md`, agreement always queued    | `Variable/Blocks.ts`              |
| the curator's transitions                     | `Lesson.Curate(now)`                              | `Function/Curate.ts`              |
| `.usage.json`                                 | `~/.dsh/lesson/usage.json`                        | `Function/Usage.ts`               |
| `logs/curator/<ts>/{run.json,REPORT.md}`      | `~/.dsh/lesson/reports/<ts>/{run.json,REPORT.md}` | `Function/Report.ts`              |
| `~/.hermes/skills/.curator_ledger.jsonl`      | `~/.dsh/playform/plugin-dsh-lesson-review.log`    | `Library.ts`                      |
| `agent/runMaintenance` (no Hermes equivalent) | the idle phase that runs the review               | `hook-dsh-lesson-nudge`           |

### 4.3 The pipeline

```
idle edge → Tick(due?) → runMaintenance(signal) → Review(snapshot)
   → Digest → Prompt → ctx.llm.stream → Parse → Judge → Apply | Queue → Report → ledger
```

Every arrow has a degradation: no `llm` service, no route, a provider throw, an unparseable reply,
and an empty snapshot.

Each one is an outcome class (`unavailable` / `failed` / `nothing` / `proposed` / `applied`) and one
ledger line, and none of them throws into the maintenance task of the caller.

### 4.4 The judge: the part that makes it trustworthy

Thirteen deterministic rules carry one id each (`SCHEME.md` §5): `name-shape`, `name-artifact`,
`exists`, `missing`, `pinned`, `frontmatter`, `narrative`, `negative-claim`, `support-path`,
`absorbed-missing`, `absorbed-self`, `agreement-long`, and `duplicate`.

The rule that earns its keep is `negative-claim`: "the formatter is broken" is refused, while "the
formatter is broken until `npm install` runs in the root" is accepted.

That is the difference between a constraint that the agent will cite against itself for months and a
lesson.

### 4.5 The lifecycle

`Curate` keeps the four protections of Hermes and drops the snapshot machinery for now: pinned
entries never move, only `createdBy: agent` entries are in jurisdiction, a zero-use entry keeps
`neverUsedGraceDays`, and an archive is a rename into `.archive/` that `Restore` undoes.

The `created_by` field is documented as a POLICY FLAG and not as a provenance claim, which is the
same reading that Hermes settled on.

## 5. The mockup that exists on disk

```
Classic/packages/plugin-dsh-lesson-review/
  Source/Library.ts                 the service (19 methods)
  Source/Function/{Knobs,Digest,Prompt,Parse,Judge,Apply,Curate,Usage,Report,Snapshot}.ts
  Source/Interface/{Config,Entry,Proposal,Review,Corpus}.ts
  Source/Variable/{Config,Blocks}.ts
  Source/Test/{Harness.ts, Nudge-Cadence, Digest-And-Prompt, Parse-And-Judge,
               Apply-And-Pending, Curate-Lifecycle, Policy-Defaults}
Classic/packages/hook-dsh-lesson-nudge/
  Source/Library.ts                 the loader contract (name/apply/Config/inject)
  Source/Function/Apply.ts          the one listener
  Source/Interface/{Config,State,Factory,Agent}.ts
  Source/Test/{Harness.ts, Listen-And-Nudge}
```

Verified in this checkout with the commands and their real results:

| Command                                                               | Result                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm --filter @playform/plugin-dsh-lesson-review run prepublishOnly` | clean build, `tsc` on both trees, `Harness selfcheck OK`            |
| `pnpm --filter @playform/hook-dsh-lesson-nudge run prepublishOnly`    | clean build, `Harness selfcheck OK`                                 |
| the 6 service folders                                                 | 5 + 9 + 20 + 14 + 8 + 9 = **65 PASS**                               |
| the hook folder                                                       | **10 PASS**                                                         |
| `pnpm test` (the aggregate runner)                                    | picks all 7 folders up by directory; every count matches its README |

The smokes are the contract in the family's shape: the `README.md` of each folder declares its
`## Expected count`, and `Maintain/Run/Smokes/Function/Run.mjs` fails the run when the printed
`N PASS - <Name>` disagrees, which is the vacuously-green guard.

## 6. The open seams (honest list)

1. **The live-session projection.**

    The `agent.session.surface` accessors of `Function/Snapshot` were NOT verified against a live
    host in this checkout, so the module probes four candidate shapes, guards every read, and
    returns `[]`, and the review then reports `unavailable (empty snapshot)`.

    This is the one place where a harness upgrade can change behaviour, and it is one file.

2. **The auxiliary-call classification.**

    `GenerateOptions.purpose` accepts only `'compaction' | 'session-title'`, and a lesson review has
    no slot, so the request leaves `purpose` unset and giving it one is an upstream harness change.

3. **The KV storage domain.**

    `domain: "lesson"` is declared and the JSON sidecar is what is wired, while the family's PoC
    posture is KV-primary with the JSON fallback in the shape of the pattern service.

4. **Consolidation.**

    `consolidate` is declared and unwired, and the deterministic pass is the shipped maintenance.

5. **The report root is not the ledger.**

    Two artifacts serve two purposes: the ledger answers "did it activate / what happened" and the
    report answers "why was this refused", and neither gates a mutation.

## 7. The ETS twins (planned)

The rule of the family is one contract and two trees, and 47 of the 101 packages have `ets-*` twins.

These two do not have a twin yet, and the parity work is not a transliteration:

- the class and `Service` base of the service map to an Effect `Layer` and a service tag, and its
  `Promise` returns become `Effect` envelopes;
- the judge is pure and ports unchanged, because it is a function of `(proposal, corpus)`;
- the listener of the hook maps to an Effect-wrapped handler that registers through the same
  `ctx.on("agent/status")` seam, with the failure channel carrying the warn instead of a `catch`;
- the byte-stable ledger strings and the smoke README counts must match the Classic tree EXACTLY,
  which is what the smokes of the family assert across both trees.

## 8. What a delivery still owes (the census)

Adding packages to this repo is a CENSUS change and not just a directory.

Before merge:

| Gate                                                | What it needs                                                                                                                                                                                                                                       |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PLUGIN-FAMILY.md`                                  | two rows, and the counts reconciled: the tree holds **54 Classic + 48 ETS = 102** directories today while the registry says 101 (53 + 48) - the new packages make it 56 + 48 = 104, and the registry's own drift should be settled in the same pass |
| `PLUGIN-SUITE-SUMMARY.md`                           | the one-line role per package                                                                                                                                                                                                                       |
| `Site/Source/Library/Content.ts` + `Live.ts`        | the census figures the site renders (packages, smoke folders, checks, twins, policy packages, storage domains, dependents)                                                                                                                          |
| the SITE CATALOG                                    | one static page per package, the registry links to it, and the sitemap entry - the catalog is derived per package, so two packages are two pages                                                                                                    |
| `marketplace.json` + `Site/Public/marketplace.json` | `pnpm marketplace` (the generator walks both trees)                                                                                                                                                                                                 |
| `Documentation/INDEX.md`                            | this plan's entry                                                                                                                                                                                                                                   |
| the ETS twins                                       | section 7, if the delivery includes them                                                                                                                                                                                                            |

`node Site/Scripts/Drift-Guard.mjs` is the arbiter.

Measured in this checkout:

- **baseline before the mockup: 5 failures, all in the smoke figures** - `Counts.Coach` (Classic 139
  expected, 129 counted), `Totals.Classic` (3509/3500), `Totals.EffectTS` (3172/3173),
  `Counts.SuitesClassic` (272/271), and `Counts.Suites` (514/513). The tree was already red here.
- **after the mockup: 20 failures** - the same 5, plus 15 that are exactly the census that the two
  packages move. The new ones follow, with the figures a delivery must write:

| Check                               | Now (repo)   | Content library      |
| ----------------------------------- | ------------ | -------------------- |
| `Totals.Classic`                    | 3584 checks  | 3500                 |
| `Counts.SuitesClassic`              | 279 folders  | 271                  |
| `Counts.Suites`                     | 521 folders  | 513                  |
| `Counts.PackagesClassic`            | 56 packages  | 54                   |
| `Counts.Packages`                   | 104 packages | 102                  |
| `Policy.Packages`                   | 26           | 25                   |
| `Storage.Domains`                   | 15           | 14                   |
| `Dependents.CoreClassic`            | 49           | 47                   |
| `Dependents.Factory`                | 48           | 46                   |
| the twin-less Classic packages      | nine         | the documented seven |
| the catalog's fallback tuples       | 104 rows     | 102                  |
| the catalog: a built page per entry | 2 missing    | -                    |
| the registry: every page linked     | 2 missing    | -                    |
| the sitemap: every page listed      | 2 missing    | -                    |

Two of those are worth calling out because they are not obvious from "add a package": the new
service declares a KV `domain` (`lesson`), which moves `Storage.Domains`, and it carries a
`Policy-Defaults` smoke folder, which moves `Policy.Packages`.

Both are derived from the packages themselves, which is the point of the guard.

None of this is a code defect, because the two packages build, typecheck, and pass their own smokes.

It is the price of a package existing in a repo whose site is a re-derivation of the tree.

## 9. Non-goals

- **Not a memory system.** `AGENTS.md` proposals are queued and never written by this plugin,
  because the working agreement of the user is theirs.
- **Not a subagent.** The review is one bounded model call and not a spawned agent with tools, and
  the D6 `spawn` verdict stays `approve` for that reason.
- **Not a cron.** The trigger is the own idle edge of the agent, so the review never runs when
  nothing happened.
- **Not a replacement for the suggesters.** `hook-dsh-*-suggester` names companions in the hot path
  deterministically and with no LLM, while this loop is the cold path that runs after the turn and
  about the session.
