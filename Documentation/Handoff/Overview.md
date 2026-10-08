# The Handoff — Overview

> The DSH Plugin Family handoff: the overview. Restructured from the pre-restructure flat HANDOFF
> record (written 2026-10-04, in sequential additions — each package one focused addition): this
> file holds the family snapshot, the verified state, and the architecture at a glance (Packages
> 1–3). The session-by-session packages live in `Packages/Package-01.md` … `Packages/Package-13.md`,
> the future-work register in `Register.md`, and the working lessons in `Lessons.md`. The next
> session should pick up at **Package 4 (the queue)** after confirming **Package 2 (the verified
> state)**.

---

## The family snapshot (Package 1)

**Five bundles + the factory** — all under `~/.dsh/profiles/desktop/bundles/` (one git repo:
`~/.dsh`):

| Bundle                      | Identity                                                            | Mission                                                                                                                                             | Layout                                              |
| --------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `dsh-plugin-factory`        | `@playform/dsh-plugin-factory` v0.1.0 · service `ctx.pluginFactory` | the furnace: 15 methods centralizing the shared machinery                                                                                           | class/service plugin, `Source/` TS, `Target/` built |
| `dsh-hook-package-governor` | `@playform/dsh-hook-package-governor`                               | package.json chain-canonicalize + ncu update (programmatic/bin)                                                                                     | thin module + transform leaf + engines              |
| `dsh-hook-package-pinner`   | `@playform/dsh-hook-package-pinner`                                 | package.json static pinning (`^`/`~`/`=` stripped), keep-list                                                                                       | thin module, P-only                                 |
| `dsh-hook-cargo-governor`   | `@playform/dsh-hook-cargo-governor`                                 | Cargo.toml chain + full-version normalization + `cargo upgrade`                                                                                     | thin module + TOML transform + engine               |
| `dsh-hook-mdash`            | `@playform/dsh-hook-mdash`                                          | model-output dash normalization ([llm/stream waterfall](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)) | thin module, NON-manifest consumer                  |

**Terminology**: the factory's consumers are **MODULES** (renamed from "flavor" — the spec docs say
Module; the CODE still says `Flavor` — see Package 4 §4.1 for the exact rename scope). The factory
produces modules.

**Repo**: `~/.dsh` git — committed at `859f16a`
(`refactor(factory): convert the governance trio into plugin-factory flavors and add the mdash output normalizer`) +
`49e5b3d` (`feat(factory): introduce the dsh-plugin-factory service bundle`) — the working tree is
CLEAN. `~/.hermes` is a private home repo — NEVER commit it unprompted.

---

## The verified state (Package 2)

| Bundle   | tsc | build           | smoke     | smoke file                |
| -------- | --- | --------------- | --------- | ------------------------- |
| factory  | 0   | minified Target | **30/30** | `/tmp/factory-smoke.mjs`  |
| governor | 0   | minified Target | **70/70** | `/tmp/governor-smoke.mjs` |
| pinner   | 0   | minified Target | **28/28** | `/tmp/pinner-smoke.mjs`   |
| cargo    | 0   | minified Target | **58/58** | `/tmp/cargo-smoke.mjs`    |
| mdash    | 0   | minified Target | **45/45** | `/tmp/mdash-smoke.mjs`    |

Every consumer smoke loads the **REAL factory instance** from `dsh-plugin-factory/Target/Library.js`
(the Service-base pattern — the factory's own smoke is the reference). Every ledger string is
byte-identical to the pre-refactor behavior (smoke-asserted).

**Profile**: `~/.dsh/profiles/desktop/package.json` carries the five `link:` dependencies;
`dsh.profile.bundles` order: `@deepseek-ai/dsh-base`, `@deepseek-ai/dsh-web-app`,
`@playform/dsh-plugin-factory`, `@playform/dsh-hook-package-governor`,
`@playform/dsh-hook-package-pinner`, `@playform/dsh-hook-cargo-governor`,
`@playform/dsh-hook-mdash`.

**Ledgers**: `~/.dsh/governor.log` · `~/.dsh/pinner.log` · `~/.dsh/cargo-governor.log` ·
`~/.dsh/mdash.log`.

**A confirmation + research agent** (`8176b172`) was launched 2026-10-04 to re-verify all five (tsc
×5, builds ×5, smokes, git cleanliness) AND research the granularization/factorization (see Package
4 — its report refines the queue). If it has not reported yet, its verdict is pending — check its
session before starting new work.

---

## The architecture at a glance (Package 3)

### The factory surface (`ctx.pluginFactory` — the module contract)

15 methods (full signatures in `dsh-plugin-factory/SCHEME.md` §2, now renamed to the Module
vocabulary):

1. `Append(state, message)` — the ledger (logger + appendFileSync, never throws)
2. `Match(path, list)` — exclusion segment match 3–4. `Discover(dir)` / `Parse(path)` — auxiliary
   discovery (the exemption)
3. `ResolvePolicy(state, dir, found, chain, opts?)` — union keep-list (+ P3 chain keys)
4. `Gate(state, target, observation, actor, {basename, mutationToolsField?})` — g1 set, logs nothing
5. `GuardedWrite(state, target, content, version, signal?)` — replaceIfVersion + P4 fence + Stash
   pre-registration
6. `Refresh(state, target, actor, version)` — same-actor re-emit (P₃/U₂)
7. `Continue(state, target, actor, dir, found, version, transform)` — the detached contained
   continuation
8. `State(ctx, config, {module, fields?, policyFileName?})` — the State builder (cell unwrap +
   probe-once)
9. `Wire(ctx, state, observe)` —
   [fs/observed](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts)
   registration (MANIFEST-hardwired — a non-manifest module wires its own `ctx.on`)
10. `Attach(ctx, {state, name})` — P1 jobs controller + P2 in-flight disposal + P5 storage journal
11. `Journal(state, event, path, detail, at?)` —
    [the storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain)
    writer (silent skip when absent)
12. `Schema(shared?, module?)` — the Schemastery schema factory (volatile shared fields; instance
    method — see Package 4 §4.2)
13. `Seam(state, name)` — probe-once via `ctx.get` (never the dead accessor)

**The transform contract** (the module leaf the factory drives):
`(current: string|null, section: unknown, keep: string[]) => { next, count, message? } | null` —
`current` = RAW text; `next` = an object (JSON-serialized) or a STRING (the cargo's TOML line
surgery, verbatim); `message` = a string or `(outcome:{version}) => string`; `null` = every no-op
path (the module logs its own lines).

### The module leaves (what the factory NEVER absorbs)

- the transforms (Satisfy/Pin/Normalize + decode) — each module's identity
- the update engines (ncu library/binary, cargo upgrade) — the standing exemptions
- the update gates + breaker maps — module-owned state
- the ledger STRINGS — byte-identical, smoke-asserted
- the config extensions + docs — module delineation

### The cascade matrix

`Documentation/Guides/Governor-CASCADES.md` — the full nuanced matrix (10 cascades,
element-by-element, the async boundary, the data flow) and
`Documentation/Guides/Governor-TRIO-GRAPH.md` (the API-surface graph + the research verdict, P1–P9).
Both docs use the Module vocabulary now (the literal `activated (cargo flavor, …)` ledger string
stays — smoke-asserted).

### The four live-verified fixes (never regress them)

1. `inject` + `Config` MUST be on the loader's DEFAULT export object (named-only exports are
   shadowed → `cannot get property "fs" without inject`)
2. `apply` MUST return nothing (a returned value silently kills event delivery)
3. `ctx.jobs` at root needs `attachController` (the "agent-scoped" premise was REFUTED —
   jobs.md:398, 42-46, 488-493); the detached continuation is the probed fallback
4. `ctx.fs.writeText` from a root plugin needs an explicit sandbox policy
   (`{mode:"danger-full-access"}` before P4; now the P4 confined posture — `sandboxMode`-decided
   `{mode:"workspace-write", workspaceRoot: <manifest dir>}`)
