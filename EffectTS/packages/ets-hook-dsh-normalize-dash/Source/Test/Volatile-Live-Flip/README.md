# Volatile-Live-Flip

What this test verifies.

## Intent

The P10 volatile live-flip: a config change committed to a running plugin without remounting it.

This is its own folder because the flip is the hazardous path, since a rebuild would re-apply and
duplicate the registration.

The test therefore pins "no remount, no re-apply, identity preserved, next consumer picks up the new
value".

The other folders exercise the same dispatch for scope objects (Scopes, Overpass), and this one
covers the scalar `replacement` cell end to end.

The source suite's Run V, moved verbatim.

## Scenario

- Group: Run V - the P10 volatile live-flip.
    - Check: "P10: the refresh listener is registered".
    - Check: "P10: exactly one activation line after the mount".
    - Check: "P10: the mount-time replacement is the default".
    - Check: "P10: the volatile dispatch refreshed State.Replacement in
      place".
    - Check: "P10: the State object identity is preserved (no rebuild)".
    - Check: "P10: still exactly one activation line (NO remount, no
      re-apply)".
    - Check: "P10: the NEXT stream normalizes with the NEW replacement
      without remount".
    - Check: "P10: the flipped stream still writes its normal count line".
    - Check: "P10: the flipped stream added NO activation line".

## Fixtures

The harness fake ctx + the REAL factory + the REAL dash apply.

The config is hand-built with `replacement` as a stable volatile cell whose getter reads a mutable
outer binding (`FlipValue`), exactly the "commit into the running reference" semantics of the loader.

The flip is a mutation of that binding plus a `[["replacement"]]` dispatch through the registered
`loader/volatile-update` listener.

The post-flip stream feeds one text-delta chunk through the registered `llm/stream` listener.

The durable ledger is cleared at folder start, and no ledger reads happen.

## Expected ledger strings (byte-exact)

- `normalized 1 dash char(s) in one stream` (the flipped stream's count
  line, read via `includes` from the captured logger lines).

Activation lines are counted and not compared: `activated (` must appear exactly once before and
after the flip.

## Edge cases

- The State object identity must be preserved across the flip, because a rebuild would produce a second activation line and break the count checks.
- The next stream uses the NEW value (`a -*- b`) while the count line keeps its normal shape, so the flip changes only the replacement.

## Expected count

9 PASS.
