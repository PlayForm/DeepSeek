# Wiring-And-Defaults

What this test verifies.

## Intent

The loader contract and the config schema are the two surfaces every other
folder (and every consumer) silently depends on: the volatile fields must
arrive as `{ get }` cells, every default must match the shipped schema, `apply`
must return NOTHING while registering exactly the FIVE listeners (the four
plugin listeners plus the State builder's P10 volatile refresh), the state
probe must carry the REAL factory instance and the unwrapped cell values, the
cold mount must log its byte-exact `disabled (enabled=false)` line and an
activated mount its byte-exact `activated (bundle 0.2.0, blocks=<n>,
refresh=<policy>)` line - both in-memory and durably ([ISO] prefixed in the
file) - and the schema must fail LOUD on invalid configs. A drift here breaks
every later folder, so it is its own folder.

## Scenario

- Group: the volatile cells and the config defaults.
    - Sub: "volatile cells: the eight knobs arrive as { get }"
        - logFile, enabled, sectionName, refresh, ttlCalls, separator,
          sectionBudgetBytes and blocks are `{ get }` callable cells
    - Sub: "config defaults: the shipped posture"
        - enabled=false (the IDLE-forever posture), logFile=
          ~/.dsh/playform/hook-dsh-live-containers.log, sectionName=live-containers,
          refresh="request", ttlCalls=8, separator="---",
          sectionBudgetBytes=4096
        - blocks = the 14-entry catalog in shipped order; exactly
          todo-list, command-runner and session-stats enabled
- Group: the apply-time wiring and the activation.
    - Sub: "apply returns NOTHING (the loader contract)"
    - Sub: "exactly FIVE registrations (the four plugin listeners + the P10
      volatile refresh)", with the sorted listener name list asserted
    - Sub: "the module identity is hook-dsh-live-containers" and "state
      carries the REAL factory instance"
    - Sub: "state unwraps the defaults (On=false, refresh=request, ttlCalls=8)"
    - Sub: "cold-mount ledger line byte-exact: disabled (enabled=false)" and
      "the durable ledger file carries the [ISO] disabled line"
    - Sub: "activation ledger line byte-exact" (bundle 0.2.0, blocks=2,
      refresh=request) and "the durable [ISO] activation line" and the ttl
      flavor (blocks=14, refresh=ttl)
- Group: fail-loud validation.
    - Sub: twelve refusals, each asserted on the exact error message:
      empty sectionName; refresh outside "request"|"ttl"; ttlCalls below 1;
      empty separator; sectionBudgetBytes below 1; blocks not an array;
      duplicate block ids; unknown block kind; empty block template;
      non-string var value; bad block trigger; bad block scope

## Fixtures

The harness world: the fake ctx (on/get/logger capture + the root seam) with
the REAL `@playform/plugin-dsh-factory` instance from its built Target, one
`Make(Validate({ logFile: Ledger }))` against the harness tmpdir ledger. Each
validation refusal constructs a throwaway mount through the same `Validate`
helper (each throws before any listener registration matters). The ledger
file lives in a fresh per-process mkdtemp directory.

## Expected ledger strings (byte-exact)

- `hook-dsh-live-containers: disabled (enabled=false)` (the cold mount, the
  in-memory info line)
- The same line after the `[ISO] ` stamp in the durable ledger file
- `hook-dsh-live-containers: activated (bundle 0.2.0, blocks=2,
  refresh=request)` (and the blocks=14/refresh=ttl flavor)
- The refusal error messages (thrown, not logged), each with the
  `hook-dsh-live-containers: ` prefix

## Edge cases

- The `blocks` volatile cell is an array cell (its `get` returns the whole
  table) - the array is the refresh unit, its leaves stay plain.
- The registration-count check is the negative control: a missing or extra
  listener registration fails the exact-five assertion.
- Each validation refusal is asserted on the exact error message, not merely
  on "it threw".

## Expected count

42 PASS.
