# @playform/dsh-hook-package-governor

> One of the four Governor guides migrated to `Documentation/Guides/` — the companion docs are
> `Governor-CASCADES.md`, `Governor-SCHEME.md`, and `Governor-TRIO-GRAPH.md` in this folder; the
> handoff context is `../Handoff/Overview.md` and `../Handoff/Packages/Package-03.md`.

Event-bus governor for the DeepSeek Harness: hooks `fs/observed` — the cordis event **every harness
file write dispatches** (the tool layer is the only dispatcher; the fs backend emits nothing). No
watcher: the tool calls themselves are the trigger — full writes, single-line edits, and
`str_replace_editor` patches alike.

**Fully API-aware**: every interaction with the plugin system, the filesystem, processes, config,
and lifecycle goes through the DeepSeek Harness / Cordis API — `ctx.fs` (`readText`, version-guarded
`writeText` with an explicit sandbox policy, `stat`), `ctx.subprocess` for bin mode, a validated
Schemastery `Config` schema, `inject: ["fs"]` on the loader contract, and a detached contained
continuation for the update stage. Exactly two things remain exempt: the npm-check-updates
library/binary itself, and internal pure calculations (string gates, maps, exclusion matching,
registry discovery, ledger formatting).

**Typed against the published seams**: the Source is typed with the same packages the running host
carries — `@deepseek-ai/dsh-fs` (`FsTarget`, `FsObservation`, `FsVersion`,
`FsWriteIntent`/`FsWriteOutcome`, the `ctx.fs`/`fs/observed` vocabulary and its `Context`/`Events`
augmentation), `@deepseek-ai/dsh-subprocess` (`SubprocessService`, `SubprocessSpawnSpec`,
`SubprocessHandle`), `@deepseek-ai/dsh-sandbox` (`SandboxExecutionPolicy`), `@deepseek-ai/cordis`
(`Context`, `Plugin`), `@deepseek-ai/schemastery` (the `Config` schema). The devDependencies pin the
HOST's exact versions (dsh-* 0.2.0-rc.2, cordis ^4.0.4, schemastery ^3.18.4) — no type/runtime
drift. These are type-only imports (erased at build); the built output's one runtime import,
`@deepseek-ai/schemastery`, resolves from the running dsh's installation scope, and no peers are
declared (dropping peers avoids the boot-time compat-gate skip risk for local bundles).

**Anywhere mode, exclusion-first**: there is NO roots allowlist. When **any** agent (main, subagent,
workflow child) mutates a file named `package.json` via the harness fs tools — anywhere on disk — it
is governed, UNLESS its path contains an excluded segment (`node_modules`, `.git`, `.dsh`, …):

1. **Governance context discovery**: the nearest `registry.json` is found by walking UP from the
   written file's directory (stopping at `node_modules` boundaries and the filesystem root).
2. **Chain pass** (deterministic, idempotent, pure): the manifest is read via `ctx.fs.readText`,
   every chain-governed dep (`dep ∈ registry.effectiveLatest`) is canonicalized to `^<resolved>`;
   with `strict: true`, unknown deps are stripped; public deps are left for the update stage.
   Without a registry, the chain pass is skipped (everything is public). The author model never
   learns.
3. **Version coherence**: the rewrite goes through `ctx.fs.writeText` with
   `{kind: "replaceIfVersion", version}` and the governor's own sandbox policy (its exclude list IS
   its fence — without an explicit policy the deployment default `workspace-write` denies paths
   outside the canonical workspace). The service-issued fresh `FsWriteOutcome.version` is re-emitted
   as `fs/observed` (same actor) so the observation-policy's record stays in sync — the author's
   next guarded write/edit does not fail `FS_STALE_VERSION` (a notification leak). A racing author
   write makes the guarded rewrite fail safely: no clobber.
4. **Update stage** (detached contained continuation — NOT `ctx.jobs`, which is agent-scoped and has
   no controller for a root plugin — with cooldown + in-flight + failure-breaker, **dual-mode** via
   `updateMode`): the continuation runs the nearest `update-policy.json` (the file's own directory →
   co-located with the discovered registry → the configured global `policyFile` → a built-in
   default: reject the learned tailwindcss exception, all dep groups, target latest, no
   verifyCommand), with the chain dep names **merged into the reject list** (the cordis-trap guard).
   Its settlement re-emits the fresh version from `ctx.fs.stat` (U₂). Two modes, selected by the
   `updateMode` config:
    - `programmatic` (default): the `npm-check-updates` library — the standing exemption — driven
      through
      `ncu.run({packageFile, upgrade: true, silent: true, dep, concurrency, target, reject, allow, filter})`;
      no external binary is involved.
    - `bin`: the ncu binary from `ncuBin`, resolved via `ctx.subprocess.resolveExecutable` and
      spawned through `ctx.subprocess` (fully-specified argv, collect-mode output appended to the
      ledger); if the deployment has no subprocess seam, a minimal child-process fallback runs
      inside the same continuation. All policy options are preserved in both modes.

Loop control by construction: the governor's rewrites are `ctx.fs` writes (the fs service dispatches
no `fs/*` events — only the harness tool path does) and the update stage is a continuation, not an
author tool call. The refresh re-emit re-enters the listener, but the version-token gate (`Stash`)
makes it a no-op. The listener's critical path stays await-free and throw-free: the async API-aware
stage runs as a detached, contained continuation.

Silence: the model-facing write result is built from the author's own content
(`after = normalizeLineEndings(content)`, no disk re-read, no checksum), so the parent thread sees
exactly what it wrote. The governed state is discoverable only by a subsequent `read`.

Ledger: one global log (`logFile`, default `$DSH_HOME/governor.log`) records activation, exclusions,
chain-pass results, and every update-stage dispatch.

## Structure

TypeScript-first, built with `@playform/build` (ESBuild + tsc type-check), mirroring the
monorepo conventions:

```
dsh-hook-package-governor/
├── Source/                  ← TypeScript (NOT shipped)
│   ├── Library.ts           ← entry: name / apply / Config / inject
│   │                          + default { name, apply, Config, inject }
│   ├── Function/            ← kind folders — Append.ts, Observe.ts,
│   │   │                      Continue.ts, Govern.ts, Dispatch.ts, …
│   │   └── Update/          ← the update-stage family
│   ├── Interface/           ← typed contracts (State, event payloads…)
│   └── Variable/            ← constants, defaults, the Config schema
├── Configuration/
│   └── ESBuild.ts           ← the @playform/build custom config
├── Target/                  ← built output (SHIPPED: .js + .d.ts)
├── cordis.patch.yml         ← the loader row (name: the package identity)
├── package.json             ← main → Target/Library.js
└── README.md / SCHEME.md    ← usage + the design document (with the diagram)
```

The published artifact contains **only the built output** — `files` whitelists `Target/`,
`cordis.patch.yml`, and the docs; `Source/` never ships.

## Build & publish

There are no `build`/`watch` npm scripts on purpose: the harness consumes the built `Target/` output
directly via `main`/`exports` — building is a dev/ publish-time concern, not a runtime one. The only
npm script is the publish hook:

```sh
prepublishOnly      # Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts
```

Invoke the build ad hoc with the direct command (the local `Build` binary or npx):

```sh
npx Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts          # one build
npx Build 'Source/**/*.ts' --Watch --ESBuild Configuration/ESBuild.ts  # dev loop
```

`prepublishOnly` is how the package is built before publishing — the tarball contains `Target/`
only. The same command is required after a `git clone` before the bundle can load.

## Install — three granularized paths

**1. Remote / dependency install (auto-activation).** Add the package as a plain dependency of a
profile — the `dsh.bundle` manifest makes it a harness bundle, so it is **installed automatically
and activates at the next host start** ("the tool installs itself — it is effectively a
dependency"):

```sh
pnpm add @playform/dsh-hook-package-governor   # in the profile dir
# + the package name in dsh.profile.bundles (or dsh plugin add)
```

**2. Local git clone.** Clone → install → build → link:

```sh
git clone <url> dsh-hook-package-governor
cd dsh-hook-package-governor
pnpm install --ignore-workspace   # the bundle carries its own node_modules
npx Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts   # Source → Target
# then dsh plugin --profile <name> add <this directory>   (or the tarball)
```

**3. Native dsh install.** Any packaged form (tarball, directory link, npm):

```sh
dsh plugin --profile <name> add ./local-dsh-hook-package-governor-<v>.tgz
```

All three end the same way: the loader activates the entry from `Target/` (`main` →
`Target/Library.js`), `cordis.patch.yml` inserts the `package-governor` row, and the global ledger
logs `activated (anywhere mode, …)` at the next host start.

## Config (cordis.patch.yml)

The exported `Config` schema validates and fills every default at load (invalid configuration fails
loudly), so the patch row below only restates the defaults for override convenience — every tunable
is a config field.

New entries are declared with `insert:` (a bare `id:` row patches an existing entry — the loader
rejects unknown ids with `entry "…" not found`).

```yaml
- insert:
      - id: package-governor
        name: "@playform/dsh-hook-package-governor"
        config:
            log: true
            logFile: $DSH_HOME/governor.log # global ledger (default: $DSH_HOME/governor.log)
            updateCooldownMs: 3000
            strict: false # explicit only; never default-delete unknown deps
            mutationTools: [write, edit, str_replace_editor]
            maxUpdateFailures: 3 # circuit breaker: pause a dir's update stage
            ncuBin: ncu # binary name resolved via the host PATH (or an absolute path)
            updateMode: programmatic # "programmatic" (default) | "bin"
            policyFile: "" # optional global update-policy.json (else discovery, else built-in)
            exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
```

## Live-verified hard lessons (why it works)

Four failures cost real time before the live pipeline ran clean; each is a loader/API contract fact,
not a style choice:

1. **`inject` and `Config` must sit on the DEFAULT export object** — the loader builds the fiber
   from the default object; named-only exports are shadowed and service accessors throw
   `cannot get property "fs" without inject`.
2. **`apply` must return nothing** — a returned value silently kills event delivery (the loader
   treats apply returns specially). Test probes use `Context.__governorState`.
3. **`ctx.jobs` is agent-scoped** — a root plugin has no job controller
   (`no job controller serves this agent`). Root-plugin background work = the detached contained
   continuation.
4. **`ctx.fs.writeText` from a root plugin needs an explicit sandbox policy** — the deployment
   default (`workspace-write`) denies paths outside the canonical workspace; the governor passes
   `{ mode: "danger-full-access" }` because its own exclude list IS its fence.

## Observe

- Write a `package.json` with the `write` tool anywhere → check:
    - the global `governor.log` for the ledger lines (activation, governed, update stage
      dispatched/DONE);
    - the final file content (chain pins canonical when a registry.json is nearby; public deps
      bumped by ncu; rejected packages untouched);
    - the transcript: the tool result shows only the author's write.
- Write it again immediately → no `FS_STALE_VERSION` (version coherence).
- Write inside `node_modules`/`.git`/`.dsh` → `skipped (excluded)` in the ledger, file untouched.
- Edit ONE line with the `edit` tool → the same full governance pass runs.
