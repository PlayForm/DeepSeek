---
title: Smoke-Suite Restructure - the durable specification
category: Archive/Smoke-Restructure
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Smoke-Restructure/SMOKE-SUITE-RESTRUCTURE-NOTE.md
index: Documentation/INDEX.md
statuses:
    - name: the per-test folder structure (one folder per test, Source/Test/<name>/)
      state: implemented
      evidence: the full restructure landed; see the blueprint's record
    - name: the full TypeScript rewrite (Classic + EffectTS)
      state: implemented
      evidence: all suites converted; the legacy .mjs retired
    - name: the two-step compile (Source first, Test second)
      state: implemented
      evidence: the blueprint's shape, in every package
    - name: the aggregate runner (the vacuously-green guard)
      state: implemented
      evidence: all 207 smoke suites passed - node Maintain/Run-Smokes.mjs
    - name: the separate ESBuild pre-compile step
      state: implemented
      evidence: per package; the Test build regenerates Target/Test
    - name: the npm exclusion (tests never publish)
      state: implemented
      evidence: npm pack shows zero Test paths; the files-array negation added
---

# Smoke-Suite Restructure - NOTE FOR A FUTURE AGENT (2026-10-19)

> Status: **NOTED, NOT IMPLEMENTED.** This is the durable specification for a future restructuring
> task. The user dictated it on 2026-10-19; a subsequent agent implements it, using the two-step
> compilation reference below.

## 1. The goal

Restructure the DSH plugin family's smoke tests into a per-test, per-plugin, self-describing,
TypeScript-native layout, compiled in a separate ESBuild step, run one-by-one or aggregated, and
never published to npm.

## 2. The structure (user-mandated)

1. **Break down the smoke tests**: from the current single `.mjs` suite per plugin into **one test
   per folder**:
    - `EachPlugin/Source/Test/<test-name>/` - one folder per test, containing:
        - **the test file** - a _singular file, singular test_ with a **deeply nested hierarchy** of
          assertions (the nested describe/it-style tree encodes the scenario);
        - **`README.md`** - next to the test, in the same folder, **carefully describing what the
          Test is testing for** (the intent, the scenario, the fixtures, the expected ledger
          strings, the edge cases).
2. **Location**: keep each plugin's tests in `EachPlugin/Source/Test/` (both the Classic
   `hook-dsh-*` tree and the EffectTS `ets-hook-dsh-*` tree).
3. **Runnable one-by-one AND together**: each test file runs standalone (`node <compiled-test>`),
   and the **main Smoke file** (the family's aggregate runner - today `Maintain/Run-Smokes.mjs`
   driving the `Classic/smokes/*.mjs` + `EffectTS/smokes/*.mjs` suites) imports and runs them
   together, preserving the current suite totals as the arbiter baseline.
4. **Future transformability**: the structure must be easily transformable later into a full-on test
   suite (e.g. vitest - the harness repo ships `vitest.config.ts` variants; keep each test folder's
   shape compatible with that migration).

## 3. TypeScript rewrite (user-mandated)

- **Fully rewrite the tests to TypeScript** to benefit from the types and everything else in the
  Tool Suite (`@playform/build` - the same tooling that compiles the plugin Source with
  `Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts`).
- **Both editions**: Classic (`hook-dsh-*`) AND EffectTS (`ets-hook-dsh-*`) mirrors, preserving the
  parity discipline (the ETS tests byte-equal to the Classic tests under the tree-identity import
  substitutions).

## 4. Packaging exclusions (user-mandated)

- **`.npmignore`**: exclude the `Target/Test` output AND the `Source/Test` sources so test files are
  **never published** with the bundle packages (the family `files` field already ships `Target` +
  `cordis.patch.yml` + `README.md` + `SCHEME.md` - the Test artifacts must not ride along).

## 5. Two-step compilation (user-mandated)

- The `EachPlugin/Source/Test` folder is **pre-compiled on a separate step, again with ESBuild, just
  like the Configuration files**:
    1. `Build 'Source/Test/**/*.ts' --ESBuild <Test ESBuild config>` -> the compiled tests (e.g.
       `Target/Test/`);
    2. `Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts` -> the plugin's `Target/`
       (unchanged);
    3. `Run Test` (the compiled tests) -> `Run Source` (the existing smokes) separately.
- **`prepublishOnly.sh`** per plugin (and a `Run.sh` --Watch dev variant), mirroring the two-step
  compilation pattern the user pointed to:
  **`/Users/nikola/Developer/Application/CodeEditorLand/Land/Element`** - the elements there do
  exactly this two-step compilation (e.g. **`Output/Source/prepublishOnly.sh`** +
  **`Output/Source/Run.sh`** with `Build "Source/**/*.{ts,json}" --ESBuild Source/ESBuild/Output.ts`
  style steps; `Worker`, `Wind`, `Cocoon` also carry `prepublishOnly.sh` + `Run.sh`). The
  implementing agent MUST study those scripts first.

## 6. Current-state context (for the implementer)

- Today: one `.mjs` suite per plugin in `Classic/smokes/` + `EffectTS/smokes/` (e.g. `ccr-smoke.mjs`
  146 PASS, `normalize-dash-smoke.mjs` 184 PASS, `factory-smoke.mjs` 35 checks) + the aggregate
  `Maintain/Run-Smokes.mjs` ("All 41 smoke suites passed" as of 2026-10-19). The Boilerplate tree is
  archived at `/Volumes/CORSAIR/Archive/Application/PlayForm/Boilerplate` - do not reference it.
- The smoke harness pattern: fake ctx + REAL built `Target/Library.js` + the REAL factory;
  byte-identical ledger-string assertions; additive-only growth; the vacuously-green trap; the
  smoke/live fidelity gap (the live battery proves wiring). All of this transfers into the per-test
  folders.
- The granular-normalization feature added live-volatile-flip smokes (fake `loader/volatile-update`
  dispatches) - those are among the tests to split.

## 7. Acceptance criteria (for the future agent)

- Every plugin has `Source/Test/<name>/` folders with `README.md` + TS test files; both trees in
  parity.
- `prepublishOnly.sh` performs Test -> Source two-step; `Run.sh` --Watch dev.
- Main Smoke file aggregates everything; total suite counts >= the current baseline with ZERO
  assertion weakening (byte-identical ledger strings).
- `.npmignore` excludes Test artifacts; a packed-install check proves the tarball ships no Test
  files.
- Full arbiter green; docs (README/SCHEME per plugin) updated.
