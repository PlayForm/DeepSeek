# The Family Overview - Twelve Packages, One Contract

> Source: SKILL.md, the opening summary line. Mandate: the skill's own
> standing law, restated at conversion (2026-10-20).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The DeepSeek Harness Plugin Family is ONE contract implemented by twelve
packages. Every package - the factory (@playform/plugin-dsh-factory)
and every hook-dsh-* module - compiles against, loads through, and is
judged by the same set of conventions: the loader contract, the bundle
anatomy, the deterministic build, the smoke arbiter, and the
ledger-string form. This manual states those conventions directly - it
does not deliberate. Where a question has an answer in this family, the
answer is the convention, not an opinion.

## Why: The Full Philosophy

1. **One family, one dialect.** A plugin family that shares a factory
   shares its failure surface: if two packages disagree about what a
   bundle is or when a build fails, the disagreement surfaces as a
   runtime bug in the live profile, not as a style debate. The contract
   exists so the twelve packages behave as one program.
2. **The factory is the center of gravity.** The packages are not
   peers: the factory owns the shared machinery (ledger, journal, write
   executor, govern fold, gate, continuation, State builder) and every
   module leaf plugs into it. Anything the factory defines - the loader
   surface, the config validation, the govern channel - binds the
   leaves, never the reverse.
3. **Conventions stated, not argued.** The family has already paid for
   its lessons (returned values killing event delivery, concurrent
   workspace builds racing shared Targets, smokes passing while the
   world is weird). The conventions encode those payments. Reopening
   them without new evidence re-spends the cost.
4. **The three-tier source layout.** The family lives in three places
   that must stay distinct in the reader's head:
   - `~/.dsh` - the LIVE profile. Never modified by monorepo
     development. The family runs here.
   - `Boilerplate/` - the reference copy of the source. The
     authoritative text of the contract as implemented.
   - `Classic/` and `EffectTS/` - the release variants that DERIVE from
     Boilerplate. They may reorganize mechanics; they may not diverge
     from the contract (see ./references/effectts-variant.md).

## Examples

### Good

- Reading the factory's built Target to learn the exact loader surface
  before touching a module leaf.
- Treating a Boilerplate pattern as the answer ("how does the family
  name ledger files?") instead of inventing a variant.

### Bad

- "This module is special, so it can skip the bundle anatomy." Nothing
  in the family is special; only the factory is central.
- Editing `~/.dsh` directly to prototype a change. The live profile is
  a deployment target, not a workspace.

## Exceptions

- None. The "one contract" statement has no carve-out. The EffectTS
  variant changes the INTERNAL mechanics (Effect v4 instead of the
  direct shell) but explicitly keeps the SAME contract - which proves
  the contract is exception-free by design.

## Failure Modes

- **Local exception creep:** a developer grants their package a private
  deviation ("just this once"), and the next reader inherits it as an
  undocumented dialect. Cost: the family's predictability dies one
  package at a time.
- **Confusing the three tiers:** editing Boilerplate expecting a live
  effect, or editing `~/.dsh` expecting a durable one. Cost: work is
  lost or the live profile is corrupted.
- **Deliberating instead of reading:** the manual says the conventions
  are stated directly; re-deriving them per session wastes the session
  and risks divergence. Cost: drift and duplicated reasoning.

## Arbiters

- The smoke suites: every change to a bundle's Source must pass its
  bundle's smoke with ZERO assertion changes (see
  ./references/smoke-arbiter.md).
- The live battery: proves the WIRING the smokes do not cover (see
  ./references/smokes-prove-mechanics.md).
- The ledger strings: the byte-identical contract surface (see
  ./references/ledger-strings-byte-identical.md).
- Review: any patch that introduces a family-wide new convention must
  state it in this manual's references, not in a package's private
  comments.
