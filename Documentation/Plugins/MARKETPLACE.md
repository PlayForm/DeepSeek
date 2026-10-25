---
title: The plugin marketplace - the static index, its URL, and the release step
category: Plugins
kind: standard
date: 2026-10-25
status: active
registry: Documentation/Plugins/MARKETPLACE.md
index: Documentation/INDEX.md
---

# THE PLUGIN MARKETPLACE - THE STATIC INDEX

> The family's own plugin market: one static JSON in format 1 of the official DSH plugin market
> index, generated from both release trees and the npm registry, served by the site, and read by
> the official `@deepseek-ai/dsh-plugin-market` service (the Web **Discover** tab and the
> `plugin_market` tool). The URL to hand DSH:
> `https://deepseek.playform.cloud/marketplace.json`.

## 1. The URL

| Use                                                | URL                                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| DSH (Discover, `plugin_market`)                    | `https://deepseek.playform.cloud/marketplace.json`                               |
| The same file, straight from the repository        | `https://raw.githubusercontent.com/PlayForm/DeepSeek/Current/marketplace.json`    |

The host refuses redirects, so configure the final URL, not a short link. The site URL needs the
`Site` repository pushed and the Pages deployment finished; the raw URL needs only the root
repository pushed to `Current`.

## 2. Add it to a profile

Discover: **Plugins -> Discover -> Index sources -> Add index source**, paste the URL, save.

Or in the profile's `cordis.patch.yml`:

```yaml
- id: plugin-market
  name: "@deepseek-ai/dsh-plugin-market"
  config:
    indexes:
      - https://deepseek.playform.cloud/marketplace.json
```

The `plugin-market` row ships in `@deepseek-ai/dsh-experimental-plugin-market-bundle`. Without that
bundle there is no Discover tab and no `plugin_market` tool.

## 3. The two files

| File                            | Role                                              |
| ------------------------------- | ------------------------------------------------- |
| `marketplace.json` (repository root) | the source of truth, committed with the tree |
| `Site/Public/marketplace.json`  | the byte-identical copy the site serves           |

`Site/` is its own repository, so its CI checkout cannot read the root copy. The served copy is
committed beside it, and the generator writes both in one run.

## 4. Regenerate

```bash
pnpm marketplace        # write both files
pnpm marketplace:check  # exit 1 when either file is stale; run it on release
```

`Maintain/Generate-Marketplace.mjs` reads:

- both trees' `Classic/packages/*/package.json` and `EffectTS/packages/*/package.json`: name,
  version, description, `dsh.bundle`, `engines.dsh`;
- the npm registry: every published version and its publish time, per package;
- the git HEAD commit and its time, for the `git` source pin.

It builds format 1 and validates the document with `@deepseek-ai/dsh-plugin-market-index` before it
writes.

## 5. What an entry carries

- One entry per package (102 today). The category comes from the directory prefix (`plugin`,
  `hook`, `client`, `library`); the labels are `classic` or `effectts`, plus `npm` or `source`; the
  keywords come from the directory name.
- One version per real npm publish (`source: npm`), with the publish time the registry records.
- A `git` version pinned to the HEAD commit and the package directory (`source: git`, `path:
  <Tree>/packages/<dir>`) when the repository version is not published.
- Placeholders `0.0.0` and `0.0.0-stage` are never listed.
- When a version is published, the npm entry is the only entry for that version: the registry is
  immutable, and the market cannot express two different contents under one version.

## 6. The install truth (2026-10-25)

- 102 packages in the tree: 21 have a real 0.1.0 on npm, 70 have only a `0.0.0` placeholder, and 11
  are not on npm at all.
- An npm entry installs only where the whole dependency closure is published. The Classic 0.1.0 set
  (the factory, the six normalize hooks, the package governor, the package pinner, the cargo
  governor) resolves against `@playform/hook-dsh-core@0.1.0` and
  `@playform/plugin-dsh-factory@0.1.0`, both published.
- The Effect-TS 0.1.0 set does not resolve yet: its consumers depend on
  `@playform/ets-lib-dsh-core@0.1.0`, which has only a placeholder.
- A `git` entry installs the repository at that commit, but pnpm still resolves the package's
  `dependencies` from the registry. The current tree depends on `@playform/lib-dsh-core@0.1.0`,
  `@playform/lib-dsh-trace@0.1.0` and others that are not published, so a git install of most
  current packages fails until a release publishes the closure.
- The release step that closes the gap: bump the versions, publish in dependency order, then run
  `pnpm marketplace`. The market widens on the next generate; no entry is hand-written.

## 7. The site page

`https://deepseek.playform.cloud/marketplace/` renders the same JSON. The page reads
`Site/Public/marketplace.json` at build time and prints the URL, the profile snippet, the counts and
one card per entry with its versions and install commands.

## 8. Verification

- `pnpm marketplace:check` exits 0.
- `cd Site && pnpm prepublishOnly` exits 0, and `Site/Target/marketplace.json` exists.
- The validator accepts the document:
  `parseMarketIndex(JSON.parse(bytes), "https://deepseek.playform.cloud/marketplace.json")`.
