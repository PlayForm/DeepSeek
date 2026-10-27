# SCHEME — @playform/hook-dsh-cargo-governor

This file is the design document of the **CARGO.TOML MODULE** of the silent package.json governor.

The module delineation is the point: the architecture and the API-awareness discipline stay
identical, but the update stage is **Rust-side only**, which means `cargo upgrade` (cargo-edit)
driven through `ctx.subprocess`.

Rust does not co-opt into the TypeScript ecosystem, because no npm-library equivalent exists for
cargo manifest updates, so the update stage operates at the **exclusionary level** through the cargo
CLI.

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
  `[target.'cfg(...)'.dependencies]` with its dev and build variants, and
  `[workspace.dependencies]`, which is the SHARED dep table; a manifest can define versions THERE
  instead of in `[dependencies]`, and the module governs both.
- Version forms: bare `"0.3.4"`, which is Cargo's implicit caret and the canonical form, `"=0.3.4"`
  for the exact form, `"~0.3.4"`, inline tables `{ version = "0.3.4", features = [...] }`, and
  table-style entries (`[dependencies.serde]` plus `version = "…"`).
- NEVER rewritten: `path = "…"` entries, `git = "…"`/`rev = "…"` entries, and inherited entries
  (`dep.workspace = true` or `dep = { workspace = true }`, where the version lives in the workspace
  table and is walked separately).
- Comments and formatting: preserved byte-for-byte, because the module parses for identification,
  rewrites by line surgery, and never runs a TOML stringify.

## 3. The chain pass (P) — semantics

- `P(P(c)) = P(c)`: a canonical manifest produces no plan and no write.
- A dep name in `registry.effectiveLatest` is CHAIN-GOVERNED, so its version requirement is
  canonicalized to the bare resolved string in caret form when it differs, and `pinStyle: "exact"`
  produces `=resolved`.
- The canonical output is ALWAYS the full resolved form, because the registry value itself is padded
  through Function/Normalize, so even a shorthand registry entry ("2.0") yields "2.0.0".
- THE FULL-VERSION NORMALIZATION DIRECTIVE is specific to the Cargo module: the user prefers full
  versions, so no shorthand like "1.0" may remain in a governed Cargo.toml.
- Every simple version value is expanded to its MOST SPECIFIC form through Function/Normalize:
  "1.0"→"1.0.0", "1"→"1.0.0", "0.1"→"0.1.0", and "=1.0"→"=1.0.0" where the exact form keeps its `=`
  prefix.
- The core is padded BEFORE any prerelease or build suffix, so "1.2-rc.1"→"1.2.0-rc.1", while
  "1.2.3-rc.1" and "1.2.3+build" stay as authored.
- Complex forms (">=", ">", "<", "~", "^", "*", and compound or space ranges) are LEFT AS-IS.
- Cargo semantics are unchanged, because a bare full version is still Cargo's implicit caret.
- PRECEDENCE runs in order: first CHAIN, where the registry of the user wins and its canonical
  output is always full; second STRIP, for strict-mode unknown deps and only with a registry
  present; third NORMALIZE, for every other simple version.
- The keep-list overrides the third step, because the **`pin-policy.json` keep entries WIN over
  normalization and kept packages stay byte-identical**.
- The discovery mirrors the package.json pinner: the global `keepFile`, then the directory of the
  file, then the location beside the nearest `registry.json`, with the union of the readable
  sources, and an unreadable file logs and contributes nothing.
- A dep name absent from the registry is PUBLIC and left for `cargo upgrade`.
- With `strict: true` the unknown deps are STRIPPED, which removes the whole `name = "…"` entry, as
  the documented Cargo-specific decision states.
- This is never a default.
- Inherited and path/git entries survive, because stripping an inherited entry would orphan every
  member that inherits it.
- Without a registry.json the chain part is skipped, so canonicalization and strict strip do not run
  and normalization ALONE runs, while the update stage still runs because everything is public.

## 4. The update stage (U) — the Rust/TS boundary

- The continuation is DETACHED and CONTAINED, and it never uses `ctx.jobs`, because jobs are
  agent-scoped and a root plugin has no job controller, as the live run verified.
- `ctx.subprocess` is probed at runtime, is optional, and is never injected:
  `resolveExecutable(cargoBin)` verifies and resolves the binary, and the host PATH is not the shell
  PATH of the user, so set an absolute `cargoBin` in the patch row when needed.
- The spawn then runs with a FULLY-SPECIFIED argv, collect-mode stdio, an owned abort signal, and
  `graceMs`, and the collected stdout and stderr are appended to the ledger by US.
- Without the seam the minimal `node:child_process` fallback runs INSIDE the continuation, because
  only the cargo CLI is exempt and process management never is.
- The gates run per directory: the circuit breaker pauses after 3 consecutive failures, then the
  in-flight gate allows one cargo run per dir, then the cooldown gate applies `updateCooldownMs`.
- The graceful no-cargo-edit path catches spawn ENOENT or exit 101 with "no such command", writes
  `update: cargo-edit unavailable: …`, marks the stage failed, and leaves the manifest untouched.
- The digest line reads `update: cargo upgrade <args> → {"exitCode":N}`.

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

- After the chain rewrite (P3), `ctx.fs.writeText` runs with a `replaceIfVersion` intent and
  `{ mode: "danger-full-access" }`, because the sandbox policy is REQUIRED and the live run verified
  it, the fresh service-issued version is pre-registered in the Stash, and the `fs/observed` re-emit
  then carries `outcome.version` and the SAME actor.
- After the cargo upgrade (U2) the module re-stats through `ctx.fs.stat` and re-emits, so the
  observation-policy record tracks whatever the CLI or verifyCommand wrote.
- Both re-emits hit the idempotence gate of the Stash, so there is no re-govern and no re-dispatch.

## 7. Silence — the author never learns

- The `fs/observed` listener is synchronous, await-free, and throw-free, and the stages run as the
  detached contained continuation with its own catch.
- The tool layer builds the model-facing write result from the OWN content of the author, and the
  writes of the governor dispatch no `fs/*` events, because only the tool layer does.
- A throwing rewrite is contained to the logger, and a racing author write fails the guarded write
  safely with no clobber and logs nothing to the ledger.

## 8. Exemptions and rule exceptions (with reasons)

- **smol-toml parse** — pure internal calculation for identification only.
- **Pin's surgical line rewrite** — pure internal calculation, and it is what makes comment
  preservation possible, because a TOML stringify would destroy comments and no write-forge
  equivalent exists for raw-text surgery.
- **Normalize's version padding plus Keep's keep-list discovery** — pure internal calculations,
  which are the FULL-VERSION NORMALIZATION directive and the pin-policy.json sidecar read, in the
  same exemption class as the discovery walk-ups.
- **The cargo CLI itself** — the second standing exemption, as ncu is for the parent; process
  management is NOT exempt, because it goes through `ctx.subprocess` with a documented
  `node:child_process` fallback when the seam is absent.
- **Auxiliary discovery reads** (registry.json, update-policy.json, pin-policy.json) — plain
  synchronous fs as part of the policy-discovery calculation, and the governed manifest is never
  read this way.
- **The ledger append** (`appendFileSync`) — ctx.fs has no append operation, and the ledger is the
  diagnostic log of the plugin rather than a governed file.
- **`{ mode: "danger-full-access" }`** — the deployment default (`workspace-write`) denies paths
  outside the canonical workspace, and the exclusion list of the governor is its fence under the
  anywhere-mode mandate.
- **Unmatched-plan refusal** — `Pin` aborts the whole rewrite when a planned entry cannot be located
  in the text, so a partial rewrite never happens.

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
- Entry contract probe: `name`/`apply`/`Config`/`inject` plus the default object carrying ALL FOUR,
  and `apply` returns undefined.
- Smoke: **48/48 checks pass** (`node cargo-smoke.mjs` in the `smokes/` directory of the family),
  which covers the loader contract, the config defaults, the trigger gates, chain canonicalization
  (member + target + workspace tables), comment and formatting preservation, strict stripping,
  pinStyle exact, the refusal guard and fence, P3/U2 coherence, the CLI mapping (exclude flags in
  the spawned argv, no comma form), cooldown/in-flight/breaker, cargo-edit-unavailable (both paths),
  verifyCommand (ok/127/failure), the Filter skip, the no-registry update path, the silence
  invariant, and the FULL-VERSION NORMALIZATION directive ("1.0"→"1.0.0", "1"→"1.0.0",
  "0.1"→"0.1.0", "=1.0"→"=1.0.0", prerelease/ build preserved, complex ranges untouched, the
  keep-list wins (byte-identical), the chain output always full even from a shorthand registry
  value, and idempotence with normalization).

## 11. Interplay note

The three plugins coexist on `fs/observed`: the package.json governor, the package.json pinner, and
this Cargo.toml module.

Each one gates on its own basename (`package.json` / `package.json` / `Cargo.toml`), so the cargo
module never processes an npm event and the reverse holds too, and each writes its own ledger.

The user decides which to activate, and activation of one never implies another.

Composition semantics when several are activated: **pin → bump-exact**, because a fully pinned
manifest leaves the update stage of the npm governor nothing to do and ncu's no-op case is an exact
pin; **chain > strip > normalize**, which is the precedence of this module in §3; and **keep-list
wins**, because the `pin-policy.json` of the pinner keeps ranges as authored while the keep-list of
this module, the same sidecar, wins over normalization and never over the chain.
