# Wiring-And-Service - the wiring and the service surface tests

The folder tests the loader wiring of the plugin and its service dispatch: the cold mount, the activation proof, the absence of any listener or storage effect, the fail-loud validation, and the `act` dispatch by operation kind.

## Scenarios

- **W1.**

    In the IDLE-forever cold mount apply returns NOTHING, the service is still provided, and nothing is wired (no listener, no effect, no state probe).

    The ledger carries the byte-exact `disabled (enabled=false)` line.

- **W2.**

    In the enabled mount the activation line `activated (propagate=block)` is byte-exact in the logger AND the durable file.

    Even when the plugin is enabled, NOTHING is wired, because the ops are request/response over the service (no listener, no storage effect).

    The state probe is attached and carries the config-derived fields.

- **W3.**

    In the fail-loud validation a bad `propagate` fails loud at the schema (a `ValidationError`, because the union validates first), and a `maxFileBytes` below 1 and a non-integer `maxBlockLines` each throw at load with the byte-exact `reflect: ` messages.

- **W4.**

    The service surface has `rename`/`connect`/`replace`/`act`, and `act` dispatches each operation kind through its own path, so all three reject a missing file with the honest `not an observed file` reply.

## Fixtures

The shared Harness supplies a fake ctx with a DISTINCT root object, the real factory, the real built Target, and a WORKING fake fs with a replaceIfVersion fence.

The folder uses no fake clock, because the plugin has no clock dependency.

## Expected ledger strings (byte-exact, `reflect: ` prefix)

`disabled (enabled=false)`, `activated (propagate=block)`.

## Expected count

13 PASS.
