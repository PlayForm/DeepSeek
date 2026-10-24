# plugin-dsh-ingester - the live test plan

## Identity

- Package: `@playform/plugin-dsh-ingester` (Classic/packages/plugin-dsh-ingester).
- Profile row id: `plugin-dsh-ingester` (bundled in the desktop profile).
- Exposes: the `ingester` service (`export default class Ingester extends Service` with
  `super(Context, "ingester")`, registered immediately on construction - the factory's precedent)
  with `Apply(proposal, decision)`, `WhenIdle()` (the flush seam) and `Proposals()`. The only writer
  in the batch flow: it consumes `batch/decision` events (from hook-dsh-batch-decision) and applies
  the approved batches to files through `ctx.fs` (the governed write path with the version guard) —
  never `node:fs`, never a plugin-side write.
- The decision consumer (SCHEME §1a): the constructor registers two bus listeners — `batch/proposed`
  records the proposal (bounded by `maxProposals`), `batch/decision` consumes it. A decision for a
  proposal the ingester never heard is refused (`unknown` /
  `no proposal recorded for the decision`). One apply per decision: the claim is taken
  synchronously, keyed by `proposal:outcome:at`, so the same decision delivered twice (the tool's
  handoff and the event) applies exactly once.
- The apply loop (SCHEME §3): resolve → stat (absent = `conflict`) → fence (sha256 vs
  `target.version`; mismatch = `conflict`) → match (a missing `find` = `conflict`) → apply (one
  version-fenced literal edit per operation, `ctx.fs.editText`) → journal (`applied` / `conflict` /
  `recovery-required` / `rejected`). `stopOnConflict` (default true) stops at the first failed
  target; a failed validation rejects the whole run with every target `skipped`, zero writes.
- The feedback outcome (SCHEME §4): after an apply the ingester reports to `ctx.feedback` (probed at
  use time; absent is a silent skip) — outcome `applied` or `rejected`, detail
  `applied <n>, conflicts <n>, recovery <n>`, the session/agent from the proposal's `origin`.
- The policy block (D6, SCHEME §5a): `policy: Policy()`; `write` is the ingester's own action class
  and stays the shipped `approve` — the decision's approval IS the gate; the rest auto/approve per
  the family block. One volatile object; a resolved pack's `policy` section overrides per action.
- Ledger: the journal (one line per event, `{ at, event, proposal, path, detail }`), logFile
  `~/.dsh/playform/plugin-dsh-ingester.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-ingester"}` → one entry, status schema (defaults: maxTargets 20,
   stopOnConflict true, maxProposals 16, policy.* D6 defaults). Ships `enabled: true` (the patch
   entry).
2. Service check: `cordis_inspect_query` host/Service/listService `ingester` → resolves immediately
   on construction.
3. Ledger line: the activated line in `~/.dsh/playform/plugin-dsh-ingester.log`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | `listService ingester` | the service is registered
| construction-time registration | | T4 | Emit `batch/proposed` then `batch/decision` (approved) for
an /tmp-targeted proposal | the ingester applies the batch | the /tmp file changes match the
proposal; the write path is the ingester's ONLY (through `ctx.fs`) | | T4 | Emit `batch/decision`
for a denied proposal | nothing is written | the denials never reach the file system | | T4 | Emit
the SAME decision twice (tool handoff + event) | exactly one apply | the synchronous claim keyed
`proposal:outcome:at`; every caller receives the same result | | T4 | A decision for an unrecorded
proposal | refused | the `unknown` journal line, never applied against a guessed proposal | | T4 | A
target edited between proposal and apply | the fence catches it | `conflict` (sha256 mismatch), zero
silent overwrite |

## Known live gaps

- Not dogfooded yet. Watch for: the ingester writing when the decision event is malformed, and
  handoff attempts from batch_decision failing silently when the service seam is absent. The
  feedback outcome is a silent skip when `ctx.feedback` is not mounted.

## Fix loop

- Fix files: `Source/Library.ts` (the class), `Source/Function/` (the apply engine, the decision
  consumer), `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-ingester run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-ingester/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-ingester`
- Tests run: T1 config - / T1 service - / T4 apply - / T4 denied no-op - / T4 one-apply claim - / T4
  fence -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
