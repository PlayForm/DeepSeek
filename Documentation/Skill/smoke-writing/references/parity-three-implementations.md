# The Parity Discipline (The Three Implementations)

> Source: SKILL.md, section "The parity discipline", rules 1 and 2.
> Mandate: the canonical skill-structure conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The family has three implementations, and their smoke suites stand in
a fixed relationship:

1. The **Boilerplate** suites are the REFERENCE - they hold the
   original counts, the baseline every other suite is measured
   against.
2. The **Classic** suites are the SAME assertion sets as the
   reference.
3. The **EffectTS** suites are the same assertion sets PLUS their
   additive coverage - the Stream pipeline, the typed envelope, the
   parallel marker - the checks only that implementation's features
   need.

THE PARITY RULE: an EffectTS suite passes with the Classic's
assertions byte-identical - the ledger strings + the behaviors are the
contract ACROSS the implementations.

## Why: The Full Philosophy

1. **Why parity at all.** The three implementations are three ways of
   building the same family contract. If their suites diverged, a
   green Classic and a green EffectTS would mean two different things,
   and a bug fixed in one could silently persist in the other. Parity
   makes one green verdict meaningful for all three.
2. **Why the Boilerplate is the reference.** It came first; its
   counts are the original record. Reference-ness is historical fact,
   not a quality judgment: the reference defines WHAT is asserted and
   HOW MANY; the others mirror it.
3. **Why byte-identical across implementations.** The ledger strings
   are the shared contract (see
   ./references/byte-identical-ledger-assertions.md). If the
   EffectTS's strings drifted from the Classic's, the "same" suite
   would be asserting two different contracts, and cross-implementation
   refactors (change once, expect all three to stay green) would be
   impossible. Byte identity is what makes the contract portable.
4. **Why the EffectTS additions are additive, not divergent.** The
   Stream pipeline, the typed envelope, and the parallel marker are
   EffectTS-only features, so their checks EXCEED the Classic's set -
   they never replace or reshape it. The suite is the Classic's set,
   superset-form. This keeps the parity check mechanical: the Classic
   subset must be findable, byte-identical, inside the EffectTS suite.

## Examples

### Good

- A refactor of a shared module: the Classic suite's assertions are
  copied into the EffectTS suite unchanged, the EffectTS additions sit
  after them, and all three suites pass with the same ledger strings.
- A count comparison across a handoff: Boilerplate N, Classic N,
  EffectTS N + k (k = the additive coverage), every run.

### Bad

- An EffectTS-only fix that adjusts a shared ledger string in the
  EffectTS suite only - the cross-implementation contract just broke.
- Reordering or rewording the shared assertions in one implementation
  "for readability" - the mechanical parity check dies.
- Dropping a Classic assertion in EffectTS because the typed path
  "makes it redundant" - that is weakening, not parity.

## Exceptions

- The EffectTS additive coverage (Stream pipeline, typed envelope,
  parallel marker) is the documented superset delta. It grows only
  additively, per ./references/additive-coverage-rule.md.
- Identity-driven string changes, when they happen, land in ALL
  implementations in the same decision - parity is updated together,
  never per-suite.

## Failure Modes

- Silent parity drift: one implementation's string or behavior check
  edited alone; suites stay individually green while the contract
  forks.
- Reference rot: the Boilerplate's counts stop being the comparison
  point and each suite's count becomes self-referential - drift
  becomes undetectable.
- Superset erosion: over time, EffectTS-only edits creep into the
  shared subset (a renamed variable here, a merged assert there) until
  "byte-identical subset" is no longer true and no one noticed when.

## Arbiters

- The cross-suite diff: the Classic assertion set is verifiably
  present, byte-identical, in the EffectTS suite; this is checkable
  mechanically and checked on every suite change.
- The count ledger: Boilerplate counts are compared against both
  siblings on every handoff (N / N / N + k); any deviation needs a
  recorded cause.
- The suites themselves: a cross-implementation refactor must pass
  all three with the same strings - one green without its siblings is
  not a landing.
