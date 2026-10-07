# The Trio — Internals & API-Surface Graph

> One of the four Governor guides migrated to `Documentation/Guides/` — the companion docs are
> `Governor-README.md`, `Governor-SCHEME.md`, and `Governor-CASCADES.md` in this folder; the handoff
> context is `../Handoff/Overview.md` and `../Handoff/Packages/Package-03.md`.

Static analysis of all 89 Source files (2026-10-03, post-equalization pass in flight). What the code
CALLS (the DeepSeek Harness API) vs. what it DOESN'T (the deliberate exemptions), per plugin, plus
the shared anatomy.

Legend: `⟶` = call / event flow · `✗` = deliberately absent · `EX` = exemption.

---

## 1. The shared anatomy (all three plugins, identical shape)

```
                 TOOL LAYER (write/edit/str_replace_editor)
                     │  mutation of package.json / Cargo.toml
                     ▼
         ┌─────────────────────────── HOST EVENT BUS ───────────────────────────┐
         │  fs/observed ──emit──▶ ① observation-policy (records version)        │
         │                       ② OUR LISTENER (Function/Apply registers via   │
         │                          ctx.on — the ONLY harness event consumed)   │
         │                              │                                        │
         │   Function/Observe (SYNC, await-free, throw-free):                   │
         │     g1 gates: actor ∈ mutationTools · kind present · basename ·      │
         │               Stash idempotence · exclusion-first (node:path Match)  │
         │     g2: registry/policy discovery — EX: plain node:fs walks          │
         │              (Discover/Parse/Resolve — auxiliary files ONLY)         │
         │     ▼                                                               │
         │   Function/Continue (DETACHED CONTAINED CONTINUATION — async):       │
         │     ctx.fs.readText(Target)  ←── the file seam                       │
         │     pure transform (Decode / Pin / Satisfy+Normalize)  ←── EX:       │
         │              internal calculations (JSON/TOML-aware line surgery)    │
         │     refusal guard (non-dep sections never touched)                   │
         │     ctx.fs.writeText(Target, …, replaceIfVersion,                    │
         │              {mode:"danger-full-access"})  ←── the write seam        │
         │     ctx.emit(fs/observed, outcome.version, same actor)  ←── P₃       │
         │              (refreshes the policy record — no FS_STALE_VERSION)     │
         │     ▼                                                               │
         │   UPDATE STAGE (governor + cargo only; pinner is P-only):            │
         │     Function/Dispatch: cooldown + in-flight + breaker (State maps)   │
         │     → Function/Execute → the update engine:                          │
         │        governor: npm-check-updates LIBRARY in-process  ←── EX, or    │
         │                  the ncu BINARY via ctx.subprocess (probed)          │
         │        cargo:   cargo upgrade via ctx.subprocess (probed)  ←── EX    │
         │     Function/Settle: ctx.fs.stat → ctx.emit (U₂ refresh)             │
         │   L: ledger (Append — EX: node:fs appendFileSync + ctx.logger)       │
         └───────────────────────────────────────────────────────────────────────┘
                     │
                     ▼
         AUTHOR SEES exactly what it wrote (tool result from its own content)
```

## 2. What the trio CALLS — the harness API surface

| API                                      | Used by          | Where                                         | Notes                                                                       |
| ---------------------------------------- | ---------------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| `ctx.on("fs/observed")`                  | all three        | `Function/Apply`                              | the ONLY consumed event — root listener                                     |
| `ctx.emit("fs/observed")`                | all three        | `Govern`/`Rewrite`/`Refresh`/`Library`        | P₃ + U₂ refreshes — re-enters our own listener as a Stash-gated no-op       |
| `ctx.fs.readText/stat`                   | all three        | `Continue`/`Govern`/`Settle`/`Refresh`        | the service owns tokens — never parsed locally                              |
| `ctx.fs.writeText`                       | all three        | `Govern`/`Rewrite`                            | `replaceIfVersion` + explicit `{mode:"danger-full-access"}` policy          |
| `ctx.get("subprocess")`                  | governor + cargo | `Update/Bin`·`Update/Verify`·`Update/Upgrade` | the optional-seam probe (accessor law: direct access throws without inject) |
| `ctx.subprocess.spawn/resolveExecutable` | governor + cargo | same files                                    | cargo upgrade / ncu bin / verifyCommand — collect-mode stdio                |
| `ctx.logger`                             | all three        | `Append`·`Continue`·`Observe`                 | best-effort info/error — never rethrown                                     |
| `inject: ["fs"]`                         | all three        | `Library` (default object!)                   | loader contract — default object carries name/apply/Config/inject           |
| Schemastery `Config`                     | all three        | `Variable/Config`                             | validated at load, fail-loud, settings-ready                                |
| cordis `Context`/`Plugin` types          | all three        | `Interface/State`·`Apply`                     | type-only (erased)                                                          |
| `dsh-fs` types                           | all three        | event payloads, intents, outcomes             | type-only + runtime schemastery only                                        |
| `dsh-sandbox`/`dsh-subprocess` types     | all three / two  | policy + handle types                         | type-only                                                                   |

## 3. What the trio DOESN'T call — the deliberate exemptions (each documented in-code)

| Exemption                                | Where                                                 | Why (verified)                                                                                                                                                                           |
| ---------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **npm-check-updates library**            | governor `Update/Programmatic` (dynamic import)       | THE standing exemption — the external update engine                                                                                                                                      |
| **cargo CLI** (`cargo upgrade`)          | cargo `Update/Upgrade`                                | the Rust side doesn't co-opt into TS — CLI-only, driven through the seam                                                                                                                 |
| **`node:fs` plain reads**                | `Discover`·`Parse`·`Resolve`·`Keep`·`Update/Policy`   | AUXILIARY discovery files only (registry.json, pin-policy.json, update-policy.json) — needed synchronously for the await-free listener; the GOVERNED manifest is never read on this path |
| **`node:fs` ledger append**              | `Append`                                              | ctx.fs has no append; re-reading + rewriting a shared log would be racy                                                                                                                  |
| **`node:child_process` fallback**        | `Bin`·`Verify`·`Upgrade`·`Verify`                     | ONLY when the subprocess seam is absent (probed) — process management is NOT exempt                                                                                                      |
| **`node:path`**                          | `Match`·`Observe`·`Discover`·`Resolve`·`Programmatic` | pure path math — internal calculation                                                                                                                                                    |
| **smol-toml**                            | cargo `ParseToml`                                     | parsing-only (identification); the REWRITE is line surgery so comments survive                                                                                                           |
| **internal calculations**                | Decode, Pin, Satisfy, Normalize, the gates            | string gates, exclusion matching, registry discovery, ledger formatting                                                                                                                  |
| **`ctx.jobs`**                           | ✗ never                                               | agent-scoped — a root plugin has no job controller (verified)                                                                                                                            |
| **`tools/*` waterfalls**                 | ✗ never                                               | tools/post-execute is the louder result amendment — violates the silence invariant                                                                                                       |
| **`fs/write-intent` / `fs/edit-intent`** | ✗ never                                               | single-slot, owned by the observation policy — registering would veto it                                                                                                                 |
| **session events / notifications**       | ✗ never                                               | the silence invariant — the author never learns                                                                                                                                          |
| **service provisioning**                 | ✗ none                                                | the registers-no-service archetype (like the observation policy)                                                                                                                         |
| **agent-scoped listeners**               | ✗ root only                                           | fs events are unscoped; root hears every dispatcher                                                                                                                                      |

## 4. Per-plugin call structure (the intra-tree graph)

```
GOVERNOR (package.json — chain + ncu):
  Library → Apply → Append · Observe → Continue → Decode · Satisfy · Govern(ctx.fs.writeText+emit)
                                                  → Filter · Resolve · Dispatch → Execute → Run →
                                                    Update/{Programmatic(dynamic ncu) · Bin(ctx.get→subprocess)}
                                                    → Settle(ctx.fs.stat+emit) · Verify(ctx.get→subprocess)
  Refresh (U₂ re-emit) · Match (exclusion) · Discover/Parse/Resolve (EX auxiliary fs)

PINNER (package.json — pin only, P-only):
  Library → Apply → Append · Observe → Continue → Decode · Pin (pure) · Rewrite(ctx.fs.writeText+emit)
                                                  → Resolve (keep-policy discovery) · Match
  NO update stage — no Dispatch/Execute/Settle — no subprocess — no ncu

CARGO (Cargo.toml — chain + normalize + cargo upgrade):
  Library → Apply → Append · Observe → Continue → Decode · ParseToml(smol-toml) · Satisfy(chain) ·
                                                  Normalize(full versions) · Govern(ctx.fs.writeText+emit)
                                                  → Filter · Resolve · Dispatch → Execute → Run →
                                                    Update/{Upgrade(ctx.get→cargo upgrade) · Policy(EX fs)}
                                                    → Settle(ctx.fs.stat+emit) · Verify(ctx.get→subprocess)
  Keep (keep-list discovery) · Refresh · Match
```

## 5. The balance sheet

- **API-native**: the entire observation/trigger path (events, g1 gates), the file seams
  (readText/writeText/stat), the process seam (subprocess probes), config (schemastery), the loader
  contract, the lifecycle (no apply return), the version coherence (P₃/U₂), the logger.
- **Own versions (exempt)**: the two update ENGINES (ncu + cargo — no TS-side equivalent exists),
  auxiliary discovery reads (the sync-listener constraint), the ledger (no append in the API), the
  parse/transform math, the child_process fallback (only when the seam is absent).

The research agent (running) is comparing this surface against the full API to propose better
injection points — the candidates under evaluation: settings/UI forms, a shared governance service,
editText for surgical rewrites, ctx.timer/schedule-based deferral, HMR effects, and the newer
0.2.1-alpha.1 surface.

---

## 6. Research verdict (exploration agent, 2026-10-03) — docs-anchored

Sources: the local deepseek-harness docs checkout (0.2.0-rc.2), the three Source
trees, the skill, plus byte-level type diffs of the 0.2.1-alpha.1 seam packages (byte-identical to
rc.2 — nothing new to adopt).

### The headline corrections

- **F1 — `ctx.jobs` is NOT off-limits at root.** `JobRegistry.attachController(name)` is callable
  from any context; an unscoped controller "serves every owner"; `start({owner: undefined})` = an
  UNOWNED job "open to any caller until service disposal" (jobs.md:398, 42-46, 488-493). Our live
  probe failed on ADMISSION ("no job controller serves this agent"), not on scoping. The sanctioned
  root-plugin background pattern is a jobs controller + unowned jobs (detached continuation as the
  probed fallback when the deployment has no jobs service) — proposal P1.
- **F3 — LIVE PING-PONG BUG (governor × pinner).** Both hook package.json. Governor canonicalizes
  chain pins to `^resolved` → re-emits; pinner strips the `^` → re-emits; each consumes the other's
  fresh version, so `replaceIfVersion` never fails — an **infinite rewrite loop when both are active
  in a registry-governed workspace** (earlier live tests didn't trip it only because the sandbox
  root has no registry). Minimal fix (P3): the pinner unions its keep-list with
  `registry.effectiveLatest` keys — chain pins are never stripped.
- **F2 — no disposal of in-flight updates**: the unowned AbortControllers in Dispatch violate
  defensive-patterns.md:19-21 ("dispose must reach quiescence"). P1 fixes it via registry disposal;
  otherwise State must own the controllers + a `ctx.effect` disposer.

### The adopt/stay verdict

| Proposal | What                                                                                                                                                                | Verdict                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| P1       | root jobs controller + unowned jobs for update stages (kind `governor-update`, JobHandle.append narration, kill/follow, teardown-to-quiescence)                     | **ADOPT** (fallback = continuation when jobs absent) |
| P2       | in-flight disposal via `ctx.effect` (abort + terminate + await)                                                                                                     | **ADOPT**                                            |
| P3       | pinner keep-list ∪ registry keys — the interlock                                                                                                                    | **ADOPT (critical)**                                 |
| P4       | confined per-call sandbox policy (`workspace-write`, manifest dir as root) + read `ctx.fs.sandboxMode`; drop the danger-full-access cast                            | **ADOPT** (danger-full-access no longer exempt)      |
| P5       | `ctx.storageDomain` for structured durable facts (typed records; the human ledger stays appendFileSync — the fs service has NO append, proven from its member list) | **ADOPT** (optional seam)                            |
| P6       | a shared governance service — ONLY for the P3 interlock or a real consumer                                                                                          | **conditional**                                      |
| P7       | `ctx.timer` for cooldown/debounce (fiber-disposed)                                                                                                                  | **ADOPT**                                            |
| P8       | volatile cells for hot config fields (no fiber remount on ledger/throttle tweaks)                                                                                   | **ADOPT**                                            |
| P9       | drop the dead accessor fallback in the subprocess probe (`ctx.get` alone, probe once per apply)                                                                     | **ADOPT**                                            |

**Stays exempt (with proof)**: the ncu library + cargo CLI (no harness update service exists
anywhere in capability-seams), the ledger append (no append in the fs Service Definition;
read-modify-write of a shared log would race), pure calculations (the docs' own policy plugin does
the same), auxiliary discovery reads (N awaited ctx.fs round-trips for zero semantic gain), the
child_process fallback (sanctioned optional-dep posture), session events (REJECTED — root plugin has
no session; the model-history pipeline would see it — the silence invariant), OTel (needs explicit
transport).

**Misused affordances**: unowned AbortControllers; the `danger-full-access` type-cast; the dead
accessor fallback; hand-rolled cooldown stamps; ncu/cargo stdout folded into the ledger instead of a
JobHandle ring; `Context.__governorState` debug attachments (acceptable smoke plumbing);
displayPath-keyed in-flight vs targetKey-keyed idempotence (key both on targetKey — targetKey is
opaque per backend).
