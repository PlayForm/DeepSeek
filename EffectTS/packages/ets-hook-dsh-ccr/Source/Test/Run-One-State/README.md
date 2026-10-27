# Run-One-State

What this test verifies.

## Intent

The posture of one State instance, from one `apply`.

The folder covers the listener set (tools/post-execute, registered with `prepend` so that the gate
runs before the other post-execute listeners) and the single tool registration (ccr_retrieve).

It covers the State fields: the REAL factory instance, the volatile unwraps (Ledger, Enabled,
Threshold, PreviewMax, Multipliers), the module identity `ccr`, the memory-only store, and the 8
copied targets.

It also covers the under-threshold pass-through that anchors every later scenario: a small bash
result flows through the listener to the downstream decision unchanged, with no compress and no
store.

It is its own folder because the state posture is what every other folder assumes.

This is the source suite's Run 1 (the listener, tool and state parts) plus Run 1a, moved verbatim.

## Scenario

- Group: Run 1 - the listener set, the tool registration and the State.
    - Check: "the tools/post-execute listener is registered".
    - Check: "the listener PREPENDS (the gate runs before the other
      post-execute listeners)".
    - Check: "exactly one tool registered".
    - Check: "the tool registration is captured: the tool is named
      ccr_retrieve".
    - Check: "state carries the REAL factory instance".
    - Check: "volatile unwrap: logFile cell unwrapped to State.Ledger".
    - Check: "volatile unwrap: log cell unwrapped to State.Enabled=true".
    - Check: "volatile unwrap: thresholdBytes cell -> State.Threshold=1024"
      (the runtime label uses U+2192).
    - Check: "volatile unwrap: previewMaxChars cell -> State.PreviewMax=240"
      (U+2192).
    - Check: "volatile unwrap: multipliers cell -> State.Multipliers (error
      x8)" (U+2192 and U+00D7).
    - Check: "state module = ccr (the ledger prefix)".
    - Check: "the store is memory-only by default".
    - Check: "state targets copied from config".
- Group: Run 1a - under-threshold pass-through (byte-identical).
    - Check: "under-threshold bash result: the downstream decision passes
      through unchanged" - the SAME decision object by identity.
    - Check: "under-threshold result writes NO ledger line (no compress, no
      store)" - the negative control.

## Fixtures

- The Harness fake ctx + the REAL factory (`Furnace`) + the REAL ccr apply, with `Raw1 = Validate({ logFile: Ledger })` and `Run1 = Make(Raw1)`.
- Run 1a's fixture: `TextBlock("short bash output")` (well under the 1024 threshold) through `Run1.Listeners["tools/post-execute"]` with an accept decision as the downstream.

## Expected ledger strings (byte-exact)

None asserted beyond absence, because the contract of this folder is the State shape and the pass-through identity (the activation line belongs to the Config-And-Activation folder).

## Edge cases

- The under-threshold result produces NO ledger line (no compress, no store).
- The downstream decision is returned by IDENTITY, not as a copy.
- State.Factory is the REAL factory instance (reference equality).

## Expected count

15 PASS.
