---
name: smoke-writing
description: THE discipline for the family's smoke suites (the arbiter) - the fake-ctx + real-factory harness pattern, the byte-identical ledger assertions, the additive coverage for new features, the vacuously-green trap, and the smoke/live fidelity gap. Load before writing, extending, or debugging any smoke suite in the DeepSeek Harness Plugin Family.
whenToUse: Mandatory before creating or modifying ANY smoke suite for the family (the twelve packages under Boilerplate/, Classic/, EffectTS/ smokes dirs). If you are about to add an assertion without the harness pattern, or "fix" a failing smoke by weakening an assertion, STOP and read this manual first.
---

# Smoke Writing - Operating Manual

The smokes are the arbiter: after every change, the suites must pass.
This manual states the conventions directly.

## 1. The harness pattern

1. Every suite loads the REAL built `Target/Library.js` of its bundle
   (and the REAL factory instance where the bundle consumes it) against a
   FAKE ctx: the capture seams (on/emit/effect/get/reflect/fs/waterfall/
   logger) + the `root` seam (`get root() { return Context; }` - the
   fs/observed listeners register on the root) + the `__<name>State`
   probe attachments.
2. The fake fs varies per suite: the capturing fs (the reads/writes/
   intents/observations arrays) vs the real-token fs (the version guards
   exercised with actual tokens - the pinner's suite).
3. The suites run from their smokes dir with the monorepo-relative
   imports (`../packages/<bundle>/Target/...`); the sibling symlinks in
   the bundles' node_modules are NOT pnpm-managed - recreate them after
   installs.

## 2. The assertion contract

1. The ledger strings are asserted BYTE-IDENTICAL (the logger-prefixed
   `<module>: ...` forms + the ledger file's `[ISO] message` forms) -
   they are the contract.
2. The identity-driven strings (the `<module>: ` prefixes, the logFile
   defaults) change ONLY when the module's identity changes (BY DESIGN -
   the mdash → normalize-dash precedent). Every OTHER assertion stays
   byte-identical through every refactor.
3. New features GROW the suites (additive checks) - the existing
   assertions never weaken. The counts are recorded per suite (the
   handoff's baseline).
4. A failing smoke means the change is wrong - never weaken an
   assertion to pass.

## 3. The traps

1. THE VACUOUSLY-GREEN TRAP: a smoke whose fixture wiring is wrong can
   pass checks without exercising the code (the cargo's `boot()` once
   never assigned the listener - checks 1-12 passed vacuously). When a
   smoke "passes but the world is weird", verify the harness wiring
   first.
2. THE SWAPPED/REVERSED ASSERTS: `assert.equal(boolean, string)` and
   count drifts - read the assertion's INTENT before "fixing" the code.
3. THE SMOKE/LIVE FIDELITY GAP: the smokes prove the MECHANICS - the
   LIVE battery proves the WIRING. The smokes do NOT cover: the profile
   + bundle patch layers (the effective config - the patch config
   replaces the entry config wholesale), the load order (the pinner
   activates before the governor at this boot), the version-guard
   interplay across a multi-step fold, the storage-domain open failures
   (the silent-catch era). Every live finding must become a smoke
   regression test where the harness can represent it.

## 4. The parity discipline (the three implementations)

1. The Classic + EffectTS suites are the SAME assertion sets (the
   EffectTS adds its additive coverage: the Stream pipeline, the typed
   envelope, the parallel marker). The Boilerplate's suites are the
   reference (the original counts).
2. The parity rule: an EffectTS suite passes with the Classic's
   assertions byte-identical - the ledger strings + the behaviors are
   the contract across the implementations.
3. The tracing-on mode (FACTORY_SMOKE_TRACING=1) must produce
   byte-identical stdout + ledgers (the hygiene rule) - the spans never
   alter the strings/ordering/timing.