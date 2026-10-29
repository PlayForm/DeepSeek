# Decision-Consumer - the batch-decision trace adapter

This folder covers the consumption of the bus by the ingester: `batch/proposed` records the
proposal, and `batch/decision` applies it through the existing content fence, once per decision.

## Scenarios

- D1: the proposal record through `Ingester.Proposals()` and the decision
  apply - the file content changes and the journal carries one `applied`
  record for the target.
- D2: the one-apply claim - the SAME decision delivered twice changes the file
  once, journals one `applied` record, and holds one claim.
- D3: a decision for an unrecorded proposal is refused with `unknown` and
  `no proposal recorded for the decision`, and it is never applied.
- D4: a denied decision rejects the whole run with its byte-exact reason
  (`rejected` and `decision denied the proposal`), and the file stays
  untouched.
- D5: the feedback outcome - the apply feeds `ctx.feedback.Outcome(...)` with
  `applied` and `applied 1, conflicts 0, recovery 0`.
- D6: the session and the agent of the outcome are the `origin` of the
  proposal.
- D7: malformed proposals and decisions are ignored without a throw and
  without a journal line.

## Fixtures

The fixtures are the shared Harness with the fake ctx that captures the `batch/proposed` and
`batch/decision` listeners, the version-guarded fake fs, and the real built class.

The version token of the proposal is the sha256 of the live content, so the fence passes for the
happy path.

## Expected journal strings (byte-exact, one JSON line per event)

`applied` / `version <sha>`, `unknown` / `no proposal recorded for the
decision`, `rejected` / `decision denied the proposal`.

## Expected count

8 PASS.
