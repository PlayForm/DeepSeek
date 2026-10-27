# Read-Write-Pipeline

This page records what the test verifies.

## Intent

The read -> count -> write pipeline runs through Factory.Write, the shared executor, and it defines what one tool call actually does to a file.

This folder stands alone because the pipeline is the whole product of this flavor: resolve, read, the six-fold transform, the write-intent waterfall, the fs/observed emit, the outcome metadata, the count ledger line, and the P5 journal record, plus the config knob that flows into it (the volatile replacement).

The folder holds the source suite's Run 1b, Run 1c, and Run 6, moved verbatim.

## Scenario

- Group: Run 1b - a file with all six families -> N > 0 -> the write lands.
    - Check: "the exec resolves the model-supplied path first (caller-side,
      like raw-write)".
    - Check: "the pipeline reads the target exactly once".
    - Check: "N>0: the write lands through Factory.Write with ALL SIX
      transforms applied (em dash -> -, curly quotes -> straight, ellipsis
      -> ..., NBSP -> space, zero-width removed, fullwidth ->
      halfwidth)".
    - Check: "the fs/write-intent waterfall's next() default flowed through
      (unconditional write)".
    - Check: "the shared executor ran the fs/write-intent waterfall".
    - Check: "the waterfall received the actor".
    - Check: "bare backend: no sandbox policy stamped onto the write
      (standing posture)".
    - Check: "the exec's signal flows end to end into writeText".
    - Check: "fs/observed emitted with the written version (the governance
      hooks' trigger)".
    - Check: "the outcome reports path, count=7, changed=true".
    - Check: "the outcome carries the real before/after contents".
    - Check: "count ledger line byte-exact (N>0 only)" (Run1.Lines[1]).
    - Check: "the durable ledger file carries the count line (the [ISO]
      message, no logger prefix)".
    - Check: "exactly ONE count line for the write".
- Group: Run 1c - the P5 journal record (the REAL routing).
    - Check: "exactly ONE 'normalized' journal record after the write".
    - Check: "the 'normalized' record carries the target's displayPath".
    - Check: "journal detail byte-identical to the ledger count line".
    - Check: "the 'normalized' record carries a numeric timestamp".
    - Check: "the record routes to the factory pre-bind buffer (stage 2),
      not the per-State queue".
- Group: Run 6 - the volatile replacement knob flows into the tool.
    - Check: "volatile unwrap: custom replacement unwrapped"
      (State.Replacement === "$&").
    - Check: "the replacement knob flows into the Dashes step (literal $& -
      the function replacer)".
    - Check: "the replacement run reports count=1, changed=true".
    - Check: "the count line reflects the custom-replacement run".
    - Check: "the custom-replacement run adds its 'normalized' journal
      record" (the cumulative count reaches 2, detail byte-exact).

## Fixtures

The harness uses a fake ctx whose read/write fs seams serve an in-memory Files map, the REAL factory, and the REAL normalize-file apply.

Run 1b writes the source suite's All6 fixture (em dash, curly quotes, ellipsis, NBSP, zero-width space, fullwidth A) to `/tmp/normalize-file-smoke-fixture.txt` through the in-memory map.

The `Exec` helper builds the call identity.

Run 1c reads `Furnace.PendingJournal`, the cumulative counter, which stands at 1 after Run 1b's write.

That write is the only journal-producing call made in this folder before Run 6, so Run 6's record is #2 exactly as in the source suite.

The harness clears the durable ledger at folder start and before Run 6, and it keeps the 10ms settle waits before every ledger read.

## Expected ledger strings (byte-exact)

- `plugin-dsh-normalize-file: normalized 7 char(s) in /tmp/normalize-file-smoke-fixture.txt` (Run1.Lines[1]; the durable file carries the same
  message text with the [ISO] timestamp prefix).
- `normalized 1 char(s) in /tmp/normalize-file-smoke-replacement.txt` (the
  Run 6 ledger line via `includes`, and the second journal record's detail).

## Edge cases

- N>0 is the only journaling and counting path, and the folder's no-op siblings with count 0 live in No-Op-Rule.
- The six transforms apply in the family order in one pass, so the single write's content is the combined proof.
- The signal must flow from the exec into writeText unchanged.

## Expected count

24 PASS.
