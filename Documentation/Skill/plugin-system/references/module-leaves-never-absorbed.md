# The Module Leaves Are Never Absorbed

> Source: SKILL.md, Section 3 (The family architecture), rule 2.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The MODULE leaves are NEVER absorbed into the factory. The enumerated
leaves:

1. the transforms,
2. the update engines,
3. the update gates + breaker maps,
4. the ledger STRINGS,
5. the config extensions + docs.

Whatever a module does differently from its siblings stays in the
module. The factory never grows a "generic" version of a leaf.

## Why: The Full Philosophy

1. **Absorption is the factory's death by a thousand knobs.** The
   moment one module's transform becomes "the transform, parameterized
   by config", the factory must carry every module's special cases as
   options. The config grows a mode for each module's difference; the
   machinery becomes a simulator of all leaves at once; every leaf
   change now risks every other leaf. Keeping leaves in the modules
   keeps the factory small and stable.
2. **The leaf set is the family's variation budget.** The five
   enumerated leaf kinds are exactly where modules are ALLOWED to
   differ. A transform difference, an update-engine difference, or a
   different breaker map is a module identity, not a defect to be
   unified. The converse also holds: anything OUTSIDE the leaf set
   that two modules share must be promoted to factory machinery (see
   ./references/factory-owns-machinery.md) - not duplicated.
3. **Ledger strings are leaves because identity is local.** The
   strings are the module's own (see
   ./references/identity-and-ledger-ownership.md); a shared string
   factory would make one module's wording a cross-module change. The
   byte-identical rule (see
   ./references/ledger-strings-byte-identical.md) depends on this
   locality.
4. **Config extensions + docs are leaves because their consumers are
   local.** A module's config surface and its documentation serve that
   module's users; generalizing them couples unrelated configuration
   stories and makes every config change a family-wide review.

## Examples

### Good

- Module A ships its own transform; Module B ships a different one.
  Both call the same write executor - shared machinery, local leaves.
- A second module needs an update engine "almost like" the first's:
  either it keeps its own leaf (variation) or the difference is
  examined and found to be identical - then promotion to the factory
  is discussed, never silent duplication.

### Bad

```
// factory:
function transform(input, { modeA, modeB, modeC, legacyA }) { ... }
	// the factory now simulates three leaves through flags
```

```
// a leaf:
const LEDGER_LINE = factoryFormat('hook-dsh-x', ...)
	// strings borrowed from the factory - ownership inverted
```

## Exceptions

- None. "Never absorbed" has no thresholds: a leaf does not graduate
  into the factory because it appears in two modules. Promotion is a
  deliberate family decision (a new machinery entry with its own
  smoke), made in review, never as a side effect of a feature diff.

## Failure Modes

- **Absorption by parameterization:** modes/flags accumulating in
  factory code to cover leaf differences. Cost: combinatorial
  behavior no smoke fully covers, and every leaf change becomes a
  factory release.
- **Duplication by anti-absorption:** misreading this rule as "copy
  machinery into each module". Cost: N unguarded copies of a write
  path - the opposite failure of
  ./references/factory-owns-machinery.md.
- **String absorption drift:** a "helper" in the factory that formats
  module strings. Cost: one wording change flips every module's
  ledger contract at once.

## Arbiters

- Review: the leaf/machinery question is asked per diff, in both
  directions (is this being absorbed? is this being duplicated?).
- The smokes: each module's smoke covers its own leaves; the factory's
  smoke never grows assertions covering a leaf's behavior (see
  ./references/smoke-arbiter.md).
- The ledger strings: byte-identical assertions live in the module
  smokes only (see ./references/ledger-strings-byte-identical.md).
