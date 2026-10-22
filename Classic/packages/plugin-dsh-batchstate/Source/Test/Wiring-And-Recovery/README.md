# Wiring-And-Recovery - the wiring and the recovery tests

The loader contract, the cold mount, the activation proof, the service
registration, the fail-loud validation, the state-file recovery, and the
purity guarantee.

## Scenarios

- L1: the loader contract - the default object carries name
  `plugin-dsh-batchstate`, apply, Config, inject `["pluginFactory"]`; apply
  returns NOTHING and the `__pluginDshBatchstateState` probe exists with the
  factory module name.
- W1: the IDLE-forever cold mount - the byte-exact
  `disabled (enabled=false)` line, and the service still registers and
  reads the empty state honestly.
- W2: the activation wiring - the byte-exact
  `activated (batch=default, stateFile=<path>)` line followed by the
  recovery line, and the nine-method service surface on the provided
  instance.
- X1: the fail-loud validation - `maxRecent` 0, an empty `stateFile`, and
  an empty `batch` all throw `batchstate: ...` at load.
- R1: the recovery - a seeded state file restores the members (with their
  statuses and scopes), keeps only the queue ids that still have a member
  record (`recovered (2 members, queue 1)`), and a recovered active member
  is honestly downgraded to `interrupted` with a finishedAt stamp.
- R2: a corrupt state file starts the batch empty
  (`recovered (0 members, queue 0)`), never guessed.
- P1: the zero context-fs guarantee - a full write cycle records ZERO
  `writeText` and ZERO `readText` calls on the fake fs (the state file and
  the ledger are the plugin's own plain-fs stores, never the governed
  context fs).

## Fixtures

The shared Harness with the `Seed` helper (the JSON state file the recovery
reads at apply time).

## Expected ledger strings (byte-exact, `batchstate: ` prefix)

`disabled (enabled=false)`,
`activated (batch=<batch>, stateFile=<path>)`,
`recovered (<n> members, queue <m>)`.

## Expected count

13 PASS.
