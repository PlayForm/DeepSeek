# Policy-Defaults

The policy block (D6) on the queue: the defaults, the State mapping, and the spawn gate's two ways
plus its precedence over `autoSpawn`.

## Intent

D6 makes automation a per-plugin allowlist.

The queue's gated action is the spawn: the shared block's `spawn` verdict is the OUTER gate in front
of `autoSpawn` (the INNER one).

This folder proves the block is real config, not dead text - an `approve` verdict holds the launch
with the documented line, and an `auto` verdict proceeds.

It also pins the precedence: policy approve beats an enabled knob, while a knob that is off still
refuses on its own.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the queue's schema fills the D6 policy defaults" - the
      composed `policy` cell deep-equals the D6 defaults
      (read/index/record/suggest/message = auto, write/commit/spawn =
      approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps
      `policy` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit
      `policy: { spawn: "auto" }` replaces spawn and keeps the other seven.
- Group P2: the approve verdict HOLDS the spawn.
    - Check: "P2: an approve verdict never calls the subagent service" - the
      `autoSpawn: true` mount with `policy.spawn: approve` makes zero
      `startActivation` calls and writes no `spawned` line.
    - Check: "P2: the held line is byte-exact and the task waits with its
      seat" - `spawn held queue-1 (policy spawn=approve)`, the task stays
      `dispatched`, the seat stays held, no child id.
- Group P3: the auto verdict proceeds.
    - Check: "P3: an auto verdict proceeds to the spawn" - the same mount with
      the gate open spawns exactly once and ledgers `spawned queue-1 ->
      child-1`.
- Group P4: the precedence.
    - Check: "P4: a knob that is off refuses silently even with the gate open"
      - `autoSpawn: false` with `policy.spawn: auto` makes no call and writes
      no spawn line at all (the inner gate).

## Fixtures

The shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake
ctx, the `Automation` mount (the enabled plugin + `autoSpawn: true` + `policy.spawn: "auto"` + the
fake `ctx.subagents` recorder + the fake `ctx.agents` registry), and the `Flush()` join point (no
sleeps, no timers).

A scenario overrides `policy`/`autoSpawn` through the mount's config.

## Expected ledger strings (byte-exact, `plugin-dsh-queue: ` prefix)

`spawn held <id> (policy spawn=approve)`,
`spawned <id> -> <child>`,
and the unchanged `dispatched <id> -> <agent>`.

## Expected count

7 PASS.
