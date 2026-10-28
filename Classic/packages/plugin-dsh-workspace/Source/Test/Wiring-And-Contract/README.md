# Wiring-And-Contract - the wiring and the loader contract tests

The test covers the loader contract, the IDLE-forever cold mount, the byte-exact activation line of the enabled mount, the five tool registrations, the no-listeners posture of the pure consumer, the State probe, the fail-loud validation, and the fs purity invariant.

## Scenarios

- W1: the default export carries name/apply/Config/inject, the identity is the package name, the inject list holds the three services, `apply` returns nothing, and the schema fills the documented defaults (enabled false first).
- W2: a disabled mount registers nothing and logs the byte-exact `plugin-dsh-workspace: disabled (enabled=false)` line in the logger and the durable file.
- W3: the activation line of the enabled mount is byte-exact (`activated (bundle 0.2.1, tools=5)`), the five tools register in contract order (map, find, expand, context, index), no root listeners and no services are registered because the consumer is pure, only the loader/volatile-update of the factory sits on the ctx, and the State probe carries the contract fields.
- W4: mapDepth 0, findLimitMax < findLimit, expandDepth 4, and an unknown node kind all fail loud at load with the exact messages.
- W5: the wiring never touches the fs seam (zero resolve/stat/read/write calls), and the ledger holds exactly the one activation line.

## Expected count

17 PASS.
