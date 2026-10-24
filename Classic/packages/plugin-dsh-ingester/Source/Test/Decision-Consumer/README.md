# Decision-Consumer - the batch-decision trace adapter

The ingester consumes the bus: `batch/proposed` records the proposal,
`batch/decision` applies it through the existing content fence, once per
decision.

## Scenarios

- D1: the proposal record (`Ingester.Proposals()`) and the decision apply -
  the file content changes and the journal carries one `applied` record for
  the target.
- D2: the one-apply claim - the SAME decision delivered twice changes the
  file once, journals one `applied` record, and holds one claim.
- D3: a decision for an unrecorded proposal is refused
  (`unknown` / `no proposal recorded for the decision`), never applied.
- D4: a denied decision rejects the whole run with its byte-exact reason
  (`rejected` / `decision denied the proposal`), the file untouched.
- D5: the feedback outcome - the apply feeds `ctx.feedback.Outcome(...)` with
  `applied` and `applied 1, conflicts 0, recovery 0`.
- D6: the outcome's session and agent are the proposal's `origin`.
- D7: malformed proposals and decisions are ignored without a throw and
  without a journal line.

## Fixtures

The shared Harness (the fake ctx with the captured `batch/proposed` and
`batch/decision` listeners, the version-guarded fake fs, the real built
class). The proposal's version token is the live content's sha256, so the
fence passes for the happy path.

## Expected journal strings (byte-exact, one JSON line per event)

`applied` / `version <sha>`, `unknown` / `no proposal recorded for the
decision`, `rejected` / `decision denied the proposal`.

## Expected count

8 PASS.
