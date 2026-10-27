# No-Op-Rule

What this test verifies.

## Intent

The N=0 no-op rule: normalizing a file that needs no changes must do NOTHING - no write, no
waterfall run, no emit, no count line, no journal record, with the file left byte-identical and the
outcome carrying no diff.

This is its own folder because the no-op path is the safety case: a no-op that touched anything
would corrupt history or journaling.

The source suite's Run 1d (idempotence) and Run 2 (clean file) are moved verbatim.

## Scenario

- Fixture: Run 1b's N>0 write (silent; its own assertions live in Read-Write-Pipeline).

    It establishes journal record #1, the first write/intent/observation, and the first count line
    that every no-op check is measured against.
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

The harness fake ctx + the REAL factory + the REAL normalize-file apply.

The fixture writes the All6 fixture to `/tmp/normalize-file-smoke-fixture.txt` (the source suite's
Run 1b, silent), and `WritesBeforeNoop` is captured after it exactly as in the source suite.

The clean file is `/tmp/normalize-file-smoke-clean.txt` with `"plain text, already clean\n"`.

The durable ledger is cleared at folder start, and the 10ms settle wait before the ledger read is
kept.

## Expected ledger strings (byte-exact)

None asserted in this folder beyond counts - the no-op rule is expressed by ABSENCE: exactly one
count line (from the fixture) and exactly one journal record, both unchanged by the no-op calls.

The fixture's own count line is the Read-Write-Pipeline folder's contract.

## Edge cases

- The no-op must not write, not run the waterfall, not emit, not journal, and not add a count line -
  five absence checks plus the byte-identical file and the diff-less outcome.
- A clean file behaves identically to an already-normalized one (both count 0 from the start).

## Expected count

11 PASS.
