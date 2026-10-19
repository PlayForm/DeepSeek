# Volatile-Live-Flip

What this test verifies.

## Intent

The P10 volatile live-flip and the files scope gate: config changes committed
to a running tool without remounting it. This is its own folder because the
flip is the hazardous path (a rebuild would re-apply and duplicate the
registration) and because the `files` gate is this flavor's own scope - the
one switch that turns the whole tool off and back on live. The source
suite's Run V and Run F, moved verbatim.

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
    - Check: "P10: the NEXT tool call normalizes with the NEW replacement
      without remount".
    - Check: "P10: the flipped tool call still writes its normal count
      line".
    - Check: "P10: the flipped tool call added NO activation line".
- Group: Run F - the FILES scope gate.
    - Check: "scopes.files off: the tool returns the unchanged
      changed:false result".
    - Check: "scopes.files off: no resolve/read/write/ledger line".
    - Check: "scopes.files flipped back on: the NEXT tool call normalizes
      again (no remount)".

## Fixtures

The harness fake ctx + the REAL factory + the REAL normalize-file apply.
Run V builds the replacement as a stable volatile cell whose getter reads a
mutable outer binding (`FlipValue`), seeds
`/tmp/normalize-file-smoke-flip-fixture.txt` with the All6 content, flips to
`-*-` and dispatches `[["replacement"]]`. Run F builds a hand-config with a
`scopes` volatile cell whose getter reads `FilesOn`, seeds
`/tmp/normalize-file-smoke-gate-fixture.txt` (declared alongside the flip
fixture, as in the source suite), turns the gate off and back on via
`[["scopes", "files"]]` dispatches. The durable ledger is cleared before
each run; no direct ledger reads (count lines are checked via the captured
logger lines).

## Expected ledger strings (byte-exact)

- `normalized 7 char(s) in /tmp/normalize-file-smoke-flip-fixture.txt` (the
  flipped call's count line, via `includes`).
(Activation lines are counted, not compared: `activated (` must appear
exactly once before and after each flip.)

## Edge cases

- State object identity must survive both flips.
- The gate-off call must do nothing at all - no resolve, no read, no write,
  no ledger line - and still report a well-formed unchanged result.
- The gate flips back on live: the next call normalizes again with no
  remount.

## Expected count

12 PASS.
