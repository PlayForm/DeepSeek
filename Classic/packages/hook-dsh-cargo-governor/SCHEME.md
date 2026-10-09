# SCHEME — @playform/hook-dsh-cargo-governor

The design document of the **CARGO.TOML MODULE** of the silent package.json governor.

The module
delineation is the point: identical architecture and API-awareness discipline, but the update stage
is **Rust-side only** — `cargo upgrade` (cargo-edit) driven through `ctx.subprocess` — because Rust
does not co-opt into the TypeScript ecosystem: there is no npm-library equivalent for cargo manifest
updates, so the update stage operates at the **exclusionary level** through the cargo CLI.

```
        tool-layer write/edit (write | edit | str_replace_editor)
        of a file named Cargo.toml (the FLAVOR gate)
                    │  ctx.emit("fs/observed", target, {kind:"present", version}, exec)
                    ▼
        ┌─ g1 trigger gates (synchronous, throw-free, await-free) ─────┐
        │  actor ∈ mutationTools · kind present · basename Cargo.toml │
        │  · not our own re-emit (Stash token gate) · not excluded    │
        └──────────────────────────────┬──────────────────────────────┘
                                       ▼
        ┌─ g2 governance context ─────────────────────────────────────┐
        │  registry.json walk-up (Discover — THE USER'S OWN registry) │
        └──────────────────────────────┬──────────────────────────────┘
                                       ▼  detached, contained continuation
        ┌─ g3 chain pass P (pure) ────────────────────────────────────┐
        │  ctx.fs.readText → Decode (smol-toml, identification ONLY)  │
        │  → Satisfy (Plan): 1. CHAIN (full resolved form)            │
        │                     2. STRIP (strict, registry present)     │
        │                     3. NORMALIZE (full-version directive;   │
        │                        the keep-list wins → byte-identical) │
        │  → Pin (surgical line rewrite)                              │
        │  → Govern (ctx.fs.writeText replaceIfVersion + {mode:       │
        │     "danger-full-access"} → P3 re-emit with outcome.version)│
        └──────────────────────────────┬──────────────────────────────┘
                                       ▼
        ┌─ g4 update stage U (detached contained continuation) ───────┐
        │  breaker → in-flight → cooldown gates                       │
        │  Execute → Update/Upgrade: ctx.subprocess.spawn             │
        │    argv = [cargo, upgrade, --manifest-path <Cargo.toml>,    │
        │            --exclude <crate> …, -p <crate> …,               │
        │            --compatible/--incompatible/--pinned …]          │
        │  exclude = policy.reject ∪ chain deps (the cordis-trap      │
        │  analog: cargo upgrade must never bump a chain pin)         │
        │  → Update/Verify (verifyCommand, exit 127 non-fatal)        │
        │  → Settle → Refresh (U2 re-stat + re-emit)                  │
        └─────────────────────────────────────────────────────────────┘
```

## 1. The module boundary (what is the same, what is Rust-side)

| Concern                  | package.json governor                  | THIS cargo module                                                                                                                  |
| ------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Trigger basename         | `package.json`                         | **`Cargo.toml`**                                                                                                                   |
| Registry discovery       | walk-up `registry.json`                | the SAME walk-up (shared user registry)                                                                                            |
| Chain canonical form     | `^<resolved>`                          | **bare `<resolved>`** (Cargo's implicit caret) or `=<resolved>` with `pinStyle: "exact"` — ALWAYS the full form (shorthand padded) |
| Parse library            | JSON.parse                             | **smol-toml (identification ONLY)**                                                                                                |
| Rewrite                  | JSON.stringify                         | **surgical line-level string manipulation (comments survive)**                                                                     |
| Version normalization    | none                                   | **FULL-VERSION: `1.0`→`1.0.0`, `=1.0`→`=1.0.0`; complex ranges as-is; the keep-list wins**                                         |
| Update driver            | npm-check-updates (library or ncu bin) | **`cargo upgrade` (cargo-edit) via ctx.subprocess — the only path**                                                                |
| Exclusion enforcement    | ncu `-x` (one comma argument)          | **`--exclude` one flag per crate (comma ignored)**                                                                                 |
| Ledger                   | the governor's ledger                  | **`hook-dsh-cargo-governor.log`** (separate)                                                                                       |
| Strip semantics (strict) | delete the dep key                     | **remove the whole `name = "…"` entry; inherited (`workspace = true`) and path/git entries are never stripped**                    |

## 2. Cargo.toml semantics handled

- Tables: `[dependencies]`, `[dev-dependencies]`, `[build-dependencies]`,
  `[target.'cfg(...)'.dependencies]` (and its dev/build variants), and `[workspace.dependencies]` —
  the SHARED dep table; a manifest can define versions THERE instead of in `[dependencies]`, and the
  module governs both.
- Version forms: bare `"0.3.4"` (Cargo's implicit caret — the canonical form), `"=0.3.4"` (exact),
  `"~0.3.4"`, inline tables `{ version = "0.3.4", features = [...] }`, table-style entries
  (`[dependencies.serde]` + `version = "…"`).
- NEVER rewritten: `path = "…"` entries, `git = "…"`/`rev = "…"` entries, and inherited entries
  (`dep.workspace = true` or `dep = { workspace = true }` — the version lives in the workspace
  table, walked separately).
- Comments/formatting: preserved byte-for-byte (parse for identification, rewrite by line surgery,
  never a TOML stringify).

## 3. The chain pass (P) — semantics

- `P(P(c)) = P(c)`: a canonical manifest produces no plan, no write.
- A dep name in `registry.effectiveLatest` is CHAIN-GOVERNED: its version requirement is
  canonicalized to the bare resolved string (caret form) when it differs; `pinStyle: "exact"`
  produces `=resolved`. The canonical output is ALWAYS the full resolved form — the registry's own
  value is padded through Function/Normalize, so even a shorthand registry entry ("2.0") yields
  "2.0.0".
- THE FULL-VERSION NORMALIZATION DIRECTIVE (Cargo-module specific): the user prefers full versions —
  no shorthand like "1.0" may remain in a governed Cargo.toml. Every simple version value is
  expanded to its MOST SPECIFIC form (Function/Normalize): "1.0"→"1.0.0", "1"→"1.0.0",
  "0.1"→"0.1.0"; "=1.0"→"=1.0.0" (the exact form keeps its `=` prefix); the core is padded BEFORE
  any prerelease/build suffix ("1.2-rc.1"→"1.2.0-rc.1"; "1.2.3-rc.1" and "1.2.3+build" stay as
  authored). Complex forms (">=", ">", "<", "~", "^", "*", compound/space ranges) are LEFT AS-IS.
  Cargo semantics are unchanged: a bare full version is still Cargo's implicit caret.
- PRECEDENCE, in order: (1) CHAIN — the user's own registry wins, and its canonical output is always
  full; (2) STRIP — strict-mode unknown deps (only with a registry present); (3) NORMALIZE — every
  other simple version, UNLESS the name is in the keep-list: the **`pin-policy.json` keep entries
  WIN over normalization — kept packages stay byte-identical** (discovery mirrors the package.json
  pinner: global `keepFile` → the file's own directory → co-located with the nearest
  `registry.json`; the union of the readable sources; an unreadable file logs and contributes
  nothing).
- A dep name absent from the registry is PUBLIC (left for `cargo upgrade`).
- `strict: true`: unknown deps are STRIPPED — the whole `name = "…"` entry removed (the documented
  Cargo-specific decision). Never a default. Inherited and path/git entries survive (stripping an
  inherited entry would orphan every member inheriting it).
- Without a registry.json: the chain part (canonicalization + strict strip) is skipped —
  normalization ALONE runs; the update stage still runs (everything is public).

## 4. The update stage (U) — the Rust/TS boundary

- The DETACHED CONTAINED continuation (never `ctx.jobs` — agent-scoped; a root plugin has no job
  controller — live-verified).
- `ctx.subprocess` is probed at runtime (optional, never injected): `resolveExecutable(cargoBin)`
  verifies/resolves the binary (the host PATH is not the user's shell PATH — set an absolute
  `cargoBin` in the patch row when needed), then `spawn` with a FULLY-SPECIFIED argv, collect-mode
  stdio, owned abort signal, `graceMs`. Collected stdout/stderr are appended to the ledger by US.
- Without the seam: the minimal `node:child_process` fallback INSIDE the continuation (only the
  cargo CLI is exempt, never process management).
- Gates per directory: circuit breaker (3 consecutive failures → pause) → in-flight (one cargo run
  per dir) → cooldown (`updateCooldownMs`).
- The graceful no-cargo-edit path: spawn ENOENT or exit 101 with "no such command" →
  `update: cargo-edit unavailable: …`, stage failed, the manifest untouched.
- The digest line: `update: cargo upgrade <args> → {"exitCode":N}`.

## 5. Policy mapping (cargo-edit 0.13.13, live-verified)

| Policy field                             | CLI flag                         | Notes                                                                                                                                                                                                                            |
| ---------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reject`                                 | `--exclude <crate>`              | ONE pair per crate; the comma form is silently ignored                                                                                                                                                                           |
| `allow`                                  | `-p <crate>`                     | repeatable                                                                                                                                                                                                                       |
| `incompatible`                           | `--incompatible <allow\|ignore>` | CLI default: ignore                                                                                                                                                                                                              |
| `pinned`                                 | `--pinned <allow\|ignore>`       | CLI default: ignore                                                                                                                                                                                                              |
| `compatible`                             | `--compatible <allow\|ignore>`   | CLI default: allow                                                                                                                                                                                                               |
| `pinStyle`                               | —                                | no `--exact` exists; manifest-level via the chain pass                                                                                                                                                                           |
| `depGroups`                              | —                                | cargo upgrade rewrites every dep table                                                                                                                                                                                           |
| `targets`                                | —                                | no per-package target selector                                                                                                                                                                                                   |
| `concurrency`                            | —                                | no knob                                                                                                                                                                                                                          |
| `verifyCommand`                          | `/bin/sh -c <cmd>`               | exit 127 non-fatal                                                                                                                                                                                                               |
| **keep-list** (`pin-policy.json` `keep`) | —                                | **wins over FULL-VERSION NORMALIZATION** — kept packages stay byte-identical (Function/Keep, the union of global `keepFile` + directory + registry-adjacent, mirroring the pinner); the CHAIN canonicalization is not suppressed |

## 6. Hygiene (P3/U2) — no FS_STALE_VERSION leak

- After the chain rewrite (P3): `ctx.fs.writeText` with a `replaceIfVersion` intent +
  `{ mode: "danger-full-access" }` (the sandbox policy is REQUIRED — live-verified), the fresh
  service-issued version pre-registered in the Stash, then the `fs/observed` re-emit with
  `outcome.version` and the SAME actor.
- After the cargo upgrade (U2): re-stat via `ctx.fs.stat` + re-emit — the observation-policy record
  tracks whatever the CLI/verifyCommand wrote.
- Both re-emits hit the Stash idempotence gate: no re-govern, no re-dispatch.

## 7. Silence — the author never learns

- The `fs/observed` listener is synchronous, await-free, throw-free; the stages run as the detached
  contained continuation (its own catch).
- The model-facing write result is built from the author's OWN content by the tool layer; the
  governor's writes dispatch no `fs/*` events (only the tool layer does).
- A throwing rewrite is contained (logger-only); a racing author write fails the guarded write
  safely (no clobber) and logs nothing to the ledger.

## 8. Exemptions and rule exceptions (with reasons)

- **smol-toml parse** — pure internal calculation (identification only).
- **Pin's surgical line rewrite** — pure internal calculation; it is what makes comment preservation
  possible (a TOML stringify would destroy comments; there is no write-forge-equivalent API for
  raw-text surgery).
- **Normalize's version padding + Keep's keep-list discovery** — pure internal calculations (the
  FULL-VERSION NORMALIZATION directive and the pin-policy.json sidecar read; same exemption class as
  the discovery walk-ups).
- **The cargo CLI itself** — the second standing exemption (as ncu is for the parent); process
  management is NOT exempt — it goes through `ctx.subprocess`, with a documented
  `node:child_process` fallback when the seam is absent.
- **Auxiliary discovery reads** (registry.json, update-policy.json, pin-policy.json) — plain
  synchronous fs, part of the policy-discovery calculation; the governed manifest is never read this
  way.
- **The ledger append** (`appendFileSync`) — ctx.fs has no append operation; the ledger is the
  plugin's own diagnostic log, not a governed file.
- **`{ mode: "danger-full-access" }`** — the deployment default (`workspace-write`) denies paths
  outside the canonical workspace; the governor's own exclusion list is its fence (anywhere-mode
  mandate).
- **Unmatched-plan refusal** — `Pin` aborts the whole rewrite when a planned entry cannot be located
  in the text (never a partial rewrite).

## 9. The ledger strings (asserted by cargo-smoke.mjs)

```
activated (cargo flavor, logFile=…, updateMode=cargo, cargoBin=…, exclude=[…], policyFile=(discovery), keepFile=(discovery))
skipped (excluded) …
no registry.json found for … — chain pass skipped
unreadable registry.json at … — chain pass skipped for …
observed non-JSON/TOML Cargo.toml … — skipped
governed … → …
REFUSED rewrite of …: non-dependency section "…" would change
REFUSED rewrite of …: dependency "…" in section "…" not found in text — rewrite aborted
update stage dispatched for … (cargo via …[, policy …] | …, built-in default policy)
update stage skipped for … (in-flight | cooldown)
update stage paused for … (N consecutive failures ≥ N)
update: using built-in default policy
update: cargo upgrade … → {"exitCode":N}
update: cargo upgrade failed (base) status N
update: cargo-edit unavailable: …
update: running verifyCommand: …
update: verifyCommand ok | failed (status N) | runner unavailable (exit 127) — skipped, non-fatal
update: DONE — pins bumped per policy
update: FAILED — see lines above
update stage FAILED (N) for …; consecutive=N
```

## 10. Verification results (2026-10-03)

- `tsc --noEmit` — zero errors (TS 7.0.2, the host-pinned set).
- Build: `@playform/build` (ESBuild, `minify: true`, ESM, Target wiped and rebuilt, `.d.ts` emitted,
  aliases rewritten to relative paths).
- Entry contract probe: `name`/`apply`/`Config`/`inject` + the default object carrying ALL FOUR;
  `apply` returns undefined.
- Smoke: **48/48 checks pass** (`node cargo-smoke.mjs` in the family's `smokes/` directory) — loader
  contract, config defaults, trigger gates, chain canonicalization (member + target + workspace
  tables), comment/formatting preservation, strict stripping, pinStyle exact, refusal guard + fence,
  P3/U2 coherence, the CLI mapping (exclude flags in the spawned argv, no comma form), cooldown/
  in-flight/breaker, cargo-edit-unavailable (both paths), verifyCommand (ok/127/failure), the Filter
  skip, the no-registry update path, the silence invariant — and the FULL-VERSION NORMALIZATION
  directive ("1.0"→"1.0.0", "1"→"1.0.0", "0.1"→"0.1.0", "=1.0"→"=1.0.0", prerelease/ build
  preserved, complex ranges untouched, the keep-list wins (byte-identical), the chain output always
  full even from a shorthand registry value, idempotence with normalization).

## 11. Interplay note

The three plugins coexist on `fs/observed`: the package.json governor, the package.json pinner, and
this Cargo.toml module.

Each gates on its own basename (`package.json` / `package.json` /
`Cargo.toml`), so the cargo module never processes an npm event and vice versa; each writes its own
ledger.

The user decides which to activate — activation of one never implies another.

Composition
semantics when several are activated: **pin → bump-exact** (a fully pinned manifest leaves the npm
governor's update stage nothing to do — ncu's no-op case is an exact pin); **chain > strip >
normalize** (this module's precedence, §3); **keep-list wins** (the pinner's `pin-policy.json` keeps
ranges as authored; this module's keep-list — the same sidecar — wins over normalization, never over
the chain).
