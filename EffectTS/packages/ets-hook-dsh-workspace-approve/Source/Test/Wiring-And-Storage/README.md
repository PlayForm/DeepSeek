# Wiring-And-Storage - the wiring and the storage tests

The plugin's loader wiring and its own P5-style storage domain: the cold
mount, the root-context registration, the apply-registered service, the
activation proof, the fail-loud validation, the absent facility, the loud
open failure and the restart recovery.

## Scenarios

- W1: the IDLE-forever cold mount - apply returns NOTHING, the service is
  still provided, nothing registers on the root context and no storage
  effect is armed, and the ledger carries the byte-exact
  `disabled (enabled=false)` line.
- W2: the enabled mount - `fs/observed` registers on the ROOT context only
  (never on the plugin context; the fake root is a distinct object, so a
  ctx-side registration cannot pass), the root identity is not the plugin
  ctx, the activation line `activated (domain=workspace_approve)` is
  byte-exact, the storage effect is armed, and the state probe is attached.
- W3: the fail-loud validation - an empty `domain` and a `maxBindings`
  below 1 throw at load with the byte-exact `approve: ` messages; a
  non-boolean `requireConstraints` fails loud at the schema (a
  `ValidationError`, since the schema validates the type first).
- W4: the absent facility - the effect is a SILENT SKIP: no
  `storage open failed` line, the handle stays undefined, the bindings live
  in memory only.
- W5: the loud open failure - a present facility whose open fails logs the
  byte-exact `storage open failed: storage unavailable` line and degrades
  (the handle stays undefined).
- W6: the restart recovery - the seeded `bindings` rows rebuild the by-id
  map, the `__ring` row rebuilds the ring with invalid rows skipped, the
  sequence restarts at the MAXIMUM loaded sequence (5, never a wall clock),
  the handle binds, and the domain spec is the hook's own
  `workspace_approve` version 1 with two tables.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory,
the real built Target) plus `OpenStorage` (the tests drive the storage
module directly - the observe Storage-And-Service precedent) and
`FakeStorage` (a capturing facility with a failOpen mode). No fake clock:
the plugin has no clock dependency - every timing assertion is on the
binding sequence.

## Expected ledger strings (byte-exact, `approve: ` prefix)

`disabled (enabled=false)`, `activated (domain=workspace_approve)`,
`storage open failed: storage unavailable`.

## Expected count

13 PASS.
