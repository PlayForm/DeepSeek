# Volatile-Live-Flip

This page records what the test verifies.

## Intent

This folder covers the P10 volatile live-flip and the files scope gate, which commit config changes to a running tool without remounting it.

It stands alone because the flip is the hazardous path, since a rebuild would re-apply and duplicate the registration.

It also stands alone because the `files` gate is this flavor's own scope, the one switch that turns the whole tool off and back on live.

The folder holds the source suite's Run V and Run F, moved verbatim.

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

The harness uses a fake ctx, the REAL factory, and the REAL normalize-file apply.

Run V builds the replacement as a stable volatile cell whose getter reads a mutable outer binding (`FlipValue`).

It seeds `/tmp/normalize-file-smoke-flip-fixture.txt` with the All6 content, flips to `-*-`, and dispatches `[["replacement"]]`.

Run F builds a hand-config with a `scopes` volatile cell whose getter reads `FilesOn`.

It seeds `/tmp/normalize-file-smoke-gate-fixture.txt` (declared alongside the flip fixture, as in the source suite), then turns the gate off and back on through `[["scopes", "files"]]` dispatches.

The harness clears the durable ledger before each run and reads no ledger directly, because it checks count lines through the captured logger lines.

## Expected ledger strings (byte-exact)

- `normalized 7 char(s) in /tmp/normalize-file-smoke-flip-fixture.txt` (the
  flipped call's count line, via `includes`).
(Activation lines are counted, not compared: `activated (` must appear
exactly once before and after each flip.)

## Edge cases

- The State object identity must survive both flips.
- The gate-off call must do nothing at all, with no resolve, no read, no write, and no ledger line, and it must still report a well-formed unchanged result.
- The gate flips back on live, so the next call normalizes again with no remount.

## Expected count

12 PASS.
