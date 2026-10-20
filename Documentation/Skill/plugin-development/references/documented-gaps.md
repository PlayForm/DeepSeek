# Documented Gaps: Known Incompleteness (Don't Over-Document)

> Source: SKILL.md, section 12 "Documented gaps (don't over-document)".
> This file carries the full list and the reasoning; SKILL.md only points
> here.

## The Rule

These gaps in the framework's documentation are KNOWN. When you hit one,
treat it as expected behavior, not as a bug in your plugin - and do not
paper over it with invented rules:

- No-schema config passes through unvalidated (the docs only mandate a
  schema export; they do not promise validation when none is exported).
- `Plugin.Transform` has no worked example.
- Waterfall "Awaited? No" in the primer is confusing: awaiting happens
  through `next()` (see ./references/waterfall.md).
- Cooldowns are not a framework concept for listeners - throttle triggers
  are config-owned write-behind patterns (see
  ./references/performance-pressure.md).

## Why: The Full Philosophy

1. "Don't over-document" is a discipline about epistemic honesty: when the
   source material is incomplete, the skill should record the incompleteness
   rather than invent a plausible-sounding rule and present it as framework
   law. An invented rule eventually hardens into false doctrine.
2. Each gap has a specific practical consequence:
   - No-schema pass-through means a plugin without `Config` gets zero
     validation - the fail-loud guarantee only applies when a schema exists
     (compare ./references/config-contract.md).
   - `Plugin.Transform` lacks an example, so any use of it is uncharted -
     treat it as experimental and verify live.
   - The waterfall "Awaited? No" cell misleads readers into thinking the
     chain never awaits; `next()` is the await mechanism.
   - "Cooldowns" as a listener concept does not exist; throttling is owned
     by config-driven write-behind patterns, not by the event bus.
3. The list also protects reviews: a reviewer should not reject code for
   "violating" a rule that the framework never had.

## Examples

### Good

A plugin author notes in a comment: "No Config schema is exported here by
design; this plugin has no tunables - see the documented gaps."

### Bad

Writing a skill rule claiming "the framework enforces listener cooldowns"
and citing nothing - inventing doctrine to fill a documentation gap.

## Exceptions

- None. Gaps are gaps; if a future framework version documents one of
  these, this file gets updated and the gap removed.

## Failure Modes

- Filling gaps with invented rules that contradict actual framework
  behavior (the over-documentation this section prohibits).
- Hitting a gap and assuming your code is broken - e.g. expecting
  validation of a no-schema config, then "fixing" unrelated code.
- Treating `Plugin.Transform` as supported-with-examples and shipping it
  unverified.

## Arbiters

- This file is the arbiter of what counts as a known gap. A suspected gap
  not listed here must be verified live before being treated as one.
- The live host and the shipped governor plugin are the fallback arbiter
  when documentation is silent.
