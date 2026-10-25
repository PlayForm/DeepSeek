# Wiring-And-Contract - the wiring and the loader contract tests

The loader contract, the IDLE-forever cold mount, the enabled mount's
byte-exact activation line, the five tool registrations, the no-listeners
posture of the pure consumer, the State probe, the fail-loud validation and
the fs purity invariant.

## Scenarios

- W1: the default export carries name/apply/Config/inject; the identity is
  the package name; the inject list is the three services; `apply` returns
  nothing; the schema fills the documented defaults (enabled false first).
- W2: a disabled mount registers nothing and logs the byte-exact
  `plugin-dsh-workspace: disabled (enabled=false)` line (logger and durable
  file).
- W3: the enabled mount's activation line is byte-exact
  (`activated (bundle 0.2.0, tools=5)`), the five tools register in
  contract order (map, find, expand, context, index), no root listeners and
  no services are registered (pure consumer), only the factory's
  loader/volatile-update sits on the ctx, and the State probe carries the
  contract fields.
- W4: mapDepth 0, findLimitMax < findLimit, expandDepth 4 and an unknown
  node kind all fail loud at load with the exact messages.
- W5: the wiring never touches the fs seam (zero resolve/stat/read/write
  calls) and the ledger holds exactly the one activation line.

## Expected count

17 PASS.
