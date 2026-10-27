# Config-And-Registration

This file states what the test verifies.

## Intent

This folder covers the apply-time wiring of the file flavor: what one `apply(ctx, config)` builds
before any tool call.

It has its own folder because the file flavor is the first listener-less tool of the family, and the
empty stream registry, the exactly-one-tool registration, and the minimal schema are the posture
that separates it from every stream flavor.

This folder holds Run 1 of the source suite and the Run 8 fresh-state leaf, moved verbatim.

## Scenario

- Group: Run 1 - defaults + the listener-less posture.
    - Check: "volatile cell: log arrives as { get }".
    - Check: "volatile cell: logFile arrives as { get }".
    - Check: "volatile cell: replacement arrives as { get }".
    - Check: "minimal schema: no stream flags and no fs/observed fields
      (shared: false + two knobs)".
    - Check: "no stream listener (the family's first listener-less flavor);
      the three listeners are the P10 volatile-update refresh and the two
      overpass arms (both opt-in, gated at runtime)" (exactly three).
    - Check: "exactly one tool registered".
    - Check: "the tool registration is captured: the tool is named
      normalize-file".
    - Check: "input schema: file_path is a required string".
    - Check: "state carries the REAL factory instance" (State.Factory is the
      harness Furnace by identity).
    - Check: "volatile unwrap: logFile cell unwrapped to State.Ledger".
    - Check: "volatile unwrap: log cell unwrapped to State.Enabled=true".
    - Check: "volatile unwrap: replacement cell unwrapped to
      State.Replacement='-'".
    - Check: "tool flavor: state carries no stream flags (no
      Reasoning/ToolArgs)".
    - Check: "state module = plugin-dsh-normalize-file (the ledger prefix)".
    - Check: "activation ledger line byte-exact" (the captured logger line).
    - Check: "apply journals NOTHING (the family's stream-flavor posture -
      only the tool's N>0 count is journaled, unlike the trio's activated
      record)" (PendingJournal length 0).
    - Check: "no normalized journal record before any tool call".
- Group: Run 8 - each apply builds a FRESH state (no module-level globals).
    - Check: "each apply builds a FRESH state (no module-level globals)"
      (default apply vs the `$&` apply; the source suite compares Run1.State
      with the custom-replacement run's State, whose own assertions live in
      Read-Write-Pipeline).

## Fixtures

The fixtures are the harness fake ctx, which supplies the listener capture, the read/write fs seams
over a bare backend, the waterfall delegate with the actor, the synchronous emit recorder, and the
self-root, plus the REAL factory instance from the harness Furnace and the REAL normalize-file apply
from the built Target of this bundle.

One `Validate({ logFile })` config and a second `Validate({ replacement: "$&" })` apply serve the
fresh-state probe.

No tool call happens in this folder, so the journal counters stay at zero exactly as the source
suite requires, and the harness clears the ledger file at folder start while the folder reads no
ledger content.

## Expected ledger strings (byte-exact)

- `plugin-dsh-normalize-file: activated (replacement=-, logFile=/tmp/normalize-file-smoke-ledger.log)` (the captured logger line, byte-exact).

## Edge cases

- The stream listener registry must be EMPTY, because a registered
  `llm/stream` would fail the three-listener check.
- The volatile cells must be `{ get }` references at the config boundary.
- Two applies must not share state, which the HMR probe shows, because a
  module-level global would fail the identity check.
- Apply itself must journal nothing, because only the tool's N>0 count
  journals.

## Expected count

18 PASS.
