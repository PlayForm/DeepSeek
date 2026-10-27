# Overpass

What this test verifies.

## Intent

The overpass arms and the human command (Run O): the tool-results arm
(tools/post-execute), the step-batch arm (agent/pre-step), the
normalize-overpass command, the ordering guard, and the history-safety
invariant. The stream flavors do not only normalize live model output - they
can also sweep content that is already produced: tool results flowing back
into the transcript and the message batch entering a step, each behind its own
scope gate (both off by default) and driven live through the volatile-update
dispatch of the factory. The folder pins the whole contract: the registration
facts (the post-execute arm PREPENDS, the pre-step arm uses default ordering,
the command registers under "normalize-overpass" without a slash), the
toolResults flip with its byte-exact ledger line, the `read` exemption, the
untouched tool-call blocks, the N=0 no-op rule, the canonical value decision,
the CCR marker guard (normalization never touches a ccr replacement), the
content basis of the downstream decision, the batch flip with its byte-exact
ledger line, the one-shot batch grammar (armed once, consumed once, exactly
one use), the reject passthrough, and the other grammars of the command. The
assertions are moved verbatim from section "Run O (additive): the overpass
arms + the command" of `Classic/smokes/spaces-smoke.mjs`.

## Scenario

- Group: O0 - registration facts (the ordering contract is the prepend flag
  + the marker guard, together making any load order safe).
    - Sub: "overpass: the tools/post-execute arm is registered"
    - Sub: "overpass: the agent/pre-step arm is registered"
    - Sub: "overpass: the post-execute arm PREPENDS (outermost vs the ccr
      arm's own prepend)"
    - Sub: "overpass: the pre-step arm uses default ordering (nothing needs
      to precede it)"
    - Sub: "overpass: the normalize-overpass command is registered (name
      without slash)"
- Group: O1/O2 - the tool-results arm: off by default, then the volatile
  flip to on (normalization + the exact ledger line).
    - Sub: "overpass: toolResults off (default) -> the decision passes
      untouched"
    - Sub: "overpass: toolResults on -> the text block is rewritten (em dash
      -> hyphen)"
    - Sub: "overpass: the tool-result ledger line is byte-exact"
    - Sub: "overpass: the arm runs against the REAL factory (no direct fs
      access)"
- Group: O3 - the exemption list: `read` passes by identity even with the
  scope on.
    - Sub: "overpass: exempt tool (read) passes through by identity"
- Group: O4 - non-text blocks are never touched; a mixed content rewrites
  only text.
    - Sub: "overpass: tool-call/argument blocks pass untouched
      (execution-critical JSON)"
    - Sub: "overpass: the text block in the same content IS rewritten"
- Group: O5/O6/O7 - the no-op and pass-through rules (N=0, the canonical
  value decision, the CCR marker guard).
    - Sub: "overpass: N=0 payload -> the bare decision unchanged"
    - Sub: "overpass: N=0 -> no ledger line (the no-op rule)"
    - Sub: "overpass: value-carrying decision passes untouched"
    - Sub: "overpass: marker-bearing content passes through the arm unchanged
      (N=0 on a ccr replacement)"
    - Sub: "overpass: O5/O6/O7 added NO ledger lines (the no-op and
      pass-through rules)"
- Group: O8 - the content basis is the DOWNSTREAM decision's content when
  present.
    - Sub: "overpass: the downstream decision's content is the basis (not
      the raw result)"
- Group: O9/O10 - the step-batch arm: off by default, then the volatile flip
  to on (normalized messages + the exact ledger line).
    - Sub: "overpass: batch off (default) -> the enter decision passes
      untouched"
    - Sub: "overpass: batch on -> the text blocks in the incoming batch are
      rewritten"
    - Sub: "overpass: the step-batch ledger line is byte-exact"
- Group: O11 - N=0 batch -> decision unchanged, no ledger line.
    - Sub: "overpass: N=0 batch -> the decision unchanged"
    - Sub: "overpass: N=0 batch -> no ledger line"
- Group: O12 - the one-shot arm from the command fires ONCE regardless of
  the scope.
    - Sub: "overpass: the command's batch grammar arms the one-shot flag"
    - Sub: "overpass: the one-shot arm normalizes the next batch with the
      scope off"
    - Sub: "overpass: the one-shot batch ledger line is byte-exact"
    - Sub: "overpass: the one-shot flag is consumed (cleared after one use)"
    - Sub: "overpass: the second batch after the one-shot passes untouched
      (exactly one use)"
- Group: O13 - a rejected step is never touched.
    - Sub: "overpass: a reject decision passes untouched"
- Group: O14 - the command's other grammars.
    - Sub: "overpass: the scopes report is the read-only effective-values
      summary"
    - Sub: "overpass: the files sweep is declined by a stream flavor (owned
      by normalize-file)"
    - Sub: "overpass: 'results' without on|off is a usage error"
    - Sub: "overpass: an unknown grammar is a usage error"
    - Sub: "overpass: 'results on' with no settings/config-editor service
      reports the settings path (config stays the source of truth)"

## Fixtures

The shared harness (`../Harness.js`): `Furnace` (the REAL factory - the O2
check proves that the arm runs against it, with no direct fs access), the fake
ctx including the `commands` registry seam, the REAL `apply`, and the ledger
path `/tmp/spaces-smoke-ledger.log` (removed at the start of the folder). The
config is hand-built with `replacement: " "` and a MUTABLE scopes object - a
copy of SCOPES_DEFAULT from the Run-S section (the source suite defines it in
Run S and reads it in Run O; this standalone folder carries its own duplicate)
- so the O2/O10 flips go through the `loader/volatile-update` dispatch with
the `[["scopes", ...]]` shape. The post-execute fixtures carry
`{isError, value, content}` decisions and an Exec shape with
`callId: "call_smoke"`; the pre-step fixtures carry
`{agent, messages, turn, step, signal}` and downstream decisions; the command
fixtures call `handler({ rawInput })` with the batch/scopes/files/results
grammars.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-spaces: overpass: normalized 1 char(s) in tool result bash call_smoke` (O2)
- `hook-dsh-normalize-spaces: overpass: normalized 1 char(s) in step batch (turn 3 step 1)` (O10)
- `hook-dsh-normalize-spaces: overpass: normalized 1 char(s) in step batch (turn 4 step 0)` (O12)

(O5/O6/O7 and O11 assert the ABSENCE of lines - the ledger-line counter must
not move. The success texts of the command are asserted by content
substrings, not byte-exactly.)

## Edge cases

- The marker guard: a CCR replacement marker in the content passes the arm
  unchanged - ordering safety between the flavors.
- The one-shot grammar: arms with the scope off, normalizes exactly one
  batch, clears the flag, and leaves the next batch untouched.
- The mixed-content case: tool-call blocks are never rewritten even when a
  text block in the same content is - the execution-critical JSON survives.
- The usage-error grammars (bare "results", "nonsense") return errors; the
  "files" sweep is declined because this stream flavor does not own it.

## Expected count

34 PASS.
