# Suggester-And-Set - the S-series smoke tests

The CAN-5 mini-conversation suggester (I6 SUGGESTER-CONFIGURED) and the
live_container_set tool surface: the zero-subagent guarantee, the gate
conjunction, the privacy default, the clamping, the configured-block frame,
the accept/dismiss verbs, and the autoPlant dormant block.

## Scenarios

- S1: with suggester "off" (the default) - zero subagent spawns, zero frames.
- S2: a qualifying user turn spawns exactly ONE detached activation with the
  composed prompt; privacy "redact" (the default) forwards the first 200
  chars plus the total length; "verbatim" (explicit config) forwards the
  whole excerpt (the consent surface is the config flag).
- S3: the skip words, the gate length, and the rate cap are each independently
  asserted (a short message, a message naming "plant", and the 7th suggestion
  in an hour all spawn nothing).
- S4: a parse failure produces only the ledger line `suggestion parse failed`.
- S5: a fit=yes "plant" suggestion renders the section 4 configured frame
  exactly once with the clamped tokens, then withdraws with
  `suggestion expired <sid>`; the frame states the lease, the accept and the
  dismiss verbs.
- S6: clamping - an out-of-range expectAgents clamps to 8 with the
  `suggestion clamped <sid> <field>` ledger line before the frame renders.
- S7: `accept=<sid>` instantiates the stored configuration verbatim (the
  board opens with the suggested expectAgents; ledger `suggestion accepted
  <sid> (<templateId>)`); `accept` on an expired sid -> `accept failed <sid>
  (expired)`; `dismiss=<sid>` -> `suggestion dismissed <sid>`.
- S8: autoPlant=true - no preview frame; the dormant planted block renders
  with `status: suggested - accept=<sid> to start`; dismiss withdraws it with
  `suggestion dismissed <sid> (dormant)`.
- S9: the set tool - key/value writes to per-agent state (`set <key>`),
  unknown verbs no-op (`set unknown ...`), and the plant verb opens a board
  from the catalog preset.

## Fixtures

The shared Harness plus the wave-2 fixtures; FakeSubagent captures every
spawn spec and lets the smoke resolve the result promise on demand.

## Expected count

21 PASS.
