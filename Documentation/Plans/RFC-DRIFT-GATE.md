---
title: The drift gate - generate the site's fallback constants instead of hand-syncing them
category: Plans
kind: queued-plan
date: 2026-10-27
status: planned
registry: Documentation/Plans/RFC-DRIFT-GATE.md
index: Documentation/INDEX.md
statuses:
    - name: the problem (fallback constants maintained by hand while the tree moves)
      state: resolved
      evidence: section 1
    - name: why this beat the shortlist (the smoke aggregate, publication, cost consumers)
      state: resolved
      evidence: section 2
    - name: the three mechanisms and the absent-root consequence
      state: resolved
      evidence: section 3 - deletion is rejected by the Site repository's own build
    - name: the recommendation (a generator at the root, strict when the root is present)
      state: resolved
      evidence: section 4
    - name: the migration sequence
      state: resolved
      evidence: section 5
    - name: the acceptance checks
      state: resolved
      evidence: section 6
    - name: the implementation
      state: open
      evidence: section 7 - this RFC proposes; it does not build
---

# The drift gate - generate the site's fallback constants instead of hand-syncing them

> The site renders every dynamic figure from the tree at build time, and serves a hand-maintained
> block of fallback constants when a live source is missing. The tree has moved since the fallbacks
> were last verified (2026-10-25, per the block's own header), and the drift guard's latest run
> reports 745 checks with 139 failures. This RFC proposes generating the derivable fallbacks from
> the tree with a Maintain script instead of hand-syncing them, and failing loud only where the tree
> is present.

## 1. The problem

The fallback block is `Site/Source/Library/Content.ts` lines 96-279: one object literal of about 184
lines whose values were "the previously verified values (2026-10-25)" (the comment at line 53).
`Site/Scripts/Drift-Guard.mjs` (1469 lines) re-derives every one of those figures from the primary
sources and compares; its last run printed 745 checks and 139 failures.

The drift is not hypothetical. Comparing the fallback constants against the tree as it stands:

| Drift class          | Fallback says (file, line)                                               | The tree says (how measured)                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| The release version  | `Release: "0.2.0"` (Content.ts line 122)                                 | all 106 `package.json` files carry `"version": "0.3.0"` (a version-line grep over both trees returned 58 Classic + 48 EffectTS matches)           |
| The package census   | `Packages: 102, PackagesClassic: 54` (lines 130-131)                     | 58 Classic + 48 EffectTS = 106 package directories (the same manifest glob)                                                                       |
| The smoke totals     | `Classic: 3500, EffectTS: 3173` (lines 115-118)                          | the per-folder README sums the guard re-derives; the block lags them                                                                              |
| The twin-less roster | the guard's `NoTwin` list of seven (Drift-Guard.mjs lines 392-400)       | 58 - 47 = 11 Classic packages without an ETS twin, because four new packages have none                                                            |
| The storage domains  | `Storage: { Domains: 14 }` (Content.ts line 148)                         | a fifteenth name, `lesson`, from the new `plugin-dsh-lesson-review` (`Source/Variable/Config.ts` line 23)                                         |
| The package catalog  | 87 tuples (lines 166-254, "39 Classic plus every EffectTS package (48)") | 106 entries; four Classic packages are absent: `plugin-dsh-cost`, `plugin-dsh-cost-analysis`, `hook-dsh-lesson-nudge`, `plugin-dsh-lesson-review` |

The four new packages are the mechanism behind half of the table: they are absent from the catalog
fallback, they have no ETS twins, and one of them declares a new storage domain. The version bump to
0.3.0 fails the guard's per-package version loop (Drift-Guard.mjs lines 976-989), which is one check
per package, 106 in total, plus the mode check at lines 1029-1035.

Two structural facts make this a gate rather than a chore. First, the same derivation is written
twice: the guard re-derives it to check, and a human re-derives it to fix, and the human copy is the
one that lags. Second, the fallbacks are not decoration: `Site/Source/Library/Live.ts` finds the
monorepo root by walking up until it sees the `Classic/packages` marker and returns `""` when it
does not (lines 93-104), at which point every reader degrades to null and Content.ts serves the
fallback block for every figure. The Site directory is its own repository (MARKETPLACE.md line 57;
the release runbook commits it separately, RELEASE-0.2.0.md lines 299-303), so in the site's own CI
the root is always absent and the fallback block is always the rendered truth.

## 2. Why this beat the shortlist

The brief offered four candidates: the drift gate, the smoke aggregate, publication, and the cost
family's next step. The ranking, and the reason each RFC below states it again:

1. **The drift gate (this RFC).** 139 failing checks today, every one of them a claim a public site
   renders, and the fix is currently manual work whose next instance is already scheduled by the
   next package addition.
2. **The smoke aggregate.** A real silent-failure class, but a runner-side check closes it with zero
   new files; see RFC-SMOKE-AGGREGATE.md.
3. **Publication.** The machinery exists, is armed, and was already executed once at 0.2.0; the
   residual is a staged re-run plus a record reconciliation; see RFC-PUBLICATION.md.
4. **The cost family's next step.** Rejected as an RFC this round: the cost plan's own frontmatter
   records "the live install in the profile" as open (COST-TRACK-PLUGIN.md, the bundle row written
   but the package not installed), so there is no production ledger for a scheduled report, a
   dashboard or an alert to consume, and the privacy profile of a committed export makes the
   dashboard candidate the riskiest of the four.

## 3. The three mechanisms, and what the absent root does to them

### A. Hand-sync the fallbacks once - insufficient

Fix the 139 failures by editing the constants to the values the guard derives. The tree goes green
and the site renders true figures - until the next package lands, at which point the version loop,
the census checks, the catalog tuples and the twin roster all re-open. Between syncs the block is
quietly wrong in the one place it is authoritative (the site repository's CI, where nothing live
contradicts it). It is also a 184-line hand edit of numbers a script derives in milliseconds, and
one transposed digit is a false claim on a public page. This is the mechanism that produced the
current 139, and repeating it buys the same failure again.

### B. A generator that writes the fallbacks from the tree - viable

A Maintain script re-derives every derivable fallback exactly the way the guard does and rewrites
the corresponding fields of the `Fallback` object in Content.ts. The root repository is the only
place the tree exists, so the generator runs there, and the derived constants are committed into the
Site repository like any other release artifact - the pattern `pnpm marketplace` already
establishes, writing both copies in one run (MARKETPLACE.md sections 3-4).

The consequence for the absent root is the point: the site keeps building with the monorepo missing
because the constants are in the tree, but they are now generated, so they are as fresh as the last
root-side regeneration, and `--check` makes staleness a CI failure instead of a slow drift. The
guard stays as the independent verifier; the generator is the writer. The residual hand-maintained
set is exactly the values with no live source, which Content.ts already lists separately (lines
58-77): `NewLibraries: 2`, `Pack.Layers: 3`, the `Migration` facts, the `History` era facts, the
`Decisions` index, `Sprite.Badges: 11`, `Steps.Count: 4`, the copyright line, `Roles: 2`, and the
`Groups` page groupings. The generator does not touch them.

### C. Delete the fallbacks and fail the build when a live source is missing - rejected as stated

Deleting the block makes the site fail to build in its own repository, because there the root is
absent on every run and every live read is null by design (Live.ts lines 74-76: "the build NEVER
fails on a moved or renamed source" is the current law). That inverts the one requirement the brief
states for the site: it must still build when the monorepo root is absent. What survives from this
option is its strict half, and it belongs in the recommendation: when the root IS present, a null
read must be a failure, because a moved or renamed source silently serving a stale fallback is
precisely the drift the guard exists to catch, and the fallback constants hide it.

## 4. The recommendation

**Mechanism B, plus the strict mode from C.** One generator, `Maintain/Generate/Content-Fallbacks/`
following the marketplace generator's shape, with two commands in the root `package.json`:

- `pnpm fallbacks` - re-derive and rewrite the derivable fields of the `Fallback` object.
- `pnpm fallbacks:check` - regenerate and diff; exit 1 when the committed block is stale.

The derivation functions move into a shared module that both the generator and the guard import, so
the two cannot disagree about what the tree says; the check remains a comparison against the tree,
not against the generator. The strict mode is a guard change, not a build change: when `FindRoot()`
returns a real root, any null live read for a figure the guard derives is a failure; when the root
is absent, the fallbacks serve and the guard's own run is what validates them.

## 5. The migration sequence

| Step | Change                                                                                          | Note                                                                                    |
| ---- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1    | Hand-sync once to the tree's current values (the table in section 1 is the work list)           | the shortest path to a green guard; the block is the input to the generator's first run |
| 2    | Extract the guard's derivations into the shared module; the guard must stay green byte-for-byte | no behavioral change; the extraction is mechanical                                      |
| 3    | Build the generator and run it; its output must diff empty against the hand-synced block        | the proof that the generator derives the same numbers the human derived                 |
| 4    | Add `fallbacks:check` to CI and the strict mode to the guard                                    | the drift becomes a CI failure at PR time instead of a 139-check pile at release time   |
| 5    | Record the generator in the release runbook beside `pnpm marketplace`                           | the release step writes both derived artifacts in one pass                              |

## 6. The acceptance checks

1. With the tree present, `pnpm run Drift` (in Site/) exits 0 after a regeneration.
2. `pnpm fallbacks:check` exits 0 on a clean tree and exits 1 after a planted change (a new package
   directory) without regeneration.
3. In the Site repository alone, with no `Classic/` or `EffectTS/` beside it, the site build still
   exits 0 and serves the committed constants - the absent-root requirement holds.
4. With the root present, a renamed or moved source (a deleted `SCHEME.md` the guard reads) fails
   the guard's strict mode instead of silently serving a stale fallback.
5. A regeneration diff touches only derivable fields; the values Content.ts lists as having no live
   source (lines 58-77) are byte-identical after every run.
6. The four new packages appear in the generated catalog, and the guard's twin-less roster check
   sees eleven names, matching the tree.

## 7. What this RFC does not do

It does not implement the generator, move any derivation, or change a single rendered figure; the
hand-sync of step 1 is described, not performed. It does not merge the Site repository into the root
repository, change the Live.ts degradation contract for the absent root, or extend the guard beyond
the strict mode. It does not touch the smoke runner (RFC-SMOKE-AGGREGATE.md), the publication record
(RFC-PUBLICATION.md), or the cost family.
