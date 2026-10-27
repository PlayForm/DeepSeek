# Engine-Flag-On

What this test verifies.

## Intent

The context engine with the flag ON.

The folder first covers the pure decision math (`ThresholdBytes` - 30% of the budget; `Eligible` - the
first-2 head and last-4 tail protect windows; `Decide` - the middle-only archive plan with its byte
sum), then the end-to-end lifecycle at `storeBudgetBytes: 10000` (threshold 3000).

The lifecycle covers the three-listener posture (tools/post-execute + agent/pre-step + the P10
refresh of the State builder), the built runtime, and the observation records tagged with the turn
cursor of the engine (content for pass-throughs, hash for already-stored results).

It also covers the threshold crossing at pre-step turn 8 that archives the two middle records
through the REAL compress path, the deliberate no-op crossing with an empty middle, the second
archive at turn 14, and the byte-exact engine ledger lines in both the logger form (`ccr: engine
archived 2 results`, `ccr: engine archived 1 results`) and the durable `[ISO]` form.

This is the source suite's Run 11 and Run 12, moved verbatim.

## Scenario

- Group: Run 11 - the engine's pure decision math.
    - Check: "ThresholdBytes: 30% of the 256 MiB store budget (the nominal
      reference) = 80530636 bytes".
    - Check: "ThresholdBytes: 30% of 10000 = 3000".
    - Check: "ThresholdBytes: 0% yields a zero limit and Decide never crosses
      it".
    - Check: "Eligible: first-2 head and last-4 tail protected - only turns
      3,4 are middle at CurrentTurn 9".
    - Check: "Eligible: a record inside the last-4 window (turn 3 at
      CurrentTurn 6) is protected".
    - Check: "Eligible: the current turn itself sits inside the last-4 window
      and is never eligible".
    - Check: "Decide: under the threshold -> no archive (undefined)".
    - Check: "Decide: over the threshold but zero middle records -> no
      archive".
    - Check: "Decide: the crossing archives the MIDDLE records only (turns
      3,4 of 3,4,9)".
    - Check: "Decide: the archived bytes are the middle records' sizes".
    - Check: "Decide: the last-4 turn stays protected".
- Group: Run 12 - the context engine flag ON - end to end.
    - Check: "engine flag ON: the agent/pre-step listener is registered".
    - Check: "engine flag ON: tools/post-execute + agent/pre-step, plus the
      State builder's P10 volatile-update refresh".
    - Check: "engine flag ON: the runtime is built (Turn=1, empty log)".
    - Check: "pre-step: the downstream decision is returned unchanged".
    - Check: "pre-step turn 1: no archive, no engine line".
    - Check: "engine flag ON: post-execute behavior unchanged - the small
      result still passes through".
    - Check: "pre-step turn 3: under the threshold -> no archive line".
    - Check: "engine flag ON: three observations recorded".
    - Check: "observations are tagged with the engine's turn cursor".
    - Check: "the pass-through result is observed with its CONTENT
      (archivable)".
    - Check: "the stored result is observed with its HASH (already in the
      store)".
    - Check: "the accumulated observed bytes cross the 3000-byte threshold".
    - Check: "before the archive, the pass-through content is NOT in the
      store".
    - Check: "pre-step turn 8: the decision still passes through".
    - Check: "engine ledger line byte-exact: 'ccr: engine archived 2
      results'".
    - Check: "the head-protected turn-1 record survives the archive
      (middle-only)".
    - Check: "the engine turn cursor advanced to the pre-step's turn (8)".
    - Check: "the archive pushed the record through the REAL compress path:
      ccr_retrieve restores the original bytes".
    - Check: "the hash-recorded (already-stored) entry stays retrievable
      untouched".
    - Check: "crossing with an EMPTY middle (turn 8 in the last-4 window): a
      deliberate no-op, no line".
    - Check: "the tail-window record survives the no-archive pre-step".
    - Check: "engine ledger line byte-exact: 'ccr: engine archived 1
      results'".
    - Check: "after both archives only the head-protected record remains".
    - Check: "the archived tail-window record is retrievable too".
    - Check: "pre-step 15: the accumulator is below the threshold again -> no
      further archive".
    - Check: "the durable ledger file: '[ISO] engine archived 2 results'".

## Fixtures

- The Harness fake ctx + the REAL factory + the REAL ccr apply, with Run 12's config as `Validate({ contextEngine: true, logFile: Ledger, storeBudgetBytes: 10000 })`.
- The engine script: pre-step 1, a ~925-byte pass-through, pre-step 3, a ~3534-byte auto-expanded store and a ~925-byte pass-through, pre-step 8 (the archive), a ~2425-byte tail store, pre-step 9 (the no-op), and pre-step 14 (the second archive), then pre-step 15.
- The Engine functions come from the REAL built Target (`Target/Function/Engine.js`).

## Expected ledger strings (byte-exact)

- `ccr: engine archived 2 results` (exactly one line after pre-step 8).
- `ccr: engine archived 1 results` (the second engine line, at index 1).
- `[ISO] engine archived 2 results` in the durable file (the
  `^\[[^\]]+\] engine archived 2 results$` regex).

## Edge cases

- The protect windows: head (first-2), tail (last-4), the current turn.
- The empty-middle crossing is a deliberate no-op with NO second line.
- The turn-1 head-protected record survives every archive.
- 0% threshold: Decide never crosses a zero limit.

## Expected count

37 PASS.
