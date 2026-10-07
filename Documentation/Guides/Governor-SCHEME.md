# Package-Governor — Commutative Scheme & Diagram (v1.2, TypeScript, anywhere mode)

> One of the four Governor guides migrated to `Documentation/Guides/` — the companion docs are
> `Governor-README.md`, `Governor-CASCADES.md`, and `Governor-TRIO-GRAPH.md` in this folder; the
> handoff context is `../Handoff/Overview.md` and `../Handoff/Packages/Package-03.md`.

Status: **IMPLEMENTED and LIVE-VERIFIED.** This document ships inside the bundle as `SCHEME.md`
(alongside the usage README).

**v1.2 changes (2026-10-03):** the plugin is now TypeScript-first, built with `@playform/build`
(`Source/` → `Target/`, `prepublishOnly` build hook), with kind-folder categorization
(`Source/Function/*`, `Source/Interface/*`, `Source/Variable/*` — no folder/file name duplication),
the publish identity `@playform/dsh-hook-package-governor`, granularized install paths (npm
dependency auto-activation / git clone + build / native `dsh plugin add`), and devDependencies typed
from the published seam packages at the HOST's exact versions —
`@deepseek-ai/dsh-fs`/`dsh-subprocess`/`dsh-sandbox` at 0.2.0-rc.2, `@deepseek-ai/cordis` ^4.0.4,
`@deepseek-ai/schemastery` ^3.18.4 (the `@deepseek-ai/dsh` npm package is the CLI APPLICATION, not a
types package — its vocabulary lives in the seam packages; installing the CLI as a devDependency
would drag the whole app into the bundle). These types now cover the event payloads
(`FsTarget`/`FsObservation` with the `fs/observed` `Context`/`Events` augmentation), the Config
schema, and the service calls (`ctx.fs.readText/writeText/stat` signatures including the sandbox
policy arg, the probed `ctx.subprocess` spawn seam). The runtime behavior, the ledger strings, and
the silence invariant are byte-identical to the verified v0.4.x line.

**Verified corrections folded in (2026-10-03, each cost live debugging time):**

- `inject` + `Config` MUST be on the loader's DEFAULT export object (named-only exports are shadowed
  → `cannot get property "fs" without inject`).
- `apply` MUST return nothing (a return value silently kills event delivery).
- The update stage is a **detached contained continuation**, NOT a `ctx.jobs` job (`ctx.jobs` is
  agent-scoped — a root plugin has no job controller).
- `ctx.fs.writeText` from a root plugin REQUIRES an explicit sandbox policy
  (`{ mode: "danger-full-access" }` — the governor's exclude list is its fence); the deployment
  default `workspace-write` denies paths outside the canonical workspace.
- Peers are dropped (the `@deepseek-ai/*` runtime resolution comes from the installation scope);
  devDependencies are kept for the type checker.

All mechanism claims below were verified against the **live runtime**: host cordis Event catalog;
`dsh-tool-fs`, `dsh-fs-local`, `dsh-fs`, `dsh-fs-sandbox`, `dsh-fs-observation-policy` sources
(asar-extracted); `docs/subsystems/filesystem.md`, `docs/subsystems/jobs.md`,
`docs/event-producer-consumer.md`, `docs/user/develop/basic/*`.

---

## 0. Why `fs/observed`, not the `fs/write-intent` waterfall

The intent waterfall carries only a version guard (`{kind:"createIfAbsent"}` |
`{kind:"replaceIfVersion", version}`) — **never content** (`docs/subsystems/filesystem.md:515-526`).
The write content travels only in the tool's own arguments → `ctx.fs.writeText`. The only hook that
runs _after_ content is on disk is the synchronous broadcast `fs/observed`. Hence the post-hoc
rewrite design. (`FsTarget` has only `targetKey` + `displayPath` — the `target.path` assumption was
the fatal bug of the previous attempt.)

## 1. The domain — every harness write path

`fs/observed` is dispatched **only by the tool layer** (`dsh-tool-fs`,
`dsh-tool-str-replace-editor`), for **every** write/edit/read issued through the harness fs tools,
by **any** thread: main agent, subagent, workflow child. The fs _service_ and every other writer
(bash, git, ncu, plain `node:fs`) dispatch **nothing**.

Write paths `𝒲 = { write tool, edit tool, str-replace-editor, any tool issuing ctx.fs.writeText }`.
Every `w ∈ 𝒲` emits exactly one `fs/observed` with `(target, {kind:"present", version}, actor)` —
full writes AND single-line edits dispatch the identical payload (live-verified: a one-line `edit`
triggered the complete pass).

## 2. The governor pipeline G = U ∘ P

- **Context discovery (no roots)**: the nearest `registry.json` is found by walking UP from the
  written file's directory (stopping at `node_modules` boundaries and the filesystem root). Its
  `update-policy.json` (co-located, or the file's own directory, or the configured global
  `policyFile`) drives U; without any policy, U uses a built-in default (reject the learned
  tailwindcss exception, all dep groups, target latest, no verifyCommand).
- **P — chain pass** (pure, deterministic, idempotent): when a registry was found, rewrite
  chain-governed pins (`dep ∈ registry.effectiveLatest`) to `^<resolved>` when out of chain; unknown
  deps: leave for U unless `strict` is explicit (never default-delete). Without a registry, P is
  skipped (everything is public). `P(P(c)) = P(c)`.
- **U — update stage** (policy-gated, cooldown-guarded, async, DUAL-MODE): a **detached contained
  continuation** (`Dispatch` → `Execute` — NOT a `ctx.jobs` job; the jobs registry is agent-scoped
  and serves no root plugin) with the config-selected mode `updateMode` — **`"programmatic"`
  (default)**: the `npm-check-updates` library (a declared dependency in the bundle's own
  `node_modules`) imported only inside that continuation and driven through
  `ncu.run({packageFile, upgrade: true, silent: true, dep, concurrency, target, reject, allow, filter})`
  — no external binary; **`"bin"`**: the `ncu` binary from `ncuBin`, resolved via
  `ctx.subprocess.resolveExecutable` and spawned through `ctx.subprocess` with the same
  policy-derived CLI arguments (reject/allow/dep/concurrency/ target/filter; a minimal child-process
  fallback runs inside the continuation when the deployment has no subprocess seam). Both modes
  preserve every policy option (`reject`/`allow`/`depGroups`/`concurrency`/
  `targets`/`verifyCommand`) and both merge the **chain-governed dep names into the reject list** —
  the cordis-trap guard: ncu must never bump a chain pin to public npm latest; `-x`/`--reject` is
  ONE comma-delimited argument (ncu 23.x) — then the policy's `verifyCommand` if any (exit 127 =
  runner unavailable, non-fatal), only when cooldown elapsed and no update is already in flight for
  that directory. External-process writes (ncu, pnpm) dispatch no events. **U₂ (required for the
  silence invariant)**: the continuation's settlement (`Settle`) must re-emit `fs/observed` with the
  fresh version from `ctx.fs.stat(target)` (same actor, captured in the listener closure). ncu
  mutates package.json after P₃; without U₂ the policy record stays at the pre-ncu version and the
  author's next guarded write/edit would fail `FS_STALE_VERSION` — a notification leak.

## 3. Trigger law and non-trigger law

- **Trigger law**: G fires ⟺ `fs/observed` carries `observation.kind === "present"`,
  **`actor.name ∈ mutationTools`** (`write`, `edit`, `str_replace_editor` — reads also emit
  `kind:"present"` with a stat version, so the actor gate is required), and
  `basename(target.displayPath) === "package.json"`. **No root check — anywhere.** Precedent:
  `dsh-skill-filesystem/lib/index.js:57-60`.
- **Exclusion law (first)**: if any path segment of `displayPath` matches the config `exclude` list
  (defaults: `node_modules`, `.git`, `.dsh`, `.pnpm`, `.store`, `DeepSeek Harness.app`), G records
  `skipped (excluded)` and does nothing — internals are never governed.
- **Idempotence gate**: `Stash.get(targetKey) === observation.version` → skip. Covers G's own
  refresh re-emit (re-enters the listener as a no-op) and any re-read of a governed file.
- **Non-trigger law (no recursion)**: G's own writes go through the `ctx.fs` service (the fs service
  dispatches no `fs/observed` — only the tool layer does) and the update stage is a continuation —
  neither is an author tool call. **G ∉ 𝒲.**
- **Re-entrancy is still handled**: G's deliberate refresh re-emit (below) reaches G's own listener
  again; the version-token gate makes it a no-op.

## 4. Commutativity

For any write path `w ∈ 𝒲`, author content `c`, registry/policy snapshot `R`:

```
        disk ⟦ w(c) ⟧ ──fs/observed──▶ G(c) ──▶ disk ⟦ U(P(c)) ⟧
```

- **Path independence**: the final on-disk state depends only on `c` and `R`, not on which element
  of `𝒲` wrote it (all paths dispatch the same event with the same payload shape).
- **Interleaving closure**: for two author writes `w₁, w₂` and governor passes `G₁, G₂`:
  `disk⟦G₂(w₂(G₁(w₁(c))))⟧ = disk⟦G₂(w₂(w₁(c)))⟧` — P is idempotent, U is gated, and the governor's
  rewrite is version-guarded (`replaceIfVersion` at the observed version): if the author lands a
  newer write before G's rewrite, G's write is rejected stale and the newer write triggers its own G
  pass. Final state = governed form of the last author write.
- **Update-stage race (accepted, documented)**: ncu rewrites the file from its own read; a second
  author write during a running ncu can be clobbered. Per-directory in-flight flag + cooldown make
  this a rare, logged event; the chain pass re-governs whatever lands.

## 5. Silence invariant (the "no notification" property)

The parent thread's observable state — tool result envelope, transcript, session events — is
**identical with and without G**, except:

1. the governed file's on-disk content (discoverable only by a later `read`), and
2. the observation-policy's recorded version, which G **refreshes** (see below).

Proof from the write tool (`dsh-tool-fs/lib/index.js:583-597`): the result
`{path, operation, before, after}` is built from the `writeText` **outcome**, where
`after = normalizeLineEndings(author content)` — the tool's own content, **not a disk re-read**
(`dsh-fs-local/lib/index.js:872-880`). No checksum. A post-emit rewrite is invisible to the
envelope.

**Required hygiene (the leak vector)**: the observation-policy (active via `dsh-base` patch) records
`{kind:"present", version}` per `owner = actor.agent.session`. If G mutates the file without
refreshing the record, the author's next guarded write/edit fails **FS_STALE_VERSION** — an error
the model _sees_ → notification leak. Therefore G must, after every mutation:

- **P**: re-emit `ctx.emit("fs/observed", target, {kind:"present", version: v'}, <same actor>)` with
  `v'` taken from the `ctx.fs.writeText` outcome (`FsWriteOutcome.version` — the service owns the
  version token; it is never computed or parsed locally). Same actor ⇒ same owner bucket ⇒ record
  refreshed.
- **U**: in the continuation's settlement, re-stat via `ctx.fs.stat(target)` and re-emit with the
  fresh version (same actor), covering ncu/verifyCommand mutations.

G never: participates in `fs/write-intent`/`fs/edit-intent` waterfalls, touches `tools/*` waterfalls
(`tools/post-execute` is the only sanctioned result amendment — it is _louder_, so forbidden),
spawns LLM calls, adds messages, or throws (a listener throw fails the tool call; wrap everything,
and the ledger is best-effort).

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

| edge                                           | why it cannot exist                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| G's rewrite → new `fs/observed`                | only the tool layer dispatches; `ctx.fs` service writes emit nothing |
| ncu/pnpm → new `fs/observed`                   | external processes dispatch nothing                                  |
| G → tool result amendment                      | result envelope uses the tool's own content, not disk                |
| G → transcript/session event                   | G emits only `fs/observed` (internal bus) and writes `governor.log`  |
| author's next guarded write → FS_STALE_VERSION | P₃/U₂ refresh the policy record (same owner)                         |
| G's re-entrant pass → rewrite loop             | P idempotent ⇒ re-entrant P is a no-op                               |
| G → ctx.jobs job                               | jobs registry is agent-scoped; root plugins use the continuation     |

## 7. Registration

1. Source: `Source/Library.ts` (loader contract: `name`, `apply`, `Config`, `inject: ["fs"]`,
   default `{ name, apply, Config, inject }` — all four on the default object; `apply` returns
   nothing) + `Source/Function/*` + `Source/Interface/*` + `Source/Variable/*`. Built by
   `@playform/build` (`Configuration/ESBuild.ts`) into `Target/` (.js + .d.ts).
2. Package: `package.json` — `main`/`exports` → `Target/Library.js`,
   `files: ["Target", "cordis.patch.yml", "README.md", "SCHEME.md"]` (no Source — the published
   artifact ships only the built output), `prepublishOnly` = the build, `cordis.patch.yml` (row
   `id: package-governor`, `name: "@playform/dsh-hook-package-governor"`, config),
   `"dsh": {"bundle": {"patch": "./cordis.patch.yml"}}`.
3. Install (granularized):
    - **Remote/dependency**: `pnpm add @playform/dsh-hook-package-governor` in a profile →
      auto-activates at the next host start (the `dsh.bundle` manifest makes a plain dependency a
      harness bundle).
    - **Git clone**: clone → `pnpm install --ignore-workspace` → `pnpm build` →
      `dsh plugin --profile <name> add <dir>`.
    - **Native dsh**: `dsh plugin --profile <name> add <tarball|dir|npm-spec>`.
4. Verify activation via `plugin_manager` / Inspect `Config.listConfigs` + the durable
   `activated (anywhere mode, …)` ledger line in `apply()` (never assume; the previous disable was
   an uncommitted staged edit, discovered only by forensics).

## 8. Config (validated schema — every tunable is a field)

The exported `Config` schema validates and fills every default at load (invalid configuration fails
loudly). New entries are declared with `insert:` — a bare `id:` row patches an existing entry and
the loader rejects unknown ids with `entry "…" not found` (verified 2026-10-02).

```yaml
- insert:
      - id: package-governor
        name: "@playform/dsh-hook-package-governor"
        config:
            log: true
            logFile: $DSH_HOME/governor.log # global ledger (default: $DSH_HOME/governor.log)
            updateCooldownMs: 3000
            strict: false # explicit; never default-delete unknown deps
            mutationTools: [write, edit, str_replace_editor] # reads emit too — gate required
            maxUpdateFailures: 3 # circuit breaker: pause a dir after N consecutive failures
            ncuBin: ncu # binary name resolved via the host PATH (or an absolute path)
            updateMode: programmatic # "programmatic" (default) | "bin" (ncu binary via ncuBin)
            policyFile: "" # optional global update-policy.json; else discovery; else built-in default
            exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
```

## 9. Test plan (verified live 2026-10-03 against the built bundle)

1. Restart with the bundle active; `governor.log` shows the activation line.
2. Write a stale-pins `package.json` with the write tool:
    - chain pass corrects chain pins; file lands governed; tool result shows the author's content
      only; transcript contains no governor traces.
3. Write the same file again immediately: no FS_STALE_VERSION (P₃ hygiene).
4. Public-dep bump: ncu ran (ledger lines), version record fresh (U₂).
5. Edit ONE line with the edit tool: the full pass runs (line-patch activation, live-verified).
6. Loop check: after all of the above, `governor.log` shows no runaway recursion.
7. Excluded-path write (`node_modules/…`): `skipped (excluded)`, file untouched.
8. Smoke suite (47 checks against the BUILT output): byte-identical ledger strings, gates, breaker,
   cooldown, in-flight, both update modes, refusal guard, loader contract (default-object
   inject/Config, no apply return).
