# Package-Pinner — Commutative Scheme & Diagram (v1.0, TypeScript, anywhere mode)

Status: **IMPLEMENTED and SMOKE-VERIFIED** (the smoke suite proves the pipeline against the built
output; the API contracts are the governor's, live-verified against the same runtime on
2026-10-02/03).

A SEPARATE plugin from `@playform/ets-hook-dsh-package-governor`, with the same TypeScript/PlayForm
layout and the same API-awareness discipline, but a different mission: **pin every dependency
version in a written package.json to its static version** — `"^0.3.4"` → `"0.3.4"`.

---

## 0. Why `fs/observed`, not the `fs/write-intent` waterfall

The intent waterfall carries only a version guard (`{kind:"createIfAbsent"}` |
`{kind:"replaceIfVersion", version}`) — **never content** (`docs/subsystems/filesystem.md:515-526`).

The write content travels only in the tool's own arguments → `ctx.fs.writeText`.

The only hook that
runs _after_ content is on disk is the synchronous broadcast `fs/observed`.

Hence the post-hoc
rewrite design.

(`FsTarget` has only `targetKey` + `displayPath` — the `target.path` assumption was
the fatal bug of the governor's first attempt.)

## 1. The domain — every harness write path

`fs/observed` is dispatched **only by the tool layer** (`dsh-tool-fs`,
`dsh-tool-str-replace-editor`), for **every** write/edit/read issued through the harness fs tools,
by **any** thread: main agent, subagent, workflow child.

The fs _service_ and every other writer
(bash, git, pnpm, plain `node:fs`) dispatch **nothing**.

Write paths `𝒲 = { write tool, edit tool, str-replace-editor, any tool issuing ctx.fs.writeText }`.

Every `w ∈ 𝒲` emits exactly one `fs/observed` with `(target, {kind:"present", version}, actor)` —
full writes AND single-line edits dispatch the identical payload.

## 2. The pipeline — P only

There is NO update stage: the pinner is a **pure deterministic rewrite** — no ncu, no jobs, no
subprocess, no cooldown/breaker.

One pass:

```
P = Rewrite ∘ Pin ∘ Resolve ∘ Decode
```

- **Keep-list policy discovery** (`Resolve`): sources in order — the configured global `policyFile`
  → the written file's own directory → co-located with the nearest discovered `registry.json` (if
  any — walk up, stopping at `node_modules` boundaries and the filesystem root) → built-in default
  (empty keep-list). Every readable source contributes; the **effective keep-list is the UNION**. A
  source file that exists but does not parse is logged
  (`unreadable pin-policy.json at … — using built-in default`) and contributes nothing.
- **P — pin pass** (`Pin`, pure, deterministic, idempotent): inside every config-declared dependency
  section, each ranged version has ONE leading prefix stripped (`^`, `~`, `=`). `P(P(c)) = P(c)`.
- **Rewrite** (`Rewrite`): refusal guard first, then the version-guarded `ctx.fs.writeText`, then
  the P₃ re-emit.

## 3. The range law (the transform, exactly)

For each dependency value `v` (after the keep-list gate), in order:

| #   | Condition                    | Action                       | Examples                                                                                                                              |
| --- | ---------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | not a string                 | untouched                    | `"foo": {"imports": …}`                                                                                                               |
| 2   | first char ∉ {`^`, `~`, `=`} | untouched                    | `"0.3.4"`, `"1.2.3-rc.1"`, `"*"`, `""`, `">=1.0.0"`, `"workspace:*"`, `"file:../x"`, `"link:…"`, `"git+https://…"`, `"npm:pkg@1.0.0"` |
| 3   | whitespace in value          | untouched                    | `"^1.0.0 \|\| 2.0.0"`, `"^1.0.0 <2.0.0"`                                                                                              |
| 4   | otherwise                    | strip the one leading prefix | `"^0.3.4"` → `"0.3.4"`, `"~1.2.3"` → `"1.2.3"`, `"=2.0.0"` → `"2.0.0"`                                                                |

Idempotence: an already-static version has no leading prefix, so rule 2 passes it through —
**pinning a pinned file is a no-op rewrite** (the ledger shows `no changes to pin for …`).

**Documented edge decision (wildcards with a prefix)**: `"^1.*"` IS stripped to `"1.*"` — the law
strips the notation (the prefix) and leaves the content untouched; the static-version rule targets
the common caret/tilde/exact case, and the pinner never invents content.

Protect wildcards with the
keep-list (`pin-policy.json`) if a deployment needs them preserved.

**Protocol safety**: none of `workspace:*`, `file:`, `link:`, `git+…`, `npm:` begins with
`^`/`~`/`=`, so rule 2 leaves them untouched by construction — there is no separate protocol test to
get wrong.

## 4. Trigger law and non-trigger law

- **Trigger law**: P fires ⟺ `fs/observed` carries `observation.kind === "present"`,
  **`actor.name ∈ mutationTools`** (`write`, `edit`, `str_replace_editor` — reads also emit
  `kind:"present"` with a stat version, so the actor gate is required), and
  `basename(target.displayPath) === "package.json"`. **No root check — anywhere.** (Identical to the
  governor's trigger law, minus the registry logic.)
- **Exclusion law (first)**: if any path segment of `displayPath` matches the config `exclude` list
  (defaults: `node_modules`, `.git`, `.dsh`, `.pnpm`, `.store`, `DeepSeek Harness.app`), P records
  `skipped (excluded)` and does nothing — internals are never pinned.
- **Idempotence gate**: `Stash.get(targetKey) === observation.version` → skip. Covers P's own
  refresh re-emit (re-enters the listener as a no-op) and any re-read of a pinned file.
- **Non-trigger law (no recursion)**: P's own writes go through the `ctx.fs` service (the fs service
  dispatches no `fs/observed` — only the tool layer does) — **P ∉ 𝒲**. Re-entrancy is still handled:
  the deliberate refresh re-emit (below) reaches P's own listener again; the version-token gate
  makes it a no-op.

## 5. Commutativity

For any write path `w ∈ 𝒲`, author content `c`, policy snapshot `K`:

```
        disk ⟦ w(c) ⟧ ──fs/observed──▶ P(c) ──▶ disk ⟦ P(c) ⟧
```

- **Path independence**: the final on-disk state depends only on `c` and `K`, not on which element
  of `𝒲` wrote it.
- **Interleaving closure**: for two author writes `w₁, w₂` and pin passes `P₁, P₂`:
  `disk⟦P₂(w₂(P₁(w₁(c))))⟧ = disk⟦P₂(w₂(w₁(c)))⟧` — P is idempotent and the rewrite is
  version-guarded (`replaceIfVersion` at the observed version): if the author lands a newer write
  before P's rewrite, P's write is rejected stale and the newer write triggers its own P pass. Final
  state = pinned form of the last author write.

## 6. Silence invariant (the "no notification" property)

The parent thread's observable state — tool result envelope, transcript, session events — is
**identical with and without P**, except:

1. the pinned file's on-disk content (discoverable only by a later `read`), and
2. the observation-policy's recorded version, which P **refreshes** (below).

Proof (same as the governor's): the tool result `{path, operation, before, after}` is built from the
`writeText` **outcome**, where `after = normalizeLineEndings(author content)` — the tool's own
content, **not a disk re-read**.

No checksum.

A post-emit rewrite is invisible to the envelope.

**Required hygiene (the leak vector)**: the observation-policy (active via `dsh-base` patch) records
`{kind:"present", version}` per `owner = actor.agent.session`.

If P mutates the file without
refreshing the record, the author's next guarded write/edit fails **FS_STALE_VERSION** — an error
the model _sees_ → notification leak.

Therefore P, after every mutation, re-emits
`ctx.emit("fs/observed", target, {kind:"present", version: v'}, <same actor>)` with `v'` taken from
the `ctx.fs.writeText` outcome (`FsWriteOutcome.version` — the service owns the version token; it is
never computed or parsed locally).

Same actor ⇒ same owner bucket ⇒ record refreshed.

The version is
pre-registered in the Stash before the re-emit so the re-entrant pass is a no-op.

P never: participates in `fs/write-intent`/`fs/edit-intent` waterfalls, touches `tools/*` waterfalls
(`tools/post-execute` is the only sanctioned result amendment — it is _louder_, so forbidden),
spawns processes, calls LLMs, adds messages, or throws (a listener throw fails the tool call; wrap
everything, and the ledger is best-effort).

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

| edge                                           | why it cannot exist                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| P's rewrite → new `fs/observed`                | only the tool layer dispatches; `ctx.fs` service writes emit nothing               |
| P → tool result amendment                      | result envelope uses the tool's own content, not disk                              |
| P → transcript/session event                   | P emits only `fs/observed` (internal bus) and writes `ets-hook-dsh-package-pinner.log` |
| author's next guarded write → FS_STALE_VERSION | P₃ refreshes the policy record (same owner)                                        |
| P's re-entrant pass → rewrite loop             | P idempotent ⇒ re-entrant P is a no-op                                             |
| P → ctx.jobs / subprocess                      | P is P-only: no update stage exists to run                                         |

## 8. Registration

1. Source: `Source/Library.ts` (loader contract: `name`, `apply`, `Config`, `inject: ["fs"]`,
   default `{ name, apply, Config, inject }` — all four on the default object; `apply` returns
   nothing) + `Source/Function/*` + `Source/Interface/*` + `Source/Variable/*`. Built by
   `@playform/build` (`Configuration/ESBuild.ts` + the `.js` twin) into `Target/` (.js + .d.ts).
2. Package: `package.json` — `main`/`exports` → `Target/Library.js`,
   `files: ["Target", "cordis.patch.yml", "README.md", "SCHEME.md"]` (no Source — the published
   artifact ships only the built output), `dependencies: {}` (schemastery resolves from the host
   installation scope), `prepublishOnly` = the build, `cordis.patch.yml` (row
   `id: ets-hook-dsh-package-pinner`, `name: "@playform/ets-hook-dsh-package-pinner"`, config),
   `"dsh": {"bundle": {"patch": "./cordis.patch.yml"}}`.
3. Install (granularized):
    - **Remote/dependency**: `pnpm add @playform/ets-hook-dsh-package-pinner` in a profile →
      auto-activates at the next host start (the `dsh.bundle` manifest makes a plain dependency a
      harness bundle).
    - **Git clone**: clone → `pnpm install --ignore-workspace` → build
      (`npx Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts`) →
      `dsh plugin --profile <name> add <dir>`.
    - **Native dsh**: `dsh plugin --profile <name> add <tarball|dir|npm-spec>`.
4. Verify activation via the durable `activated (pinner, …)` ledger line in `apply()` (never assume
   a restart activated the bundle).

## 9. Config (validated schema — every tunable is a field)

The exported `Config` schema validates and fills every default at load (invalid configuration fails
loudly).

New entries are declared with `insert:` — a bare `id:` row patches an existing entry and
the loader rejects unknown ids with `entry "…" not found`.

```yaml
- insert:
      - id: ets-hook-dsh-package-pinner
        name: "@playform/ets-hook-dsh-package-pinner"
        config:
            log: true
            logFile: ~/.dsh/ets-hook-dsh-package-pinner.log # SEPARATE ledger (own plugin)
            mutationTools: [write, edit, str_replace_editor] # reads emit too — gate required
            policyFile: "" # optional global pin-policy.json; else discovery; else built-in default
            sections: [dependencies, devDependencies, peerDependencies, optionalDependencies]
            exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
```

## 10. Test plan (smoke-verified against the built bundle)

The suite `pinner-smoke.mjs` (in the family's `smokes/` directory) mirrors the governor's fake-ctx
harness (real temp-dir I/O with `dev:ino:size:mtimeNs:ctimeNs` version tokens enforcing
`replaceIfVersion`) and asserts, among others:

1. Loader contract: entry exports name/apply/Config/inject, the default object carries inject +
   Config, apply returns undefined.
2. Byte-identical ledger strings: `activated (pinner, …)`, `skipped (excluded) …`,
   `observed non-JSON package.json … — skipped`, `pinned … (N versions)`, `no changes to pin for …`,
   `unreadable pin-policy.json at … — using built-in default`,
   `REFUSED rewrite of …: non-dependency section "…" would change`.
3. The range law across all four sections (caret/tilde/equals stripped; static versions, compound
   ranges, wildcards, protocol deps untouched).
4. Keep-list policy honored (`tailwindcss` stays `^3.0.5`) and the discovery order (global → dir →
   registry-co-located → built-in) with the union.
5. Silence: emit returns synchronously (await-free listener), the throwing continuation is contained
   (logger-only), and the P₃ re-emit refreshes the token so the next guarded write does not fail
   FS_STALE_VERSION.

## 11. Interplay — the governor family

The three plugins coexist on `fs/observed`, each gating on its own basename (`package.json` /
`package.json` / `Cargo.toml`) and writing its own ledger (`ets-hook-dsh-package-pinner.log` /
`ets-hook-dsh-package-governor.log` / `ets-hook-dsh-cargo-governor.log`); the fs/observed trigger law and
the exclusion-first rule are shared.

Composition semantics: **pin → bump-exact** (the pinner pins
`^0.3.4` → `0.3.4`; a fully pinned manifest leaves the npm governor's update stage nothing to do —
ncu's no-op case is an exact pin — while its chain pass may still re-canonicalize chain pins to
`^resolved`); **chain > strip > normalize** (the cargo module's precedence); **keep-list wins** (the
pinner's `pin-policy.json` protects ranges as authored; the cargo module's keep-list — the same
sidecar — wins over normalization, never over the chain).

Activation of one never implies another;
order between two npm listeners is defined only by registration.
