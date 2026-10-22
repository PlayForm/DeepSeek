# Wiring-And-Stamps - the wiring and the recorder tests

The plugin's loader wiring and the synchronous recorder: the cold mount, the
root-context registration, the apply-registered service, the activation
proof, the stamp mechanics and the fail-loud validation.

## Scenarios

- W1: the IDLE-forever cold mount - apply returns NOTHING, the service is
  still provided, nothing registers on the root context, and the ledger
  carries the byte-exact `disabled (enabled=false)` line.
- W2: the enabled mount - `fs/observed` registers on the ROOT context only
  (never on the plugin context; the fake root is a distinct object, so a
  ctx-side registration cannot pass), the root identity is not the plugin
  ctx, the activation line `activated (domain=workspace_observe)` is
  byte-exact, and the storage effect is armed.
- W3: the stamp mechanics - two events record sequences 1 and 2 with the
  event's version and origin `fs/observed` (no wall clock anywhere: the
  third event lands on exactly 3); the stamped ledger line is byte-exact
  (logger and durable file); the ring reads newest first through the
  service; an absent observation records version `absent`, never a
  fabricated token.
- W4: the fail-loud validation - `maxStamps` below 1 and an empty `domain`
  throw at load with the byte-exact `observe: ` messages.
- W5: the service surface - the instance is the apply-registered one,
  `statistics()` is exact, `stamp(path)` returns the exact latest stamp (or
  undefined).

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory,
the real built Target). No fake clock: the plugin has no clock dependency -
every timing assertion is on the monotonic sequence.

## Expected ledger strings (byte-exact, `observe: ` prefix)

`disabled (enabled=false)`, `activated (domain=workspace_observe)`, `stamped
<path> version <version> (fs/observed)`.

## Expected count

16 PASS.
