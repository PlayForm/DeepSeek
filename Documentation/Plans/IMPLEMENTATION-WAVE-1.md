---
title: Implementation Wave 1 - the decisions and the workstreams
category: Plans
kind: living-plan
date: 2026-10-20
status: complete
registry: Documentation/Plans/IMPLEMENTATION-WAVE-1.md
index: Documentation/INDEX.md
statuses:
  - name: the decision record (npm, totals, EffectTS, behavioral fixes, overpass, renames)
    state: resolved
    evidence: this document - the user's "proceed with all" instruction
  - name: the site totals and the mechanics-pass banner
    state: implemented
    evidence: Classic 1314 / EffectTS 1324; build 24 pages; Drift content checks pass; MECHANICS PASS and the wiring-suite note shipped
  - name: the npm publish-pending correction
    state: implemented
    evidence: publish-pending on the plugins page, the setup page, the Configurator, and the three detail pages
  - name: the EffectTS cleanup (keep the fork, remove dead deps, correct the claim)
    state: implemented
    evidence: the four direct effect deps removed; ets-core claim corrected; seven ETS suites at 147/82/32/62/14/129/280
  - name: the behavioral fixes (ccr path, ledger paths, default-path assertions)
    state: implemented
    evidence: both trees' defaults aligned; ccr 147, governor 79/82; the full aggregate 207 folders exit 0
  - name: the overpass drift-guard, then the versioned move
    state: implemented
    evidence: core and base Overpass files; the Classic and ETS delegates; the guard 40/40; the aggregate 207 suites exit 0
  - name: the safe renames
    state: implemented
    evidence: the voice and vocabulary standard landed in site-authoring; the content terms corrected; package names, name exports, and ledger strings stay frozen
---

# Implementation Wave 1

The user's instruction is "proceed with all of them". This document records
the decisions, the exact scope, and the verification for each workstream.
The "lyrics" (site copy) and the functionality decisions are owned by
high-effort agents; the mechanical edits go to low-effort agents.

## The decisions

1. **npm**: the three 404 packages (`hook-dsh-ccr`, `hook-dsh-tool-coach`,
   `hook-dsh-live-containers`) are **publish-pending**. The site says so
   and points to the build-from-source route; the actual publish remains
   the release owner's action.
2. **Totals**: the per-folder sums are the truth. The manifests are
   regenerated to them: Classic **1314**, EffectTS **1324** across the
   fourteen mechanics suites. The banner says **MECHANICS PASS**, and a
   note states that the seven wiring suites are live-only and excluded.
3. **EffectTS**: keep the fork for now. Remove the four unused direct
   `effect` dependencies (ccr, tool-coach, live-containers, core), correct
   the false `Stream/Gate` claim in `ets-hook-dsh-core`, and defer the
   generate/adapt/delete choice to a release decision.
4. **Behavioral fixes**: the ccr default path becomes `~/.dsh/ccr.log`;
   the ledger defaults align to the patch/README names
   (`hook-dsh-package-governor.log`, `hook-dsh-package-pinner.log`,
   `hook-dsh-cargo-governor.log`); a default-path assertion lands in the
   relevant smoke. These are behavioral and versioned.
5. **Overpass**: land the hash drift-guard first (zero behavior change),
   then the versioned move with the dash canary per the architecture plan.
6. **Renames**: only safe content terms. Package names, exported `name`
   values, ledger strings, and config keys are frozen.

## The workstreams

### WS1 - Site totals and the banner (high-effort owner)

- Regenerate the manifest lines in `Classic/smokes/README.md` and
  `EffectTS/smokes/README.md` to the per-folder sums; fix the stale
  additive-coverage sentence.
- Update `Site/Source/Library/Content.ts` fallbacks to the same values.
- Change the meta strip to `MECHANICS PASS`; add the wiring-suite note.
- Verify: `cd Site && pnpm prepublishOnly` and `pnpm Drift`; the count
  checks must pass, the freshness failures are pre-existing.

### WS2 - npm publish-pending (high-effort owner)

- `plugins.astro`: the install rows use the npm form; the three packages
  are publish-pending. Use `Versions.Release`.
- The three detail pages: a publish-pending note beside the install.
- Verify: build; the copy matches the registry state.

### WS3 - EffectTS cleanup (high-effort planner, low editors)

- Remove `"effect"` from the four package.json files; rebuild the four;
  run their smokes.
- Correct the `ets-hook-dsh-core/Source/Library.ts` claim to point at
  `ets-base-dsh`.
- Verify: builds and the four suites at their recorded counts.

### WS4 - Behavioral fixes (high-effort planner, low editors)

- ccr path in both trees' `Config.ts` and `cordis.patch.yml`, plus the
  rebuilt Target; update the site references.
- Ledger defaults in the three governance packages' `Variable/Config.ts`
  (both trees), the patch rows, the READMEs/SCHEMEs, and the site.
- Add default-path assertions to the relevant smoke folders.
- Verify: rebuild the affected bundles, run their suites, and confirm the
  ledger strings are unchanged apart from the default path.

### WS5 - Overpass (high-effort owner)

- First the drift-guard: a script that hashes the duplicated files and
  fails on divergence. Zero behavior change.
- Then the M1-M9 move from the architecture plan, with the dash canary.

### WS6 - Renames (high-effort owner)

- Content terms only: the site's plugin/package/hook/ledger vocabulary,
  the remaining "governor-package" forms, and the stale internal codenames.
- No package name, `name` export, ledger string, or config key changes.

## Verification (every workstream)

- The relevant build exits zero.
- The relevant smokes pass at the recorded counts.
- `pnpm Drift` has no content failures.
- The site build emits 24 pages and the changed strings appear in
  `Site/Target/`.
- READY-TO-COMMIT with the exact file list; no git mutations.

## Execution notes (recorded while the wave runs)

- The additive EffectTS coverage is **factory +7, governor +3, core at
  parity**; the delta is 10, not 13. The final totals after the new
  default-path assertions are **Classic 1314 / EffectTS 1324** (ccr 147,
  governor 79/82).
- The ETS ledger names are **per-tree** (`ets-hook-dsh-package-governor.log`
  etc.); the six patch rows do not change because the wiring suites assert
  them.
- The ccr path uses the family's `~/.dsh/...` form; the live normalize
  ledgers already use it, so the State/Append path expands it. The scratch
  boot check remains the proof.
- **Build-contract finding**: the cargo-governor build printed TS2345/
  TS2322 brand errors (duplicate `@deepseek-ai/dsh-fs` types across the
  root and package `node_modules`) and still exited 0. The
  deterministic-build rule says a red `tsc` fails the build. Investigate
  whether the `Build --TypeScript` step propagates tsc's exit code; this
  is a separate follow-up, not part of the path fix.
