# THE PUBLISHED FAMILY (All 25 Packages Live at 0.0.1)

> Source: SKILL.md, section 5 ("THE PUBLISHED FAMILY (all 25 packages live
> at 0.0.1)"). Converted to the canonical skill structure on 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The DSH Family is PUBLISHED: every package listed below exists at version
`0.0.1` under the `@playform` scope. There are two published splits - the
Classic split (`@playform/dsh-*`-named hooks + the plugin) and the EffectTS
split (`@playform/ets-*` - Effect v4 services and layers, built on the
`@playform/ets-base-dsh` base). The 25 names:

- `ets-base-dsh` - the EffectTS plumbing base every ets-* package builds on.
- Classic (12):
  - `hook-dsh-core`
  - `plugin-dsh-factory`
  - `hook-dsh-cargo-governor`, `hook-dsh-package-governor`,
    `hook-dsh-package-pinner`
  - the 7 normalize flavors: `hook-dsh-normalize-dash`,
    `hook-dsh-normalize-quotes`, `hook-dsh-normalize-ellipsis`,
    `hook-dsh-normalize-spaces`, `hook-dsh-normalize-invisible`,
    `hook-dsh-normalize-fullwidth`, `hook-dsh-normalize-file`
- EffectTS (12):
  - `ets-hook-dsh-core`
  - `ets-plugin-dsh-factory`
  - `ets-hook-dsh-cargo-governor`, `ets-hook-dsh-package-governor`,
    `ets-hook-dsh-package-pinner`
  - the 7 normalize flavors: `ets-hook-dsh-normalize-dash`,
    `ets-hook-dsh-normalize-quotes`, `ets-hook-dsh-normalize-ellipsis`,
    `ets-hook-dsh-normalize-spaces`, `ets-hook-dsh-normalize-invisible`,
    `ets-hook-dsh-normalize-fullwidth`, `ets-hook-dsh-normalize-file`

That is 1 base + 12 Classic + 12 EffectTS siblings = 25. Never mix the two
splits in one dependency graph. The authoritative registry document is
`Documentation/Plugins/PLUGIN-FAMILY.md`.

## Why: The Full Philosophy

1. **Publication state changes what "exists" means.** Before publication,
   family packages were local trees; after it, each name is a real, citable,
   installable package at `0.0.1` under `@playform`. Sessions must treat the
   25 names as stable public API surface: references to the family use the
   published names, not internal directory shorthand.
2. **The arithmetic is a verification tool.** 1 base + 12 Classic + 12
   EffectTS = 25. Any enumeration that does not sum to 25 is incomplete or
   has invented a name. The symmetric structure (each Classic hook has an
   ets-* sibling) makes omissions obvious.
3. **Never mix the splits in one dependency graph.** The Classic split and
   the EffectTS split are parallel implementations of the same family. A
   dependency graph that mixes `hook-dsh-*` and `ets-hook-dsh-*` packages
   couples two independent builds, drags both runtimes into one install, and
   creates version conflicts that no single split would have. Each graph
   draws from exactly one split (plus the shared base where applicable).
4. **The base is the EffectTS root.** Every `ets-*` package builds on
   `ets-base-dsh`; it is counted separately because it has no Classic
   sibling - the Classic split's plumbing lives inside its own packages.
5. **The registry document is the arbiter.** Names, versions, and roles are
   recorded in `Documentation/Plugins/PLUGIN-FAMILY.md`. When memory and the
   registry disagree, the registry wins - and the disagreement is itself a
   finding to fix at the source.

## Examples

### Good

- A session writing documentation cites `@playform/hook-dsh-normalize-dash`
  (Classic) or `@playform/ets-hook-dsh-normalize-dash` (EffectTS), each at
  `0.0.1`, and never mixes the two prefixes in one example graph.
- A session verifying family completeness counts 1 + 12 + 12 = 25 and
  cross-checks the names against `Documentation/Plugins/PLUGIN-FAMILY.md`.

### Bad

- A package.json (or an example, or a doc) depending on both
  `@playform/plugin-dsh-factory` and `@playform/ets-plugin-dsh-factory` -
  the two splits mixed in one graph.
- An enumeration listing 24 packages because one normalize flavor was
  forgotten - the arithmetic check (25) catches it.
- Referring to a package as "the dash normalizer" without its published
  name, so readers cannot install or verify it.

## Exceptions

- None documented. The 25-name list, the version (`0.0.1`), and the
  no-mixing rule have no carve-outs. New packages (if any are ever added)
  change the registry document first, then this skill - not the reverse.

## Failure Modes

- Split mixing: a dependency graph or an install combining Classic and
  EffectTS packages; the result is a coupled, conflict-prone graph.
- Count drift: reciting "the family" with a number other than 25, usually
  from forgetting the 7 normalize flavors or the base package.
- Version drift: citing the packages at a version other than `0.0.1`
  without the registry document supporting it.
- Registry divergence: this skill's list and
  `Documentation/Plugins/PLUGIN-FAMILY.md` disagreeing after an update
  touched only one of them.

## Arbiters

- `Documentation/Plugins/PLUGIN-FAMILY.md` is the authoritative registry
  document for names, versions, and roles.
- The arithmetic check: 1 base + 12 Classic + 12 EffectTS = 25; any list
  must sum to it.
- The published registry (npm under the `@playform` scope) shows each name
  at `0.0.1`; publication claims are verifiable against it.
