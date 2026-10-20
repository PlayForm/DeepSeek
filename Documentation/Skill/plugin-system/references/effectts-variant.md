# The EffectTS Variant - Same Contract Behind Effect v4

> Source: SKILL.md, Section 3 (The family architecture), rule 5.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The EffectTS variant keeps the SAME contract behind Effect v4. What
that means, precisely:

- the cordis shell stays (the loader contract is untouched - see
  ./references/loader-contract.md);
- the Effect services/layers carry the internals;
- the tracing is present with a no-op default;
- the ledger strings are BYTE-IDENTICAL to the direct variant's.

Everything observable from outside the package - the plugin surface,
the config, the ledger strings, the govern channel - is the same
contract. Only the internal execution model is Effect.

## Why: The Full Philosophy

1. **The variant exists to prove the contract is implementation-free.**
   If the same observable contract can be delivered through a
   different execution model (Effect v4 services and layers instead
   of direct calls), the contract was genuinely about WHAT the family
   does, not HOW one implementation runs it. That is why the
   byte-identical strings requirement is non-negotiable for the
   variant: the strings are the observable proof.
2. **Effect layers replace construction, not ownership.** The
   machinery (write executor, journal, ledger Append) is still
   factory-owned conceptually; the variant re-hosts it as Effect
   services with layers providing them. This is the one sanctioned
   re-implementation in the family (see
   ./references/factory-owns-machinery.md) - sanctioned because it
   keeps the contract, unlike leaf-side forking which does not.
3. **Tracing with a no-op default keeps the dependency honest.** The
   variant ships tracing capability, but with no-op as the default so
   the live profile does not pay tracing costs it did not ask for.
   The default-off choice is part of the contract: enabling tracing
   is a config decision, never a side effect of using the variant.
4. **Byte-identical strings make the variants interchangeable.** A
   consumer (a smoke, a battery, a human reading logs) must not be
   able to tell which implementation produced a ledger line. That is
   what allows swapping the variant in the live profile without
   renegotiating anything downstream.

## Examples

### Good

```
// the variant's shell - unchanged contract:
export default definePlugin({
	name: 'hook-dsh-govern',        // same identity rules
	apply,                          // returns nothing
	Config,                         // same schema surface
	inject: ['dsh.factory', 'fs'],  // same service list
})
	// internals: Effect.gen with Layer-based services
	// ledger output: byte-identical strings
```

### Bad

```
// reformatting ledger strings "for the variant":
log(`${module} :: ${op}`)          // different spacing/formatting
	// breaks interchangeability - the contract violation
// or:
tracing: always-on                 // cost imposed on non-askers
```

## Exceptions

- The internal mechanics may differ freely (Effect runtimes, fibers,
  layers). This is the rule's own point: mechanics are free, the
  contract is not. Renaming or reformatting anything observable is
  NOT covered by this exception.

## Failure Modes

- **String "improvements" in the variant:** a rewrite that touches
  ledger formatting. Cost: the variants stop being interchangeable
  and every byte-identity check goes red.
- **Contract drift by refactor:** an Effect idiomatic rewrite that
  changes the config surface or the inject list. Cost: the loader and
  the profile see a different plugin than the direct variant ships.
- **Always-on tracing:** a "helpful" default. Cost: the live profile
  pays overhead silently, and the no-op-default contract is broken.

## Arbiters

- The variant's smoke: it asserts the ledger strings byte-identically
  against the SAME expectations as the direct variant (see
  ./references/ledger-strings-byte-identical.md).
- The loader contract's own arbiters apply unchanged (see
  ./references/loader-contract.md).
- Review: a variant diff is asked one question first - "is anything
  observable different?"
