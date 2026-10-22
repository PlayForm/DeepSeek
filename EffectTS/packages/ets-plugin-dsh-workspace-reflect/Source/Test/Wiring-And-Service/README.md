# Wiring-And-Service - the wiring and the service surface tests

The plugin's loader wiring and its service dispatch: the cold mount, the
activation proof, the absence of any listener or storage effect, the
fail-loud validation and the `act` dispatch by operation kind.

## Scenarios

- W1: the IDLE-forever cold mount - apply returns NOTHING, the service is
  still provided, nothing is wired (no listener, no effect, no state
  probe), and the ledger carries the byte-exact `disabled (enabled=false)`
  line.
- W2: the enabled mount - the activation line
  `activated (propagate=block)` is byte-exact in the logger AND the durable
  file; even when enabled NOTHING is wired (the ops are request/response
  over the service - no listener, no storage effect); the state probe is
  attached and carries the config-derived fields.
- W3: the fail-loud validation - a bad `propagate` fails loud at the schema
  (a `ValidationError`, since the union validates first); a `maxFileBytes`
  below 1 and a non-integer `maxBlockLines` each throw at load with the
  byte-exact `reflect: ` messages.
- W4: the service surface - `rename`/`connect`/`replace`/`act` exist, and
  `act` dispatches each operation kind through its own path (all three
  reject a missing file with the honest `not an observed file` reply).

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory,
the real built Target, a WORKING fake fs with a replaceIfVersion fence).
No fake clock: the plugin has no clock dependency.

## Expected ledger strings (byte-exact, `reflect: ` prefix)

`disabled (enabled=false)`, `activated (propagate=block)`.

## Expected count

13 PASS.
