# The Bundle Anatomy

> Source: SKILL.md, Section 2 (The bundle anatomy), rules 1-2.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every bundle's `Source/` is layered exactly the same way:

- `Library.ts` - the plugin entry: `name` / `apply` / `Config` /
  `inject` (see ./references/loader-contract.md).
- `Function/` - the behaviors (the executable logic).
- `Interface/` - the structural types (shapes shared across files).
- `Variable/` - the Config schema + the defaults.

The tsconfig `paths` aliases bind the layers:

```
@Function/*  -> ./Source/Function/*
@Interface/* -> ./Source/Interface/*
@Variable/*  -> ./Source/Variable/*
```

and the build rewrites those aliases to relative output paths
(`tsc-alias` in the deterministic build).

## Why: The Full Philosophy

1. **Uniform anatomy is what makes the family navigable.** "Where is
   the config schema?" has one answer in twelve packages: `Variable/`.
   "Where is the behavior?" one answer: `Function/`. A reader who knows
   one bundle knows all of them; a diff reviewer knows where every
   change must land before opening the file.
2. **The layers encode dependency direction.** `Library.ts` is the
   contract surface; `Function/` holds the logic that the entry wires;
   `Interface/` holds types with NO runtime presence (they must not
   contain behavior); `Variable/` holds the schema, which must be
   constructible at load without pulling in behaviors. When a layer is
   respected, circular imports become impossible by construction.
3. **The aliases are compile-time sugar with a build-time unwind.**
   Source code reads `@Function/x` because absolute-looking imports
   survive refactors; the built `Target/` must contain relative paths
   because that is what Node loads. The build's alias rewrite is the
   documented bridge - which is why hand-written relative paths in
   Source are discouraged: they bypass the convention and make the
   build rewrite a no-op.
4. **`Variable/` owns defaults, not `Function/`.** Defaults are part
   of the schema (the loader fills them at load, see
   ./references/loader-contract.md). Keeping them in `Variable/` means
   the schema is the single source of truth for both validation and
   defaults; scattering defaults into behaviors creates two answers.

## Examples

### Good

```
Source/
	Library.ts                     import { run } from '@Function/run'
	Function/run.ts                import type { Ctx } from '@Interface/ctx'
	Interface/ctx.ts               types only
	Variable/config.ts             Schema.object({...}) with defaults inside
```

### Bad

```
Interface/ctx.ts                 // contains a helper function (behavior)
Function/run.ts                  import { config } from '../../Variable/config'
                                 // hand-written relative path past the alias
Library.ts                       // Config defined inline instead of Variable/
```

## Exceptions

- `Library.ts` may re-export from the layers (it is the entry), but it
  must not contain behavior beyond wiring. A bundle small enough that
  one file would suffice still keeps the four-layer shape - uniformity
  beats minimalism here.

## Failure Modes

- **Types with behavior in `Interface/`:** a "types" file that grew a
  helper. Cost: the structural layer now has a runtime presence and
  can start import cycles with `Function/`.
- **Schema logic in `Function/`:** the Config schema assembled or
  mutated by behavior code. Cost: the loader cannot validate it
  reliably at load; defaults land in two places.
- **Alias/relative mixing:** some imports via `@Function/*`, some via
  `../../`. Cost: the build rewrite covers only part of the graph;
  one broken alias surfaces as a runtime module-not-found only in the
  built Target.

## Arbiters

- `tsc -p tsconfig.json` in the deterministic build fails on type
  layer violations visible to the compiler (see
  ./references/deterministic-build.md).
- The build's alias rewrite is exercised on every build; a missing
  alias mapping fails the built Target load.
- Review: new files are checked against the layer map in review, one
  glance per file.
