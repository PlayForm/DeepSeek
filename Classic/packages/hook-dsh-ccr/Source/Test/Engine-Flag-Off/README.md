# Engine-Flag-Off

This file states what the test verifies.

## Intent

The suite covers the fully inert postures with the context engine flag OFF, which is the default: no
engine runtime is built, NO agent/pre-step listener is registered (the extra listener beyond
tools/post-execute is the P10 volatile-update refresh of the State builder), and post-execute traffic
leaves no engine traces and no engine ledger lines.

It also covers the byte-identical pass-throughs that hold regardless of the engine: the six exempt
tools (write, edit, raw-write, subagent, ask_user_question, ccr_retrieve), the failing result with
compressFailures=false, the value-carrying accepted decision, and the block decision.

These are the negative controls of the compression gate, because each returns the downstream decision
by IDENTITY with no marker and no store.

The suite is Run 10, Run 4, and Run 6 of the source suite, moved verbatim.

## Scenario

- Group: Run 10 - the context engine, flag OFF - fully inert.
    - Check: "engine flag OFF (default): no engine runtime is built".
    - Check: "engine flag OFF: NO agent/pre-step listener is registered (the
      engine's no-op posture; the extra listener is the State builder's P10
      volatile-update refresh)".
    - Check: "engine flag OFF: post-execute results are not observed" (after
      one oversized post-execute).
    - Check: "engine flag OFF: no engine ledger lines".
- Group: Run 4 - exempt tools pass through byte-identical.
    - Check (x6): "exempt tool '<Name>' passes through byte-identical (no
      marker, no store)" for write, edit, raw-write, subagent,
      ask_user_question, ccr_retrieve.
    - Check: "exempt tools write NO ledger lines".
- Group: Run 6 - failures pass through unless compressFailures.
    - Check: "a failing result passes through byte-identical with
      compressFailures=false".
    - Check: "a value-carrying accepted decision passes through (content is
      never replaced)".
    - Check: "a block decision passes through (feedback is never
      compressed)".

## Fixtures

- The Harness fake ctx with the REAL factory and the REAL ccr apply, where each group gets a fresh
  `Rm()` and its own `Make(Validate(...))` run exactly as the source suite does (Run 10 with the
  default config, and Run 4 and Run 6 with `autoExpand: false`).
- The 5000-byte `PlainText` content serves the exempt and failure scenarios, and the
  `Decision`/`ValueDecision`/`BlockDecision` downstream stubs stand in for the decisions.

## Expected ledger strings (byte-exact)

None, because the folder asserts ABSENCE: no compressed or stored lines, no engine lines, and
decision identity for every pass-through.

## Edge cases

- The exempt list covers mutators, the own tool of the plugin, the briefs of agents, and the user
  gates, so all six pass through even at 5000 bytes.
- Failing results, value-carrying decisions, and block decisions are never touched when
  compressFailures=false, which is the fail-open envelope.
- The two-listener posture is itself the flag-off signature, because agent/pre-step is absent.

## Expected count

14 PASS.
