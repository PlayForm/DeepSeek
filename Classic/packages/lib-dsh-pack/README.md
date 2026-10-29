# @playform/lib-dsh-pack

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Flib-dsh-pack&color=blue)](https://www.npmjs.com/package/@playform/lib-dsh-pack)
[![release](https://img.shields.io/static/v1?label=release&message=v0.1.0&color=blue)](https://www.npmjs.com/package/@playform/lib-dsh-pack)
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

**Family position**: the pack library of the suggester family, parent of none and child of none, and
the CLASSIC build has zero runtime dependencies.

The six suggesters consume it ([`hook-dsh-doc-suggester`](../hook-dsh-doc-suggester),
[`hook-dsh-edit-suggester`](../hook-dsh-edit-suggester),
[`hook-dsh-search-suggester`](../hook-dsh-search-suggester),
[`hook-dsh-convention-suggester`](../hook-dsh-convention-suggester),
[`hook-dsh-test-suggester`](../hook-dsh-test-suggester),
[`hook-dsh-replay-suggester`](../hook-dsh-replay-suggester)), and each projects its own domain
(`doc/`, `edit/`, `search/`, `convention/`, `test/`, `replay/`) out of the resolved pack.

- **The built-in pack** (`Builtin`) is the union of the six suggesters' former embedded packs: 31
  families keyed by the domain-qualified id (`doc/Plan`, `edit/Version`, `search/Version`, ...), so
  the six domains share one map without colliding on the ids they reuse.

    It is the default for this monorepo and byte-for-byte the data the suggesters shipped before the
    extraction.

- **The layered resolution** (D2): the user layer `~/.dsh/playform/workspaces/<repo-slug>.yml` is
  read first, the repo layer `<repo>/.dsh/pack.yml` overrides it, and a pack may `extends:` another
  user-layer pack (cycle-guarded).

    A repo without a pack resolves to the built-in pack, while a workspace outside its signature
    resolves to `undefined`, which is the honest silence.

- **The workspace locator** (`Locate`) is the family's gate: the first ancestor whose pack signature
  matches.

    The signature is the pack's `signature` list, defaulting to `Documentation/ARCHIVE-STYLE.md`.

- The library is **not a plugin bundle**: it has no
  [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml),
  no loader contract, and is publishable on its own, so consumers link it as a plain library
  dependency rather than as a bundle row.

## Install

```sh
pnpm add @playform/lib-dsh-pack
```

Because it is not a bundle, there is no `dsh plugin add` row: add the package as a plain dependency
of whatever consumes it and build it with the same `prepublishOnly` sequence as the family bundles.

## Usage

Named exports only, with no plugin and no loader contract:

```js
import { Builtin, Families, Locate, Resolve } from "@playform/lib-dsh-pack";

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

The repo layer is read first to discover that slug, then the user layer, then the `extends:` chain
(a named base is looked up in the user layer, a missing name is skipped, and a cycle is guarded so
each pack is merged once).

The merge works as follows: families by id, targets by path, scalars replace, and arrays replace,
and the merged result is normalized once so an absent field never overwrites the base.

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
