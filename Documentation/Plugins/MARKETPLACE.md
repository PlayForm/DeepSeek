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
> index, generated from both release trees and the npm registry, served by the site, and read by the
> official `@deepseek-ai/dsh-plugin-market` service (the Web **Discover** tab and the
> `plugin_market` tool). The URL to hand DSH: `https://deepseek.playform.cloud/marketplace.json`.

## 1. The URL

| Use                                         | URL                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| DSH (Discover, `plugin_market`)             | `https://deepseek.playform.cloud/marketplace.json`                             |
| The same file, straight from the repository | `https://raw.githubusercontent.com/PlayForm/DeepSeek/Current/marketplace.json` |

The host refuses redirects, so configure the final URL, not a short link.

The site URL needs the `Site` repository pushed and the Pages deployment finished; the raw URL needs
only the root repository pushed to `Current`.

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

The `plugin-market` row ships in `@deepseek-ai/dsh-experimental-plugin-market-bundle`.

Without that bundle there is no Discover tab and no `plugin_market` tool.

## 3. The two files

| File                                 | Role                                         |
| ------------------------------------ | -------------------------------------------- |
| `marketplace.json` (repository root) | the source of truth, committed with the tree |
| `Site/Public/marketplace.json`       | the byte-identical copy the site builds from |

`Site/` is its own repository, so its CI checkout cannot read the root copy.

The served copy is committed beside it, and the generator writes both in one run.

The site's build minifies the JSON it serves; the document is unchanged and the host parses it as
JSON.

## 4. Regenerate

```bash
pnpm marketplace       # write both files
pnpm marketplace:check # exit 1 when either file is stale; run it on release
```

`Maintain/Generate/Marketplace/Index.mjs` reads:

- both trees' `Classic/packages/*/package.json` and `EffectTS/packages/*/package.json`: name,
  version, description, `dsh.bundle`, `engines.dsh`;
- the npm registry: every published version and its publish time, per package;
- each package directory's last commit and its time, for the `git` source pin. A commit that only
  touches the index, the docs or the site leaves every pin valid, so `--check` stays meaningful
  between releases.

It builds format 1 and validates the document with `@deepseek-ai/dsh-plugin-market-index` before it
writes.

## 5. What an entry carries

- One entry per package (102 today). The category comes from the directory prefix (`plugin`, `hook`,
  `client`, `library`); the labels are `classic` or `effectts`, plus `npm` or `source`; the keywords
  come from the directory name.
- One version per real npm publish (`source: npm`), with the publish time the registry records.
- A `git` version pinned to the HEAD commit and the package directory (`source: git`,
  `path: <Tree>/packages/<dir>`) when the repository version is not published.
- Placeholders `0.0.0` and `0.0.0-stage` are never listed.
- When a version is published, the npm entry is the only entry for that version: the registry is
  immutable, and the market cannot express two different contents under one version.

## 6. The install truth (2026-10-25, after the 0.2.0 release)

- 102 packages in the tree, all published at 0.2.0 on npm. Before that release 21 had a real 0.1.0,
  70 had only a `0.0.0` placeholder and 11 were absent; the release closed that gap.
- The index carries 224 npm versions across the 102 packages (0.0.1, 0.1.0 and 0.2.0 where each
  exists) and no `git` pins, because the rule adds a pin only when a tree version is unpublished.
- An npm entry installs only where the whole dependency closure is published. The 0.2.0 release
  published the closure in dependency order (`lib-dsh-core@0.2.0`, `lib-dsh-trace@0.2.0`,
  `plugin-dsh-factory@0.2.0`, ...), so a Discover install of any 0.2.0 entry resolves.
- A future unpublished tree version gets the `git` pin again: a `git` entry installs the repository
  at that commit, and pnpm still resolves its `dependencies` from the registry, so the pin works
  only for a published closure.
- The release step: bump, publish in dependency order, then `pnpm marketplace`. The market follows
  the registry; no entry is hand-written.

## 7. The site page

`https://deepseek.playform.cloud/marketplace/` renders the same JSON. The page reads
`Site/Public/marketplace.json` at build time and prints the URL, the profile snippet, the counts,
one card per entry with its recommended version and labels, and the install channels.

## 8. Verification

- `pnpm marketplace:check` exits 0.
- `cd Site && pnpm prepublishOnly` exits 0, and `Site/Target/marketplace.json` exists.
- The validator accepts the document:
  `parseMarketIndex(JSON.parse(bytes), "https://deepseek.playform.cloud/marketplace.json")`.
