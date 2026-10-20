# The Build Configuration

> Source: SKILL.md, Section 2 (The bundle anatomy), rule 3.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Each bundle's `Configuration/` directory holds:

- `ESBuild.ts` - the esbuild configuration - plus its hand-kept
  `ESBuild.js` twin, which the build loader swaps to.
- `TypeScript.noemit.json` - the type-check-only TypeScript config.

The build WIPES and REGENERATES `Target/` on every run: `Target/` is
build output only, never hand-edited, never committed as a source of
truth.

## Why: The Full Philosophy

1. **The `.ts`/`.js` twin is deliberate redundancy.** The build
   toolchain loads the esbuild config before TypeScript compilation is
   available, so a compiled `.js` form of the config must exist. It is
   HAND-KEPT - meaning a change to `ESBuild.ts` must be mirrored into
   `ESBuild.js` in the same diff. The alternative (generating it) would
   make the build depend on itself; the twin keeps the bootstrap
   cycle-free at the cost of one manual sync, which the review step
   owns.
2. **`noemit` separates type-checking from emitting.** The
   deterministic build emits through esbuild (fast, bundling) and
   type-checks through `tsc` with `TypeScript.noemit.json` (complete,
   strict, no output). Splitting the roles means neither step
   compromises the other: esbuild never relaxes types, and tsc never
   decides what files ship.
3. **`Target/` wiped, never patched.** Any hand-edit inside `Target/`
   would be destroyed by the next build - so the convention removes
   the possibility early: the directory is disposable by definition.
   Debugging happens in `Source/`, the only durable text.

## Examples

### Good

```
Configuration/
	ESBuild.ts              // edited
	ESBuild.js              // mirrored in the same diff
	TypeScript.noemit.json  // strict flags, noEmit: true
```

### Bad

```
ESBuild.ts changed, ESBuild.js left stale   // build loader runs old config
hand-edit inside Target/lib.js              // wiped on next build
adding emit options to TypeScript.noemit.json  // role confusion
```

## Exceptions

- None for the twin rule: a stale `ESBuild.js` is a build bug by
  definition. If a configuration change is genuinely incompatible
  between the two forms, the diff must state so and update both anyway.

## Failure Modes

- **The stale twin:** `ESBuild.ts` updated without `ESBuild.js`. Cost:
  the build runs with the OLD configuration while the source of truth
  says otherwise - a divergence invisible until behavior differs.
- **Editing `Target/` to test a theory:** the edit vanishes on the
  next build and the theory appears "disproven". Cost: wasted
  debugging sessions.
- **Letting the twin drift "temporarily":** the twin has no smoke of
  its own; only review catches drift. Cost: exactly the kind of
  slow-burn bug the manual exists to prevent.

## Arbiters

- Review: any diff touching `ESBuild.ts` is checked for the `ESBuild.js`
  mirror in the same diff.
- The deterministic build itself: it consumes `Configuration/` on
  every run (see ./references/deterministic-build.md), so a broken
  configuration fails loudly there.
- Hygiene: `Target/` contents are never referenced in diffs, reviews,
  or debugging notes as if they were source.
