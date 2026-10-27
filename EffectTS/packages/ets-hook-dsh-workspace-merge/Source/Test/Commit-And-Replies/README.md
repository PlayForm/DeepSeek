# Commit-And-Replies - the commit path and the reply union tests

The per-file commits through the shared write executor of the factory and the commit reply union (applied / conflict / denied / rejected / recovery-required / outcome-unknown), with every module-owned line asserted byte-exactly.

## Scenarios

- C1: a two-file commit applies both files (each write carries the explicit `replaceIfVersion` intent and emits `fs/observed` on the root), and the `batch <id> started (<n> files, <m> bytes)` / `applied <path> version <v> (batch <id>)` / `batch <id> complete (applied 2, conflict 0, denied 0, recovery 0, unknown 0)` lines are byte-exact (logger and durable file); the record and the statistics are honest.
- C2: in survivors mode a gate-level conflict is a per-file reply (`conflict <path> (expected v1, observed v2)`), the batch continues, and the applied file still applies.
- C3: a mid-batch write failure in all-or-nothing mode stops the batch and marks the remaining files `recovery-required` with the byte-exact `recovery-required <path> (batch <id>)` line, and the batch status is `partial`.
- C4: a sandbox/policy refusal is classified honestly as a `denied` reply with the `denied <path> (<reason>)` line.
- C5: an unmappable write failure is an `outcome-unknown` reply (with the observed version read back), never a guess.
- C6: the read-back verification, where a failed verification read is `outcome-unknown` with the exact reason prefix `the verification read failed:`, and applied bytes that differ from the intended content are a `conflict`.

## Fixtures

The shared Harness (fake ctx with a FUNCTIONAL fs + the REAL built factory + the REAL built plugin apply), where the write/read faults and the tamper mode are the fault injections of the fs.

## Expected ledger strings (byte-exact, `merge: ` prefix)

`batch <id> started (<n> files, <m> bytes)`, `applied <path> version <v> (batch <id>)`, `batch <id> complete (applied <a>, conflict <c>, denied <d>, recovery <r>, unknown <u>)`, `conflict <path> (expected <e>, observed <o>)`, `recovery-required <path> (batch <id>)`, `denied <path> (<reason>)`, `outcome-unknown <path> (batch <id>)`.

## Expected count

11 PASS.
