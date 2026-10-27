# Overpass

What this test verifies.

## Intent

The overpass layer: the tools/post-execute arm (normalizing tool results in the transcript), the
agent/pre-step arm (normalizing incoming step batches), the human-facing `normalize-over` command
that drives both, and the history-safety invariant.

This is its own folder because the arms are a separate integration surface with their own
registration contract, their own scope gates (both off by default), their own exemption list and
their own ledger strings.

The source suite's Run O (O0-O14), moved verbatim.

## Scenario

- Group: O0 - registration facts.
    - Check: "overpass: the tools/post-execute arm is registered".
    - Check: "overpass: the agent/pre-step arm is registered".
    - Check: "overpass: the post-execute arm PREPENDS (outermost vs the ccr
      arm's own prepend)".
    - Check: "overpass: the pre-step arm uses default ordering (nothing
      needs to precede it)".
    - Check: "overpass: the normalize-overpass command is registered (name
      without slash)".
- O1: default-off passthrough. Check: "overpass: toolResults off (default)
  -> the decision passes untouched".
- O2: the volatile flip (toolResults on) -> "the text block is rewritten
  (em dash -> hyphen)", "the tool-result ledger line is byte-exact", "the
  arm wrote NOTHING to any file surface (history safety)".
- O3: exemption. Check: "overpass: exempt tool (read) passes through by
  identity".
- O4: block rules. Check: "overpass: tool-call/argument blocks pass
  untouched (execution-critical JSON)"; Check: "overpass: the text block in
  the same content IS rewritten".
- O5: the N=0 no-op rule. Check: "overpass: N=0 payload -> the bare
  decision unchanged"; Check: "overpass: N=0 -> no ledger line (the no-op
  rule)".
- O6: canonical. Check: "overpass: value-carrying decision passes
  untouched".
- O7: the CCR marker guard. Check: "overpass: marker-bearing content passes
  through the arm unchanged (N=0 on a ccr replacement)"; Check: "overpass:
  O5/O6/O7 added NO ledger lines (the no-op and pass-through rules)".
- O8: basis. Check: "overpass: the downstream decision's content is the
  basis (not the raw result)".
- O9: batch off. Check: "overpass: batch off (default) -> the enter
  decision passes untouched".
- O10: batch on (the volatile flip) -> "the text blocks in the incoming
  batch are rewritten"; "the step-batch ledger line is byte-exact".
- O11: N=0 batch. Check: "overpass: N=0 batch -> the decision unchanged";
  Check: "overpass: N=0 batch -> no ledger line".
- O12: the one-shot arm. Check: "overpass: the command's batch grammar arms
  the one-shot flag"; Check: "overpass: the one-shot arm normalizes the
  next batch with the scope off"; Check: "overpass: the one-shot batch
  ledger line is byte-exact"; Check: "overpass: the one-shot flag is
  consumed (cleared after one use)"; Check: "overpass: the second batch
  after the one-shot passes untouched (exactly one use)".
- O13: rejection. Check: "overpass: a reject decision passes untouched".
- O14: the command's other grammars. Check: "overpass: the scopes report is
  the read-only effective-values summary"; Check: "overpass: the files
  sweep is declined by a stream flavor (owned by normalize-file)"; Check:
  "overpass: 'results' without on|off is a usage error"; Check: "overpass:
  an unknown grammar is a usage error"; Check: "overpass: 'results on' with
  no settings/config-editor service reports the settings path (config stays
  the source of truth)"; Check: "overpass: zero fs/observed emissions and
  zero writes from ANY overpass path (history safety)".

## Fixtures

The harness fake ctx + the REAL factory + the REAL dash apply.

One apply with a hand-built config whose `scopes` volatile cell returns a mutable object, and the
O2/O10/O12 flips mutate that object and dispatch through the registered `loader/volatile-update`
listener.

`PostO`/`PreO` are the registered listeners, `NextAcceptO` and the value/content-returning
alternatives are the downstream decisions, and `ExecO("bash")` builds the call identity.

The durable ledger is cleared at folder start, and no ledger reads happen.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-dash: overpass: normalized 1 char(s) in tool result bash call_smoke`
- `hook-dsh-normalize-dash: overpass: normalized 1 char(s) in step batch (turn 3 step 1)`
- `hook-dsh-normalize-dash: overpass: normalized 1 char(s) in step batch (turn 4 step 0)`

The scopes report contains `conversation=on`, `toolResults=on`, `batch=off`, `exempt: read, edit`.

## Edge cases

- Both arms are off by default, and the O2/O10 flips are live (no remount).
- Non-text blocks, value-carrying decisions, CCR marker text and rejected steps all pass through untouched, because the marker guard makes any load order safe.
- The one-shot arm fires exactly once and is consumed.
- Zero writes and zero fs/observed emissions from ANY overpass path (the history-safety invariant).

## Expected count

35 PASS.
