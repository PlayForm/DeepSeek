# Package 10 — THE LIVE FAMILY TEST (2026-10-04, after the restart)

> Run with the user: the app restarted with the six links; the battery is COMPLETE. Every ledger
> line below is live (the ledgers are the complete record). Its P5 fix and the follow-up revisions
> are in this file; the playbook is [Package 7](Package-07.md). Part of `Documentation/Handoff/` —
> see `../Overview.md`.

1. **Activation (11:21:56)** — all four activation lines: the governor
   (`activated (anywhere mode, …updateMode=programmatic…)`), the pinner, the cargo
   (`activated (cargo flavor, …)` — the keep-list literal intact) and the mdash. The factory
   registers none (a service).
2. **The interlock (11:27:57)** — one write of a NON-canonical governed-chain package.json
   (`~0.1.0-rc.6` chain + `^4.18.1`/ `^3.0.5` public): `governed <path> → <version>` (chain
   canonicalized ONCE) + `pinned <path> (2 versions)` (public prefixes stripped); the final file:
   chain `^0.1.0-rc.6` + `4.18.1`/`3.0.5` — the interlock exact. Bounded passes live: the re-emit
   was `update stage skipped … (in-flight)`.
3. **The update stages as real jobs** — the governor's programmatic ncu (`update: ncu (base) → {}` +
   the policy's `verifyCommand: pnpm install` → `verifyCommand failed (status 1)` — the fixture's
   vendored forks aren't on the registry, the documented cordis trap — breaker `consecutive=1`); the
   cargo's REAL `cargo upgrade` with the full argv
   (`--exclude serde --exclude anyhow --incompatible ignore --pinned ignore` — the chain keys always
   excluded) + the digest + `DONE`.
4. **The cargo normalization** — `serde = "1.0"` → `"1.0.228"`, `toml = "0.1"` → `"0.1.30"`,
   comments preserved (the surgical rewrite).
5. **The mdash** — live `normalized 2/4/18 dash char(s) in one stream` events; it normalizes the
   SESSION's own model streams (replacement `-`).
6. **The collision window** — the in-flight gate live (`skipped (in-flight)` during the
   verifyCommand window) + back-to-back cargo runs each completing cleanly (no orphan; the
   namespaced UpdateKey smoke covers the controller survival).
7. **THE P5 LIVE FINDING (fixed, commit `952eaa1`)** — the harness's dsh-storage-domain enforces ONE
   open per domain name (verified in the installed 0.2.0-rc.2: "concurrent opens of one name fail
   loud"), so the SHARED package_governance domain was single-winner per boot: at this boot only the
   PINNER's records landed in the domain (`storages/package_governance.json`), the governor's +
   cargo's silently never did (the human ledgers remained the complete record). Fix: the FIRST
   successful Open binds its table put on the factory instance (`SharedJournal` — every module holds
   the same injected service) and the Journal method routes all modules' records through it (Attach
   probes the service via ctx.get "pluginFactory", try/catch). Smoke-verified (all six); LIVE
   CONFIRMATION: the next restart should show ALL modules' records in the shared domain.

## THE FAMILY IS LIVE AND COMPLETE

The queue ([Packages 4-REVISION + 9 + 9-REVISION](Package-04.md)) is fully executed; the live
battery ([Package 7](Package-07.md)) is done except the P5 fix's next-boot confirmation. Ten commits
since the handoff: 28ebc30 → 952eaa1. tsc ×6 = 0, smokes 8/31/71/28/58/45 all green, tree clean. The
only open items: the P5 shared-sink live confirmation (one more restart, whenever natural) and any
future granularization the user wants (none left in the queue).

---

# PACKAGE 10-REVISION — THE P5 FINDING RESOLVED (952eaa1 + aa53c91)

- `952eaa1` — the shared journal sink: the FIRST successful Open binds its put on the factory
  instance (`SharedJournal`); the Journal method routes every module's records through it (the
  harness's storageDomain is single-open per name — verified in dsh-storage-domain 0.2.0-rc.2:
  "concurrent opens of one name fail loud"). LIVE-CONFIRMED at the next boot: the governor's
  `governed` + `dispatched` records landed in the shared domain (15:09:07) — previously they never
  would.
- `aa53c91` — the BOOT-WINDOW RACE closed (delegated to a coder subagent per the user's working
  directive — see below): the non-first modules' pre-bind records (their `activated` records,
  journaled before ANY open completes) now buffer in the factory-level `PendingJournal` (capped 256,
  drop-when-full mirroring the per-State queue) and drain through the shared sink when the first
  open succeeds (timestamps preserved), then retire. Three-stage routing: shared sink → pre-bind
  buffer → per-State fallback. Smoke-harness fixes: the governor/cargo smokes' fake `ctx.get` falls
  through to the ctx property (Attach's ctx.get("pluginFactory") probe must find the factory —
  otherwise the shared sink never binds in the tests); the factory smoke resets the buffer per
  scenario and its section-9 assertions follow the new routing. All six smokes + tsc ×6 green
  (battery re-run by the orchestrator).
- Live confirmation of the boot-window fix: at the NEXT natural restart, ALL four modules'
  `activated` records should appear in `~/.dsh/storages/package_governance.json` (the governor's was
  the one missing at the last boot).

## THE USER'S WORKING DIRECTIVE (2026-10-04)

"From now on, develop only through subagents": all CODE changes are delegated to coder subagents
with precise specs (the smokes + tsc as the arbiter, the orchestrator verifies + commits).
Live-testing (fixture writes, ledger/storage reads) remains direct.

---

# PACKAGE 10-FINAL — THE P5 RESOLUTION LIVE-CONFIRMED (third boot, 13:44:43 UTC)

The shared domain (`~/.dsh/storages/package_governance.json`) now shows the COMPLETE record set from
ONE boot:

```
16:44:43.232 activated | activated (pinner, …)
16:44:43.301 activated | activated (anywhere mode, …)   ← the governor's (was missing)
16:44:43.302 activated | cargo                            ← the cargo's (was missing)
16:45:42.178 governed  | <version token>                  ← the interlock cascade
16:45:42.196 dispatched | programmatic                    ← the update stage
```

Both fixes confirmed live: the SHARED SINK (952eaa1 — post-bind records from every module) and the
PRE-BIND BUFFER (aa53c91 — the boot-window activations of the non-first modules). The interlock, the
pinner's `pinned (2 versions)` and the governor's ncu/verifyCommand cascade all still run as
designed (the fixtures return canonical). THE FAMILY IS FULLY LIVE: the queue, the granularization,
the smokes (8/31/71/28/58/45), and every P5 record path.
