# Classic - the DeepSeek Harness Plugin Family for PlayForm

This tree is the CLASSIC release of the PlayForm plugin family for DeepSeek Harness.

It holds twelve TypeScript packages in `packages/`, and every one of them passed verification and
smoke arbitration.

The set is the core library, the factory service, the governance trio (package governor, version
pinner, Cargo.toml governor), and the seven-member normalize family (six stream flavors plus the
file tool).

The release identity uses the user-approved reversed hierarchical naming, which this family calls
the "@-sentence" identity.

The scope stays `@playform`, the old `dsh-` prefix leaves the package name, and the family and type
marker leads: `hook-dsh-*`, `lib-dsh-*`, and `plugin-dsh-*`.

A package name therefore reads as a sentence about what the package is: a DeepSeek Harness hook, a
library, or the DeepSeek Harness plugin factory.

Each package carries its own one-sentence self-description, its @-sentence, and the inventory below
quotes it.

[![variant](https://img.shields.io/static/v1?label=variant&message=CLASSIC&color=blue)](packages/)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=EFFECT-TS&color=white)](../EffectTS/)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

## The variants (CLASSIC vs EFFECT-TS)

- **CLASSIC** (this tree): the twelve contracts in plain TypeScript - classes, Maps and plain
  functions, with zero runtime framework dependencies; this release builds here and the twelve
  smokes below verify it.
- **EFFECT-TS** (the sibling tree, `../EffectTS/`): the same twelve contracts restated on Effect-TS
  services and layers - same behavior, same smokes, different runtime plumbing.

## The variant toggle (CLASSIC vs EFFECT-TS)

One name covers two builds.

Every package in this tree ships BOTH implementations in the same tarball: `Target/` is the CLASSIC
build and the default, and `Target-EffectTS/` is the EFFECT-TS build that `Maintain/DualSource.sh`
assembles byte-exactly from the sibling tree.

**Install once, toggle at the loader.**

```sh
pnpm add @playform/lib-dsh-core @playform/plugin-dsh-factory @playform/hook-dsh-package-governor
```

One install is enough, because every package ships BOTH the CLASSIC build (plain TypeScript, the
default) and the EFFECT-TS build (effect-backed, the same contract) in the same tarball.

No postinstall build runs and no user-side compilation happens, because the toggle is pure
resolution:

- **CLASSIC (default):** import the package and nothing else -
  `import { Govern } from "@playform/plugin-dsh-factory"`.
- **EFFECT-TS (whole family, one flag):**
    - Node: `node --conditions=effect-ts` (or `NODE_OPTIONS="--conditions=effect-ts"`)
    - TypeScript: `"customConditions": ["effect-ts"]` in `compilerOptions`
    - esbuild: `conditions: ["effect-ts"]`; Vite: `resolve.conditions: ["effect-ts"]`; webpack:
      `resolve.conditionNames: ["effect-ts"]`
- **Per-import escape hatch** (no loader config):
  `import { ... } from "@playform/lib-dsh-core/effect-ts"` (or `/classic`) - deterministic in every
  toolchain.

The whole family toggles together, so never mix variants in one graph, because the effect-ts
`Update` returns Effect envelopes and not the classic dispatch envelope.

The same single install brings `effect` v4.0.2 as a dependency.

This tree is the canonical publish home, so the published tarball ships `Target/` and
`Target-EffectTS/` through the `files` whitelists of the manifests.

The tarball from the EffectTS tree is the mirror, with `Target/` and `Target-Classic/`.

In-tree, the `default` condition of each tree routes to its own build.

## The twelve packages

| Package (`@playform/...`)                                                                                                              | Identity sentence                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib-dsh-core`                                                                                                                         | The pure, dependency-free library commonalities of the family: the section lists, the exclusion segments, the suppression composer, the policy loader, [the refusal guard](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/lib-dsh-core/Source/Function/Refusal.ts) and the normalize/Stream machinery. |
| [plugin-dsh-factory](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source)                     | The family's first service: the ledger, the exclusion match, the discovery, the keep-list union, the gate set, the version-guarded fenced write, the refresh, the detached contained continuation, the State builder, the wiring, the effects, the schema factory and the probe-once seam.                                 |
| [hook-dsh-package-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-governor/Source)       | The silent package.json governor: hooks [fs/observed][dsh-fs], rewrites chain-governed pins to the effective registry's resolved versions, and runs the update stage as a detached, contained continuation.                                                                                                                |
| [hook-dsh-package-pinner](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source)           | The silent package.json version pinner: hooks [fs/observed][dsh-fs] and deterministically rewrites every ranged dependency version to its static version, protected by a pin-policy keep-list.                                                                                                                             |
| [hook-dsh-cargo-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-cargo-governor/Source)           | The Cargo.toml governor: the Rust-sided flavor of the package governor - surgical chain-pin rewrites on the raw TOML lines and cargo upgrade driven through [the subprocess seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess).                                             |
| [hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source)           | The dash flavor: normalizes the unicode dash family to ASCII hyphen-minus in model output streams, mirroring the core's dash class at the injection point a file hook lacks.                                                                                                                                               |
| [hook-dsh-normalize-quotes](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-quotes/Source)       | The quotes flavor: maps the eight curly quote code points to their ASCII straight counterparts in model output streams.                                                                                                                                                                                                    |
| [hook-dsh-normalize-ellipsis](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-ellipsis/Source)   | The ellipsis flavor: replaces the horizontal ellipsis (U+2026) with the plain ASCII three-dot sequence in model output streams.                                                                                                                                                                                            |
| [hook-dsh-normalize-spaces](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-spaces/Source)       | The spaces flavor: normalizes the unicode space family (Zs minus the ASCII space) to the plain space in model output streams.                                                                                                                                                                                              |
| [hook-dsh-normalize-invisible](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-invisible/Source) | The invisible flavor: removes the zero-width/invisible character family (soft hyphen, zero-width spaces and joiners, bidi controls, BOM) from model output streams.                                                                                                                                                        |
| [hook-dsh-normalize-fullwidth](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-fullwidth/Source) | The fullwidth flavor: maps the entire FULLWIDTH FORMS range (U+FF01-U+FF5E) to its ASCII half-width counterparts in model output streams.                                                                                                                                                                                  |
| [plugin-dsh-normalize-file](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-normalize-file/Source)       | The file-content normalizer plugin: the `normalize-file` tool - the read, count, write pipeline applying all six transforms to a file already on disk, writing only when something changed.                                                                                                                                |

## Layout

```
Classic/
  packages/          the twelve packages, one directory each
  smokes/            the twelve smoke suites, one per bundle
```

Each package is self-contained.

It carries its own `package.json`, its own deterministic build (`Source/` -> `Target/` through
ESBuild, `tsc`, and `tsc-alias`), and its own
[cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml)
where the bundle ships one.

## Build (per bundle, deterministic)

Build the base library and the factory first, then the consumers:

```
cd packages/lib-dsh-core      && pnpm install --ignore-scripts && pnpm run prepublishOnly
cd packages/plugin-dsh-factory && pnpm run prepublishOnly
```

Then build each consumer bundle, which is the governance trio and the seven normalize flavors:

```
cd packages/<bundle> && pnpm run prepublishOnly
```

The standalone-workspace packages, `lib-dsh-core` and the flavors with their own
`pnpm-workspace.yaml`, also take a per-bundle `pnpm install --ignore-scripts`.

The remaining bundles get their dev dependencies from the family workspace root.

The ten consumer bundles reach their siblings through the
`packages/<consumer>/node_modules/@playform/` directory links:

```
@playform/lib-dsh-core      -> ../../../lib-dsh-core
@playform/plugin-dsh-factory -> ../../../plugin-dsh-factory
```

## Test (the smokes are the arbiter)

One suite covers each bundle, and you run it from `Classic/smokes/`.

Each suite prints its count and exits non-zero when any check fails:

```
node smokes/core-smoke.mjs            # 14
node smokes/factory-smoke.mjs         # 34
node smokes/governor-smoke.mjs        # 78
node smokes/pinner-smoke.mjs          # 32
node smokes/cargo-smoke.mjs           # 62
node smokes/normalize-dash-smoke.mjs  # 132
node smokes/quotes-smoke.mjs          # 62
node smokes/ellipsis-smoke.mjs        # 62
node smokes/spaces-smoke.mjs          # 62
node smokes/invisible-smoke.mjs       # 62
node smokes/fullwidth-smoke.mjs       # 62
node smokes/normalize-file-smoke.mjs  # 71
```

Every suite loads the REAL built Target of its bundle, plus the REAL factory service where the
bundle consumes it, and it asserts the full behavioral contract.

That contract covers the loader contract, the byte-exact ledger strings, the identity assertions
(`name`, `State.Module`, the `<module>: ` logger prefixes, the `~/.dsh/<identity>.log` ledger
defaults), and the effect wiring.

The counts above are the release contract, and they must not change.

## Known limits

This section states the documented gaps as they are:

- **The verifyCommand trap** - an update-policy `verifyCommand` can fail with a non-zero status on a
  vendored-fork workspace, because the forks are not on the public registry, and then the ledger
  records `update: verifyCommand failed (status 1)`, which is the documented cordis registry trap,
  the expected outcome, and not a bug. Exit 127, where the runner is unavailable, is non-fatal, and
  any other failure trips the circuit breaker.
- **Load order is not list order** - the pinner can activate before the governor at boot, and the
  sequential fold with the fresh-version writes makes the order irrelevant.
- **The smoke/live fidelity gap** - the smokes prove the mechanics and the live battery proves the
  wiring, and every real bug appeared live rather than in the smokes.
- **The fixture paths** - the `Test/` fixtures carry the neutralized display forms (`<repo-root>/`,
  `$DSH_HOME/`) and never the personal absolute paths of the internal Boilerplate copies.
- **The byte-integrity law** - a write that emits bytes the file's format forbids corrupts the file,
  as the NUL-byte incident class shows; verbatim is the default and the byte-scan is the arbiter.

[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
