# Rules-And-Refusals - the resolution rules and the refusal-to-guess tests

This folder covers the operate hook's loader contract, the service registration from apply, the cold-mount idle-forever posture, the fail-loud validation, the happy-path proposals, the full refusal vocabulary, and the purity rule.

## Scenarios

- G1: the default object carries exactly name/apply/Config/inject, and inject is `["pluginFactory", "fs"]`.
- G2: an enabled mount returns NOTHING from apply, exposes `ctx.__hookDshWorkspaceOperateState`, registers the `workspaceOperate` service, registers the fs/observed fence tracker on the ROOT only, and the activation line is byte-exact: `operate: activated (domain=workspace_operate)` (logger and durable file).
- G3: a disabled mount wires NOTHING and logs the honest `operate: disabled (enabled=false)` line while the service stays registered.
- G4: the fail-loud validation throws module-prefixed errors for an empty domain and a zero maxProposals.
- P1: the happy paths record a rename, a connect, and a replace proposal with the byte-exact `proposed <id> <kind> <path>` line (logger and durable file), and each carries the monotonic id `<kind>-<sequence>`, the version fence, and the sequence.
- P2: the refusal vocabulary is byte-exact and never guessed: `bad-request` (malformed rename and replace), `missing-version`, `graph-unavailable` (no workspaceGraph mounted), `unknown-symbol` (rename and connect endpoints), `name-collision`, `incompatible-edge`, `duplicate-edge`, `stale-version` (fence contradicts the file version), and `span-beyond-file` (checked against the file's real line count), and every refusal is ledgered with the `refused <kind> <reason>` line.
- P3: the purity rule holds, because proposing never writes a file (zero writeText calls).

## Fixtures

The fixtures use the shared Harness (fake ctx with a FUNCTIONAL fs + a fake workspaceGraph + the REAL built factory + the REAL built plugin apply).

## Expected ledger strings (byte-exact, `operate: ` prefix)

`activated (domain=workspace_operate)`, `disabled (enabled=false)`,
`proposed <id> <kind> <path>`, `refused <kind> <reason>`.

## Expected count

23 PASS.
