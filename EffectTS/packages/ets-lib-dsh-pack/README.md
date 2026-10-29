# @playform/ets-lib-dsh-pack

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fets-lib-dsh-pack&color=blue)](https://www.npmjs.com/package/@playform/ets-lib-dsh-pack)
[![release](https://img.shields.io/static/v1?label=release&message=v0.1.0&color=blue)](https://www.npmjs.com/package/@playform/ets-lib-dsh-pack)
[![variant](https://img.shields.io/static/v1?label=variant&message=CLASSIC&color=blue)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **workspace-pack layer** of the suggester family: the pack schema, the layered resolution (the
> user layer, the repo layer, the cycle-guarded `extends:` chain), the strict YAML-subset parser,
> the merge rules, the workspace locator, and the built-in pack for this monorepo.
>
> _The CLASSIC build: zero runtime dependencies._
>
> _Not a plugin - the data layer under the six suggesters._
>
> _The @-sentence identity: **Lib @ DSH @ Pack** - one file describes one repository._

---

## Where It Fits

**Family position**: the pack library of the suggester family - parent of none, child of none: the
CLASSIC build has zero runtime dependencies.

The six suggesters consume it ([`hook-dsh-doc-suggester`](../ets-hook-dsh-doc-suggester),
[`hook-dsh-edit-suggester`](../ets-hook-dsh-edit-suggester),
[`hook-dsh-search-suggester`](../ets-hook-dsh-search-suggester),
[`hook-dsh-convention-suggester`](../ets-hook-dsh-convention-suggester),
[`hook-dsh-test-suggester`](../ets-hook-dsh-test-suggester),
[`hook-dsh-replay-suggester`](../ets-hook-dsh-replay-suggester)), and each one projects its own
domain (`doc/`, `edit/`, `search/`, `convention/`, `test/`, `replay/`) out of the resolved pack.

1. **The Built-in Pack.**

    `Builtin` is the union of the six suggesters' former embedded packs: 31 families keyed by the
    domain-qualified id (`doc/Plan`, `edit/Version`, `search/Version`, ...), so the six domains
    share one map without a collision on the ids that they reuse.

    It is the default for this monorepo and byte-for-byte the data that the suggesters shipped
    before the extraction.

2. **The Layered Resolution (D2).**

    The user layer `~/.dsh/playform/workspaces/<repo-slug>.yml` is read first, the repo layer
    `<repo>/.dsh/pack.yml` overrides it, and a pack can `extends:` another user-layer pack
    (cycle-guarded).

    A repo without a pack resolves to the built-in pack, and a workspace outside its signature
    resolves to `undefined` - the honest silence.

3. **The Workspace Locator.**

    `Locate` is the family's gate: it selects the first ancestor whose pack signature matches.

    The signature is the pack's `signature` list, which defaults to
    `Documentation/ARCHIVE-STYLE.md`.

4. **A Plain Library.**

    The library is **not a plugin bundle**: it has no
    [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/ets-plugin-dsh-factory/cordis.patch.yml),
    no loader contract, and it is publishable on its own.

    Consumers link it as a plain library dependency, not as a bundle row.

## Install

```sh
pnpm add @playform/ets-lib-dsh-pack
```

The package is not a bundle, so it has no `dsh plugin add` row.

Add the package as a plain dependency of whatever consumes it, and build it with the same
`prepublishOnly` sequence as the family bundles.

## Usage

The package has named exports only - no plugin, no loader contract:

```js
import { Builtin, Families, Locate, Resolve } from "@playform/ets-lib-dsh-pack";

// The gate + the pack for one call (the suggesters' hot path):
const Located = Locate("Documentation/INDEX.md", cwd);
if (Located !== undefined) {
	const Families_ = Families(Located.pack, "doc");
	// ... detect/score with the repo's own doc families
}

// A direct resolution (the learner, the tools, a test):
const Pack = Resolve("/path/to/repo", { home: "/tmp/temp-home" });
```

## The resolution (D2)

```
<home>/.dsh/playform/workspaces/<repo-slug>.yml     the user layer, read first
<repo>/.dsh/pack.yml                                the repo layer, overrides
pack.extends: <name>                                the base, merged underneath
```

The repo slug is the repo root's basename, lowercased, unless the pack declares `slug`.

The repo layer is read first to find that slug, then the user layer, then the `extends:` chain: a
named base is looked up in the user layer, a missing name is skipped, and a cycle is guarded so each
pack is merged once.

The merge keeps families by id and targets by path, replaces scalars, and replaces arrays.

It normalizes the merged result once, so an absent field never overwrites the base.

See [SCHEME.md](./SCHEME.md) for the exact rules and the parser's documented subset.

## The parser decision

The workspace does not carry the `yaml` package in its own dependency graph (the symbol only
resolves through the enclosing machine's pnpm store, which a checkout elsewhere would not have), so
the library stays dependency-light and parses the documented YAML subset itself
(`Source/Function/Parse.ts`).

A `.json` pack is accepted too (`JSON.parse`).

The subset and its refusals are listed in [SCHEME.md](./SCHEME.md#the-parser-subset).

## The smokes

| Folder  | Checks | Covers                                                      |
| ------- | ------ | ----------------------------------------------------------- |
| Resolve | 10     | the built-in fallback, the layers, the slug, the gate       |
| Merge   | 8      | families by id, targets by path, scalars/arrays replace     |
| Extends | 6      | the chain, the cycles, the missing link, the array of bases |
| Parser  | 6      | the YAML subset and its refusals, the reader                |

Run one folder with `node Target/Test/<Name>/Test.js`, and run the whole tree with
`node Maintain/Run/Smokes/Index.mjs` (the aggregate).

## License

CC0-1.0.
