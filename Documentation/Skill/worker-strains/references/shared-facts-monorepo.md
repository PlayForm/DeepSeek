# The Shared Facts the Strains Must Not Contradict

> Source: SKILL.md, section 4. Canonical skill structure: the mandate
> of 2026-10-20. This file carries the full fact set; SKILL.md only
> points here.

## The Rule

The DeepSeek monorepo batch's truth is fixed and shared. Every strain,
every spec, every plan, every report must agree with these facts. A
contradiction is an error even when the work is otherwise good.

## The Facts (exact)

### Test suites and totals

- The smoke totals: Classic 733 / EffectTS 746 - the suites print them.
- The per-suite pairs (as printed by the suites):
  - core 14/17
  - factory 34/41
  - governor 78/81
  - pinner 32
  - cargo 62
  - dash 132
  - five flavors 62
  - file 71

### The factory surface

- 19 callable methods.
- SCHEME references: sect. 2.7 Write+GuardedWrite, sect. 2.16
  UpdateKey, sect. 2.17 RegisterGovern, sect. 2.18 Govern. (The
  original text wrote these with the section-sign character before
  each number: SCHEME 2.7, 2.16, 2.17, 2.18.)

### Releases, pins, tools

- The releases are at 0.0.1.
- The effect pin is 4.0.2.
- The ncuBin default is "ncu" (PATH-resolved).
- The releases are licensed CC0-1.0.

### Baselines and records

- The Boilerplate + the live ~/.dsh are the internal baselines;
  personal paths stay - the pending gitignore/submodule decision.
- Documentation/Plans/ + Reports/ are the process records.

### Conventions

- Tabs: tabWidth 4, printWidth 100; YAML stays spaces.
- The typography laws: Inter + IBM Plex Mono, the 13px floor, no
  JetBrains Mono.
- The Harness Blue tokens + zero elevation.
- Quoted ledger strings stay byte-exact.
- Flag-don't-fix content conflicts.

## Why: The Full Philosophy

1. **A shared fact set is what makes parallel lanes coherent.** Many
   agents writing specs and reports without a common truth drift into
   contradiction: one lane plans against 746 total, another against
   733. The fact set is the contract that keeps the lanes' outputs
   mergeable.
2. **The facts are printed truth, not folklore.** They come from the
   suites' printed totals and the repo's own records, not from
   memory. When a fact changes (a suite grows), the change updates
   this file and the process record together - it is never silently
   different per agent.
3. **Contradiction is the failure, not disagreement.** An agent that
   measures something different from the record must flag the
   conflict in its report, not resolve it locally by picking a
   number.

## Examples

### Good

- A spec states: "the smokes must pass at the current totals - Classic
  733 / EffectTS 746, as printed by the suites."
- A plan cites "factory surface: 19 callable methods (SCHEME sect.
  2.7, 2.16, 2.17, 2.18)" and builds on exactly those.
- A lane measures a different total -> it flags the conflict in its
  report instead of asserting its own number.

### Bad

- A report claiming "all 700+ tests pass" when the suites print
  specific totals.
- A plan that invents a 20th factory method because it "would fit
  nicely".
- Introducing JetBrains Mono "as a nice alternative" - the typography
  law excludes it.
- "Fixing" a content conflict by overwriting the other lane's text -
  conflicts are flagged, not fixed.

## Exceptions

- None per fact. When the truth changes, this file and the process
  record are updated together; the old value is never kept "just in
  case" in an agent's local belief.

## Failure Modes

- **Stale facts:** an agent plans against an old total; the arbiter
  fails at a number nobody expected.
- **Local invention:** a lane rounds or approximates a fact; the
  reports diverge.
- **Silent conflict-fixing:** a lane edits another lane's conflicting
  content instead of flagging it (violates flag-don't-fix).

## Arbiters

- Reports and plans that cite numbers match this fact set, or explain
  a measured delta with evidence.
- The suites' printed totals are the primary source; this file defers
  to them when they change.
