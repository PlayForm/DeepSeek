# The Smokes Are the Arbiter

> Source: SKILL.md, Section 4 (The smokes are the arbiter), rule 1.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every change to a bundle's Source must pass the bundle's smoke with
ZERO assertion changes.

The two documented exceptions:

1. identity-driven strings change BY DESIGN - the module's own
   identity (see ./references/identity-and-ledger-ownership.md);
2. additive coverage for new features.

## Why: The Full Philosophy

1. **The smokes judge, they do not advise.** "Arbiter" means the smoke
   result decides: red is red, regardless of how reasonable the change
   felt. This removes the negotiation step where a developer argues
   with a test; the only arguments the family recognizes are the two
   exceptions above, both of which must be explicit in the diff.
2. **ZERO assertion changes makes the smoke a regression contract.** A
   smoke whose expectations can be edited to match new behavior is not
   a test - it is a mirror. The rule keeps the expectations FIXED so
   that behavior changes must either (a) preserve the observable
   contract or (b) invoke a named exception. Everything else is a
   regression by definition.
3. **The exceptions are narrow on purpose.** Identity-driven string
   changes are allowed because the strings ARE the identity - a
   renamed module's ledger lines SHOULD change, and only in the ways
   the rename dictates. Additive coverage is allowed because new
   features need new assertions - but additive means ADDING, never
   weakening or rewording existing ones.
4. **Per-bundle scope keeps judgment local.** A module's change runs
   ITS bundle's smoke; the factory's smoke covers the machinery. A
   module diff does not get to green itself against the factory's
   smoke.

## Examples

### Good

- Diff changes a transform's internals; the smoke runs unchanged and
  stays green. Merged.
- Diff adds a new govern step; the smoke gains NEW assertions for it
  (additive) and all previous assertions hold unchanged. Merged.
- Diff renames the module BY DESIGN; the identity-driven strings
  change, and the diff states exactly that exception. Merged after
  review.

### Bad

- Diff changes behavior, smoke goes red, developer rewrites the old
  assertions to match. NOT merged - that is weakening, not additive.
- Diff changes formatting "cosmetically" in ledger output. NOT merged
  - see ./references/ledger-strings-byte-identical.md.

## Exceptions

- **Identity-driven strings, by design:** the module's own identity
  change, stated explicitly in the diff, limited to what the identity
  change requires.
- **Additive coverage:** new assertions for new features. Old
  assertions keep their text, their order, and their meaning.

## Failure Modes

- **Assertion-editing to green:** the most corrosive failure. Cost:
  the smoke suite silently stops testing the contract; regressions
  land undetected.
- **"Cosmetic" string drift:** formatting tweaks treated as free.
  Cost: the byte-identical contract dies piecemeal.
- **Wrong-bundle green:** running the factory's smoke for a module
  change and declaring victory. Cost: the module's own contract
  surface was never exercised.

## Arbiters

- The bundle's smoke itself, run on every Source change.
- Review: any diff touching smoke expectations is checked against the
  two exceptions, line by line.
- The ledger strings: byte-identity assertions inside the smokes (see
  ./references/ledger-strings-byte-identical.md).
