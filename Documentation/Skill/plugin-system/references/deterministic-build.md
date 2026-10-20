# The Deterministic Build

> Source: SKILL.md, Section 2 (The bundle anatomy), rule 4.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every bundle builds through `prepublishOnly` with exactly this chain:

```
Build 'Source/**/*.ts' \
	--ESBuild Configuration/ESBuild.ts \
	--TypeScript Configuration/TypeScript.noemit.json \
&& tsc -p tsconfig.json \
&& tsc-alias -f -p tsconfig.json
```

- A red `tsc` FAILS the build - always, no override.
- Consumers type-check against the factory's BUILT Target: rebuild the
  factory FIRST.
- The recursive workspace builds run SERIALIZED
  (`--workspace-concurrency=1`): concurrent builds race the shared
  Targets.

## Why: The Full Philosophy

1. **The three stages each own one job.** `Build ... --ESBuild
   ... --TypeScript ...` emits the bundle through esbuild while
   honoring the type-check config; `tsc -p tsconfig.json` is the
   package's own full type-check; `tsc-alias -f -p tsconfig.json`
   rewrites the `@Function/*`-style aliases to relative output paths
   (see ./references/bundle-anatomy.md). The `&&` chain is the
   determinism: any red stage stops the chain, so a broken package
   never publishes a half-built Target.
2. **A red tsc fails the build - no waivers.** The temptation is to
   ship with `// @ts-ignore` or a skipped check "for now". Every such
   waiver converts a compile-time error into a runtime mystery for the
   next reader. The family pays for correctness here, where it is
   cheapest.
3. **Consumers bind to the factory's BUILT Target.** The factory
   exposes its types and surfaces through its build output; module
   packages type-check against that output, not against the factory's
   Source. Therefore the factory must be rebuilt BEFORE any consumer -
   otherwise consumers check against a stale Target and report errors
   that do not exist (or miss ones that do).
4. **Serialization is not pessimism - it is correctness.** The
   workspace builds share Targets (the factory's Target is consumed by
   the modules). Two concurrent builds can both write the same Target
   mid-read: one consumer type-checks against a half-written Target.
   `--workspace-concurrency=1` makes the shared-resource race
   impossible instead of merely rare.

## Examples

### Good

```
# in the monorepo root, the safe loop:
rebuild the factory (prepublishOnly)
then, serialized:
	pnpm -r --workspace-concurrency=1 run prepublishOnly
```

### Bad

```
pnpm -r run prepublishOnly
	# parallel across packages - consumers race the factory's Target

tsc failing? -> // @ts-ignore and move on
	# the exact waiver the rule forbids
```

## Exceptions

- None for the chain, the fail-on-red rule, or serialization. If a
  build genuinely needs different flags, the change lands in
  `Configuration/` (see ./references/build-configuration.md) so the
  build stays uniform in SHAPE even when parameters differ.

## Failure Modes

- **Parallel workspace builds:** the race reproduces rarely and looks
  like a phantom type error or a missing export in a consumer. Cost:
  hours lost to a bug that is not in anyone's code. The fix is
  always: rerun serialized.
- **Consumers type-checking before the factory rebuild:** stale-Target
  errors that "fix themselves" after a rebuild - a sign the order was
  wrong, not that the code changed.
- **Waiving a red tsc:** the error ships, and the next build or the
  next consumer's type-check turns it into a runtime failure far from
  its cause.
- **Skipping tsc-alias:** the built Target keeps `@Function/*`
  specifiers that Node cannot resolve. Cost: module-not-found at
  load, only in the built form.

## Arbiters

- The `prepublishOnly` chain itself: red stages stop the publish.
- Review: diffs that alter build order, add concurrency, or waive
  type errors are rejected by default.
- The smokes load the REAL built Targets, so a broken or stale build
  fails the smoke too (see ./references/smokes-prove-mechanics.md).
