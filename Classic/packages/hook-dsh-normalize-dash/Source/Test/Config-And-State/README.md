# Config-And-State

What this test verifies.

## Intent

The apply-time wiring of the dash flavor: what a single `apply(ctx, config)` builds
before any stream flows. This is its own folder because the wiring is the
contract every other behavior sits on - the volatile cells arrive as
`{ get }` references, the schema defaults decide the dispatch posture, the
four-listener set defines what the flavor reacts to, and the State unwraps
decide what the transform actually uses. The source suite's Run 1 and Run 6,
moved verbatim.

## Scenario

- Group: Run 1 - defaults (the config cells, the listeners, the state).
    - Check: "volatile cell: log arrives as { get }".
    - Check: "volatile cell: logFile arrives as { get }".
    - Check: "volatile cell: replacement arrives as { get }".
    - Check: "config default normalizeReasoning=true".
    - Check: "config default normalizeToolArguments=false".
    - Check: "the llm/stream listener is registered".
    - Check: "llm/stream + the P10 volatile-update refresh + the two overpass
      arms (post-execute prepended, pre-step default order)" (exactly four
      listeners).
    - Check: "state carries the REAL factory instance" (State.Factory is the
      harness Furnace by identity).
    - Check: "volatile unwrap: logFile cell unwrapped to State.Ledger".
    - Check: "volatile unwrap: log cell unwrapped to State.Enabled=true".
    - Check: "volatile unwrap: replacement cell unwrapped to
      State.Replacement='-'".
    - Check: "plain fields: Reasoning=true, ToolArgs=false".
    - Check: "state module = hook-dsh-normalize-dash (the ledger prefix)".
    - Check: "activation ledger line byte-exact" (the captured logger line,
      see below).
- Group: Run 6 - HMR-safety probe (no module-level state).
    - Check: "each apply builds a FRESH state (no module-level globals)"
      (two applies build two distinct State objects with the same defaults).

## Fixtures

The harness fake ctx (listener/logger capture, the tool/fs seams with a bare
backend, the waterfall delegate, the synchronous emit recorder, the self-root
seam) + the REAL factory instance (the harness Furnace) + the REAL dash apply
from this bundle's built Target. One `Validate({ logFile })` config built
through the exported schema; two applies for the Run 6 comparison. The
harness clears the ledger file at folder start; the folder reads no ledger
content.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=/tmp/normalize-dash-smoke-ledger.log)` (the captured
  logger line, byte-exact).

## Edge cases

- The volatile cells must be `{ get }` references at the config boundary, not
  plain values - a plain value would fail the three "arrives as { get }"
  checks.
- Exactly four listeners: a missing P10 refresh or a missing overpass arm
  fails the listener-set check.
- Two applies must not share state (the HMR probe) - a module-level global
  would fail the identity check.

## Expected count

15 PASS.
