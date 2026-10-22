# Wiring-And-Decisions - the loader contract, wiring, and gate decisions

The govern hook's loader contract, the service registration from apply, the
cold-mount idle-forever posture, the fail-loud validation, the four
independent means-checks through the real service, the policy override, the
fail-open recovery table, the decision ring, and the purity invariant.

## Scenarios

- G1: the default object carries exactly name/apply/Config/inject; inject is
  `["pluginFactory"]`.
- G2: an enabled mount returns NOTHING from apply, exposes
  `ctx.__hookDshWorkspaceGovernState`, registers the `workspaceGovern`
  service (the gate/decisions methods resolve on the context), and the
  activation line is byte-exact: `govern: activated (tools=4, policy=0)`
  (logger and durable file).
- G3: a disabled mount wires NOTHING (no waterfall listeners) and logs the
  honest `govern: disabled (enabled=false)` line while the service stays
  registered.
- G4: the fail-loud validation: a non-array policy table, a bad recovery
  override behavior, a zero loop bound - all throw with module-prefixed
  errors.
- D1: a declared, contributed proposal passes with the byte-exact
  `passed op:1 (write /repo/src/a.ts)` line (logger and durable file).
- D2: an empty contribution denies with the byte-exact
  `denied op:1 (contributes)` line and the obligations record.
- D3: with a non-empty scope allowlist, a target outside it denies and a
  target inside it passes (the scope obligation records satisfied/denied).
- D4: an explicitly unsatisfied precondition denies by name
  (`denied op:3 (precondition tests pass)`); all-satisfied preconditions
  pass.
- D5: a policy deny rule forces the denial (`denied op:5 (policy: bash)`);
  a policy allow rule never bypasses the checks (an empty contribution still
  denies).
- D6: an escalate rule produces the ask decision with the byte-exact
  `escalated op:7 (approval required)` line.
- D7: the fail-open recovery table: missing preconditions pass with the
  byte-exact `recovery preconditions (fail-open)` line; a fail-closed
  override turns missing preconditions into a denial.
- D8: the decision ring keeps the newest decisions (newest first, with the
  optional limit) and the statistics pair is honest.
- D9: the gate reads no file content (zero fs calls).

## Fixtures

The shared Harness (fake ctx + the REAL built factory + the REAL built
plugin apply); the gate is driven through the real `workspaceGovern`
service.

## Expected ledger strings (byte-exact, `govern: ` prefix)

`activated (tools=4, policy=0)`, `disabled (enabled=false)`,
`passed <op> (<kind> <target>)`, `denied <op> (<reason>)`,
`escalated <op> (approval required)`,
`recovery <obligation> (fail-open)`.

## Expected count

21 PASS.
