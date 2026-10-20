---
title: The Family Organization and Functionality Analysis
category: Plans
kind: living-plan
date: 2026-10-20
status: active
registry: Documentation/Plans/FAMILY-ORGANISATION-ANALYSIS.md
index: Documentation/INDEX.md
statuses:
  - name: the structural and duplication audit across both release trees
    state: resolved
    evidence: this document - 827 Source files, 125,935 lines, checksum-verified
  - name: the functionality audit
    state: resolved
    evidence: this document - the capability matrix, the gaps, the overlaps
  - name: the placement audit
    state: resolved
    evidence: this document - the misplacement findings and the moves
  - name: the target design for the overpass scaffolding
    state: implemented
    evidence: the core and base Overpass files; the Classic and ETS delegates; the guard 40/40; the aggregate 207 suites exit 0
  - name: the EffectTS strategy decision
    state: resolved
    evidence: keep the fork; the four unused direct effect deps removed; the ets-core claim corrected; seven ETS suites green
  - name: the P0 data-loss fix (the Site ignore rule)
    state: implemented
    evidence: .gitignore now /Site/; git check-ignore clean; the three archived docs are untracked and visible
  - name: the functionality fixes
    state: implemented
    evidence: ccr path and the ledger defaults aligned in both trees; default-path assertions; the aggregate 207 folders exit 0
  - name: the verification gate
    state: implemented
    evidence: the aggregate 207 suites exit 0 with 3201 PASS; the site build 24 pages with zero content Drift failures
---

# The Family Organization and Functionality Analysis

The family is well de-duplicated inside Classic and badly de-duplicated
across the two release trees. That is the sentence this document supports
with numbers, and the sentence that decides the order of the work: fix the
data-loss and correctness bugs first, then the small within-tree
duplications, and only then decide what EffectTS is for.

Method: read-only audit of `Classic/packages` and `EffectTS/packages`
(827 `.ts` files under `Source`, 125,935 lines), SHA-1 grouping of every
file, line-level diffs of the duplicate clusters, and a read of the
configs, ledgers, and placement rules. Every number below was reproduced
by the orchestrator.

## 1. The scale

| Measure | Value |
| --- | --- |
| Classic Source | 408 files, 61,497 lines |
| EffectTS Source | 419 files, 64,438 lines |
| Byte-identical groups (2+ files) | 161 |
| Lines in those groups | 39,030 |
| Redundant lines (all but one per group) | 26,695 (21%) |
| Cross-tree byte-identical pairs | 158 groups; 181 pairs |
| Classic lines with an ETS twin path | 60,069 of 61,497 |
| Tests inside `Source/Test` | 238 files (207 `Test.ts`), 32,703 Classic lines (53%) |
| `prepublishOnly.sh` / `Run.sh` copies | 31 / 31 |
| `Interface/Factory.ts` mirrors | 26 |
| `Command.ts` copies | 12 (175 lines each) |
| `StepBatch.ts` copies | 10 (115/111 lines) |

## 2. The duplication map

### 2.1 Within a tree

Only three byte-identical groups exist per tree, all in the normalize
family:

- `Function/Command.ts`, 175 lines, identical six times (the six stream
  flavors). The normalize-file variant (206 lines) is the only real one.
- `Function/StepBatch.ts`, near-identical six times: 115 lines for
  ellipsis/invisible/spaces, 111 for fullwidth/quotes (one transform call
  differs), one-off variants for dash and normalize-file.
- `Function/Overpass.ts`, 188 lines, near-identical seven times; the diff
  between dash and ellipsis is comment-only.

The command is generic: it reads `State.Module`, `State.Scopes`,
`State.Exempt`, and `State.Overpass`, and its only flavor-specific text is
the module name. It even hardcodes the sentence "the files sweep is owned
by the normalize-file hook" in the six stream flavors. The step-batch arm
is generic apart from the transform delegate. The overpass module is
generic apart from the transform and the comments.

That is roughly 3,000 duplicated lines per tree of shared scaffolding.

### 2.2 Across the trees

All 13 module packages are path-identical 1:1. Of the 344 module twin
files, 134 are byte-identical, 180 differ by no more than 12 lines and only
by the import rename (`@playform/hook-dsh-core` to
`@playform/ets-base-dsh`), and 30 are substantive. No twin exceeds 2x line
divergence (the maximum is 1.91x, normalize `Normalize.ts`).

The `effect` dependency is declared in `ets-hook-dsh-ccr`,
`ets-hook-dsh-tool-coach`, `ets-hook-dsh-live-containers`, and
`ets-hook-dsh-core`, and imported by zero files in each.

EffectTS is therefore a textual fork, not an Effect port. The 30
substantive files are the real port: the Stream gate, the typed Update
envelope, the `Continue` Cause/Exit channel, and the normalize
`Normalize.ts`/`Apply.ts` redesign.

### 2.3 The other commonalities

- **Tests**: 207 `Test.ts` and 31 `Harness.ts`, 53% of Source lines. The
  harnesses hand-roll the same fake-context rig (110-850 lines). Tests are
  compiled into `Target/Test`; publication is saved only by the
  `"!Target/Test"` negation in each manifest.
- **Build scripts**: 31 `prepublishOnly.sh` (15 distinct hashes, 25/32/33
  lines) and 31 `Run.sh`, 1,496 lines total, with real drift.
- **Service type mirrors**: 26 `Interface/Factory.ts` files (24-34 lines),
  each importing the factory's default type and augmenting `Context`.
- **Config defaults**: three homes per normalize flavor -
  `Function/Overpass.ts:61-79`, `Function/Normalize.ts:78-85`, and
  `Variable/Config.ts:68-92` - with visible drift.
- **Docs**: six flavor READMEs of 372-406 lines each; `SCHEME.md` in 8 of
  15 Classic packages; `CODE_OF_CONDUCT.md` in 24 package directories.

### 2.4 The smoke manifest is stale

The manifest line (`Classic/smokes/README.md`, `EffectTS/smokes/README.md`)
is the source the site parses, and it lags the per-folder tests: dash 184
vs 132, each small flavor 104 vs 62, normalize-file 112 vs 71, factory 35
vs 34. Core, governor, pinner, cargo, ccr, and tool-coach match. The
per-folder READMEs are the runner's arbiter (`Maintain/Run-Smokes.mjs`).

The real Classic total is 1,314 across the manifest suites, 1,594 with the
live-containers folders. The EffectTS total needs the same per-folder sum;
the manifest's 1021 and the site's 1008/1021 are the stale line, not the
test truth.

## 3. The target design

### 3.1 Move the overpass scaffolding into the machinery library

The scaffolding is structure, not a leaf: the gate order, the CCR marker
guard, the decision-kind/value checks, the identity-preserving no-op, the
fail-open, and the journal shape. It has no flavor-specific behavior and no
flavor-specific strings.

Target homes, forced by the existing trees:

| Tree | Home | Why |
| --- | --- | --- |
| Classic | `hook-dsh-core/Source/Overpass/` | core already owns the tables, `Replace`/`Chunk`/`Block`; every flavor depends on it |
| EffectTS | `ets-base-dsh/Source/Overpass/` | the ETS machinery already lives in base (`Stream/`, `Function/Activate`); `ets-hook-dsh-core` has no `Stream/` |

Files: `Blocks.ts`, `ToolResults.ts`, `StepBatch.ts`, `Command.ts`, plus
the Library exports in core and the same in base.

The parameterization boundary is four parameters:

1. `Transform(Text, State)` - the flavor's replacement, read per call so a
   volatile flip lands; the one-argument fullwidth delegate ignores State.
2. `Line` - the module's ledger-line composer (required; the module names
   core's composer or inlines its own).
3. `Ledger { Append, Journal }` - injected, so core never names the
   factory's type and the `Append(State: Shape)` bivariance is avoided.
4. `Files` - the files sweep, normalize-file only.

Module identity is not a parameter: `State.Module` already carries it.
Each flavor keeps a thin delegate so `Apply.ts`, the import paths, and the
smoke harness stay untouched; that is what makes the rollback two files.
The import direction stays consumer -> core or base; no cross-tree edge.

Migration, with a canary:

1. M0 capture the per-folder printed counts and the ledger files.
2. M1 core `Blocks.ts` and exports (additive).
3. M2 core arms, zero consumers (additive; hard rollback).
4. M3 dash canary: 184 PASS and a byte-diff of its ledger (behavioral gate).
5. M4 the five small flavors: 104 each.
6. M5 normalize-file: 112.
7. M6 core `Command.ts`, six delegates, and the file delegate.
8. M7 mirror to `ets-base-dsh`; build base, core, factory, consumers;
   parity rerun.
9. M8 docs and manifest; M9 the aggregate.

Risks: `RewriteBlocks` must return the original array by identity; the
transform must read State per call; the registration keeps
`{ prepend: true }`; core must stay dependency-free; a stale core Target
makes all seven consumers fail to resolve exports; the additive core and
base exports are the only public-surface change.

Risk: medium. The ledger strings do not change because they are
parameterized by `State.Module`; the smoke counts must not change.

The red-team's counter-argument is recorded: each package ships these
files in `Target/`, all fourteen are published at 0.0.1, and moving the
logic changes the dependency graph and the tarball contents for a new
version. That is why the sequence starts with the hash drift-guard (P1)
and treats the move as a versioned refactor (P2), not a cleanup. The
delegate files keep `Apply.ts` and the import paths unchanged; the dash
canary proves the ledger strings and counts before the other flavors
follow.

### 3.2 Export the factory's service type and delete the 26 mirrors

`plugin-dsh-factory/Source/Library.ts` exports `State`, `Options`, `Gate`,
`Transform`, `Output`, and `Journal`, but not the service type. Every
consumer hand-writes the same declaration merge. The factory should
augment `Context` itself (it owns the service) and export the service
type; the 26 mirrors become imports or disappear.

Risk: low. Type-only, erased at build. The ETS tree must re-export from
`ets-base-dsh` or its factory.

### 3.3 One home for config defaults

Add `Variable/Default.ts` per package (or a core helper for the shared
scopes/exempt block) and import it from both the schema and the overpass
helpers. This removes the three-home drift.

Risk: low. Behavior is identical when the literals already match; the
drift is the bug.

### 3.4 One build entry point

Replace the 62 shell scripts with one `Maintain/Build.mjs` and a two-line
shim per package, or generate the shims. The 15 distinct `prepublishOnly`
hashes are the evidence that the copies have already drifted.

Risk: low-medium. The npm `prepublishOnly` script must keep working, and
the build order (factory first, then serialized) must be preserved.

### 3.5 The EffectTS decision

Four options, in increasing cost:

| Option | What it means | Cost | Risk |
| --- | --- | --- | --- |
| A. Keep the fork | Accept 60k mirrored lines; fix only the dead `effect` deps and the drift | Low | Drift continues |
| B. Generate the twins | A codegen from Classic source produces the import-renamed ETS files; the 30 substantive files stay hand-written | Medium | Build complexity; the generated files must be committed or built |
| C. Thin adapter | ETS imports shared source and adds the Effect layer only where it differs | High | Cross-tree dependency; the two release groups must never mix in one graph |
| D. Delete ETS | One tree, one runtime | High | Breaks 16 published names at 0.0.1; loses the Effect offering |

The analysis supports **B or A now, C only as a deliberate release
decision**. Option D is a product decision, not a refactor. Option C
conflicts with the "never mix the groups in one dependency graph" rule
unless the shared source is a third package that both trees depend on - a
real architectural change, not a cleanup.

### 3.6 live-containers

12,670 source lines, a 1,103-line `Apply.ts`, and 18 `Function/` files:
boards, monitors, suggester, detach, failsafe, jobs, storage. It is six
subsystems in one published name. The low-risk move is an internal module
split (one folder per subsystem, `Apply.ts` reduced to wiring) and only
then a package split behind the same name. The package is disabled by
default, which lowers the user-facing risk.

### 3.7 normalize-dash

It is three packages in one: the stream flavor, the raw-write tool
(`Write.ts`, 289 lines), and the six-flavor chain (`Rewrite.ts`, 97). Do
not split the published name; move the generic chain and the raw-write
tool surface to core where they are family machinery, and leave the dash
table in the module.

## 4. The functionality findings

### 4.1 Correctness and safety

| Finding | Evidence | Fix | Class |
| --- | --- | --- | --- |
| ccr writes to a hardcoded user path (P0) | `ccr/Source/Variable/Config.ts:42`, `ccr/cordis.patch.yml:43` `/Users/nikola/.dsh/ccr.log`; `Append` swallows the failure (`Append.ts:24-33`), so the ledger is silently never written off-nikola; `setup.astro:772` tells users to verify that path | default `~/.dsh/ccr.log`; add a default-path assertion | Behavioral (path); silent ledger loss today |
| `normalizeToolArguments` in the shipped patches | six patches set `true`; schema defaults `false`; the patch comment says it is the opt-in example and the field is deprecated in favour of `scopes.toolInput` | not a patch flip: fix the site Configurator (it prints `toolArgs=on` as if it were the schema) and the docs | Docs and site |
| Ledger paths disagree | schema defaults `hook-dsh-governor-package.log` / `-pinner-package` / `-governor-cargo`; patches, READMEs, and the site use `hook-dsh-package-governor.log` etc.; no smoke catches it because every smoke overrides `logFile` | pick the schema-to-patch/README direction (majority and documented); add a default-path assertion; version bump | Behavioral, versioned |
| Gate refusals are silent | `Gate.ts` returns seven reasons; only `excluded` reaches the ledger | `verboseGate` cell emitting `skipped (<reason>) <path>` | Additive |
| No dry-run | normalize-file and the governor chain always write | `dry_run` arg / preview step | Additive |
| No backup/restore | strict strips and full-file normalize are irreversible | opt-in `backupDir` + `restore` command | Additive |
| No per-scope overrides | `strict`, `sections`, `replacement`, `exclude` are global | `govern-policy.json` keys resolved by the walk-up | Additive |
| No numeric bounds | `maxUpdateFailures: 0`, negative thresholds load | schema `min`/`max` + fail-loud apply | Behavioral for invalid configs |
| Stale model in a disabled package | `live-containers/Config.ts:143-150`, `Apply.ts:588-589` hardcode `glm-5.3-flash` | use the configured route or the current model | Behavioral (disabled package) |
| ETS unused direct dependency and a false claim | zero `from "effect"` in ccr, tool-coach, live-containers, core, but all four import `ets-base-dsh` (transitively effect-backed); `ets-hook-dsh-core/Source/Library.ts:25-31` claims `Stream/Gate` and a typed Update, while its `Source/Stream/` is empty and the gate lives in `ets-base-dsh` | remove the unused direct dependency; correct the core claim | Packaging and docs |
| Governance trio races on one write | per-target version guard + continuation, no lock; the loser fails `FS_STALE_VERSION` silently | per-target serialization in `Continue` + a `superseded` line | Additive |
| Two prepend listeners claim to be outermost | normalize-file and ccr both register `tools/post-execute` with `prepend: true` | document the actual order and fix the claim | Docs and test |

Not a fix: the ccr store's `journalPath` already implements a durable
JSONL journal; `""` (memory-only) is deliberate. Defaulting it on writes
tool-output payloads to disk and changes the retrieval contract, so it is
a privacy and retention decision, not an audit fix.

### 4.2 What not to change

- **The ledger strings.** They are the contract. Renaming
  `hook-dsh-package-pinner`'s exported name (`hook-dsh-pinner-package`) or
  ccr's `"ccr"` would rewrite every logger prefix and break the smokes.
- **The published names.** Fifteen Classic and sixteen EffectTS names at
  0.0.1; merging or splitting packages is a release decision.
- **The two-group rule.** Never mix Classic and EffectTS in one dependency
  graph; the Update envelopes differ.
- **The silence invariant.** A pass that changed nothing writes no line.

## 5. The placement findings

| Finding | Evidence | Move | Risk |
| --- | --- | --- | --- |
| `Site/` in `.gitignore` unversions `Documentation/Archive/Site/` | `git check-ignore -v` matches `.gitignore:31`; 0 tracked, 3 docs (1,145 lines) on disk | change to `/Site/`; re-add the three documents | Low - **P0, data loss** |
| 1,708 build artifacts tracked | 816 + 838 + 54 under `Target/` | add `Target/` to the ignores; untrack | Medium - verify publish runs `prepublishOnly` |
| `Documentation/Handoff/` is empty | only `.DS_Store`; 62 inbound references | restore from history or retarget the references | Medium - links break either way |
| `Site/docs/` is stale TypeDoc | `@playform/starter - v0.0.1`; no generator | delete | Low |
| Generated SVGs tracked beside sources | 319 `.mmd` + 319 `.svg` | untrack the SVGs, generate at build | Low-medium |
| `Test/model-comparison-v4-v41` is a scaffold | 9 md, missing `ROUND-1-SUMMARY.md`, contradicts the Test README | move to `Researches/` or Archive | Low |
| Fixture evidence is ignored | `*.log` ignores the two `governor.log` files | track them or stop calling them evidence | Low |
| `SITE-IMPROVEMENTS.md` was an unregistered orphan | no frontmatter, 0 refs | superseded by `Plans/SITE-POLISH-BREAKDOWN.md`; delete the report | Low |
| `.gitmodules.draft` is wrong | 25 entries vs 31 dirs, three wrong paths | delete or correct | Low |
| `NPM.yml` count/path drift | "All 25 packages"; cites a moved plan | 31 packages; fix the path | Low |
| Governor guides duplicate package docs | `Governor-README.md` 372 vs package 368; `Governor-SCHEME.md` 485 vs 358, diverged | keep the package docs canonical; the guides become pointers | Low |
| README/CHANGELOG counts | twelve, 733/746, 21 pages | fifteen, the derived per-folder totals, 24+404 | Low |

## 6. The execution order

### P0 - data loss and broken promises (do first)

1. `.gitignore` `Site/` -> `/Site/`, re-add the three archived site docs.
2. The site P0 fixes (see `Plans/SITE-POLISH-BREAKDOWN.md`): the npm
   claim, the missing model, the partial-green banner, the pinner notes,
   the real count bugs, the hero CTA, the absolutes, the generated profile,
   the verify step, the ccr prefix.
3. The ccr hardcoded path: default `~/.dsh/ccr.log`; add the default-path
   assertion. Today the ledger is silently never written off-nikola.

### P1 - safety and the small commonalities

4. The smoke manifest and the "ALL PASS" scope: derive the totals from the
   per-folder counts; state what ran and what skipped.
5. Ledger-path alignment (schema to patch/README) plus the default-path
   assertion; version bump.
6. Gate observability (`verboseGate`, additive).
7. The factory service type and the 26 mirrors.
8. One build entry point; config defaults in one home.
9. The overpass hash drift-guard (zero behavior change).

### P2 - placement and functionality

10. The overpass move to core/base (versioned, canary, republish; see
    section 3.1 and the red-team risk).
11. Untrack `Target/`; the `Handoff` resolution; `Site/docs/` removal.
12. Dry-run, backup/restore, per-scope overrides (additive).
13. Per-target serialization in `Continue` (additive; concurrency review).
14. `live-containers` internal module split.

### P3 - the strategic decisions

15. The EffectTS decision (A/B/C/D) - the user's call, after P0-P2.
16. `live-containers` package split, if the internal split proves the
    boundaries.

## 7. What this analysis does not claim

- It does not claim the smokes pass; they were not run.
- It does not claim the proposed moves are free; every behavioral change
  needs a baseline decision and a smoke run.
- It does not decide the EffectTS fate; that is a product decision, and
  the document only prices the options.

## 8. Open decisions for the user

1. **The npm claim**: publish the three missing packages, or mark them
   publish-pending?
2. **`normalizeToolArguments`**: the patch is documented opt-in, not drift.
   Keep the shipped example (and fix the site Configurator and the docs),
   or move the example out of the shipped patches?
3. **EffectTS**: keep the fork (A), generate the twins (B), thin adapter
   (C), or delete (D)?
4. **Behavioral fixes**: approve the ccr path and the ledger-path
   alignment (a version bump) as a batch, or one at a time?
5. **Placement**: approve the `Target/` untracking and the `Handoff`
   restore?
6. **The overpass move**: approve the versioned refactor after the
   drift-guard, or defer it indefinitely and keep the copies?
