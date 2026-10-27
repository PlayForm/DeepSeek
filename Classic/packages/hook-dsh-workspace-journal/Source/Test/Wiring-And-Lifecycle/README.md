# Wiring-And-Lifecycle - the wiring and the lifecycle spine

This folder covers the loader contract (apply returns nothing, the default object carries name/apply/Config/inject), the IDLE-forever cold mount, the root-context registration with the distinct root identity, the service registered from apply, the activation proof, the storage effect, the guard chain on the listener path, the monotonic progress behavior (no wall clock on the event path), and the fail-loud validation.

## Scenarios

- W1: the default object carries name/apply/Config/inject, apply returns nothing, the service is provided on a cold mount, a disabled mount wires nothing, the disabled line is byte-exact, and the cold-mount service reads honestly from the empty state.
- W2: fs/observed is registered on the ROOT context only, the root identity is distinct, the activation line is byte-exact, the storage effect is armed, and the volatile-update listener is registered on the plugin ctx.
- W3: an excluded segment, the own actor, a foreign event outside any batch, and a malformed event each produce their byte-exact line, and the listener path touches zero file content.
- W4: maxBatches, maxEntryBytes, domain, and exclude fail loud at load.
- W5: the service is the apply-registered instance, and with no open batch the counters do not move.

## Expected ledger strings (byte-exact, `journal: ` prefix)

`disabled (enabled=false)`,
`activated (domain=workspace_journal, maxBatches=200)`,
`ignored <path> (excluded)`, `ignored <path> (own actor)`,
`failed unknown (malformed event: displayPath is not a string)`.

## Expected count

20 PASS.
