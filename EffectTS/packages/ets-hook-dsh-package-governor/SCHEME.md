# Package-Governor - Commutative Scheme & Diagram (v1.3, TypeScript, anywhere mode)

Status: **IMPLEMENTED and LIVE-VERIFIED.**

This document ships inside the bundle as `SCHEME.md` (alongside the usage README).

**v1.3 changes (2026-10-04):** the bundle is REFACTORED into a FACTORY FLAVOR.

The shared machinery of the family is consumed from the injected `@playform/ets-plugin-dsh-factory`
service (v0.1.0), with `inject: ["fs", "pluginFactory"]`.

The absorbed modules (Append, Journal, Open, Match, Discover, Parse, Continue, Govern, Refresh) are
deleted from this tree.

The ledger strings, the silence invariant, the chain semantics, the exemptions, and the loader
contract are byte-identical (see §2 for the module/factory split).

**v1.2 changes (2026-10-03):** the plugin is now TypeScript-first, built with `@playform/build`
(`Source/` → `Target/`, `prepublishOnly` build hook), with kind-folder categorization
(`Source/Function/*`, `Source/Interface/*`, `Source/Variable/*`, no folder/file name duplication).

The publish identity is `@playform/ets-hook-dsh-package-governor`, with granularized install paths
(npm dependency auto-activation, git clone plus build, native `dsh plugin add`).

The devDependencies are typed from the published seam packages at the exact versions of the HOST:
`@deepseek-ai/dsh-fs`/`dsh-subprocess`/`dsh-sandbox` at 0.2.0-rc.2, `@deepseek-ai/cordis` ^4.0.4,
and `@deepseek-ai/schemastery` ^3.18.4.

The `@deepseek-ai/dsh` npm package is the CLI APPLICATION, not a types package: its vocabulary lives
in the seam packages, and installing the CLI as a devDependency would drag the whole app into the
bundle.

These types now cover the event payloads (`FsTarget`/`FsObservation` with the `fs/observed`
`Context`/`Events` augmentation), the Config schema, and the service calls
(`ctx.fs.readText/writeText/stat` signatures including the sandbox policy arg, the probed
`ctx.subprocess` spawn seam).

The runtime behavior, the ledger strings, and the silence invariant are byte-identical to the
verified v0.4.x line.

**Verified corrections folded in (2026-10-03, each cost live debugging time):**

- `inject` + `Config` MUST be on the DEFAULT export object of the loader (named-only exports are
  shadowed, which gives `cannot get property "fs" without inject`).
- `apply` MUST return nothing, because a return value silently kills event delivery.
- The update stage is a **detached contained continuation**, NOT a `ctx.jobs` job (`ctx.jobs` is
  agent-scoped, and a root plugin has no job controller).
- `ctx.fs.writeText` from a root plugin REQUIRES an explicit sandbox policy
  (`{ mode: "danger-full-access" }`, where the exclude list of the governor is its fence), because
  the deployment default `workspace-write` denies paths outside the canonical workspace.
- Peers are dropped (the `@deepseek-ai/*` runtime resolution comes from the installation scope), and
  devDependencies are kept for the type checker.

All mechanism claims below were verified against the **live runtime**: host cordis Event catalog;
`dsh-tool-fs`, `dsh-fs-local`, `dsh-fs`, `dsh-fs-sandbox`, `dsh-fs-observation-policy` sources
(asar-extracted); `docs/subsystems/filesystem.md`, `docs/subsystems/jobs.md`,
`docs/event-producer-consumer.md`, `docs/user/develop/basic/*`.

---

## 0. Why `fs/observed`, not the `fs/write-intent` waterfall

The intent waterfall carries only a version guard (`{kind:"createIfAbsent"}` |
`{kind:"replaceIfVersion", version}`), never content (`docs/subsystems/filesystem.md:515-526`).

The write content travels only in the own arguments of the tool, then into `ctx.fs.writeText`.

The only hook that runs _after_ content is on disk is the synchronous broadcast `fs/observed`.

Hence the post-hoc rewrite design.

(`FsTarget` has only `targetKey` + `displayPath`; the `target.path` assumption was the fatal bug of
the previous attempt.)

## 1. The domain - every harness write path

`fs/observed` is dispatched **only by the tool layer** (`dsh-tool-fs`,
`dsh-tool-str-replace-editor`), for **every** write, edit, or read issued through the harness fs
tools, by **any** thread: main agent, subagent, workflow child.

The fs _service_ and every other writer (bash, git, ncu, plain `node:fs`) dispatch **nothing**.

Write paths `𝒲 = { write tool, edit tool, str-replace-editor, any tool issuing ctx.fs.writeText }`.

Every `w ∈ 𝒲` emits exactly one `fs/observed` with `(target, {kind:"present", version}, actor)`:
full writes AND single-line edits dispatch the identical payload (live-verified: a one-line `edit`
triggered the complete pass).

## 2. The governor pipeline G = U ∘ P

This module is a FACTORY MODULE: the shared machinery of the family lives in the injected
`@playform/ets-plugin-dsh-factory` service, whose SCHEME.md is the machinery contract, while this
section is the MODULE contract.

`inject: ["fs", "pluginFactory"]`; the built Target never imports the factory, because the service
resolves from the profile through the injector and the compilation of the module declares the
contract structurally (Source/Interface/Factory.ts).

What the factory absorbed from v0.4 of this bundle: the ledger (Append), the P5 journal, the
exclusion match, the registry walk-up plus sidecar parse, the union keep-list (ResolvePolicy), the
g1 gate set, the guarded write (GuardedWrite: the P4 fence plus Stash pre-registration), the P₃/U₂
refresh, the detached contained continuation scaffolding (Continue: Inflight, readText,
ResolvePolicy, write, message, refresh), the State builder, and the wiring and lifecycle effects
(P1/P2/P5).

What stayed module-owned: the transform (the chain pass: decode → Satisfy → the refusal guard,
Function/Transform), the update engine (Function/Follow → Dispatch → Execute → Update/* → Settle),
the FIRST-WINS update-policy path pick (Function/Resolve, an engine input and NOT the union
keep-list discovery of the factory), and every ledger string.

- **Context discovery (no roots).**

    `Factory.Discover`/`Factory.Parse` find the nearest `registry.json` by walking UP from the
    directory of the written file, stopping at `node_modules` boundaries and the filesystem root.

    Its `update-policy.json` (co-located, or the directory of the file, or the configured global
    `policyFile`) drives U.

    Without any policy, U uses a built-in default: reject the learned tailwindcss exception, all dep
    groups, target latest, no verifyCommand.

- **P - chain pass** (pure, deterministic, idempotent, the transform of the FLAVOR, run inside
  `Factory.Continue`).

    When a registry was found, rewrite chain-governed pins (`dep ∈ registry.effectiveLatest`) to
    `^<resolved>` when out of chain; leave unknown deps for U unless `strict` is explicit (never
    default-delete).

    Without a registry, P is skipped (everything is public), and `P(P(c)) = P(c)`.

    The rewrite is the `GuardedWrite` of the factory (replaceIfVersion + the P4 sandbox fence +
    Stash pre-registration).

    The `governed <path> → <version>` line is the `message` of the transform, and the update stage
    is chained off the settled continuation (Function/Follow), skipped on refusal, decode failure,
    or a failed guarded write (the message callback runs only post-write).

    When a registry exists but the chain pass changed nothing (every computed pin equals its current
    pin), the passage stays closed: the update stage is not dispatched for it and nothing is written
    (the no-flap rule, added against the identical-update flap).

    Without a registry the passage stays closed too, and the same no-flap rule covers both
    sub-cases, so a package.json write whose chain pass changed nothing never re-triggers a full
    update run.

    The update stage runs only off a successful governed write (the public deps left for ncu, the
    job of the Filter gate) or the explicit direct-govern `update` entry.

- **U - update stage** (policy-gated, cooldown-guarded, async, DUAL-MODE).

    It is a harness JOB when the P1 controller (attached by `Factory.Attach` from the root context)
    serves this composition, via `ctx.jobs.start({kind: "governor-update", owner: undefined, run})`,
    with the historical **detached contained continuation** as the probed fallback (`Dispatch` →
    `Execute`) for deployments without a jobs registry or on a `start` preflight rejection.

    Mode `updateMode` **`"programmatic"` (default)** imports the `npm-check-updates` library (a
    declared dependency in the `node_modules` of the bundle) only inside that continuation and
    drives it through
    `ncu.run({packageFile, upgrade: true, silent: true, dep, concurrency, target, reject, allow, filter})`,
    with no external binary.

    Mode **`"bin"`** uses the `ncu` binary from `ncuBin`, resolved via
    `ctx.subprocess.resolveExecutable` and spawned through `ctx.subprocess` with the same
    policy-derived CLI arguments (reject/allow/dep/concurrency/target/filter), and a minimal
    child-process fallback runs inside the continuation when the deployment has no subprocess seam.

    Both modes preserve every policy option
    (`reject`/`allow`/`depGroups`/`concurrency`/`targets`/`verifyCommand`), and both merge the
    **chain-governed dep names into the reject list** as the cordis-trap guard: ncu must never bump
    a chain pin to public npm latest, and `-x`/`--reject` is ONE comma-delimited argument (ncu
    23.x).

    Then the `verifyCommand` of the policy runs if any (exit 127 = runner unavailable, non-fatal),
    only when cooldown elapsed and no update is already in flight for that directory.

    External-process writes (ncu, pnpm) dispatch no events.

    **U₂ (required for the silence invariant)**: the settlement of the continuation (`Settle`) must
    re-emit `fs/observed` with the fresh version from `ctx.fs.stat(target)` handed to
    `Factory.Refresh` (same actor, captured in the listener closure).

    ncu mutates package.json after P₃, and without U₂ the policy record stays at the pre-ncu
    version, so the next guarded write/edit of the author would fail `FS_STALE_VERSION`, a
    notification leak.

## 3. Trigger law and non-trigger law

- **Trigger law**: G fires if and only if `fs/observed` carries `observation.kind === "present"`,
  **`actor.name ∈ mutationTools`** (`write`, `edit`, `str_replace_editor`; reads also emit
  `kind:"present"` with a stat version, so the actor gate is required), and
  `basename(target.displayPath) === "package.json"`, with **no root check and anywhere mode**.
  Precedent: `dsh-skill-filesystem/lib/index.js:57-60`.
- **Exclusion law (first)**: if any path segment of `displayPath` matches the config `exclude` list
  (defaults: `node_modules`, `.git`, `.dsh`, `.pnpm`, `.store`, `DeepSeek Harness.app`), G records
  `skipped (excluded)` and does nothing, so internals are never governed.
- **Idempotence gate**: `Stash.get(targetKey) === observation.version` means skip, which covers the
  refresh re-emit of G (it re-enters the listener as a no-op) and any re-read of a governed file.
- **Non-trigger law (no recursion)**: the own writes of G go through the `ctx.fs` service (the fs
  service dispatches no `fs/observed`, and only the tool layer does) and the update stage is a
  continuation, so neither is an author tool call, and **G ∉ 𝒲**.
- **Re-entrancy is still handled**: the deliberate refresh re-emit (below) reaches the own listener
  of G again, and the version-token gate makes it a no-op.

## 4. Commutativity

For any write path `w ∈ 𝒲`, author content `c`, registry/policy snapshot `R`:

```
        disk ⟦ w(c) ⟧ ──fs/observed──▶ G(c) ──▶ disk ⟦ U(P(c)) ⟧
```

- **Path independence**: the final on-disk state depends only on `c` and `R`, not on which element
  of `𝒲` wrote it, because all paths dispatch the same event with the same payload shape.
- **Interleaving closure**: for two author writes `w₁, w₂` and governor passes `G₁, G₂`,
  `disk⟦G₂(w₂(G₁(w₁(c))))⟧ = disk⟦G₂(w₂(w₁(c)))⟧`, because P is idempotent, U is gated, and the
  governor's rewrite is version-guarded (`replaceIfVersion` at the observed version): if the author
  lands a newer write before the rewrite of G, the write of G is rejected stale and the newer write
  triggers its own G pass. Final state = governed form of the last author write.
- **Update-stage race (accepted, documented)**: ncu rewrites the file from its own read, so a second
  author write during a running ncu can be clobbered. The per-directory in-flight flag plus cooldown
  make this a rare, logged event, and the chain pass re-governs whatever lands.

## 5. Silence invariant (the "no notification" property)

The observable state of the parent thread (tool result envelope, transcript, session events) is
**identical with and without G**, except for two items.

1. **The governed file's on-disk content.**

    It is discoverable only by a later `read`.

2. **The observation-policy's recorded version.**

    G **refreshes** it (see below).

Proof from the write tool (`dsh-tool-fs/lib/index.js:583-597`): the result
`{path, operation, before, after}` is built from the `writeText` **outcome**, where
`after = normalizeLineEndings(author content)` is the own content of the tool, **not a disk
re-read** (`dsh-fs-local/lib/index.js:872-880`).

No checksum.

A post-emit rewrite is invisible to the envelope.

**Required hygiene (the leak vector)**: the observation-policy (active via `dsh-base` patch) records
`{kind:"present", version}` per `owner = actor.agent.session`.

If G mutates the file without refreshing the record, the next guarded write/edit of the author fails
**FS_STALE_VERSION**, an error that the model _sees_, which is a notification leak.

Therefore G must, after every mutation:

- **P**: re-emit `ctx.emit("fs/observed", target, {kind:"present", version: v'}, <same actor>)` with
  `v'` taken from the `ctx.fs.writeText` outcome (`FsWriteOutcome.version`; the service owns the
  version token, and it is never computed or parsed locally), so the same actor gives the same owner
  bucket and the record is refreshed.
- **U**: in the settlement of the continuation, re-stat via `ctx.fs.stat(target)` and re-emit with
  the fresh version (same actor), which covers ncu/verifyCommand mutations.

G never participates in `fs/write-intent`/`fs/edit-intent` waterfalls, never touches `tools/*`
waterfalls (`tools/post-execute` is the only sanctioned result amendment, and it is _louder_, so
forbidden), never spawns LLM calls, never adds messages, and never throws (a listener throw fails
the tool call, so wrap everything, and the ledger is best-effort).

## 6. Diagram

```
              AUTHOR THREAD(S) — main agent, subagents, workflow children
                 │  write / edit / str_replace_editor: package.json ANYWHERE
                 │  (excluded segments: node_modules, .git, .dsh, …)
                 ▼
        ┌────────────────────────── HOST EVENT BUS ──────────────────────────┐
        │ ① fs/write-intent (waterfall, single-slot): version guard only —   │
        │     no content ever travels the intent; G passes through           │
        │            ▼                                                       │
        │ ② ctx.fs.writeText: atomic, guarded write — author content lands,  │
        │     version v                                                      │
        │            ▼                                                       │
        │ ③ fs/observed (emit, SYNCHRONOUS, not awaited):                    │
        │     (target{targetKey, displayPath}, {kind:"present", version v},  │
        │      actor) — broadcast to:                                        │
        │      ├─▶ observation-policy: records (owner=actor.agent.session, v)│
        │      └─▶ GOVERNOR G (this bundle) — the only subscriber that acts  │
        │            E₀ exclusion check (segment match) → skip if excluded   │
        │            P₀ context discovery: registry.json walk-up (∄ → skip P)│
        │            P₁ ctx.fs.readText; chain pass (pure, idempotent)       │
        │            P₂ ctx.fs.writeText(governed, replaceIfVersion(v),      │
        │               {mode:"danger-full-access"}) — service write, no     │
        │               fs/observed from the service                         │
        │            P₃ re-emit fs/observed(outcome.version) ── refreshes    │
        │               policy; re-enters G as a no-op                       │
        │            U₁ DETACHED CONTAINED CONTINUATION (not ctx.jobs —      │
        │               agent-scoped): mode from updateMode — programmatic   │
        │               library, or bin via ctx.subprocess + ncuBin; policy  │
        │               discovery or built-in default; reject ∪ chainDeps;   │
        │               cooldown + in-flight + breaker                       │
        │            U₂ settlement: ctx.fs.stat → re-emit fs/observed        │
        │               (fresh version — required — see §2)                  │
        │            L  ledger: <logFile> (global) + ctx.logger +            │
        │               activation line in apply()                           │
        └─────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
        ④ tool result {path, operation, before, after} built from the
           AUTHOR'S OWN content (writeText outcome — no disk re-read)
                 │
                 ▼
        PARENT THREAD SEES: exactly what it wrote.  ∄ G→parent edge.
```

Non-edges (proven absent, marked ∄):

| edge                                           | why it cannot exist                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| G's rewrite → new `fs/observed`                | only the tool layer dispatches; `ctx.fs` service writes emit nothing                     |
| ncu/pnpm → new `fs/observed`                   | external processes dispatch nothing                                                      |
| G → tool result amendment                      | result envelope uses the tool's own content, not disk                                    |
| G → transcript/session event                   | G emits only `fs/observed` (internal bus) and writes `ets-hook-dsh-package-governor.log` |
| author's next guarded write → FS_STALE_VERSION | P₃/U₂ refresh the policy record (same owner)                                             |
| G's re-entrant pass → rewrite loop             | P idempotent ⇒ re-entrant P is a no-op                                                   |
| G → ctx.jobs job                               | jobs registry is agent-scoped; root plugins use the continuation                         |

## 7. Registration

1. **Source.**

    `Source/Library.ts` (loader contract: `name`, `apply`, `Config`,
    `inject: ["fs", "pluginFactory"]`, default `{ name, apply, Config, inject }`, all four on the
    default object, and `apply` returns nothing) + `Source/Function/*` + `Source/Interface/*` +
    `Source/Variable/*`.

    The build runs through `@playform/build` (`Configuration/ESBuild.ts`) into `Target/` (.js +
    .d.ts).

    The `pluginFactory` inject makes the loader hold this bundle PENDING until the factory service
    exists, so load order never matters, and no config row beyond the existing one is needed because
    the factory provides no Config.

2. **Package.**

    `package.json` sets `main`/`exports` → `Target/Library.js`,
    `files: ["Target", "cordis.patch.yml", "README.md", "SCHEME.md"]` (no Source, because the
    published artifact ships only the built output), `prepublishOnly` = the build,
    `cordis.patch.yml` (row `id: ets-hook-dsh-package-governor`,
    `name: "@playform/ets-hook-dsh-package-governor"`, config), and
    `"dsh": {"bundle": {"patch": "./cordis.patch.yml"}}`.

3. **Install (granularized).**

    - **Remote/dependency**: `pnpm add @playform/ets-hook-dsh-package-governor` in a profile
      auto-activates at the next host start, because the `dsh.bundle` manifest makes a plain
      dependency a harness bundle.
    - **Git clone**: clone → `pnpm install --ignore-workspace` → `pnpm build` →
      `dsh plugin --profile <name> add <dir>`.
    - **Native dsh**: `dsh plugin --profile <name> add <tarball|dir|npm-spec>`.

4. **Verify activation.**

    Use `plugin_manager` / Inspect `Config.listConfigs` plus the durable
    `activated (anywhere mode, ...)` ledger line in `apply()`, and never assume, because the
    previous disable was an uncommitted staged edit that only forensics discovered.

## 8. Config (validated schema - every tunable is a field)

The exported `Config` schema validates and fills every default at load, and an invalid configuration
fails loudly.

New entries are declared with `insert:`: a bare `id:` row patches an existing entry, and the loader
rejects unknown ids with `entry "..." not found` (verified 2026-10-02).

```yaml
- insert:
      - id: ets-hook-dsh-package-governor
        name: "@playform/ets-hook-dsh-package-governor"
        config:
            log: true
            logFile: ~/.dsh/playform/ets-hook-dsh-package-governor.log # global ledger (default: ~/.dsh/playform/ets-hook-dsh-package-governor.log)
            updateCooldownMs: 3000
            strict: false # explicit; never default-delete unknown deps
            mutationTools: [write, edit, str_replace_editor] # reads emit too — gate required
            maxUpdateFailures: 3 # circuit breaker: pause a dir after N consecutive failures
            ncuBin: /usr/local/bin/ncu # absolute — host PATH is not the shell PATH
            updateMode: programmatic # "programmatic" (default) | "bin" (ncu binary via ncuBin)
            policyFile: "" # optional global update-policy.json; else discovery; else built-in default
            exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
```

## 9. Test plan (verified live 2026-10-03 against the built bundle)

1. **The restart.**

    Restart with the bundle active, and `ets-hook-dsh-package-governor.log` shows the activation
    line.

2. **The stale pins.**

    Write a stale-pins `package.json` with the write tool.

    The chain pass corrects chain pins, the file lands governed, the tool result shows the author's
    content only, and the transcript contains no governor traces.

3. **The repeat write.**

    Write the same file again immediately: no FS_STALE_VERSION (P3 hygiene).

4. **The public-dep bump.**

    Public-dep bump: ncu ran (ledger lines), and the version record is fresh (U2).

5. **The line edit.**

    Edit ONE line with the edit tool: the full pass runs (line-patch activation, live-verified).

6. **The loop check.**

    Loop check: after all of the above, `ets-hook-dsh-package-governor.log` shows no runaway
    recursion.

7. **The excluded path.**

    Excluded-path write (`node_modules/...`): `skipped (excluded)`, file untouched.

8. **The smoke suite.**

    Smoke suite (49 checks against the BUILT output): byte-identical ledger strings, gates, breaker,
    cooldown, in-flight, both update modes, refusal guard, loader contract (default-object
    inject/Config, no apply return).

## 10. Interplay - the governor family

The three plugins coexist on `fs/observed`, each gating on its own basename (`package.json` /
`package.json` / `Cargo.toml`) and writing its own ledger (`ets-hook-dsh-package-governor.log` /
`ets-hook-dsh-package-pinner.log` / `ets-hook-dsh-cargo-governor.log`).

The fs/observed trigger law and the exclusion-first rule are shared.

Composition semantics: **pin → bump-exact** (a fully pinned manifest leaves the update stage of the
npm governor nothing to do, and its chain pass may still re-canonicalize chain pins to `^resolved`).

Then **chain > strip > normalize** (the precedence of the cargo module), and **keep-list wins** (the
`pin-policy.json` of the pinner protects ranges as authored, and the keep-list of the cargo module,
the same sidecar, wins over normalization and never over the chain).

Activation of one never implies another; the user decides.
