# Overpass

What this test verifies.

## Intent

This folder covers the overpass arms and the human command (Run O).

The first arm is the tool-results arm at tools/post-execute, which prepends.

The second arm is the step-batch arm at agent/pre-step, which keeps the default ordering.

The command side covers the registration of normalize-overpass and its grammars.

The per-arm behaviors begin with toolResults: off by default, then flipped on through the volatile-update dispatch (removal plus the exact ledger line).

The exemption list follows, where `read` passes by identity.

Non-text blocks stay untouched in mixed content.

The N=0 no-op rules and the value-carrying canonical decision come next.

The CCR marker guard and the downstream-content basis follow.

Then the batch arm goes off and on again (normalized messages plus the exact ledger line), with the N=0 batch.

The one-shot batch grammar is armed by the command and consumed after exactly one use.

A rejected step stays untouched.

The command's remaining grammars are the scopes report, the declined files sweep, the usage errors, and the results-on settings path.

The assertions are moved verbatim from `EffectTS/smokes/invisible-smoke.mjs` section "Run O (additive): the overpass arms + the command".

## Scenario

- Group: O0 - registration facts (the prepend flag and the marker guard form the ordering contract, so any load order is safe).
    - Check: "overpass: the tools/post-execute arm is registered".
    - Check: "overpass: the agent/pre-step arm is registered".
    - Check: "overpass: the post-execute arm PREPENDS (outermost vs the ccr arm's own prepend)".
    - Check: "overpass: the pre-step arm uses default ordering (nothing needs to precede it)".
    - Check: "overpass: the normalize-overpass command is registered (name without slash)".
- Group: O1/O2 - the tool-results arm stays off by default, then the volatile flip turns it on (removal plus the exact ledger line).
    - Check: "overpass: toolResults off (default) -> the decision passes untouched".
    - Check: "overpass: toolResults on -> the text block is rewritten (em dash -> hyphen)".
    - Check: "overpass: the tool-result ledger line is byte-exact".
    - Check: "overpass: the arm runs against the REAL factory (no direct fs access)".
- Group: O3 - the exemption list.
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
- Group: O9/O10 - the step-batch arm stays off by default, then the volatile flip turns it on (removed characters in the messages plus the exact ledger line).
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

The shared harness (`../Harness.js`) supplies the REAL factory instance (`Furnace`), the fake ctx, the REAL `apply`, and the ledger path `/tmp/invisible-smoke-ledger.log`, which is removed at the folder's start.

The config is hand-built with a MUTABLE scopes object (the stable-reference simulation) plus `replacement: ""`, the removal default, which is explicit because the defaults are bypassed.

SCOPES_DEFAULT is duplicated from the Scopes folder, because each folder is its own process and the source suite defined the const in the Run S section and reused it here through spread.

The fixtures use this flavor's own character: a zero-width space (U+200B) inside the tool result text, the batch messages, and the tool-call JSON.

Normalization REMOVES it, so the rewritten expectations contain double spaces (for example "a  b") where the invisible char vanished, and the exempt, marker, and JSON paths stay byte-identical.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in tool result bash call_smoke` (O2)
- `hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in step batch (turn 3 step 1)` (O10)
- `hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in step batch (turn 4 step 0)` (O12 one-shot)

O5/O6/O7 and O11 assert the ABSENCE of additional ledger lines (the no-op rules), and O13/O14 assert no strings.

## Edge cases

- The exemption and marker guards are identity comparisons, so the decision object must pass through untouched, not rewritten-and-equal.
- The no-op arithmetic is pinned: LinesBeforeO5 is captured before O5 and re-checked after O7, and LinesBeforeO11 is captured before and after O11, so any stray ledger line fails.
- The one-shot grammar is stateful: armed with the batch scope OFF, it fires exactly once and is cleared, so the following batch passes untouched.
- The command's grammars are exact: `scopes` reports the effective values, `files` is declined (owned by normalize-file), bare `results` and unknown input are usage errors, and `results on` with no settings/config-editor service reports the settings path.

## Expected count

34 PASS.
