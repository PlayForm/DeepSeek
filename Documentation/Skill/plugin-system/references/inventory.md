# The Family Inventory

Two release groups, one contract, one version. The package directories are
the source of truth; the prose counts in older documents lag.

## The two groups

| Group    | Names                                                          | Runtime                  | Version |
| -------- | -------------------------------------------------------------- | ------------------------ | ------- |
| Classic  | `@playform/hook-dsh-*`, `@playform/plugin-dsh-factory`          | Plain TypeScript         | 0.0.1   |
| EffectTS | `@playform/ets-hook-dsh-*`, `@playform/ets-plugin-dsh-factory`, `@playform/ets-base-dsh` | Effect 4.0.5 services and layers | 0.0.1 |

Counts: 15 Classic packages, 15 EffectTS packages plus the base (16
directories). The old "25 packages" figure counted 12 + 12 + 1; the tree
has since added `cargo-governor`, `ccr`, `live-containers`, and
`tool-coach` to both groups.

Verify:

```sh
ls Classic/packages EffectTS/packages
grep -h '"version"' Classic/packages/*/package.json EffectTS/packages/*/package.json
grep -h '"effect"' EffectTS/packages/*/package.json
```

## The roles

| Role              | Package                       | What it does                                                     |
| ----------------- | ----------------------------- | ---------------------------------------------------------------- |
| Service           | `plugin-dsh-factory`          | `ctx.pluginFactory`, 19 methods: ledger, match, discovery, keep-list, gate, write executor, re-emit, continuation, State, wiring, attach, journal, schema, seam, inflight key, direct-govern |
| Machinery         | `hook-dsh-core`               | Section lists, exclusions, suppression composer, policy loader, refusal guard, update envelope, activation composer, normalize machinery |
| Governor          | `hook-dsh-package-governor`   | Chain-pin rewrites and the update stage on `fs/observed`          |
| Pinner            | `hook-dsh-package-pinner`     | Ranged versions to static versions, keep-list protected           |
| Cargo governor    | `hook-dsh-cargo-governor`     | TOML surgery, full-version normalization, `cargo upgrade`         |
| Stream flavors    | six `normalize-*` hooks       | `llm/stream` rewrites: dash, quotes, ellipsis, spaces, invisible, fullwidth |
| File flavor       | `normalize-file`              | The read-count-write whole-file pass                              |
| Compression       | `ccr`                         | Tool-result compression, retrieval, the marker contract           |
| Coach             | `tool-coach`                  | Behavioral coaching through the tool surface, tiered              |
| Live blocks       | `live-containers`             | System-prompt blocks recomputed per request; ships disabled       |

## The event surfaces

| Surface        | Who uses it                                          |
| -------------- | ---------------------------------------------------- |
| `llm/stream`   | The six stream flavors                                |
| `fs/observed`  | The governance trio                                   |
| Tool surface   | The factory gating, ccr, tool-coach, normalize-file   |
| Loader         | The profile bundle list and the patch inserts         |

## The counts

The smoke manifest line lists 14 mechanics suites: core, factory, governor,
pinner, cargo, dash, quotes, ellipsis, spaces, invisible, fullwidth,
normalize-file, ccr, tool-coach.

The manifest line is a summary that lags the per-folder tests. On
2026-10-20 it read 1008 Classic / 1021 EffectTS, while the per-folder sums
gave 1312 Classic across those suites (1592 with the live-containers
folders). The per-folder READMEs are the arbiter; the manifest must be
regenerated or derived, never quoted as-is.

The `live-containers` package carries 14 internal test folders (280
checks per tree). The aggregate runner executes them, but the manifest
line does not count them. When quoting a total, say which set it covers.

Verify:

```sh
grep -n "mechanics suites" Classic/smokes/README.md EffectTS/smokes/README.md
ls Classic/packages/hook-dsh-live-containers/Source/Test
```

## What is planned, not shipped

The orchestration family (`routing-enforcer`, `subagent-queue`,
`batch-state`, `honest-feedback`), the UI family, the workspace family,
and the Aphrodite plans are designs. They have no packages in either tree.
Do not list them as products.

Verify:

```sh
grep -H '^status: planned' Documentation/Plans/*.md
```

## Failure modes

- **Counting by memory**: repeating "12 packages" or "25 packages" after
  the tree grew.
- **Counting the wrong set**: quoting 1008 as the family total while
  live-containers' 280 checks are excluded.
- **Promoting plans**: describing a planned plugin as shipped.
