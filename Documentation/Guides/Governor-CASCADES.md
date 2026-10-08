# The Trio — Cascade Matrix, Nuanced Edition

> One of the four Governor guides migrated to `Documentation/Guides/` — the companion docs are
> `Governor-README.md`, `Governor-SCHEME.md`, and `Governor-TRIO-GRAPH.md` in this folder; the
> handoff context is `../Handoff/Overview.md` and `../Handoff/Packages/Package-03.md`.

The family matrix deepened: per-plugin identity, exact ledger strings per step, call/data
signatures, sync/async boundaries, and failure containment for every element. **S** = seam · **F** =
factory · **M** = module · **X** = exemption.

---

## 0 · The plugin identity table (the V-columns that differ)

|                  | GOVERNOR                                                                                            | PINNER                                                     | CARGO                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| manifest         | package.json                                                                                        | package.json                                               | Cargo.toml                                                                                                                     |
| basename gate    | `"package.json"`                                                                                    | `"package.json"`                                           | `"Cargo.toml"`                                                                                                                 |
| transform        | Satisfy (chain → ^resolved)                                                                         | Pin (strip ^/~/=)                                          | Satisfy+Normalize (bare full)                                                                                                  |
| refusal guard    | dependency sections                                                                                 | dependency sections                                        | dep tables (member/target/workspace)                                                                                           |
| engine           | ncu library / ncu bin                                                                               | — (P-only)                                                 | `cargo upgrade`                                                                                                                |
| update gates     | cooldown+in-flight+breaker                                                                          | —                                                          | cooldown+in-flight+breaker                                                                                                     |
| config extension | updateMode, ncuBin, policyFile, maxUpdateFailures                                                   | sections, policyFile                                       | cargoBin, policyFile, keepFile, pinStyle, updateMode                                                                           |
| ledger file      | hook-dsh-governor-package.log                                                                       | hook-dsh-pinner-package.log                                | hook-dsh-governor-cargo.log                                                                                                    |
| activation line  | `activated (anywhere mode, logFile=…, updateMode=…, ncuBin=…, exclude=[…], policyFile=(discovery))` | `activated (pinner, logFile=…, sections=[…], exclude=[…])` | `activated (cargo flavor, logFile=…, updateMode=cargo, cargoBin=…, exclude=[…], policyFile=(discovery), keepFile=(discovery))` |
| jobs kind        | governor-update                                                                                     | —                                                          | governor-update                                                                                                                |
| jobs label       | `ncu ${Dir}`                                                                                        | —                                                          | `cargo upgrade ${Dir}`                                                                                                         |

---

## 1 · Trigger cascade — step sheet

| #   | Element                   | Call / data                                                                                                                                                                        | State                     | Ledger (exact)                                                                                                                      | Event                                                                                                  | Timing                 | Failure                              |
| --- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------ |
| 1   | tool                      | write/edit/str_replace_editor                                                                                                                                                      | —                         | —                                                                                                                                   | —                                                                                                      | sync                   | —                                    |
| 2   | host                      | [`fs/observed`][dsh-fs] emit: `(target{targetKey,displayPath}, {kind:"present", version}, actor)` | —                         | —                                                                                                                                   | [fs/observed][dsh-fs] | sync, not awaited      | a listener throw fails the tool call |
| 3   | **F** Wire                | the root listener `(t,o,a) => observe(state,…)`                                                                                                                                    | —                         | —                                                                                                                                   | —                                                                                                      | sync                   | —                                    |
| 4   | **F** Gate + **M**        | g1 chain: `displayPath` str? → `mutationTools.includes(actor.name)` → `kind==="present"` → `Stash.get(targetKey)===version`? skip → `basename===module`                            | Stash read                | —                                                                                                                                   | —                                                                                                      | sync                   | —                                    |
| 5   | **F** Match               | `Match(displayPath, exclude)`                                                                                                                                                      | —                         | `skipped (excluded) ${Path}`                                                                                                        | —                                                                                                      | sync                   | —                                    |
| 6   | **F** Discover            | `existsSync(dirname↑)` walk to registry.json (stops at node_modules/root)                                                                                                          | —                         | `no registry.json found for ${Path} — chain pass skipped` / `unreadable registry.json at ${Found} — chain pass skipped for ${Path}` | —                                                                                                      | sync                   | —                                    |
| 7   | **F** Parse/ResolvePolicy | sidecar reads (pin-policy/update-policy/keepFile) + union incl. chain keys                                                                                                         | Keep[]                    | `unreadable pin-policy.json at … — using built-in default` (pinner/cargo)                                                           | —                                                                                                      | sync                   | —                                    |
| 8   | **F** Continue            | `Stash.set(targetKey, version)`; controller → `Inflight.set`; detach                                                                                                               | Stash write; Inflight set | —                                                                                                                                   | —                                                                                                      | sync fire → async body | contained                            |
| 9   | **M**                     | the module's skip/absence lines                                                                                                                                                    | —                         | see #6                                                                                                                              | —                                                                                                      | sync                   | —                                    |

## 2 · Chain pass (governor + cargo)

| #   | Element             | Call / data                                                                                                                                                                                                             | State       | Ledger                                                                                         | Event                                                                                                  | Timing      | Failure                      |
| --- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------- | ---------------------------- |
| 1   | **F** Continue      | `fs.readText(target, signal)` → text                                                                                                                                                                                    | —           | —                                                                                              | —                                                                                                      | async       | caught → null                |
| 2   | **V** decode        | JSON.parse / smol-toml identify                                                                                                                                                                                         | —           | `observed non-JSON package.json … — skipped` / `observed non-JSON/TOML Cargo.toml … — skipped` | —                                                                                                      | sync        | caught                       |
| 3   | **V** Satisfy       | for each dep ∈ effectiveLatest → canonical form (^resolved / bare-resolved); strict strips                                                                                                                              | —           | —                                                                                              | —                                                                                                      | sync (pure) | —                            |
| 4   | **V** Normalize     | pad "1.0"→"1.0.0" (cargo)                                                                                                                                                                                               | —           | —                                                                                              | —                                                                                                      | sync (pure) | —                            |
| 5   | **V** refusal guard | non-dep sections diff → abort                                                                                                                                                                                           | —           | `REFUSED rewrite of ${Path}: non-dependency section "${Name}" would change`                    | —                                                                                                      | sync        | returns false                |
| 6   | **F** GuardedWrite  | `writeText(target, json, {replaceIfVersion, version}, signal, fence)` — fence from `fs.sandboxMode` (undefined → none; defined → `{mode:"workspace-write", workspaceRoot: dirname}`)                                    | —           | —                                                                                              | —                                                                                                      | async       | FS_STALE_VERSION → contained |
| 7   | **F** Refresh       | `emit([`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts), target, {kind:"present", version: outcome.version}, actor)` + `Stash.set(targetKey, outcome.version)` | Stash write | `governed ${Path} → ${token}`                                                                  | [fs/observed][dsh-fs] | sync        | —                            |
| 8   | **F** Gate (Stash)  | re-entrant: `Stash.get===version` → silent skip                                                                                                                                                                         | Stash read  | —                                                                                              | —                                                                                                      | sync        | —                            |

## 3 · Pin pass (pinner)

| #   | Element             | Call / data                                                        | State       | Ledger                                       | Event                                                                                                  | Timing | Failure   |
| --- | ------------------- | ------------------------------------------------------------------ | ----------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------ | --------- |
| 1–2 | same as 2.1–2.2     | —                                                                  | —           | `observed non-JSON package.json … — skipped` | —                                                                                                      | —      | —         |
| 3   | **V** Pin           | range law: first char ∉ {^,~,=} → untouched; else strip ONE prefix | —           | —                                            | —                                                                                                      | pure   | —         |
| 4   | **V** keep-list     | kept names (policy + P3 chain) → untouched                         | Keep[]      | —                                            | —                                                                                                      | pure   | —         |
| 5   | **V** refusal guard | —                                                                  | —           | `REFUSED rewrite …`                          | —                                                                                                      | sync   | —         |
| 6   | **F** GuardedWrite  | same fence logic                                                   | —           | `pinned ${Path} (${Count} versions)`         | —                                                                                                      | async  | contained |
| 7   | **F** Refresh       | P₃                                                                 | Stash write | —                                            | [fs/observed][dsh-fs] | sync   | —         |
| 8   | **V** no-op         | transform null → nothing                                           | —           | `no changes to pin for ${Path}`              | —                                                                                                      | sync   | —         |

## 4 · Update cascade (governor + cargo)

| #   | Element                | Call / data                                                                                                           | State                                             | Ledger                                                                                                                                                                                                              | Event                                                                                                  | Timing | Failure                                                                  |
| --- | ---------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------ |
| 1   | **V** Filter           | any public dep left?                                                                                                  | —                                                 | (silent skip)                                                                                                                                                                                                       | —                                                                                                      | sync   | —                                                                        |
| 2   | **V** gates            | breaker: `Count.get(dir)>=Limit`; in-flight: `Set.has(dir)`; cooldown: `now-Stamp.get(dir)<Wait`                      | Count/Set/Stamp                                   | `update stage paused for ${Dir} (N consecutive failures ≥ N)` / `update stage skipped for ${Dir} (in-flight)` / `… (cooldown)`                                                                                      | —                                                                                                      | sync   | —                                                                        |
| 3   | **F** Attach (apply)   | `effect(()=>jobs?.attachController(module))`                                                                          | —                                                 | —                                                                                                                                                                                                                   | —                                                                                                      | apply  | probed                                                                   |
| 4   | **F** Seam("jobs")     | `ctx.get("jobs")`                                                                                                     | Subprocess/Jobs                                   | —                                                                                                                                                                                                                   | —                                                                                                      | apply  | —                                                                        |
| 5   | **V** start            | `jobs.start({kind:"governor-update", label, owner:undefined, run:()=>({cancel, done})})`                              | Stamp/Set writes; Inflight                        | `update stage dispatched for ${Dir} (mode=…, ncu via …[, policy …`                                                                                                                                                  | , built-in default policy])`                                                                           | —      | sync starter                                                             | starter throw-free; fallback = detached |
| 6   | **V** Execute          | policy resolution → invocations                                                                                       | —                                                 | `update: using built-in default policy` / `update: mode=programmatic (npm-check-updates library)` / `update: mode=bin (ncu binary …)`                                                                               | —                                                                                                      | async  | —                                                                        |
| 7   | **V** engine           | ncu.run in-process / ncu bin via **S** subprocess / cargo upgrade via **S** subprocess (child_process fallback **X**) | —                                                 | `update: ncu (${label}) → ${json}` / `update: cargo upgrade ${args} → {"exitCode":N}` + raw output                                                                                                                  | —                                                                                                      | async  | `update: ncu failed (${label}): …` / `update: cargo-edit unavailable: …` |
| 8   | **V** Settle           | `Count` update; U₂: `fs.stat` → **F** Refresh                                                                         | Count; Stash                                      | `update: DONE — pins bumped per policy` / `update: FAILED — see lines above` / `update stage FAILED (N) for ${Dir}; consecutive=N` / `update: running verifyCommand: …` / `update: verifyCommand failed (status N)` | [fs/observed](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) | async  | contained                                                                |
| 9   | **F** Continue finally | `Inflight.delete`                                                                                                     | Inflight                                          | —                                                                                                                                                                                                                   | —                                                                                                      | async  | —                                                                        |
| 10  | jobs                   | `done` resolves `{status:"completed"                                                                                  | "failed", detail:"exit code: N"}` — NEVER rejects | —                                                                                                                                                                                                                   | —                                                                                                      | —      | async                                                                    | the roster shows it                     |

## 5 · Interplay (governor × pinner, one file)

| #     | Element                    | Data                                                                 | Outcome                           |
| ----- | -------------------------- | -------------------------------------------------------------------- | --------------------------------- |
| 1     | both **F** Gate            | same target, same version                                            | both pass                         |
| 2     | governor chain             | canonicalize chain pins → `^resolved`                                | P₃ at v′                          |
| 3     | pinner **F** ResolvePolicy | chain keys already in Keep (P3)                                      | chain deps untouched              |
| 4     | pinner Pin                 | public deps only → exact                                             | P₃ at v″                          |
| 5     | governor re-entry          | Stash has v″? no → chain pass again → NO changes (already canonical) | `no-op`-bounded or in-flight skip |
| 6     | governor engine            | exact pins → `ncu → {"lodash":"4.18.1"}` exact                       | stable                            |
| final | —                          | `chain > strip > normalize; keep-list (incl. chain) wins`            | terminated                        |

## 6 · Refresh (version coherence)

| #   | Element             | Data                              | Why                                                |
| --- | ------------------- | --------------------------------- | -------------------------------------------------- |
| 1   | **F** GuardedWrite  | `outcome.version` (service-owned) | the token is never computed locally                |
| 2   | **F** Refresh       | re-emit same actor                | policy record (owner=actor.agent.session) coherent |
| 3   | engine mutation     | ncu/cargo raw write               | no events (external)                               |
| 4   | **F** Refresh (U₂)  | `fs.stat` → re-emit               | covers the engine's mutation                       |
| 5   | author's next write | at the fresh token                | no `FS_STALE_VERSION` leak                         |

## 7 · Failure cascade

| #   | Element      | Ledger                                                                          | Jobs                     | State                  |
| --- | ------------ | ------------------------------------------------------------------------------- | ------------------------ | ---------------------- |
| 1   | engine fails | `update: … failed (… status N)` / `cargo-edit unavailable`                      | —                        | —                      |
| 2   | **V** Settle | `update: FAILED — see lines above` + `update stage FAILED (N) …; consecutive=N` | `done={status:"failed"}` | Count++                |
| 3   | breaker      | 3rd consecutive → `update stage paused …`                                       | roster shows failed      | Count stays            |
| 4   | recovery     | next write after cooldown                                                       | —                        | Count reset on success |

## 8 · Lifecycle

| #   | Element          | Detail                                                                                                                                     |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **F** State      | cell unwrap (`{get}`) → shared fields (volatile-read) + module fields + Stash/Inflight/Subprocess/Journal                                  |
| 2   | **V** activation | the exact `activated (…)` line per plugin (see §0)                                                                                         |
| 3   | **F** Wire       | `ctx.on` — fiber-owned (auto-unwind)                                                                                                       |
| 4   | **F** Attach     | jobs controller + Inflight disposal effects (labeled)                                                                                      |
| 5   | **F** Seam       | subprocess probe-once                                                                                                                      |
| 6   | **F** Journal    | [storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain) open; pre-open queue drained |
| 7   | HMR/config edit  | effects unwind → Inflight abort → re-apply                                                                                                 |

## 9 · Journal

| #   | Element       | Record                                                                |
| --- | ------------- | --------------------------------------------------------------------- |
| 1   | **V** moments | activated / governed / pinned / dispatched / update-failed / excluded |
| 2   | **F** Journal | `{event, path, detail, at}` → package_governance v1 events            |
| 3   | seam          | `domain/changed` in-process notify; sync reads                        |
| 4   | absent seam   | silent skip — the human ledger remains the source                     |

## 10 · Volatile

| #   | Element            | Detail                                                   |
| --- | ------------------ | -------------------------------------------------------- |
| 1   | **F** Schema       | log/logFile/updateCooldownMs/mutationTools `.volatile()` |
| 2   | settings/patch     | `loader/volatile-update` — cells refresh in place        |
| 3   | **F** State unwrap | `.get()` read                                            |
| 4   | fiber              | no remount; in-flight untouched                          |

---

## THE ASYNC BOUNDARY (what must never blur)

```
LISTENER (sync, await-free, throw-free — the tool call depends on it)
   Wire → Gate → Match → Discover → ResolvePolicy → Stash.set → Continue()
───────────────────────────▲ detach (fire-and-forget) ─────────────────────────
CONTINUATION (async, fully contained — rejections can never surface)
   readText → decode → transform → refusal guard → GuardedWrite → Refresh → (jobs envelope)
   finally: Inflight.delete
```

## THE DATA FLOW (what values travel)

```
target{targetKey, displayPath} ──Gate──▶ Stash key
observation{kind, version}     ──Gate──▶ the guard basis
actor{name}                    ──Gate──▶ mutationTools membership + P₃/U₂ owner
registry.effectiveLatest       ──Satisfy▶ canonical pins
policy keep[] + chain keys     ──Resolve▶ Keep[] → the transform
transform outcome{next, count} ──▶ GuardedWrite (replaceIfVersion@observed version)
outcome.version                ──Refresh▶ the policy record + Stash
engine invocations             ──▶ digest lines + Job.append
settle code (0/1/2)            ──▶ breaker + jobs done{status, detail}
```

[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
