# Classic - the DeepSeek Harness Plugin Family for PlayForm

The CLASSIC release of the PlayForm plugin family for DeepSeek Harness: twelve TypeScript packages
under `packages/`, each one a verified, smoke-arbitrated bundle - the core, the factory service, the
governance trio (package governor, version pinner, Cargo.toml governor) and the seven-member
normalize family (six stream flavors plus the file tool).

The release identity follows the user-approved reversed hierarchical naming (the "@-sentence"
identity): the scope stays `@playform`, the old `dsh-` prefix moves out of the package name, and the
family/type marker leads - `hook-dsh-*` and `plugin-dsh-*` - so a package name reads as a sentence
about what it is: a DeepSeek Harness hook, or the DeepSeek Harness plugin factory.

Each package carries its own one-sentence self-description (its @-sentence), quoted in the inventory
below.

[![variant](https://img.shields.io/static/v1?label=variant&message=CLASSIC&color=blue)](packages/)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=EFFECT-TS&color=white)](../EffectTS/)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

## The variants (CLASSIC vs EFFECT-TS)

- **CLASSIC** (this tree): the twelve contracts in plain TypeScript — classes, Maps and plain
  functions, zero runtime framework dependencies; the release built here and verified by the twelve
  smokes below.
- **EFFECT-TS** (the sibling tree, `../EffectTS/`): the same twelve contracts re-expressed on
  Effect-TS services and layers — same behavior, same smokes, different runtime plumbing.

## The twelve packages

| Package (`@playform/...`)      | Identity sentence                                                                                                                                                                                                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hook-dsh-core`                | The pure, dependency-free commonalities of the family: the section lists, the exclusion segments, the suppression composer, the policy loader, [the refusal guard](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-core/Source/Function/Refusal.ts) and the normalize/Stream machinery.                                                                                         |
| [plugin-dsh-factory](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source)           | The family's first service: the ledger, the exclusion match, the discovery, the keep-list union, the gate set, the version-guarded fenced write, the refresh, the detached contained continuation, the State builder, the wiring, the effects, the schema factory and the probe-once seam.   |
| [hook-dsh-governor-package](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-package/Source)    | The silent package.json governor: hooks [fs/observed][dsh-fs], rewrites chain-governed pins to the effective registry's resolved versions, and runs the update stage as a detached, contained continuation. |
| [hook-dsh-pinner-package](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-pinner-package/Source)      | The silent package.json version pinner: hooks [fs/observed][dsh-fs] and deterministically rewrites every ranged dependency version to its static version, protected by a pin-policy keep-list.              |
| [hook-dsh-governor-cargo](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-cargo/Source)      | The Cargo.toml governor: the Rust-sided flavor of the package governor - surgical chain-pin rewrites on the raw TOML lines and cargo upgrade driven through [the subprocess seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess).               |
| [hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source)      | The dash flavor: normalizes the unicode dash family to ASCII hyphen-minus in model output streams, mirroring the hermes regex at the injection point hermes lacks.                                                                                                                           |
| [hook-dsh-normalize-quotes](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-quotes/Source)    | The quotes flavor: maps the eight curly quote code points to their ASCII straight counterparts in model output streams.                                                                                                                                                                      |
| [hook-dsh-normalize-ellipsis](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-ellipsis/Source)  | The ellipsis flavor: replaces the horizontal ellipsis (U+2026) with the plain ASCII three-dot sequence in model output streams.                                                                                                                                                              |
| [hook-dsh-normalize-spaces](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-spaces/Source)    | The spaces flavor: normalizes the unicode space family (Zs minus the ASCII space) to the plain space in model output streams.                                                                                                                                                                |
| [hook-dsh-normalize-invisible](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-invisible/Source) | The invisible flavor: removes the zero-width/invisible character family (soft hyphen, zero-width spaces and joiners, bidi controls, BOM) from model output streams.                                                                                                                          |
| [hook-dsh-normalize-fullwidth](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-fullwidth/Source) | The fullwidth flavor: maps the entire FULLWIDTH FORMS range (U+FF01-U+FF5E) to its ASCII half-width counterparts in model output streams.                                                                                                                                                    |
| [hook-dsh-normalize-file](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-file/Source)      | The file-content normalizer: the `normalize-file` tool - the read, count, write pipeline applying all six transforms to a file already on disk, writing only when something changed.                                                                                                         |

## Layout

```
Classic/
  packages/          the twelve bundles, one directory each
  smokes/            the twelve smoke suites, one per bundle
```

Each bundle is self-contained: its own `package.json`, its own deterministic build (`Source/` ->
`Target/` via ESBuild + `tsc` + `tsc-alias`), and its own [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml) where the bundle ships
one.

## Build (per bundle, deterministic)

The two base bundles first, then the consumers:

```
cd packages/hook-dsh-core      && pnpm install --ignore-scripts && pnpm run prepublishOnly
cd packages/plugin-dsh-factory && pnpm run prepublishOnly
```

Then each consumer bundle (the governance trio, the seven normalize flavors):

```
cd packages/<bundle> && pnpm run prepublishOnly
```

Standalone-workspace bundles (`hook-dsh-core` and the flavors with their own `pnpm-workspace.yaml`)
also take a per-bundle `pnpm install --ignore-scripts`.

The remaining bundles resolve their dev dependencies from the family workspace root.

The ten consumer bundles import their siblings through the
`packages/<consumer>/node_modules/@playform/` directory links:

```
@playform/hook-dsh-core      -> ../../../hook-dsh-core
@playform/plugin-dsh-factory -> ../../../plugin-dsh-factory
```

## Test (the smokes are the arbiter)

One suite per bundle, run from `Classic/smokes/`; each prints its count and exits non-zero on any
failure:

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

Every suite loads the REAL built Target of its bundle (plus the REAL factory service where the
bundle consumes it) and asserts the full behavioral contract: the loader contract, the byte-exact
ledger strings, the identity assertions (`name`, `State.Module`, the `<module>: ` logger prefixes,
the `~/.dsh/<identity>.log` ledger defaults) and the effect wiring.

The counts above are the release contract: they must not change.

[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
