# Behavior-Identical Refactors: Byte-Identity, Silence, Smokes as the Arbiter

> Source: SKILL.md, Section 2 (Writing style), rule 7.

## The Rule

When atomizing or rewriting, three observable surfaces stay
byte-identical:

1. **Ledger strings** - the exact strings written to governance
   ledgers,
2. **Observable behavior** - every externally visible effect,
3. **The silence invariant** - the plugin writes NOTHING (no log
   output, no warning, no noise) in the normal success path.

The smoke suite is the arbiter: the refactor is done when the existing
smokes pass unchanged, not when the new code "seems to work."

## Why Byte-Identity on Ledger Strings

1. **Ledger strings are a contract, not a log.** The smoke suites
   assert ledger lines byte-for-byte (the fake-ctx + real-factory
   pattern of the family's smoke discipline). Downstream consumers -
   parsers, dashboards, later agents reading the ledger - may match on
   the exact string. A "cosmetic" change to wording breaks every
   consumer simultaneously.
2. **Byte-identity is testable; equivalence is not.** "Same meaning,
   different words" requires a human to judge; "same bytes" requires
   an assertion. The refactor discipline chooses the standard that a
   machine can arbitrate.
3. **The refactor's risk budget.** Atomization already changes file
   layout, imports, and call paths. Keeping the OUTPUT strings
   byte-identical confines the risk to the structure, where the smokes
   can see it.

## The Silence Invariant

A well-behaved plugin says nothing when it succeeds. Output (console
noise, warnings, progress chatter) in the success path:

- pollutes every session that loads the plugin,
- buries real warnings in routine noise,
- violates the family's contract where smokes assert silence.

So the refactor must not ADD output in the success path, and must not
remove output that smokes assert (error paths keep their exact
messages too - the same byte-identity logic applies).

## Why the Smoke Suite Is the Arbiter

1. **It encodes the observable contract.** The smokes assert the
   ledger bytes, the outputs, the silence. If the refactored code
   passes them unchanged, the three surfaces are proven preserved - no
   manual equivalence argument needed.
2. **Unchanged tests are the point.** The refactor must NOT need smoke
   changes. If a refactor requires editing assertions, either the
   behavior changed (violation) or the assertion was over-specified to
   internal structure (a smell to report, not to silently fix during a
   refactor).
3. **Vacuous green is the trap.** Passing smokes prove identity only
   if they still exercise the refactored paths - see the smoke-writing
   skill on the vacuously-green trap (smokes passing because they no
   longer reach the code). A refactor that reroutes a call past the
   fake-ctx hooks can go green while changing nothing observable and
   testing nothing real.

## The Refactor Protocol

```
1. Run the smokes BEFORE any change (baseline green).
2. Atomize/rewrite via the write/edit tool API only.
3. Run the smokes after: identical assertions, identical results.
4. Diff check: no smoke file modified by the refactor.
5. Byte-scan / ledger spot-check if the refactor touched generation of
   ledger strings (see ./references/byte-verify-after-bulk.md for
   the bulk case).
6. Report: files restructured, smokes green unchanged, surfaces
   byte-identical.
```

## Failure Modes

- "Same behavior, cleaner message" - the message is the contract;
  byte-identity means byte-identity.
- Adding helpful logging during a refactor - violates the silence
  invariant; improvements to output belong to a behavior change with
  updated smokes, not to a refactor.
- Fixing a smoke's "outdated" assertion mid-refactor - the refactor
  loses its arbiter exactly when it needs it; report the assertion
  issue separately.
- Rewriting via scripted bulk passes - violates the tool discipline
  (see ./references/never-terminal-content-edits.md) regardless of
  behavior-identity.

## Arbiters

- Smoke suite: green before and after, zero assertion edits in the
  refactor's diff.
- Ledger string diff: byte-identical outputs.
- Silence check: no new output in success paths.
