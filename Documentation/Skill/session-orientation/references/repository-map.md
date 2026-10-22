# The Repository Map

The monorepo has seven working trees. Know which one you are in before you edit; most early mistakes
are wrong-tree mistakes.

## The trees

| Path             | Role                                                                   | Git                |
| ---------------- | ---------------------------------------------------------------------- | ------------------ |
| `Classic/`       | The plain-TypeScript release: 51 packages, each with its own `Target/` | Root repo          |
| `EffectTS/`      | The Effect-TS release: 46 packages (incl. `ets-base-dsh`)              | Root repo          |
| `Site/`          | The Astro static site, built into `Site/Target/`                       | Its own repository |
| `Test/`          | Fixture archives, governance batteries, probes                         | Root repo          |
| `Documentation/` | Framework, guides, plans, skills, reports, research, archive           | Root repo          |
| `Maintain/`      | `Run-Smokes.mjs`, `Run-Wiring.mjs`, `Format.sh`, `Lychee.sh`           | Root repo          |
| `diagrams/`      | Source diagrams                                                        | Root repo          |

`Site/` is listed in the root `.gitignore`. Commit site work in `Site/`, never from the root.

`Boilerplate/` no longer exists. Any document that still calls it a third implementation is stale.

## The two release groups

| Group    | Names                                                                                             | Runtime                          |
| -------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| Classic  | `@playform/lib-dsh-*`, `@playform/hook-dsh-*`, `@playform/plugin-dsh-*`, `@playform/client-dsh-*` | Plain TypeScript, no framework   |
| EffectTS | `@playform/ets-*` (the base `ets-base-dsh` plus one twin per covered package)                     | Effect 4.0.5 services and layers |

All packages sit at `0.1.0` (unpublished). The original 14 plugins were joined on 2026-10-22 by 36
new Classic packages (the workspace family, the suggesters, the orchestration set, the client
family) and 30 of their ETS twins. Never mix the groups in one dependency graph: the EffectTS
`Update` returns Effect envelopes, not the Classic dispatch envelope.

Verify the inventory:

```sh
ls Classic/packages EffectTS/packages
grep -h '"version"' Classic/packages/*/package.json EffectTS/packages/*/package.json
```

## The package roles

- **`plugin-dsh-factory`** - the family's service. Loading it registers `ctx.pluginFactory` with 19
  callable methods: ledger, exclusion match, registry discovery, keep-list, gate, the shared write
  executor, re-emit, continuation, State, wiring, effect registrations, journal, schema, seam,
  inflight key, and the direct-govern registry and fold.
- **`lib-dsh-core`** - the machinery library, not a plugin: the section lists, exclusion segments,
  suppression composer, update-policy loader, refusal guard, update envelope, activation-line
  composer, and the normalize/stream machinery.
- **The governance trio** - `hook-dsh-package-governor` (chain pins and the update stage),
  `hook-dsh-package-pinner` (ranges to static versions), `hook-dsh-cargo-governor` (the Rust TOML
  flavor). They hook `fs/observed` and the tool surface.
- **The normalize family** - six stream flavors (`dash`, `quotes`, `ellipsis`, `spaces`,
  `invisible`, `fullwidth`) on `llm/stream`, plus `plugin-dsh-normalize-file`, the file tool.
- **The guardians** - `hook-dsh-ccr` (tool-result compression and retrieval) and
  `hook-dsh-tool-coach` (behavioral coaching through the tool surface).
- **`hook-dsh-live-containers`** - live system-prompt blocks recomputed per request. It ships
  disabled by default.
- **The 2026-10-22 delivery** - the workspace family (15 packages + `lib-dsh-workspace-live`), the
  seven suggester hooks, the orchestration set (10 packages), and the three `client-dsh-*` panels.
  Full roster: `Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md`.

## The event surfaces

| Surface       | Who uses it                                              |
| ------------- | -------------------------------------------------------- |
| `llm/stream`  | The six stream flavors (the waterfall rewrite point)     |
| `fs/observed` | The governance trio (the observed-file trigger)          |
| Tool surface  | The factory's gating, ccr, tool-coach, normalize-file    |
| Loader        | The profile's bundle list and `cordis.patch.yml` inserts |

## The site

The site is an Astro static build: `Source/` in, `Target/` out. Its own `package.json`,
`astro.config.ts`, and `README.md`. 24 built HTML pages: the landing page, the plugins registry, 15
plugin detail pages, setup, versions, flavors, models, workbench, matrix, case study, and the 404.

Verify:

```sh
find Site/Target -name "*.html" | wc -l
```

## Where to look for what

| Question                           | Look at                                                |
| ---------------------------------- | ------------------------------------------------------ |
| What a package does                | `Classic/packages/<pkg>/README.md` and `SCHEME.md`     |
| What a package ships               | `<pkg>/Source/`, `<pkg>/Target/`, `<pkg>/package.json` |
| Why a behavior exists              | `Documentation/Plans/`, `Documentation/Reports/`       |
| How to operate the governance trio | `Documentation/Guides/Governor-*.md`                   |
| The site's content model           | `Site/Source/Library/Content.ts` and `Live.ts`         |
| The smoke baselines                | `<tree>/smokes/README.md` and the per-folder READMEs   |
