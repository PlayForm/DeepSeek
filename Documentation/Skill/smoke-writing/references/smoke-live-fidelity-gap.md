# The Smoke/Live Fidelity Gap

> Source: SKILL.md, section "The traps", rule 3. Mandate: the
> canonical skill-structure conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The smokes prove the MECHANICS; the LIVE battery proves the WIRING.
The two are complementary evidence, and neither substitutes for the
other. The smokes do NOT cover:

1. the profile + bundle patch layers - the effective config: the patch
   config REPLACES the entry config wholesale;
2. the load order - e.g. the pinner activates BEFORE the governor at
   this boot;
3. the version-guard interplay across a multi-step fold;
4. the storage-domain open failures (the silent-catch era).

THE CONVERSION DUTY: every live finding must become a smoke regression
test where the harness can represent it.

## Why: The Full Philosophy

1. **Why the gap is structural, not accidental.** The harness pattern
   loads real code against a fake ctx - so it proves the code's
   mechanics (what the code does when called a certain way). But the
   fake ctx, by design, cannot reproduce the composition layers: which
   config survives the patch, which order bundles activate in, how
   guards interleave across a fold. Those are WIRING facts - facts
   about how the parts are connected - and only the LIVE battery can
   observe them.
2. **Why the four items are called out.** Each is a documented live
   finding the smokes could not have caught:
   - patch layers: a patch that replaces the entry config wholesale
     can silently drop every entry-level setting; the suites, fed a
     fixed config, never see the replacement.
   - load order: activation sequence (pinner before governor at this
     boot) is decided by the composition, outside any single bundle's
     suite.
   - version-guard interplay across a multi-step fold: each guard
     passes in isolation; their interaction across sequential steps
     is a wiring property.
   - storage-domain open failures (the silent-catch era): errors
     swallowed by a catch are invisible to a suite that never opens a
     real store in that configuration.
3. **Why green smokes must never be read as "live is fine".** The gap
   means the suites' green verdict is scoped: mechanics verified,
   wiring not addressed. Announcing live-readiness from smoke-green
   alone is the exact overclaim this trap forbids.
4. **Why the conversion duty closes the loop.** The gap cannot be
   eliminated (the harness cannot represent the whole live world), but
   each discovered instance can be CONVERTED: once live reveals a
   wiring fact, a smoke is added that represents it at the harness
   level - so the same mechanics-level regression can never recur
   undetected. The gap shrinks finding by finding; unconverted
   findings let the same live failure be rediscovered forever.

## Examples

### Good

- Live shows the patch config dropped a setting -> a smoke is added
  that asserts the module's behavior under the post-patch effective
  config (as representable in the harness) - the finding becomes a
  regression test.
- Live shows the pinner running before the governor -> the suites
  gain checks that their respective seam interactions are
  order-tolerant, documented in the handoff alongside the live note.

### Bad

- "Smokes are green, ship it" right after a composition (patch/load
  order) change - the gap's items are exactly what changed.
- Live finding recorded in the handoff only - the next session
  rediscovered it live because no smoke was added.
- Claiming the fidelity gap means live findings "can't be tested" -
  the duty is to represent them where the harness CAN, not to skip.

## Exceptions

- The four documented items are the known, standing holes - they are
  listed so sessions actively cover them with LIVE checks rather than
  assuming smoke coverage. New items join this list as live finds them.
- Genuinely unrepresentable findings (pure environment facts) are
  documented in the handoff as live-only checks - the exception is the
  documented inability, never an undocumented skip.

## Failure Modes

- The double-green illusion: smoke green + no live run = nothing was
  actually verified about wiring.
- The forgotten conversion: a live finding is fixed in code but never
  converted; the next refactor reintroduces it under green smokes.
- Scope creep in reverse: trying to make the smokes simulate the
  whole live world - the effort destabilizes the suites and breaks
  byte-identity, instead of respecting the division of labor.

## Arbiters

- The handoff: every live run's findings are listed with their
  conversion status (converted to smoke / live-only documented).
- The suites: newly converted findings appear as added checks, and
  the counts grow (see ./references/additive-coverage-rule.md).
- Review of composition changes: patch or load-order changes trigger
  the live battery explicitly - smoke-green is not accepted as cover.
