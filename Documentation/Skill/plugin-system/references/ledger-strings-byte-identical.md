# The Ledger Strings Are the Contract - Byte-Identical Everywhere

> Source: SKILL.md, Section 4 (The smokes are the arbiter), rule 4.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The ledger strings are the contract: byte-identical everywhere. Rename
ONLY the mechanics, never the strings.

## Why: The Full Philosophy

1. **The strings are the family's public interface to history.** Every
   ledger line is an observable commitment: a record that tools,
   batteries, and humans parse. The byte-identical rule means a line
   written today parses identically to a line written a year ago -
   which is what makes the ledgers a usable history instead of a pile
   of format migrations.
2. **Byte-identical, not "semantically equivalent".** Whitespace,
   casing, separators, and word choice are part of the contract. A
   "cosmetic" change breaks every downstream parser that matches on
   the exact form, even when a human sees no difference. The rule
   removes the judgment call: there is no cosmetic tier for ledger
   strings.
3. **Rename the mechanics, never the strings - the asymmetry is the
   point.** Refactors are welcome to rename functions, files,
   variables - the internal vocabulary. The strings are NOT internal
   vocabulary; they are the emitted surface. Keeping the asymmetry
   crisp gives refactors a bright line: if the change alters output
   bytes, it is a contract change and needs the by-design exception
   (see ./references/smoke-arbiter.md), not a refactor.
4. **Ownership makes enforcement local.** The strings are each
   module's own (see ./references/identity-and-ledger-ownership.md),
   so each module's smoke asserts its own strings byte-identically,
   and the factory's smoke never reformats them (see
   ./references/module-leaves-never-absorbed.md).

## Examples

### Good

```
// a refactor that renames mechanics only:
function appendLedgerRecord(...)   // was: writeLedgerLine(...)
	// output string: byte-identical -> smoke stays green without
	// touching a single assertion
```

```
// the smoke's assertion style:
assert.strictEqual(renderedLine, EXPECTED_BYTES)
	// exact bytes, not a regex, not a normalized comparison
```

### Bad

```
log(`${module}: ${op}`)     // was: `${module} :: ${op}`
	// "just a separator tweak" - a contract break

log(formatLedger(module, op))  // where formatLedber lives in the factory
	// ownership inverted; one change re-words every module
```

## Exceptions

- **Identity-driven string change, by design:** the module's own
  identity change (a deliberate rename) alters its strings, limited
  to what the rename dictates (see
  ./references/identity-and-ledger-ownership.md). This is the ONLY
  sanctioned way strings change, and it must be explicit in the diff.

## Failure Modes

- **The cosmetic drift:** separators, spacing, or casing "improved".
  Cost: downstream parsers and byte-identity smokes go red across the
  family; history becomes format-fragmented.
- **Normalizing comparisons in smokes:** asserting with trim/lowercase/
  regex "to reduce brittleness". Cost: the smoke stops guarding bytes,
  which is its entire job for strings; drift accumulates invisibly.
- **Factory-side formatting:** shared code that assembles module
  strings. Cost: one wording change re-words every module's contract
  at once (the ownership inversion this rule and the leaf rule both
  forbid).

## Arbiters

- The module smokes: byte-identical assertions on every ledger string,
  run on every Source change (see ./references/smoke-arbiter.md).
- Review: any diff whose output bytes change must either revert or
  invoke the by-design identity exception explicitly.
- The EffectTS variant: its strings must be byte-identical to the
  direct variant's (see ./references/effectts-variant.md), which
  cross-checks both implementations against one expectation set.
