# Run-One-State

What this test verifies.

## Intent

The suite covers the posture of one State instance from one `apply`: the listener set, where
tools/post-execute registers with `prepend` so the gate runs before the other post-execute listeners;
the single tool registration (ccr_retrieve); the State fields (the REAL factory instance, the volatile
unwraps of Ledger, Enabled, Threshold, PreviewMax, and Multipliers, the module identity `ccr`, the
memory-only store, and the 8 copied targets); and the under-threshold pass-through that anchors every
later scenario, where a small bash result flows through the listener to the downstream decision
unchanged with no compress and no store.

It has its own folder because the state posture is what every other folder assumes.

The suite is Run 1 of the source suite (the listener, tool, and state parts) plus Run 1a, moved
verbatim.

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

- The Harness fake ctx with the REAL factory (`Furnace`) and the REAL ccr apply, where
  `Raw1 = Validate({ logFile: Ledger })` and `Run1 = Make(Raw1)`.
- The fixture of Run 1a is `TextBlock("short bash output")`, well under the 1024 threshold, sent
  through `Run1.Listeners["tools/post-execute"]` with an accept decision as the downstream.

## Expected ledger strings (byte-exact)

None asserted beyond absence, because the contract of this folder is the State shape and the
pass-through identity, and the activation line belongs to the Config-And-Activation folder.

## Edge cases

- The under-threshold result produces NO ledger line, with no compress and no store.
- The downstream decision is returned by IDENTITY and not as a copy.
- State.Factory is the REAL factory instance by reference equality.

## Expected count

15 PASS.
