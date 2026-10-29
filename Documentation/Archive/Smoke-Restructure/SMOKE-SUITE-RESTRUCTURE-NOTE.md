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
      evidence: all 207 smoke suites passed - node Maintain/Run/Smokes/Index.mjs
    - name: the separate ESBuild pre-compile step
      state: implemented
      evidence: per package; the Test build regenerates Target/Test
    - name: the npm exclusion (tests never publish)
      state: implemented
      evidence: npm pack shows zero Test paths; the files-array negation added
---

# Smoke-Suite Restructure - NOTE FOR A FUTURE AGENT (2026-10-19)

> Status: **NOTED, NOT IMPLEMENTED.**
>
> This is the durable specification for a future restructuring task.
>
> The user dictated it on 2026-10-19, and a subsequent agent implements it with the two-step
> compilation reference below.

## 1. The goal

Restructure the DSH plugin family's smoke tests into a per-test, per-plugin, self-describing,
TypeScript-native layout.

Compile that layout in a separate ESBuild step, run it one-by-one or aggregated, and never publish
it to npm.

## 2. The structure (user-mandated)

1. **Break down the smoke tests.**

    Move from the current single `.mjs` suite per plugin to **one test per folder**.

    - `EachPlugin/Source/Test/<test-name>/` holds one folder per test, and the folder contains:
        - **the test file** - a _singular file, singular test_ with a **deeply nested hierarchy** of
          assertions, where the nested describe/it-style tree encodes the scenario;
        - **`README.md`** - next to the test, in the same folder, **carefully describing what the
          Test is testing for** (the intent, the scenario, the fixtures, the expected ledger
          strings, the edge cases).

2. **Location.**

    Keep each plugin's tests in `EachPlugin/Source/Test/`, in both the Classic `hook-dsh-*` tree and
    the EffectTS `ets-hook-dsh-*` tree.

3. **Runnable one-by-one AND together.**

    Each test file runs standalone (`node <compiled-test>`).

    The **main Smoke file** (the family's aggregate runner, today `Maintain/Run/Smokes/Index.mjs` driving
    the `Classic/smokes/*.mjs` + `EffectTS/smokes/*.mjs` suites) imports and runs them together, and
    it preserves the current suite totals as the arbiter baseline.

4. **Future transformability.**

    The structure must be easy to transform later into a full-on test suite, such as vitest, where
    the harness repo ships `vitest.config.ts` variants.

    Keep each test folder's shape compatible with that migration.

## 3. TypeScript rewrite (user-mandated)

- **Fully rewrite the tests to TypeScript** to benefit from the types and everything else in the
  Tool Suite (`@playform/build`, the same tooling that compiles the plugin Source with
  `Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts`).

- **Both editions**: Classic (`hook-dsh-*`) AND EffectTS (`ets-hook-dsh-*`) mirrors, preserving the
  parity discipline, where the ETS tests stay byte-equal to the Classic tests under the
  tree-identity import substitutions.

## 4. Packaging exclusions (user-mandated)

- **`.npmignore`**: exclude the `Target/Test` output AND the `Source/Test` sources, so test files
  are **never published** with the bundle packages.

    The family `files` field already ships `Target` + `cordis.patch.yml` + `README.md` +
    `SCHEME.md`, and the Test artifacts must not ride along.

## 5. Two-step compilation (user-mandated)

- The `EachPlugin/Source/Test` folder is **pre-compiled on a separate step, again with ESBuild, just
  like the Configuration files**:

    1. `Build 'Source/Test/**/*.ts' --ESBuild <Test ESBuild config>` -> the compiled tests (e.g.
       `Target/Test/`);
    2. `Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts` -> the plugin's `Target/`
       (unchanged);
    3. `Run Test` (the compiled tests) -> `Run Source` (the existing smokes) separately.

- **`prepublishOnly.sh`** per plugin, plus a `Run.sh` --Watch dev variant, mirrors the two-step
  compilation pattern that the user pointed to:
  **`/Users/nikola/Developer/Application/CodeEditorLand/Land/Element`**.

    The elements there do exactly this two-step compilation, for example
    **`Output/Source/prepublishOnly.sh`** + **`Output/Source/Run.sh`** with
    `Build "Source/**/*.{ts,json}" --ESBuild Source/ESBuild/Output.ts` style steps; `Worker`,
    `Wind`, and `Cocoon` also carry `prepublishOnly.sh` + `Run.sh`.

    The implementing agent MUST study those scripts first.

## 6. Current-state context (for the implementer)

- Today: one `.mjs` suite per plugin in `Classic/smokes/` + `EffectTS/smokes/` (e.g. `ccr-smoke.mjs`
  146 PASS, `normalize-dash-smoke.mjs` 184 PASS, `factory-smoke.mjs` 35 checks) plus the aggregate
  `Maintain/Run/Smokes/Index.mjs` ("All 41 smoke suites passed" as of 2026-10-19).

    The Boilerplate tree is archived at `/Volumes/CORSAIR/Archive/Application/PlayForm/Boilerplate`;
    do not reference it.

- The smoke harness pattern: fake ctx + REAL built `Target/Library.js` + the REAL factory;
  byte-identical ledger-string assertions; additive-only growth; the vacuously-green trap; the
  smoke/live fidelity gap, where the live battery proves wiring.

    All of this transfers into the per-test folders.

- The granular-normalization feature added live-volatile-flip smokes with fake
  `loader/volatile-update` dispatches, and those are among the tests to split.

## 7. Acceptance criteria (for the future agent)

- Every plugin has `Source/Test/<name>/` folders with `README.md` + TS test files, and both trees
  stay in parity.

- `prepublishOnly.sh` performs the Test -> Source two-step, and `Run.sh` provides the --Watch dev
  variant.

- The main Smoke file aggregates everything, and total suite counts stay >= the current baseline
  with ZERO assertion weakening (byte-identical ledger strings).

- `.npmignore` excludes Test artifacts, and a packed-install check proves the tarball ships no Test
  files.

- The full arbiter is green, and the docs (README/SCHEME per plugin) are updated.
