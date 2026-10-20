> Specialized working copy (repo): synced from ~/.dsh/skills/smoke-writing/ on 2026-10-20, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.

---
name: smoke-writing
description: THE discipline for the family's smoke suites (the arbiter) - the fake-ctx + real-factory harness pattern, the byte-identical ledger assertions, the additive coverage for new features, the vacuously-green trap, and the smoke/live fidelity gap. Load before writing, extending, or debugging any smoke suite in the DeepSeek Harness Plugin Family.
whenToUse: Mandatory before creating or modifying ANY smoke suite for the family (the twelve packages under Boilerplate/, Classic/, EffectTS/ smokes dirs). If you are about to add an assertion without the harness pattern, or "fix" a failing smoke by weakening an assertion, STOP and read this manual first.
---

# Smoke Writing - Operating Manual

The smokes are the arbiter: after every change, the suites must pass.
The full philosophy of each rule lives in the references; this file is
the index of pointers.

## 1. The arbiter status

- **The smokes are the arbiter** - see ./references/arbiter-status.md
  After every change the suites must pass; the suites judge the change, never the reverse.

## 2. The harness pattern

1. **Fake ctx + real built library** - see ./references/harness-pattern-fake-ctx-real-factory.md
   Every suite loads the REAL `Target/Library.js` (and the REAL factory where consumed) against a FAKE ctx: the capture seams (on/emit/effect/get/reflect/fs/waterfall/logger), the `root` seam (`get root() { return Context; }`), and the `__<name>State` probes.
2. **The fake fs varies per suite** - see ./references/fake-fs-variants.md
   The capturing fs (the reads/writes/intents/observations arrays) vs the real-token fs (the version guards exercised with actual tokens - the pinner's suite).
3. **Run from the smokes dir, monorepo-relative imports, sibling symlinks** - see ./references/smokes-dir-imports-symlinks.md
   The suites run from their smokes dir with `../packages/<bundle>/Target/...` imports; the bundles' node_modules sibling symlinks are NOT pnpm-managed - recreate them after installs.

## 3. The assertion contract

1. **Byte-identical ledger assertions** - see ./references/byte-identical-ledger-assertions.md
   The logger-prefixed `<module>: ...` forms and the ledger file's `[ISO] message` forms are asserted byte-identical - they are the contract.
2. **Identity-driven strings are the only exception** - see ./references/byte-identical-ledger-assertions.md
   The `<module>: ` prefixes and the logFile defaults change ONLY when the module's identity changes (BY DESIGN - the mdash -> normalize-dash precedent); every OTHER assertion stays byte-identical through every refactor.
3. **Additive coverage** - see ./references/additive-coverage-rule.md
   New features GROW the suites; existing assertions never weaken; the counts are recorded per suite (the handoff's baseline).
4. **A failing smoke means the change is wrong** - see ./references/failing-smoke-means-change-is-wrong.md
   Never weaken an assertion to pass; read the failure's intent and fix the change.

## 4. The traps

1. **The vacuously-green trap** - see ./references/vacuously-green-trap.md
   Wrong fixture wiring can pass checks without exercising the code (the cargo's `boot()` once never assigned the listener - checks 1-12 passed vacuously); when a smoke "passes but the world is weird", verify the harness wiring first.
2. **Swapped/reversed asserts and count drifts** - see ./references/swapped-reversed-asserts.md
   `assert.equal(boolean, string)` and drifting counts - read the assertion's INTENT before "fixing" the code.
3. **The smoke/live fidelity gap** - see ./references/smoke-live-fidelity-gap.md
   The smokes prove the MECHANICS, the LIVE battery proves the WIRING; not covered: the profile + bundle patch layers (the patch config replaces the entry config wholesale), the load order (the pinner activates before the governor at this boot), the version-guard interplay across a multi-step fold, the storage-domain open failures (the silent-catch era); every live finding must become a smoke regression test where the harness can represent it.

## 5. The parity discipline (the three implementations)

1. **The three suites and the reference** - see ./references/parity-three-implementations.md
   Classic + EffectTS are the SAME assertion sets (EffectTS adds its additive coverage: the Stream pipeline, the typed envelope, the parallel marker); the Boilerplate's suites are the reference (the original counts).
2. **The parity rule** - see ./references/parity-three-implementations.md
   An EffectTS suite passes with the Classic's assertions byte-identical - the ledger strings + the behaviors are the contract across the implementations.
3. **The tracing hygiene rule** - see ./references/tracing-hygiene-rule.md
   Tracing-on mode (FACTORY_SMOKE_TRACING=1) must produce byte-identical stdout + ledgers - the spans never alter the strings/ordering/timing.
