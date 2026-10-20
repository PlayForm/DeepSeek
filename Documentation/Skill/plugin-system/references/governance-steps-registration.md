# Governance Steps Registration (The Direct Fold)

> Source: SKILL.md, Section 3 (The family architecture), rule 3.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The governance modules register their steps with the factory at
`apply` time. The canonical step names: `canonicalize`, `pin`,
`cargo`, `update`.

The raw-write's `govern` selection runs the registered steps through
the direct fold:

- sequential by default;
- the parallel marker is gated on PROVEN disjointness.

## Why: The Full Philosophy

1. **Registration, not inheritance.** A governance module does not
   subclass the factory or hook global events; it registers its steps
   with the factory during `apply`. This keeps the dependency
   direction honest: modules contribute behavior to the factory's
   fold, but the factory owns when and how the fold runs (see
   ./references/factory-owns-machinery.md). It also makes the step
   set discoverable: the registrations in `apply` ARE the module's
   governance surface.
2. **The four canonical names are a contract, not a convention.**
   `canonicalize`, `pin`, `cargo`, `update` are the names the raw
   write's `govern` selection dispatches on and the names the
   references and smokes speak. A fifth step would need a family
   decision; a renamed step breaks dispatch silently.
3. **Sequential by default - the fold is order-sensitive.** The steps
   transform the same write pipeline; their order is part of the
   outcome (canonicalize before pin, and so on). Sequential execution
   is the semantics that reasoning about the write can rely on.
4. **Parallel only on proven disjointness.** The parallel marker is an
   optimization claim: "these steps touch disjoint data, so their
   order does not matter". That claim must be PROVEN (by construction
   - disjoint inputs/outputs - not by tests that pass today), because
   a wrong parallelism claim produces intermittent corruption, the
   worst failure class the family has.

## Examples

### Good

```
apply(ctx) {
	// register the module's steps with the factory's fold:
	govern.register('canonicalize', myCanonicalize)
	govern.register('update', myUpdate)
	// no return value - see ./references/loader-contract.md
}
```

```
// raw-write govern selection (the caller's side):
govern: ['canonicalize', 'update']        // runs the fold, sequential
```

### Bad

```
govern.register('canonicalize ', ...)     // trailing space: dispatch miss
// or:
parallel: true                            // claimed without disjointness proof
```

## Exceptions

- The parallel marker is the one exception to sequential-by-default,
  and it is gated, not free: proven disjointness is the entry ticket.
  An unproven parallel claim is a bug even if tests pass.

## Failure Modes

- **Registration at the wrong lifecycle moment:** registering outside
  `apply` (module scope, a lazy path). Cost: the fold sees the step
  for some writes and not others - order-dependent behavior.
- **Step-name drift:** a locally renamed step that the dispatch no
  longer matches. Cost: the step silently stops running; writes
  succeed while governance is skipped.
- **Optimistic parallelism:** marking steps parallel because their
  current tests never collide. Cost: intermittent state corruption
  under real write patterns - the class of bug the gate and version
  guard exist to prevent (see ./references/deterministic-build.md,
  ./references/smokes-prove-mechanics.md).

## Arbiters

- The smokes: the fold's step set and order are exercised by the
  module smokes against the real factory (see
  ./references/smoke-arbiter.md).
- The ledger: govern-marked events are visible in the ledger strings,
  which are byte-identical asserted (see
  ./references/ledger-strings-byte-identical.md).
- Review: a diff adding a step name or a parallel marker must carry
  its disjointness proof in the description.
