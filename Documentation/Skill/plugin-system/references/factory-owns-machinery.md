# The Factory Owns the Shared Machinery

> Source: SKILL.md, Section 3 (The family architecture), rule 1.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The FACTORY (@playform/plugin-dsh-factory) owns the shared machinery.
The enumerated owners:

1. **The ledger** - the Append path: one machinery for writing ledger
   records, owned once.
2. **The storage journal** (Journal) - the v2 per-record domain, with
   the 3-stage routing.
3. **The write executor** (Write) - the ONE shared write path: the
   fresh-stat version guard, the P4 fence, the Stash, the root-emit.
4. **The direct-govern fold** (Govern + the RegisterGovern steps).
5. **The gate.**
6. **The continuation** (Continue/Refresh).
7. **The State builder.**
8. **The wire/attach.**

Every module leaf consumes these; no leaf re-implements any of them.

## Why: The Full Philosophy

1. **One shared path per dangerous operation.** Writes, appends, and
   governance are exactly the operations where two implementations
   disagree fatally (lost updates, double appends, skipped gates).
   The write executor being THE one shared path means the version
   guard, the P4 fence, the Stash, and the root-emit are exercised by
   every writer in the family - one code path, one set of smokes, one
   place to fix a race.
2. **Machinery vs leaves is the family's core distinction.** Anything
   EVERY module needs identically is machinery and lives in the
   factory. Anything a module does DIFFERENTLY from its siblings is a
   leaf concern and stays in the module (see
   ./references/module-leaves-never-absorbed.md). The enumerated list
   above is the boundary made concrete.
3. **The v2 journal and 3-stage routing are factory-domain.** The
   per-record storage domain is a cross-module substrate; a leaf that
   grew its own journal variant would fork the storage model. The
   factory owning Journal means storage evolution happens once, with
   all modules along.
4. **Govern is a fold, not a library call.** The direct-govern fold
   (Govern + RegisterGovern steps) is how modules contribute behavior
   INTO the shared write path without owning it (see
   ./references/governance-steps-registration.md). Ownership stays
   with the factory; participation belongs to the modules.

## Examples

### Good

- A module needing an atomic write calls the write executor; it does
  not open a file and check stats itself.
- A new shared capability (say, a retry policy for appends) is proposed
  as factory machinery, not copied into three modules.

### Bad

```
// in a module leaf:
const st = await fs.stat(path)          // hand-rolled "version guard"
if (st.mtimeMs !== known) ...
await fs.appendFile(path, line)         // bypasses the ONE write path
```

## Exceptions

- None for ownership. The factory may DELEGATE execution details
  inward, but a module leaf never takes over a machinery concern.
  The EffectTS variant re-implements the machinery's MECHANICS behind
  Effect v4 while keeping the same contract (see
  ./references/effectts-variant.md) - that is the sanctioned
  re-implementation, owned deliberately, not leaf-side forking.

## Failure Modes

- **Leaf-side re-implementation:** "just a small append, no need for
  the executor." Cost: the write bypasses the version guard and the
  fence; the failure is a lost or interleaved update that reproduces
  rarely and far from the cause.
- **Machinery creep into leaves:** a leaf grows a local cache of
  factory state "for speed". Cost: two copies of the truth; the
  factory's invariants no longer hold.
- **New shared behavior added to ONE module:** the next module copies
  it, drift begins. Cost: N divergent implementations of what should
  be one.

## Arbiters

- The smokes: the factory's smoke covers the machinery; a module's
  smoke covers its leaves against the real factory (see
  ./references/smoke-arbiter.md).
- Review: every diff is asked "is this machinery (factory) or leaf
  (module)?" before merge.
- The write executor's guarantees are tested by the factory smoke, not
  re-tested per module.
