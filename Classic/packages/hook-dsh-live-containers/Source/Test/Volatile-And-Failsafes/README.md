# Volatile-And-Failsafes

What this test verifies.

## Intent

The volatile-flip and fail-open discipline tests. Every knob flips through its
volatile cell (the cosmokit hot-edit write plus the captured
loader/volatile-update listener - the same mechanism that the live loader
uses), and the NEXT assembly respects the flip WITHOUT a remount (the identity
of the built State object is preserved); the skip-reason ledger lines are
byte-exact and stay quiet on steady state; the fail-open negatives hold (a
render failure skips the block and logs `render failed <id> -> skipped` while
the assembly still resolves; a clock that throws degrades to the real clock; a
malformed pre-step payload never throws); and the cold-mount IDLE-forever
posture is proven by behavior (full passthrough, the byte-exact
`disabled (enabled=false)` line, zero warnings). The per-scope labels
({{sessionId}}) are stable per scope object and distinct across scopes.

## Scenario

- Group: the volatile flips (one mount, sequential flips).
    - Sub: flip enabled=false -> the next assembly passes through unchanged
      (object identity), the State identity is preserved, On=false.
    - Sub: flip enabled=true -> the section returns on the next assembly.
    - Sub: flip separator -> the next frame uses the new dashes (and the old
      dashes are gone).
    - Sub: flip refresh=ttl -> the next assemblies reuse the global cache
      (no new rendered lines).
    - Sub: flip ttlCalls=1 -> the expired TTL rebuilds with the new cadence
      (`section rebuilt (ttl 1)` byte-exact).
    - Sub: flip blocks -> the next assembly renders the new table (its own
      `block rendered new1` line).
    - Sub: flip sectionBudgetBytes -> the collapse engages on the next
      assembly (`failsafe section-collapse 1`).
- Group: the skip-reason ledger lines (byte-exact once per reason; no
  repeats on steady state): scope "never" -> (scope), trigger "manual" ->
  (manual), a wave-2 kind -> (unknown kind), a disabled block -> (disabled).
- Group: fail-open negatives.
    - Sub: a block whose vars throw on read is skipped - the assembly still
      resolves with the sibling block rendered, and the ledger gains the
      byte-exact `render failed poison -> skipped` (twice across two
      assemblies is fine; asserted present exactly as the single-line form
      after the first).
    - Sub: a State.Now that throws degrades to the real clock and never
      throws into the assembly.
    - Sub: a malformed pre-step payload (messages not an array) returns the
      downstream result unchanged with zero warnings.
- Group: the IDLE-forever cold mount (enabled=false).
    - Sub: the assemble listener passes the downstream assembly through by
      identity; the byte-exact disabled line is the ONLY info line; the
      post-execute observer passes the decision through; the tools/change
      listener logs nothing; zero warnings.
- Group: the per-scope labels: two distinct scope objects get scope-1 and
  scope-2; the same scope keeps its label across assemblies.

## Fixtures

The harness world with the fake clock. The flips commit through the `Flip`
helper (the registered `Symbol.for("cosmokit.volatile.write")` write on the
cell that the schema produces) and then fire the captured
`loader/volatile-update` listener with the changed path - mirroring the live
sequence (commit, then the event). The poisoned vars block is built by
swapping the block's vars for a throwing Proxy AFTER the mount, so the
fail-loud validation never sees it (mirroring a hot-edited bad table).

## Expected ledger strings (byte-exact)

- `hook-dsh-live-containers: block skipped <id> (scope|manual|unknown kind|disabled)`
- `hook-dsh-live-containers: render failed poison -> skipped`
- `hook-dsh-live-containers: section rebuilt (ttl 1)`
- `hook-dsh-live-containers: failsafe section-collapse 1`
- `hook-dsh-live-containers: disabled (enabled=false)`

## Edge cases

- The flip assertions never remount: the same State object keeps serving,
  which is the P10 volatile-refresh contract.
- The fail-open catch is asserted through OBSERVABLE outcomes (the section
  contents, the ledger lines, the warnings count) - never through "it did not
  throw".
- The disabled mount's post-execute passthrough returns the downstream
  decision unchanged (the counters are skipped while Off).

## Expected count

23 PASS.
