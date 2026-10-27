# Wiring-And-Storage - the wiring and the storage tests

This folder covers the plugin's loader wiring and its own P5-style storage domain: the cold mount, the root-context registration, the apply-registered service, the activation proof, the fail-loud validation, the absent facility, the loud open failure, and the restart recovery.

## Scenarios

- W1: the IDLE-forever cold mount, where apply returns NOTHING, the service is still provided, nothing registers on the root context, no storage effect is armed, and the ledger carries the byte-exact `disabled (enabled=false)` line.
- W2: the enabled mount, where `fs/observed` registers on the ROOT context only (never on the plugin context, because the fake root is a distinct object and a ctx-side registration cannot pass), the root identity is not the plugin ctx, the activation line `activated (domain=workspace_approve)` is byte-exact, the storage effect is armed, and the state probe is attached.
- W3: the fail-loud validation, where an empty `domain` and a `maxBindings` below 1 throw at load with the byte-exact `approve: ` messages, and a non-boolean `requireConstraints` fails loud at the schema (a `ValidationError`, because the schema validates the type first).
- W4: the absent facility, where the effect is a SILENT SKIP: no `storage open failed` line, the handle stays undefined, and the bindings live in memory only.
- W5: the loud open failure, where a present facility whose open fails logs the byte-exact `storage open failed: storage unavailable` line and degrades (the handle stays undefined).
- W6: the restart recovery, where the seeded `bindings` rows rebuild the by-id map, the `__ring` row rebuilds the ring with invalid rows skipped, the sequence restarts at the MAXIMUM loaded sequence (5, never a wall clock), the handle binds, and the domain spec is the hook's own `workspace_approve` version 1 with two tables.

## Fixtures

The fixtures use the shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target) plus `OpenStorage` (the tests drive the storage module directly, following the observe Storage-And-Service precedent) and `FakeStorage` (a capturing facility with a failOpen mode).

There is no fake clock, because the plugin has no clock dependency and every timing assertion is on the binding sequence.

## Expected ledger strings (byte-exact, `approve: ` prefix)

`disabled (enabled=false)`, `activated (domain=workspace_approve)`, `storage open failed: storage unavailable`.

## Expected count

13 PASS.
