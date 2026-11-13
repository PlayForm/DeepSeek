# Wiring-And-Lifecycle - the wiring and the lifecycle spine

This folder covers the loader contract (apply returns nothing, the default object carries name/apply/Config/inject), the live disabled cold mount (registered, silent, the volatile flip live), the root-context registration with the distinct root identity, the service registered from apply, the activation proof, the storage effect, the guard chain on the listener path, the monotonic progress behavior (no wall clock on the event path), and the fail-loud validation.

## Scenarios

- W1: the default object carries name/apply/Config/inject, apply returns nothing, the service is provided on a cold mount, a disabled mount registers EVERY surface (the `fs/observed` root listener and the `journal-storage` effect), the disabled line is byte-exact, the cold-mount service reads honestly from the empty state, a disabled event and a disabled mutating call (open, seal, revert throw `journal: disabled (enabled=false)`, recover answers the empty report) pass through with ZERO new ledger lines, and a volatile flip (`enabled` through the cosmokit cell plus the captured `loader/volatile-update` dispatch) acts on the very next call in both directions with no remount and no new activation line.
- W2: fs/observed is registered on the ROOT context only, the root identity is distinct, the activation line is byte-exact, the storage effect is armed, and the volatile-update listener is registered on the plugin ctx.
- W3: an excluded segment, the own actor, a foreign event outside any batch, and a malformed event each produce their byte-exact line, and the listener path touches zero file content.
- W4: maxBatches, maxEntryBytes, domain, and exclude fail loud at load.
- W5: the service is the apply-registered instance, and with no open batch the counters do not move.

## Expected ledger strings (byte-exact, `journal: ` prefix)

`disabled (enabled=false)`,
`activated (domain=workspace_journal, maxBatches=200)`,
`ignored <path> (excluded)`, `ignored <path> (own actor)`,
`failed unknown (malformed event: displayPath is not a string)`,
`opened b1 (1 files)`.

## Expected count

24 PASS.
