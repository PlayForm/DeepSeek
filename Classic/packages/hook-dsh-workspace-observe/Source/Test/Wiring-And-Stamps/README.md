# Wiring-And-Stamps - the wiring and the recorder tests

This folder covers the plugin's loader wiring and the synchronous recorder: the live disabled posture, the root-context registration, the apply-registered service, the activation proof, the stamp mechanics, and the fail-loud validation.

## Scenarios

- W1: the live disabled posture: apply returns NOTHING, the service is still provided, EVERY surface registers (the `fs/observed` root listener and the `observe-storage` effect), the ledger carries the byte-exact `disabled (enabled=false)` line, a disabled event and a disabled `manual()` call pass through with ZERO new ledger lines and zero state changes, and a volatile flip (`enabled` through the cosmokit cell plus the captured `loader/volatile-update` dispatch) acts on the very next event in both directions with no remount and no new activation line.
- W2: the enabled mount registers `fs/observed` on the ROOT context only (never on the plugin context, because the fake root is a distinct object and a ctx-side registration cannot pass), the root identity is not the plugin ctx, the activation line `activated (domain=workspace_observe)` is byte-exact, and the storage effect is armed.
- W3: the stamp mechanics record sequences 1 and 2 from two events with the event's version and origin `fs/observed` (no wall clock anywhere, because the third event lands on exactly 3), the stamped ledger line is byte-exact (logger and durable file), the ring reads newest first through the service, and an absent observation records version `absent`, never a fabricated token.
- W4: the fail-loud validation throws at load with the byte-exact `observe: ` messages for `maxStamps` below 1 and an empty `domain`.
- W5: the service surface shows the instance is the apply-registered one, `statistics()` is exact, and `stamp(path)` returns the exact latest stamp (or undefined).

## Fixtures

The fixtures use the shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target).

There is no fake clock, because the plugin has no clock dependency and every timing assertion is on the monotonic sequence.

## Expected ledger strings (byte-exact, `observe: ` prefix)

`disabled (enabled=false)`, `activated (domain=workspace_observe)`, `stamped <path> version <version> (fs/observed)`.

## Expected count

19 PASS.
