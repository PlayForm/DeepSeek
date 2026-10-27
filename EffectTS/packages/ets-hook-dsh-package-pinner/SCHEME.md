# Package-Pinner - Commutative Scheme & Diagram (v1.0, TypeScript, anywhere mode)

Status: **IMPLEMENTED and SMOKE-VERIFIED** (the smoke suite proves the pipeline against the built
output, and the API contracts are the governor's, live-verified against the same runtime on
2026-10-02/03).

A SEPARATE plugin from `@playform/ets-hook-dsh-package-governor`, with the same TypeScript/PlayForm
layout and the same API-awareness discipline, but a different mission: **pin every dependency
version in a written package.json to its static version** (`"^0.3.4"` → `"0.3.4"`).

---

## 0. Why `fs/observed`, not the `fs/write-intent` waterfall

The intent waterfall carries only a version guard (`{kind:"createIfAbsent"}` |
`{kind:"replaceIfVersion", version}`), never content (`docs/subsystems/filesystem.md:515-526`).

The write content travels only in the own arguments of the tool, then into `ctx.fs.writeText`.

The only hook that runs _after_ content is on disk is the synchronous broadcast `fs/observed`.

Hence the post-hoc rewrite design.

(`FsTarget` has only `targetKey` + `displayPath`; the `target.path` assumption was the fatal bug of
the first attempt of the governor.)

## 1. The domain - every harness write path

`fs/observed` is dispatched **only by the tool layer** (`dsh-tool-fs`,
`dsh-tool-str-replace-editor`), for **every** write, edit, or read issued through the harness fs
tools, by **any** thread: main agent, subagent, workflow child.

The fs _service_ and every other writer (bash, git, pnpm, plain `node:fs`) dispatch **nothing**.

Write paths `𝒲 = { write tool, edit tool, str-replace-editor, any tool issuing ctx.fs.writeText }`.

Every `w ∈ 𝒲` emits exactly one `fs/observed` with `(target, {kind:"present", version}, actor)`, and
full writes AND single-line edits dispatch the identical payload.

## 2. The pipeline - P only

There is NO update stage: the pinner is a **pure deterministic rewrite**, with no ncu, no jobs, no
subprocess, and no cooldown/breaker.

One pass:

```
P = Rewrite ∘ Pin ∘ Resolve ∘ Decode
```

- **Keep-list policy discovery** (`Resolve`).

    The sources come in order: the configured global `policyFile`, then the own directory of the
    written file, then co-location with the nearest discovered `registry.json` (if any, walking up
    and stopping at `node_modules` boundaries and the filesystem root), then the built-in default
    (empty keep-list).

    Every readable source contributes, and the **effective keep-list is the UNION**.

    A source file that exists but does not parse is logged
    (`unreadable pin-policy.json at ... - using built-in default`) and contributes nothing.

- **P - pin pass** (`Pin`, pure, deterministic, idempotent).

    Inside every config-declared dependency section, each ranged version has ONE leading prefix
    stripped (`^`, `~`, `=`), and `P(P(c)) = P(c)`.

- **Rewrite** (`Rewrite`).

    The refusal guard runs first, then the version-guarded `ctx.fs.writeText`, then the P₃ re-emit.

## 3. The range law (the transform, exactly)

For each dependency value `v` (after the keep-list gate), in order:

| #   | Condition                    | Action                       | Examples                                                                                                                              |
| --- | ---------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | not a string                 | untouched                    | `"foo": {"imports": …}`                                                                                                               |
| 2   | first char ∉ {`^`, `~`, `=`} | untouched                    | `"0.3.4"`, `"1.2.3-rc.1"`, `"*"`, `""`, `">=1.0.0"`, `"workspace:*"`, `"file:../x"`, `"link:…"`, `"git+https://…"`, `"npm:pkg@1.0.0"` |
| 3   | whitespace in value          | untouched                    | `"^1.0.0 \|\| 2.0.0"`, `"^1.0.0 <2.0.0"`                                                                                              |
| 4   | otherwise                    | strip the one leading prefix | `"^0.3.4"` → `"0.3.4"`, `"~1.2.3"` → `"1.2.3"`, `"=2.0.0"` → `"2.0.0"`                                                                |

Idempotence: an already-static version has no leading prefix, so rule 2 passes it through, and
**pinning a pinned file is a no-op rewrite** (the ledger shows `no changes to pin for ...`).

**Documented edge decision (wildcards with a prefix)**: `"^1.*"` IS stripped to `"1.*"`, because the
law strips the notation (the prefix) and leaves the content untouched.

The static-version rule targets the common caret/tilde/exact case, and the pinner never invents
content.

Protect wildcards with the keep-list (`pin-policy.json`) if a deployment needs them preserved.

**Protocol safety**: none of `workspace:*`, `file:`, `link:`, `git+...`, `npm:` begins with
`^`/`~`/`=`, so rule 2 leaves them untouched by construction, and there is no separate protocol test
to get wrong.

## 4. Trigger law and non-trigger law

- **Trigger law**: P fires if and only if `fs/observed` carries `observation.kind === "present"`,
  **`actor.name ∈ mutationTools`** (`write`, `edit`, `str_replace_editor`; reads also emit
  `kind:"present"` with a stat version, so the actor gate is required), and
  `basename(target.displayPath) === "package.json"`, with **no root check and anywhere mode**. This
  is identical to the trigger law of the governor, minus the registry logic.
- **Exclusion law (first)**: if any path segment of `displayPath` matches the config `exclude` list
  (defaults: `node_modules`, `.git`, `.dsh`, `.pnpm`, `.store`, `DeepSeek Harness.app`), P records
  `skipped (excluded)` and does nothing, so internals are never pinned.
- **Idempotence gate**: `Stash.get(targetKey) === observation.version` means skip, which covers the
  refresh re-emit of P (it re-enters the listener as a no-op) and any re-read of a pinned file.
- **Non-trigger law (no recursion)**: the own writes of P go through the `ctx.fs` service (the fs
  service dispatches no `fs/observed`, and only the tool layer does), so **P ∉ 𝒲**. Re-entrancy is
  still handled: the deliberate refresh re-emit (below) reaches the own listener of P again, and the
  version-token gate makes it a no-op.

## 5. Commutativity

For any write path `w ∈ 𝒲`, author content `c`, policy snapshot `K`:

```
        disk ⟦ w(c) ⟧ ──fs/observed──▶ P(c) ──▶ disk ⟦ P(c) ⟧
```

- **Path independence**: the final on-disk state depends only on `c` and `K`, not on which element
  of `𝒲` wrote it.
- **Interleaving closure**: for two author writes `w₁, w₂` and pin passes `P₁, P₂`,
  `disk⟦P₂(w₂(P₁(w₁(c))))⟧ = disk⟦P₂(w₂(w₁(c)))⟧`, because P is idempotent and the rewrite is
  version-guarded (`replaceIfVersion` at the observed version): if the author lands a newer write
  before the rewrite of P, the write of P is rejected stale and the newer write triggers its own P
  pass. Final state = pinned form of the last author write.

## 6. Silence invariant (the "no notification" property)

The observable state of the parent thread (tool result envelope, transcript, session events) is
**identical with and without P**, except for two items.

1. **The pinned file's on-disk content.**

    It is discoverable only by a later `read`.

2. **The observation-policy's recorded version.**

    P **refreshes** it (below).

Proof (same as the governor's): the tool result `{path, operation, before, after}` is built from the
`writeText` **outcome**, where `after = normalizeLineEndings(author content)` is the own content of
the tool, **not a disk re-read**.

No checksum.

A post-emit rewrite is invisible to the envelope.

**Required hygiene (the leak vector)**: the observation-policy (active via `dsh-base` patch) records
`{kind:"present", version}` per `owner = actor.agent.session`.

If P mutates the file without refreshing the record, the next guarded write/edit of the author fails
**FS_STALE_VERSION**, an error that the model _sees_, which is a notification leak.

Therefore P, after every mutation, re-emits
`ctx.emit("fs/observed", target, {kind:"present", version: v'}, <same actor>)` with `v'` taken from
the `ctx.fs.writeText` outcome (`FsWriteOutcome.version`; the service owns the version token, and it
is never computed or parsed locally).

Same actor gives the same owner bucket, so the record is refreshed.

The version is pre-registered in the Stash before the re-emit, so the re-entrant pass is a no-op.

P never participates in `fs/write-intent`/`fs/edit-intent` waterfalls, never touches `tools/*`
waterfalls (`tools/post-execute` is the only sanctioned result amendment, and it is _louder_, so
forbidden), never spawns processes, never calls LLMs, never adds messages, and never throws (a
listener throw fails the tool call, so wrap everything, and the ledger is best-effort).

## 7. Diagram

```
              AUTHOR THREAD(S) — main agent, subagents, workflow children
                 │  write / edit / str_replace_editor: package.json ANYWHERE
                 │  (excluded segments: node_modules, .git, .dsh, …)
                 ▼
        ┌────────────────────────── HOST EVENT BUS ──────────────────────────┐
        │ ① fs/write-intent (waterfall, single-slot): version guard only —   │
        │     no content ever travels the intent; P passes through           │
        │            ▼                                                       │
        │ ② ctx.fs.writeText: atomic, guarded write — author content lands,  │
        │     version v                                                      │
        │            ▼                                                       │
        │ ③ fs/observed (emit, SYNCHRONOUS, not awaited):                    │
        │     (target{targetKey, displayPath}, {kind:"present", version v},  │
        │      actor) — broadcast to:                                        │
        │      ├─▶ observation-policy: records (owner=actor.agent.session, v)│
        │      └─▶ PINNER P (this bundle) — the only subscriber that acts    │
        │            E₀ exclusion check (segment match) → skip if excluded   │
        │            P₀ policy discovery: global policyFile → file's own dir │
        │               → co-located with nearest registry.json (walk-up)    │
        │               → built-in default; UNION of keep-lists              │
        │            P₁ ctx.fs.readText; pin pass (pure, idempotent)         │
        │            P₂ ctx.fs.writeText(pinned, replaceIfVersion(v),        │
        │               {mode:"danger-full-access"}) — service write, no     │
        │               fs/observed from the service                         │
        │            P₃ re-emit fs/observed(outcome.version) ── refreshes    │
        │               policy; re-enters P as a no-op                       │
        │            L  ledger: <logFile> (global, SEPARATE: ets-hook-dsh-package-pinner.log) +   │
        │               ctx.logger + activation line in apply()              │
        └─────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
        ④ tool result {path, operation, before, after} built from the
           AUTHOR'S OWN content (writeText outcome — no disk re-read)
                 │
                 ▼
        PARENT THREAD SEES: exactly what it wrote.  ∄ P→parent edge.
```

Non-edges (proven absent, marked ∄):

| edge                                           | why it cannot exist                                                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| P's rewrite → new `fs/observed`                | only the tool layer dispatches; `ctx.fs` service writes emit nothing                   |
| P → tool result amendment                      | result envelope uses the tool's own content, not disk                                  |
| P → transcript/session event                   | P emits only `fs/observed` (internal bus) and writes `ets-hook-dsh-package-pinner.log` |
| author's next guarded write → FS_STALE_VERSION | P₃ refreshes the policy record (same owner)                                            |
| P's re-entrant pass → rewrite loop             | P idempotent ⇒ re-entrant P is a no-op                                                 |
| P → ctx.jobs / subprocess                      | P is P-only: no update stage exists to run                                             |

## 8. Registration

1. **Source.**

    `Source/Library.ts` (loader contract: `name`, `apply`, `Config`, `inject: ["fs"]`, default
    `{ name, apply, Config, inject }`, all four on the default object, and `apply` returns
    nothing) + `Source/Function/*` + `Source/Interface/*` + `Source/Variable/*`.

    The build runs through `@playform/build` (`Configuration/ESBuild.ts` plus the `.js` twin) into
    `Target/` (.js + .d.ts).

2. **Package.**

    `package.json` sets `main`/`exports` → `Target/Library.js`,
    `files: ["Target", "cordis.patch.yml", "README.md", "SCHEME.md"]` (no Source, because the
    published artifact ships only the built output), `dependencies: {}` (schemastery resolves from
    the host installation scope), `prepublishOnly` = the build, `cordis.patch.yml` (row
    `id: ets-hook-dsh-package-pinner`, `name: "@playform/ets-hook-dsh-package-pinner"`, config), and
    `"dsh": {"bundle": {"patch": "./cordis.patch.yml"}}`.

3. **Install (granularized).**

    - **Remote/dependency**: `pnpm add @playform/ets-hook-dsh-package-pinner` in a profile
      auto-activates at the next host start, because the `dsh.bundle` manifest makes a plain
      dependency a harness bundle.
    - **Git clone**: clone → `pnpm install --ignore-workspace` → build
      (`npx Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts`) →
      `dsh plugin --profile <name> add <dir>`.
    - **Native dsh**: `dsh plugin --profile <name> add <tarball|dir|npm-spec>`.

4. **Verify activation.**

    Use the durable `activated (pinner, ...)` ledger line in `apply()`, and never assume a restart
    activated the bundle.

## 9. Config (validated schema - every tunable is a field)

The exported `Config` schema validates and fills every default at load, and an invalid configuration
fails loudly.

New entries are declared with `insert:`: a bare `id:` row patches an existing entry, and the loader
rejects unknown ids with `entry "..." not found`.

```yaml
- insert:
      - id: ets-hook-dsh-package-pinner
        name: "@playform/ets-hook-dsh-package-pinner"
        config:
            log: true
            logFile: ~/.dsh/playform/ets-hook-dsh-package-pinner.log # SEPARATE ledger (own plugin)
            mutationTools: [write, edit, str_replace_editor] # reads emit too — gate required
            policyFile: "" # optional global pin-policy.json; else discovery; else built-in default
            sections: [dependencies, devDependencies, peerDependencies, optionalDependencies]
            exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
```

## 10. Test plan (smoke-verified against the built bundle)

The suite `pinner-smoke.mjs` (in the `smokes/` directory of the family) mirrors the fake-ctx harness
of the governor (real temp-dir I/O with `dev:ino:size:mtimeNs:ctimeNs` version tokens enforcing
`replaceIfVersion`) and asserts, among others:

1. **Loader contract.**

    The entry exports name/apply/Config/inject, the default object carries inject + Config, and
    apply returns undefined.

2. **Byte-identical ledger strings.**

    The strings are `activated (pinner, ...)`, `skipped (excluded) ...`,
    `observed non-JSON package.json ... - skipped`, `pinned ... (N versions)`,
    `no changes to pin for ...`, `unreadable pin-policy.json at ... - using built-in default`, and
    `REFUSED rewrite of ...: non-dependency section "..." would change`.

3. **The range law across all four sections.**

    Caret, tilde, and equals are stripped, while static versions, compound ranges, wildcards, and
    protocol deps stay untouched.

4. **Keep-list policy honored** (`tailwindcss` stays `^3.0.5`) and the discovery order (global → dir
   → registry-co-located → built-in) with the union.

5. **Silence.**

    Emit returns synchronously (an await-free listener), the throwing continuation is contained
    (logger-only), and the P₃ re-emit refreshes the token so the next guarded write does not fail
    FS_STALE_VERSION.

## 11. Interplay - the governor family

The three plugins coexist on `fs/observed`, each gating on its own basename (`package.json` /
`package.json` / `Cargo.toml`) and writing its own ledger (`ets-hook-dsh-package-pinner.log` /
`ets-hook-dsh-package-governor.log` / `ets-hook-dsh-cargo-governor.log`).

The fs/observed trigger law and the exclusion-first rule are shared.

Composition semantics: **pin → bump-exact** (the pinner pins `^0.3.4` → `0.3.4`, and a fully pinned
manifest leaves the update stage of the npm governor nothing to do, because the no-op case of ncu is
an exact pin, while its chain pass may still re-canonicalize chain pins to `^resolved`).

Then **chain > strip > normalize** (the precedence of the cargo module), and **keep-list wins** (the
`pin-policy.json` of the pinner protects ranges as authored, and the keep-list of the cargo module,
the same sidecar, wins over normalization and never over the chain).

Activation of one never implies another; order between two npm listeners is defined only by
registration.
