# hook-dsh-batch-decision - the live test plan

## Identity

- Package: `@playform/hook-dsh-batch-decision` (Classic/packages/hook-dsh-batch-decision).
- Profile row id: `hook-dsh-batch-decision` (bundled in the desktop profile).
- Exposes: the `batch_decision` tool (list pending proposals, approve/deny by id, with the ingester
  handoff attempted through the service seam when present); listens for `batch/proposed` carrying a
  BatchProposal, runs the decision gate (expiry first, then the conservative auto-approve policy:
  the first batch of an intent class always requires the user), records the BatchDecision, emits
  `batch/decision`.
- Ledger prefix: `hook-dsh-batch-decision:`; logFile `~/.dsh/batch-decision.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-batch-decision"}` → one entry, status schema (defaults: autoApprove
   "off", allowlist [], maxAutoTargets 5, minConfidence 0.8, pendingTtlMs 3600000).
2. Tool check: the Tool provider lists `batch_decision`.
3. Ledger line:
   `hook-dsh-batch-decision: activated (bundle 0.1.0, autoApprove=<mode>, allowlist=<n>)` in
   `~/.dsh/batch-decision.log` (byte-exact per Source/Test/Policy-And-Contract/Test.ts:89).

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | `batch_decision` with no arguments | the pending
list | an empty list is the CORRECT answer when nothing is pending | | T2 | Emit a `batch/proposed`
event with a BatchProposal | the proposal appears in `batch_decision`'s list | id, target count and
expiry visible | | T2 | `batch_decision` approve=<id> on a /tmp-targeted proposal | the decision is
recorded, `batch/decision` emitted | the decision line lands in the logFile; the ingester handoff
attempted | | T3 | A second proposal of the same intent class with autoApprove "off" | no
auto-approval; the user decides | the first-of-class rule cannot be bypassed by config |

## Known live gaps

- None observed: `batch_decision` works - the empty pending list is correct.

## Fix loop

- Fix files: `Source/Function/` (the decision gate, the tool), `Source/Library.ts`,
  `Source/Interface/Siblings.ts` (the structurally declared service shapes).
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-batch-decision run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-batch-decision/Target/Test/<Folder>/Test.js` (e.g.
  Policy-And-Contract). Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-batch-decision`
- Tests run: T1 list - / T2 propose+approve - / T3 policy -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
