# Overpass

What this test verifies.

## Intent

The overpass arms and the human command (Run O): the tool-results arm
(tools/post-execute, prepended), the step-batch arm (agent/pre-step, default
ordering), the normalize-overpass command registration and its grammars, and
the per-arm behaviors - toolResults off by default then flipped on via the
volatile-update dispatch (removal + the exact ledger line), the exemption
list (`read` passes by identity), non-text blocks untouched in mixed
content, the N=0 no-op rules, the value-carrying canonical decision, the CCR
marker guard, the downstream-content basis, the batch arm off-then-on
(normalized messages + the exact ledger line), the N=0 batch, the one-shot
batch grammar armed by the command and consumed after exactly one use, the
rejected step untouched, and the command's remaining grammars (the scopes
report, the declined files sweep, the usage errors, the results-on settings
path). The assertions are moved verbatim from
`Classic/smokes/invisible-smoke.mjs` section "Run O (additive): the overpass
arms + the command".

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
  flip to on (removal + the exact ledger line).
    - Sub: "overpass: toolResults off (default) -> the decision passes
      untouched"
    - Sub: "overpass: toolResults on -> the text block is rewritten (em dash
      -> hyphen)"
    - Sub: "overpass: the tool-result ledger line is byte-exact"
    - Sub: "overpass: the arm runs against the REAL factory (no direct fs
      access)"
- Group: O3 - the exemption list.
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
    - Sub: "overpass: the downstream decision's content is the basis (not the
      raw result)"
- Group: O9/O10 - the step-batch arm: off by default, then the volatile flip
  to on (removed characters in the messages + the exact ledger line).
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

The shared harness (`../Harness.js`): the REAL factory instance (`Furnace`),
the fake ctx, the REAL `apply` and the ledger path
`/tmp/invisible-smoke-ledger.log` (removed at the folder's start). The
config is hand-built with a MUTABLE scopes object (the stable-reference
simulation) plus `replacement: ""` - the removal default, explicit because
the defaults are bypassed. SCOPES_DEFAULT is duplicated from the Scopes
folder (each folder is its own process, and the source suite defined the
const in the Run S section and reused it here via spread). The fixtures use
this flavor's own character - a zero-width space (U+200B) inside the tool
result text, the batch messages and the tool-call JSON; normalization
REMOVES it, so the rewritten expectations contain double spaces (e.g.
"a  b") where the invisible char vanished, and the exempt/marker/JSON paths
stay byte-identical.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in tool result bash call_smoke`
  (O2)
- `hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in step batch (turn 3 step 1)`
  (O10)
- `hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in step batch (turn 4 step 0)`
  (O12 one-shot)

(O5/O6/O7 and O11 assert the ABSENCE of additional ledger lines - the no-op
rules; O13/O14 assert no strings.)

## Edge cases

- The exemption and marker guards are identity comparisons - the decision
  object must pass through untouched, not rewritten-and-equal.
- The no-op arithmetic is pinned: LinesBeforeO5 is captured before O5 and
  re-checked after O7, and LinesBeforeO11 before/after O11 - any stray
  ledger line fails.
- The one-shot grammar is stateful: armed with the batch scope OFF, it fires
  exactly once and is cleared, so the following batch passes untouched.
- The command's grammars are exact: `scopes` reports the effective values,
  `files` is declined (owned by normalize-file), bare `results` and unknown
  input are usage errors, and `results on` with no settings/config-editor
  service reports the settings path.

## Expected count

34 PASS.
