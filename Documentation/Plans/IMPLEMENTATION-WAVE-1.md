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
      evidence:
          Classic 1314 / EffectTS 1324; build 24 pages; Drift content checks pass; MECHANICS PASS
          and the wiring-suite note shipped
    - name: the npm publish-pending correction
      state: implemented
      evidence:
          publish-pending on the plugins page, the setup page, the Configurator, and the three
          detail pages
    - name: the EffectTS cleanup (keep the fork, remove dead deps, correct the claim)
      state: implemented
      evidence:
          the four direct effect deps removed; ets-core claim corrected; seven ETS suites at
          147/82/32/62/14/129/280
    - name: the behavioral fixes (ccr path, ledger paths, default-path assertions)
      state: implemented
      evidence:
          both trees' defaults aligned; ccr 147, governor 79/82; the full aggregate 207 folders exit
          0
    - name: the overpass drift-guard, then the versioned move
      state: implemented
      evidence:
          core and base Overpass files; the Classic and ETS delegates; the guard 40/40; the
          aggregate 207 suites exit 0
    - name: the safe renames
      state: implemented
      evidence:
          the voice and vocabulary standard landed in site-authoring; the content terms corrected;
          package names, name exports, and ledger strings stay frozen
---

# Implementation Wave 1

The instruction of the user is "proceed with all of them".

This document records the decisions, the exact scope, and the verification for each workstream.

The "lyrics" (the site copy) and the functionality decisions are owned by high-effort agents, and
the mechanical edits go to low-effort agents.

## The decisions

1. **npm.**

    The three 404 packages (`hook-dsh-ccr`, `hook-dsh-tool-coach`, `hook-dsh-live-containers`) are
    **publish-pending**, the site says so and points to the build-from-source route, and the actual
    publish remains the action of the release owner.

2. **Totals.**

    The per-folder sums are the truth, and the manifests are regenerated to them: Classic **1314**
    and EffectTS **1324** across the fourteen mechanics suites.

    The banner says **MECHANICS PASS**, and a note states that the seven wiring suites are live-only
    and excluded.

3. **EffectTS.**

    Keep the fork for now, remove the four unused direct `effect` dependencies (ccr, tool-coach,
    live-containers, and core), correct the false `Stream/Gate` claim in `ets-lib-dsh-core`, and
    defer the generate, adapt, or delete choice to a release decision.

4. **Behavioral fixes.**

    The ccr default path becomes `~/.dsh/playform/hook-dsh-ccr.log`, the ledger defaults align to
    the patch and README names (`hook-dsh-package-governor.log`, `hook-dsh-package-pinner.log`, and
    `hook-dsh-cargo-governor.log`), and a default-path assertion lands in the relevant smoke.

    These are behavioral and versioned.

5. **Overpass.**

    Land the hash drift-guard first with zero behavior change, and then the versioned move with the
    dash canary per the architecture plan.

6. **Renames.**

    Only safe content terms change, while package names, exported `name` values, ledger strings, and
    config keys are frozen.

## The workstreams

### WS1 - Site totals and the banner (high-effort owner)

- Regenerate the manifest lines in `Classic/smokes/README.md` and `EffectTS/smokes/README.md` to the
  per-folder sums, and fix the stale additive-coverage sentence.
- Update the fallbacks of `Site/Source/Library/Content.ts` to the same values.
- Change the meta strip to `MECHANICS PASS`, and add the wiring-suite note.
- Verify with `cd Site && pnpm prepublishOnly` and `pnpm Drift`, where the count checks must pass
  and the freshness failures are pre-existing.

### WS2 - npm publish-pending (high-effort owner)

- In `plugins.astro` the install rows use the npm form and the three packages are publish-pending,
  so use `Versions.Release`.
- The three detail pages carry a publish-pending note beside the install.
- Verify with a build, where the copy matches the registry state.

### WS3 - EffectTS cleanup (high-effort planner, low editors)

- Remove `"effect"` from the four package.json files, rebuild the four, and run their smokes.
- Correct the claim of `ets-lib-dsh-core/Source/Library.ts` to point at `ets-base-dsh`.
- Verify with the builds and the four suites at their recorded counts.

### WS4 - Behavioral fixes (high-effort planner, low editors)

- Set the ccr path in both trees' `Config.ts` and `cordis.patch.yml` plus the rebuilt Target, and
  update the site references.
- Align the ledger defaults in the three governance packages' `Variable/Config.ts` in both trees,
  the patch rows, the READMEs and SCHEMEs, and the site.
- Add default-path assertions to the relevant smoke folders.
- Verify by rebuilding the affected bundles, running their suites, and confirming that the ledger
  strings are unchanged apart from the default path.

### WS5 - Overpass (high-effort owner)

- First the drift-guard: a script that hashes the duplicated files and fails on divergence, with
  zero behavior change.
- Then the M1 to M9 move from the architecture plan, with the dash canary.

### WS6 - Renames (high-effort owner)

- Content terms only: the plugin, package, hook, and ledger vocabulary of the site, the remaining
  "governor-package" forms, and the stale internal codenames.
- No package name, `name` export, ledger string, or config key changes.

## Verification (every workstream)

- The relevant build exits zero.
- The relevant smokes pass at the recorded counts.
- `pnpm Drift` has no content failures.
- The site build emits 24 pages and the changed strings appear in `Site/Target/`.
- The lane reports READY-TO-COMMIT with the exact file list, and it makes no git mutation.

## Execution notes (recorded while the wave runs)

- The additive EffectTS coverage is **factory +7, governor +3, and core at parity**, so the delta is
  10 and not 13. The final totals after the new default-path assertions are **Classic 1314 and
  EffectTS 1324** (ccr 147, governor 79/82).
- The ETS ledger names are **per-tree** (`ets-hook-dsh-package-governor.log` and the rest), and the
  six patch rows do not change because the wiring suites assert them.
- The ccr path uses the family's `~/.dsh/...` form, the live normalize ledgers already use it, and
  the State and Append path expands it. The scratch boot check remains the proof.
- **Build-contract finding**: the cargo-governor build printed TS2345 and TS2322 brand errors from
  duplicate `@deepseek-ai/dsh-fs` types across the root and package `node_modules`, and it still
  exited 0. The deterministic-build rule says a red `tsc` fails the build, so investigate whether
  the `Build --TypeScript` step propagates the exit code of tsc. This is a separate follow-up and
  not part of the path fix.
