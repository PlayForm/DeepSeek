# No-Op-Rule

This page records what the test verifies.

## Intent

The N=0 no-op rule says that a normalization pass over a file with nothing to change must do NOTHING.

It must not write, must not run the waterfall, must not emit, must not add a count line, and must not add a journal record.

The file stays byte-identical and the outcome carries no diff.

This folder stands alone because the no-op path is the safety case.

A no-op that touched anything would corrupt history or journaling.

The folder holds the source suite's Run 1d (idempotence) and Run 2 (clean file), moved verbatim.

## Scenario

- Fixture: Run 1b's N>0 write (silent; its own assertions live in Read-Write-Pipeline), which establishes journal record #1, the first write/intent/observation, and the first count line that every no-op check is measured against.
- Group: Run 1d - idempotence: normalizing the normalized file is a no-op.
    - Check: "normalizing the already-normalized file: count 0,
      changed=false".
    - Check: "N=0 -> NO write at all (no writeText call)".
    - Check: "N=0 -> no fs/write-intent waterfall run".
    - Check: "N=0 -> no fs/observed emit".
    - Check: "N=0 -> NO count line (the ledger keeps exactly the first
      one)".
    - Check: "N=0 -> NO journal record".
    - Check: "N=0 -> the file is left byte-identical".
    - Check: "N=0 -> the outcome carries no before/after (nothing to
      diff)".
- Group: Run 2 - a clean file is a no-op from the start.
    - Check: "a clean file: count 0, changed=false, path reported".
    - Check: "a clean file: NO write".
    - Check: "a clean file: NO journal record".

## Fixtures

The harness uses a fake ctx, the REAL factory, and the REAL normalize-file apply.

The fixture writes the All6 fixture to
`/tmp/normalize-file-smoke-fixture.txt` (the source suite's Run 1b, silent).

The harness captures `WritesBeforeNoop` after that write, exactly as the source suite does.

The clean file is `/tmp/normalize-file-smoke-clean.txt` with
`"plain text, already clean\n"`.

The harness clears the durable ledger at folder start and keeps the 10ms settle wait before the ledger read.

## Expected ledger strings (byte-exact)

This folder asserts none beyond counts.

The no-op rule shows through ABSENCE: exactly one count line (from the fixture) and exactly one journal record, both unchanged by the no-op calls.

The fixture's own count line is the Read-Write-Pipeline folder's contract.

## Edge cases

- Five absence checks - no write, no waterfall run, no emit, no journal record, no count line - plus the byte-identical file and the diff-less outcome enforce the no-op rule.
- A clean file behaves the same as an already-normalized one, because both count 0 from the start.

## Expected count

11 PASS.
