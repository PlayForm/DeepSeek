# Overpass

What this test verifies.

## Intent

This folder covers the overpass arms and the human command (Run O): the tool-results arm (tools/post-execute), the step-batch arm (agent/pre-step), the normalize-overpass command, the ordering guard, and the history-safety invariant.

The stream flavors do not only normalize live model output; they can also sweep already-produced content, namely tool results flowing back into the transcript and the message batch entering a step.

Each sweep sits behind its own scope gate (both off by default) and is driven live through the volatile-update dispatch of the factory.

The folder pins the whole contract.

The registration facts come first: the post-execute arm PREPENDS, the pre-step arm uses default ordering, and the command registers under "normalize-overpass" without a slash.

Then the toolResults flip with its byte-exact ledger line, the `read` exemption, the untouched tool-call blocks, the N=0 no-op rule, and the canonical value decision.

The CCR marker guard follows (normalization never touches a ccr replacement), then the downstream-decision content basis.

The batch flip comes next with its byte-exact ledger line, then the one-shot batch grammar (armed once, consumed once, exactly one use), the reject passthrough, and the command's other grammars.

The assertions are moved verbatim from `EffectTS/smokes/spaces-smoke.mjs` section "Run O (additive): the overpass arms + the command".

## Scenario

- Group: O0 - registration facts (the prepend flag and the marker guard form the ordering contract, so any load order is safe).
    - Check: "overpass: the tools/post-execute arm is registered".
    - Check: "overpass: the agent/pre-step arm is registered".
    - Check: "overpass: the post-execute arm PREPENDS (outermost vs the ccr arm's own prepend)".
    - Check: "overpass: the pre-step arm uses default ordering (nothing needs to precede it)".
    - Check: "overpass: the normalize-overpass command is registered (name without slash)".
- Group: O1/O2 - the tool-results arm stays off by default, then the volatile flip turns it on (normalization plus the exact ledger line).
    - Check: "overpass: toolResults off (default) -> the decision passes untouched".
    - Check: "overpass: toolResults on -> the text block is rewritten (em dash -> hyphen)".
    - Check: "overpass: the tool-result ledger line is byte-exact".
    - Check: "overpass: the arm runs against the REAL factory (no direct fs access)".
- Group: O3 - the exemption list: `read` passes by identity even with the scope on.
    - Check: "overpass: exempt tool (read) passes through by identity".
- Group: O4 - non-text blocks are never touched, and a mixed content rewrites only text.
    - Check: "overpass: tool-call/argument blocks pass untouched (execution-critical JSON)".
    - Check: "overpass: the text block in the same content IS rewritten".
- Group: O5/O6/O7 - the no-op and pass-through rules (N=0, the canonical value decision, the CCR marker guard).
    - Check: "overpass: N=0 payload -> the bare decision unchanged".
    - Check: "overpass: N=0 -> no ledger line (the no-op rule)".
    - Check: "overpass: value-carrying decision passes untouched".
    - Check: "overpass: marker-bearing content passes through the arm unchanged (N=0 on a ccr replacement)".
    - Check: "overpass: O5/O6/O7 added NO ledger lines (the no-op and pass-through rules)".
- Group: O8 - the content basis is the DOWNSTREAM decision's content when present.
    - Check: "overpass: the downstream decision's content is the basis (not the raw result)".
- Group: O9/O10 - the step-batch arm stays off by default, then the volatile flip turns it on (normalized messages plus the exact ledger line).
    - Check: "overpass: batch off (default) -> the enter decision passes untouched".
    - Check: "overpass: batch on -> the text blocks in the incoming batch are rewritten".
    - Check: "overpass: the step-batch ledger line is byte-exact".
- Group: O11 - an N=0 batch leaves the decision unchanged and writes no ledger line.
    - Check: "overpass: N=0 batch -> the decision unchanged".
    - Check: "overpass: N=0 batch -> no ledger line".
- Group: O12 - the one-shot arm from the command fires ONCE regardless of the scope.
    - Check: "overpass: the command's batch grammar arms the one-shot flag".
    - Check: "overpass: the one-shot arm normalizes the next batch with the scope off".
    - Check: "overpass: the one-shot batch ledger line is byte-exact".
    - Check: "overpass: the one-shot flag is consumed (cleared after one use)".
    - Check: "overpass: the second batch after the one-shot passes untouched (exactly one use)".
- Group: O13 - a rejected step is never touched.
    - Check: "overpass: a reject decision passes untouched".
- Group: O14 - the command's other grammars.
    - Check: "overpass: the scopes report is the read-only effective-values summary".
    - Check: "overpass: the files sweep is declined by a stream flavor (owned by normalize-file)".
    - Check: "overpass: 'results' without on|off is a usage error".
    - Check: "overpass: an unknown grammar is a usage error".
    - Check: "overpass: 'results on' with no settings/config-editor service reports the settings path (config stays the source of truth)".

## Fixtures

The shared harness (`../Harness.js`) supplies `Furnace` (the REAL factory, which the O2 check proves the arm runs against, with no direct fs access), the fake ctx including the `commands` registry seam, the REAL `apply`, and the ledger path `/tmp/spaces-smoke-ledger.log`, which is removed at the folder's start.

The config is hand-built with `replacement: " "` and a MUTABLE scopes object, a copy of the SCOPES_DEFAULT of the Run-S section (the source suite defines it in Run S and reads it in Run O, and this standalone folder carries its own duplicate), so the O2/O10 flips go through the `loader/volatile-update` dispatch with the `[["scopes", ...]]` shape.

The post-execute fixtures carry `{isError, value, content}` decisions and an Exec shape with `callId: "call_smoke"`.

The pre-step fixtures carry `{agent, messages, turn, step, signal}` and downstream decisions.

The command fixtures call `handler({ rawInput })` with the batch/scopes/files/results grammars.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-spaces: overpass: normalized 1 char(s) in tool result bash call_smoke` (O2)
- `hook-dsh-normalize-spaces: overpass: normalized 1 char(s) in step batch (turn 3 step 1)` (O10)
- `hook-dsh-normalize-spaces: overpass: normalized 1 char(s) in step batch (turn 4 step 0)` (O12)

O5/O6/O7 and O11 assert the ABSENCE of lines, so the ledger-line counter must not move.

The success texts of the command are asserted by content substrings, not byte-exactly.

## Edge cases

- The marker guard: a CCR replacement marker in the content passes the arm unchanged, which keeps ordering safe between the flavors.
- The one-shot grammar arms with the scope off, normalizes exactly one batch, clears the flag, and leaves the next batch untouched.
- The mixed-content case: tool-call blocks are never rewritten even when a text block in the same content is, so the execution-critical JSON survives.
- The usage-error grammars (bare "results" and "nonsense") return errors, and the "files" sweep is declined because this stream flavor does not own it.

## Expected count

34 PASS.
