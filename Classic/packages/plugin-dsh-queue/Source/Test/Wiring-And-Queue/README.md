# Wiring-And-Queue - the wiring and the enqueue tests

This folder covers the loader contract, the cold mount, the activation proof, the service and tool registration, the enqueue ledger, the fail-loud validation, and the purity guarantee.

## Scenarios

- L1: the loader contract - the default object carries name
  `plugin-dsh-queue`, apply, Config, inject `["pluginFactory", "tools"]`;
  apply returns NOTHING and the `__pluginDshQueueState` probe exists with
  the factory module name.
- W1: the IDLE-forever cold mount - the byte-exact
  `disabled (enabled=false)` line, no listener registered on any context,
  and the service and tools still register while the tools refuse with the
  byte-exact `queue disabled (enabled=false)` payload.
- W2: the activation wiring - the byte-exact
  `activated (bundle 0.3.0, capacity main=10 child=2, routedDispatch true)`
  line, the `dshQueue` service is the apply-registered instance with the
  nine-method surface, and the two tools carry the enqueue contract.
- W3: the enqueue path - the ids and sequences are assigned (`queue-1`,
  `queue-2`), the spec is stored verbatim, the ledger lines are byte-exact
  (`queued queue-1 coder p3 deps0`, `queued queue-2 auto p0 deps0`) in both
  the logger and durable forms, and the journal record lands in the P5
  pre-open sink with the exact event/path/detail.
- W4: the fail-loud validation - `capacity.main` 0 and `capacity.child` 0
  both throw `plugin-dsh-queue: capacity.* must be >= 1` at load.
- W5: the zero file-content guarantee - a full enqueue/dispatch/start/
  complete cycle records ZERO `writeText` and ZERO `readText` calls on the
  fake fs.

## Fixtures

The harness is the shared Harness: the fake ctx with the tools.register capture and the real factory instance.

## Expected ledger strings (byte-exact, `plugin-dsh-queue: ` prefix)

`disabled (enabled=false)`,
`activated (bundle 0.3.0, capacity main=10 child=2, routedDispatch true)`,
`queued <id> <role|auto> p<priority> deps<n>`.

## Expected count

14 PASS.
