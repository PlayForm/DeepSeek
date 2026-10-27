---
title: The smoke aggregate - the built tree is the roster, and the runner audits it
category: Plans
kind: queued-plan
date: 2026-10-27
status: planned
registry: Documentation/Plans/RFC-SMOKE-AGGREGATE.md
index: Documentation/INDEX.md
statuses:
    - name: the problem (discovery is Target-side only, so an uncompiled suite is never run)
      state: resolved
      evidence: section 1
    - name: why this beat the shortlist (the drift gate, publication, cost consumers)
      state: resolved
      evidence: section 2
    - name: the three mechanisms and the silent-never-run failure mode
      state: resolved
      evidence: section 3
    - name: the recommendation (keep convention discovery, add the Source-versus-Target audit)
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

# The smoke aggregate - the built tree is the roster, and the runner audits it

> Every package's suites are standalone `node Target/Test/<Folder>/Test.js` runs; the family's one
> aggregate runner discovers them by convention, walking both trees for `Target/Test` folders. The
> discovery is correct about everything it can see and silent about the one thing it cannot: a suite
> that exists in `Source/Test` but never compiled into `Target` is never run and nothing says so.
> This RFC proposes keeping the convention as the roster and adding a Source-versus-Target audit
> inside the runner, reusing the reconciliation rules the test-suggester already built.

## 1. The problem

The aggregate runner is `Maintain/Run/Smokes/Index.mjs` (29 lines): `Folders.mjs` enumerates every
directory under `Classic/packages` and `EffectTS/packages`, keeps those with a `Target/Test` tree,
and returns every subdirectory holding a `Test.js` (Folders.mjs lines 4-32); `Run.mjs` spawns each
`Test.js`, reads the expected PASS count from the folder's SOURCE README
(`Source/Test/<Name>/README.md`, section `## Expected count`), and fails on a non-zero exit, a
missing `N PASS - <Name>` line, or a printed count that disagrees with the README (Run.mjs lines
6-10 and 25-38). The 0.2.0 release gate ran it and printed "All 513 smoke suites passed"
(RELEASE-0.2.0.md line 263), over 271 Classic and 242 EffectTS folders.

The failure mode lives in the discovery half. `Folders.mjs` walks `Target/Test` only. A suite
declared in `Source/Test/<Name>/` whose `Test.ts` exists and whose README declares a count, but
whose build never produced `Target/Test/<Name>/Test.js`, is invisible to the runner: it is never
spawned, never counted, and no line of the run mentions it. Nothing inside the smoke run compares
the Source census with the Target census; the only place the two are compared today is the site's
drift guard, whose `ReadSuiteTree` counts the SOURCE README folders (Drift-Guard.mjs lines 264-289)
while the runner counts TARGET folders, and whose comparison runs only when someone runs
`pnpm run Drift` in the site - a different tool, on a different trigger, against different trees.

The vocabulary for the gap already exists and has already been exercised. The test-suggester's
reconciliation names four drifts against "the aggregate runner's roster"
(`EffectTS/packages/ets-hook-dsh-test-suggester/Source/Function/Reconcile.ts` line 104 and its
SCHEME.md table line 55): `no "## Expected count"`, `the README count has no Test.ts`,
`not in the aggregate runner's roster` (the README count with no built `Test.js`), and the stale
graph Test node. Its own reconciliation suite asserts the byte-exact note
`- Target/Test/Epsilon/Test.js - not in the aggregate runner's roster (expected 3, actual 0)`
(Source/Test/Reconciliation/Test.ts lines 135-136). And its `Roster.ts` resolves the same question
this RFC starts from, with the comment "the built tree IS the roster" (Roster.ts lines 1-10): read
the roster from the built tree, not from a hand-maintained list.

The consequence is scoped but real: the release gate can pass at N suites while a package's newest
suite sits unrun in Source, and the per-suite arithmetic the drift guard checks against (the
fallback totals, the per-suite pairs) silently excludes work that exists. The guard's manifest-lag
NOTE (Drift-Guard.mjs lines 367-380) is the same class seen from the other side.

## 2. Why this beat the shortlist

1. **Above the cost family.** The cost plan's frontmatter still records the live install as open, so
   a scheduled report or alert has no production ledger to consume (COST-TRACK-PLUGIN.md, the "live
   install" entry); this RFC guards the 513 suites that already gate every release.
2. **Above publication.** The publication machinery was executed once at 0.2.0 and its runbook is
   written (RELEASE-0.2.0.md); the smoke audit has no runbook, no tool and no check today.
3. **Below the drift gate.** The drift gate is 139 failing checks on a public site; this is a
   missing check on a tool that is otherwise green. Both rank above the other two candidates.

## 3. The three mechanisms

### A. A per-package roster file - rejected

Each package ships a manifest naming its suite folders, which the runner reads instead of walking.
It converts the build's own output into a second hand-maintained list: 106 packages to keep in sync,
and the exact drift class RFC-DRIFT-GATE.md exists to eliminate - a roster that lags the tree and is
checked only when someone remembers. It also duplicates what the test-suggester's reconciliation
already derives per package on demand. Rejected, except as a report format: the audit's output may
render as a per-package list, but nothing hand-maintained may be its input.

### B. A second, monorepo-level runner that walks the packages - redundant as a new tool

The brief's second candidate already exists: `Maintain/Run/Smokes/Index.mjs` is a monorepo-level
runner that walks the packages, and the release gate already treats it as the arbiter
(RELEASE-0.2.0.md line 263). Building a second walker would create two runners and two counts, the
same disagreement the drift guard now reports between manifests and folders. The upgrade is not a
new tool but an audit inside the existing one.

### C. Convention discovery alone - the status quo, and the failure mode

What runs today. Correct for everything compiled, silent for everything that did not compile, and
the only cross-check lives in a different tool with a different trigger. The family grew from 231
checks across five bundles (Content.ts line 262) to 513 suites; the discovery step has scaled with
the tree precisely because it is derived, which is the property worth keeping and the reason the fix
adds an audit rather than a list.

## 4. The recommendation

Keep convention discovery as the single roster - the built tree is the roster, as the
test-suggester's Roster module already states - and add a reconciliation pre-pass to
`Maintain/Run/Smokes/Index.mjs` that runs before the first suite and fails the aggregate on any
drift. The audit walks each package's `Source/Test` tree and asserts, per folder: the README carries
a parseable `## Expected count`; the folder's `Test.ts` exists; the folder's
`Target/Test/<Name>/Test.js` exists (the "not in the aggregate runner's roster" case); and the
folder counts summed per tree are printed and compared with the counts the drift guard re-derives
(271 Classic + 242 EffectTS at this writing). The four reasons and their phrasing come from the
test-suggester's reconciliation table (SCHEME.md line 55), which makes the runner's failure lines
and the suggester's notes the same vocabulary instead of two dialects.

The wiring battery is untouched: `Classic/smokes` and `EffectTS/smokes` run under
`Maintain/Run/Wiring/Index.mjs` and self-skip without `DSH_TEST_SCRATCH` (the runner's header, lines
17-20), and the aggregate's closing line already says so.

## 5. The migration sequence

| Step | Change                                                                                                           | Note                                                                              |
| ---- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1    | Add the reconciliation pre-pass to the aggregate runner, rules and phrasing per the suggester's table            | one new function in `Maintain/Run/Smokes`; no package file changes                |
| 2    | Print the per-tree census (folders, checks) at the end of the run, beside the existing closing line              | makes the runner's counts directly comparable with the drift guard's folder sums  |
| 3    | Run the aggregate; fix whatever the audit names in the current tree                                              | any existing uncompiled suite surfaces here, as a named file list                 |
| 4    | Record the aggregate as the release gate's smoke step in the next runbook, with the audit's line in the evidence | the 0.2.0 runbook's gate table (RELEASE-0.2.0.md section 3a) is the shape to copy |

## 6. The acceptance checks

1. A planted `Source/Test/Ghost/README.md` (with an expected count) and `Test.ts`, with no
   `Target/Test/Ghost/Test.js`, fails the aggregate with the roster line naming the missing file.
2. A planted Target folder whose README count is unparseable still fails the run (the existing
   vacuously-green guard, unchanged).
3. A planted Source folder with a README and no `Test.ts` fails with the suggester's
   `the README count has no Test.ts` reason.
4. On the clean tree the audit is silent, the printed census equals the drift guard's folder sums,
   and the aggregate exits 0 with the same per-suite order as before.
5. Zero new files under any `Classic/packages/*` or `EffectTS/packages/*`: no roster file, no
   manifest, no generated list.
6. The wiring battery still self-skips without `DSH_TEST_SCRATCH` and the aggregate's closing line
   still names that behavior.

## 7. What this RFC does not do

It does not implement the pre-pass or fix any suite it might name. It does not create a per-package
roster file, a per-package aggregate runner, or a second monorepo runner; the existing walker stays
the only runner. It does not change the per-suite standalone invocation
(`node Target/Test/<Name>/Test.js`), the README count contract, the wiring battery, or the
test-suggester package itself - the RFC reuses its rules and does not modify it. It does not touch
the drift guard's checks (RFC-DRIFT-GATE.md owns the strict mode) beyond keeping the two tools'
folder sums equal by construction.
