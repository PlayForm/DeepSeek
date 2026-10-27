# hook-dsh-batch-decision - the live test plan

## Identity

- Package: `@playform/hook-dsh-batch-decision` (Classic/packages/hook-dsh-batch-decision).
- Profile row id: `hook-dsh-batch-decision` (bundled in the desktop profile).
- Exposes the `batch_decision` tool (list pending proposals, approve/deny by id, with the ingester
  handoff attempted through the service seam when present), and it listens for `batch/proposed`
  carrying a BatchProposal, runs the decision gate (expiry first, then the conservative auto-approve
  policy: the first batch of an intent class always requires the user), records the BatchDecision,
  and emits `batch/decision`.
- The inbox handoff (SCHEME "The handoff"): every recorded decision - approved, denied and expired
  alike - is ALSO written into the harness agent-team inbox (`agent.inject(message)` carrying
  `[BATCH DECISION - <id>]` + the canonical decision JSON), so the board's status follows the
  decision without the bus being the only wire. Target: `origin` -> the harness initiator -> the
  first live agent, and no live agent gives the honest `inbox <id>: no live agent` line.
- The policy gate (D6, SCHEME "The policy gate"): `policy: Policy()` is the OUTER gate in front of
  `autoApprove` (the INNER one). `Decide(State.Allow, "commit") !== "auto"` refuses the policy
  auto-approval with the byte-exact `decision held <id> (policy commit=approve)` line, so the
  proposal stays pending for the approval of the user. Precedence **policy approve > knob**: the
  shipped `commit: approve` means that a policy auto-approval never happens until the user opens the
  gate. One volatile object stays hot-editable, and a resolved pack's `policy` section overrides per
  action.
- Ledger lines (SCHEME "Ledger strings", byte-stable): `disabled (enabled=false)`;
  `bundle 0.1.0 autoApprove <off|on> allowlist <n>` (the Activate line);
  `proposal <id> recorded (intent <intent>, targets <n>, rev <n>)`;
  `proposal <id> ignored (revision not newer)`; `decision <outcome> <id> (by <user|policy>)`;
  `decision held <id> (policy commit=approve)`; `inbox <id>: delivered to <agent>`;
  `inbox <id>: no live agent`;
  `handoff <id>: no ingester service present (the batch stays approved)`;
  `handoff <id>: applied <n>, conflicts <n>, recovery <n>`. Prefix `hook-dsh-batch-decision:`;
  logFile `~/.dsh/playform/hook-dsh-batch-decision.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-batch-decision"}` for one entry with status schema (defaults:
    autoApprove "off", allowlist [], maxAutoTargets 5, minConfidence 0.8, pendingTtlMs 3600000,
    policy.* D6 defaults).

2. **The tool check.**

    The Tool provider lists `batch_decision`.

3. **The ledger line.**

    The Activate line `bundle 0.1.0 autoApprove <off|on> allowlist <n>` appears in
    `~/.dsh/playform/hook-dsh-batch-decision.log`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | `batch_decision` with no arguments | the pending
list | an empty list is the CORRECT answer when nothing is pending | | T2 | Emit a `batch/proposed`
event with a BatchProposal | the proposal appears in `batch_decision`'s list | id, target count and
expiry visible; `proposal <id> recorded (intent <intent>, targets <n>, rev <n>)` line; a stale
revision logs `proposal <id> ignored (revision not newer)` | | T2 | `batch_decision` approve=<id> on
a /tmp-targeted proposal | the decision is recorded, `batch/decision` emitted AND the inbox write |
`decision approved <id> (by user)`; `inbox <id>: delivered to <agent>` (or `no live agent`); the
ingester handoff attempted | | T2 | The same with the ingester service absent | the batch stays
approved | `handoff <id>: no ingester service present (the batch stays approved)` | | T2 | With
`autoApprove: "on"` while `policy.commit` stays `approve` (shipped default) | the policy
auto-approval is refused | `decision held <id> (policy commit=approve)`; the proposal stays pending
| | T3 | A second proposal of the same intent class with autoApprove "off" | no auto-approval; the
user decides | the first-of-class rule cannot be bypassed by config |

## Known live gaps

- None observed: `batch_decision` works, and the empty pending list is correct. With the shipped
  `commit: approve` policy gate, a policy auto-approval never fires until the user flips it, which
  is posture, not a defect.

## Fix loop

- Fix files: `Source/Function/` (the decision gate, the tool, the inbox handoff),
  `Source/Library.ts`, `Source/Interface/Siblings.ts` (the structurally declared service shapes).
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-batch-decision run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-batch-decision/Target/Test/<Folder>/Test.js` (e.g.
  Policy-And-Contract), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-batch-decision`
- Tests run: T1 list - / T2 propose+approve - / T2 inbox - / T2 held - / T3 policy -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
