# Package 9 — SESSION 2026-10-04 LATE: THE QUEUE EXECUTED

> Written after the 28ebc30 → 4165bbd session. EVERY item of the refined queue
> ([Package 4-REVISION](Package-04.md)) through P3 is DONE and committed; P4 is partially done. The
> family is now SIX bundles + the smoke archive. The smokes are the arbiter after every step — all
> green at the end (core 8 / factory 31 / governor 71 / pinner 28 / cargo 58 / mdash 45). Part of
> `Documentation/Handoff/` — see `../Overview.md`.

## What landed (the commit chain)

1. `28ebc30` — **P0-1 + P0-2**: the factory `.d.ts` fix (named type exports
   State/Options/Gate/Transform/Output/Journal + RELATIVE specifiers everywhere) + the deterministic
   build (each bundle's prepublishOnly now runs
   `Build … --TypeScript Configuration/TypeScript.noemit.json` — the racy onEnd hook becomes a no-op
   — then explicit sequential `tsc && tsc-alias`; a red tsc now FAILS the build). tsc ×5 green at
   last (the pinner's 5 errors gone; the mdash widened to extend the factory's State — TS2740 ×2
   fixed).
2. `3c29108` — **P1 the Module rename** (State.Flavor → State.Module; 72 files; the keep-list
   verified: `activated (cargo flavor, …)` etc.).
3. `060e3b6` — **P1 the standalone Schema helper**: the factory's named `Schema(shared?, module?)`
   (module-load use) + the optional shared block (`shared: false` → minimal log/logFile); the THREE
   Config workarounds deleted (governor hand-restate, pinner stub-ctx, cargo prototype hack). The
   governor's "no factory import" smoke assertion was updated to "only Config imports the factory"
   (its posture is now the cargo's).
4. `1ed3564` — **P2 the Inflight-key helper**: the factory's 16th method `UpdateKey(target)` →
   `update:<targetKey>`; the GOVERNOR's live collision fixed (Dispatch/Settle adopt it); the cargo's
   local Update/Key.ts deleted (its State gains the Factory field — the governor-family pattern).
   Collision-window smoke cases added (factory 30→31, governor 70→71).
5. `c6a72ce` — **P2 the type-import flip**: the consumers' structural mirrors deleted (~208 lines:
   the governor's 16-method Factory mirror, its State shared half, Gate/Transform/Output/Journal
   re-exported; the cargo's State mirror; the pinner's extraction restored to the named export). The
   governor's "only Config imports the factory" posture UNCHANGED (type-only imports are erased).
6. `1fef4ca` — **P3 @playform/dsh-hook-core** (the pure package): Section, Default, Suppress (the
   suppression-line composer — the four sites adopt it AND the governor's hardcoded
   `package-governor:` prefixes became State.Module, the P4 prefix fix folded in), Policy (the
   update-policy loader mechanics — both governors' loaders become delegates), Refusal (the shared
   guard — the governor + pinner transforms adopt it). Own unit smoke 8/8 (no fake ctx); the profile
   gains the link (bundles: +1).
7. `e78c05c` — **P4 (partial)**: the cargo's journal-parity gap fixed (`dispatched`/`update-failed`
   records), the owner-key drift fixed (the uniform unowned form = the owner KEY ABSENT; Jobs.owner
   optional), the stale "ctx.jobs is AGENT-SCOPED" header claim replaced (refuted).
8. `4165bbd` — **the smoke archive**: the six smokes committed under `~/.dsh/smokes/` (they were
   LOST once — /tmp cleared — and recovered from the session archives via write/edit replay; never
   lose them again).

## The family now (six bundles)

core (pure helpers) · factory (16 methods + the named Schema/type exports) · package-governor ·
package-pinner · cargo-governor · mdash.

## What REMAINS (the next session's queue — smaller now)

- **P4 granularization (the splits)**: cargo `Source/Function/Pin.ts` (333 lines),
  `Update/Upgrade.ts` (298), the governor's `Update/Bin.ts` (227), the cargo's `Transform.ts` (206)
  — pure reorganization into focused files, smokes as the arbiter, NO behavior change.
- **P4 naming unification**: the governor's `Passage` (the transform→update hand-off) vs the cargo's
  `Plan` (the chain pass's output — genuinely different shapes, but the ROLE naming drifts); the
  governor's `Update/Run.ts` vs the cargo's `Execute.ts` (the SAME role — the update stage body —
  under two names; neither smoke pins the file names, so a rename is mechanically safe). Pick one
  vocabulary and rename.
- **The live family test** ([Package 7](Package-07.md) playbook, still pending — the user restarts
  the app; the ledgers + Inspect are the activation assessors; the collision window is now
  smoke-covered and the unload disposal aborts both controller kinds).
- Opportunistic: the docs' remaining "flavor" prose in the four consumers' README/SCHEME (the
  factory's are clean; ~50 mentions — mechanical); `--dump-config` is gone (the Electron-managed
  profile guard).

## The working lessons of this session

Collected in [`../Lessons.md`](../Lessons.md) (§ Session 2026-10-04 late — the smoke-recovery
pattern, the pnpm-workspace trap, verbatimModuleSyntax type re-exports, the build-order dependency).

## FINAL WORD

The refined queue is EXECUTED through P3, P4 partially. The family is six packages, tsc ×6 green,
builds deterministic (rebuild ×2 → identical tree), smokes archived and green (core 8 / factory 31 /
governor 71 / pinner 28 / cargo 58 / mdash 45). Next: the P4 splits + naming unification, the docs'
flavor prose, then the LIVE family test with the user (coordinate the restart).

---

# PACKAGE 9-REVISION — THE QUEUE FULLY EXECUTED (the 711d5b2 addendum)

The P4 items listed as "REMAINING" above are DONE — `711d5b2`
`refactor(family): P4 granularization + naming unification (the four big-file splits)`:

- **The splits**: cargo Pin.ts 333→269 (SplitPath/KeyOf/Name/SpliceVersion → Pin/), cargo
  Update/Upgrade.ts 298→105 (Unavailable/Seam/Child/Collect → Update/Upgrade/), governor
  Update/Bin.ts 227→62 (Seam/Child/Pipe/ Collect → Update/Bin/ — the SAME role names as the cargo's
  split, so the runner internals unify by name across the family), cargo Transform.ts 206→154
  (Keep + Guard → Transform/).
- **The naming unification**: the cargo's hand-off cell (a locally-declared "Plan") is now
  `Interface/Passage` — the SAME ROLE and name as the package.json governor's Passage (the cargo's
  Interface/Plan stays the chain pass's output — a genuinely different shape); the cargo's
  `Execute.ts` → `Run.ts` (the same role as the governor's Update/Run).
- **The docs' flavor prose**: all four consumers' README/SCHEME renamed (~50 mentions → module); the
  KEEP-LIST intact (only the `activated (cargo flavor, …)` activation strings remain); the mdash's
  obsolete "why Factory.Schema is NOT used" sections rewritten for the v0.1.1 standalone helper
  (`shared: false` — the minimal block).

## THE STATE OF THE FAMILY (final for this session series)

Nine commits since the handoff (28ebc30 → 711d5b2). Six bundles + the smoke archive. tsc ×6 = 0,
builds deterministic, tree clean.

```
smokes (the arbiter, archived at ~/.dsh/smokes/):
  core 8 · factory 31 · governor 71 · pinner 28 · cargo 58 · mdash 45 — ALL PASS
```

## THE ONLY REMAINING ITEM — THE LIVE FAMILY TEST

User-coordinated: restart the app (the profile carries six links), then walk
[Package 7](Package-07.md)'s playbook — the four activation lines in the ledgers, the governor+pinner
interlock, a real `cargo upgrade` job in `job_list`, the mdash em-dash normalization, silence
everywhere else, and the (now smoke-covered) collision window.
