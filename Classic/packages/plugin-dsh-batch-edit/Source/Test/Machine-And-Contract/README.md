# Machine-And-Contract - the loader contract and the machine lifecycle tests

The loader contract, the IDLE-forever cold mount, the byte-exact activation
line, the fail-loud validation, the machine lifecycle with its byte-exact
ledger lines, the grammar parsers, the miss listing, and the
machinesPerAgent cap.

## Scenarios

- M1: the default export carries name/apply/Config/inject; the identity is
  the package name; apply returns nothing.
- M2: a cold mount logs the byte-exact
  `plugin-dsh-batch-edit: disabled (enabled=false)` line; the tool still
  registers and refuses loudly while disabled.
- M3: the activation line is byte-exact (`activated bundle 0.2.0
  (machinesPerAgent 2, opsPerCommit 64, deadlineMs 120000, strictMode
  false, interceptBash false)`); the fs/observed observer sits on the ROOT
  context; the pre-step listener sits on the ctx; no pre-execute listener
  while the intercept is off; the State probe carries the contract fields.
- M4: deadlineMs 999/200000, machinesPerAgent 0 and opsPerCommit 0 all fail
  loud at load.
- M5: open resolves, versions and adopts the files with the byte-exact
  `machine opened mach-1 (1 files, scope=a.txt)` and `inserted a.txt at
  version v1` lines; a missing file is listed as a miss, never guessed.
- M6: the grammar parsers - literal and regex searches, the full op grammar
  with a multi-word with and a mode, loud failures for malformed lines, and
  the opsPerCommit cap.
- M7: insert adds only new cells (a re-insertion is a renewal); remove,
  state and close with their byte-exact lines; a closed machine refuses
  inserts and is unaddressable afterwards.
- M8: a second open beyond machinesPerAgent fails loud with the contract
  phrasing.

## Expected count

25 PASS.
