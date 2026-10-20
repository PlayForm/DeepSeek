# Smokes Prove Mechanics; the Live Battery Proves Wiring

> Source: SKILL.md, Section 4 (The smokes are the arbiter), rule 2.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The smokes load the REAL built Targets (the fake ctx + the real
factory); they prove the MECHANICS.

The live battery proves the WIRING. The smokes do NOT cover:

- the profile's patch layers (`cordis.patch.yml` - see
  ./references/bundle-activation-and-patches.md),
- the load order,
- the version-guard interplay.

The live findings came from the battery.

## Why: The Full Philosophy

1. **Real Targets, fake ctx - the deliberate split.** The smokes
   import the built Target (the same artifact Node would load), so a
   smoke red means the SHIPPED code is broken, not a test double. But
   the context is fake, deliberately: a fake ctx makes mechanics
   deterministic and fast, and it removes the environment as a
   variable. The trade is explicit: determinism for environment
   fidelity - which the battery repays.
2. **The boundary is a coverage statement, not a rank order.** "The
   smokes prove the mechanics" is not "the smokes are better"; it is
   a map of what each instrument can see. A smoke CANNOT see a patch
   layer replacing a config wholesale, a load-order race, or two
   plugins' version-guard interactions - those exist only in the
   composed live profile.
3. **The battery exists because the live profile taught hard lessons.**
   The live findings - the patch-layer behaviors, the ordering issues,
   the version-guard interplay - were found by running the battery
   against the real profile. That history is the rule's evidence: the
   wiring class of bug is real, recurring, and invisible to smokes.
4. **Green smokes never imply live correctness.** A developer who says
   "smokes pass, so the profile will behave" has crossed the boundary
   the rule draws. Smokes green is necessary, not sufficient; the
   battery closes the gap.

## Examples

### Good

- A transform change: smoke red -> fix in Source -> rebuild ->
  smoke green. Battery not needed for this class.
- A new plugin added to the profile: battery run to prove the patch
  layer, load order, and config interplay - the smoke cannot see
  these.

### Bad

```
"smokes are green, ship it" - for a change touching cordis.patch.yml
	// the exact class the smokes do not cover
```

```
// re-implementing the wiring inside a smoke to "cover" it
	// the smoke now tests its own fake wiring, not the profile's
```

## Exceptions

- None. The division of labor is fixed. If a wiring concern must be
  regression-tested mechanically, the answer is a battery scenario,
  not a smoke fixture pretending to be the profile.

## Failure Modes

- **Coverage overreach in smokes:** adding fixtures that imitate patch
  layers. Cost: false confidence - the fixture's wiring differs from
  the profile's in some unknown way (and risks the vacuously-green
  trap, see ./references/vacuously-green-trap.md).
- **Skipping the battery after wiring changes:** "the unit smokes
  passed". Cost: the wiring bug ships and surfaces as live-profile
  misbehavior hours or weeks later.
- **Debugging mechanics with the battery:** slow, non-deterministic
  loops. Cost: wasted time; the smoke is the mechanics instrument.

## Arbiters

- The smokes: mechanics, per bundle, zero assertion changes (see
  ./references/smoke-arbiter.md).
- The live battery: wiring - patch layers, load order, version-guard
  interplay - run on any change that touches composition.
- Review: diffs touching profile composition require a battery run in
  their checklist.
