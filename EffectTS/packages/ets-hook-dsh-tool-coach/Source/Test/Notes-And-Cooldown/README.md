# Notes-And-Cooldown

What this test verifies.

## Intent

This folder covers tier 1 of the coaching ladder end to end: the per-class detection logs the byte-exact offense lines, and the per-class threshold converts strikes into a tier-1 note whose text is byte-exact and carries the LIVE fetched tool description (the discriminator of D1 against the static fallback).

The note is labeled with the load-bearing source `{kind, form, summary}`, and the strike line is byte-exact and durable.

Then the cooldown gating: offenses inside the cooldown are suppressed with their own byte-exact lines, the second note waits exactly for the cooldown, and tier 2 escalates on the way (6 strikes since the note).

R3 continues the SAME run as R2 on purpose, because its arithmetic is relative to the history of R2, so the two tiers live in one folder.

The assertions are moved verbatim from `Classic/smokes/tool-coach-smoke.mjs` (R2 + R3).

## Scenario

- Group: R2 - detect + strike (the setup: 2 cat reads + 1 sed write by agent-r2).
    - Check: "R2: two offense lines for the read-class cat, byte-exact pattern".
    - Check: "R2: one offense line for the write-class sed -i, byte-exact pattern".
    - Check: "R2: no note below the threshold (mixed classes, read at 2)".
    - Check: "R2: the 4th read offense returns a NEW decision" (not the downstream identity).
    - Check: "R2/D1: the notice carries the load-bearing source label {kind, form, summary}" (summary "bash read (U+00D7) 4").
    - Check: "R2/D1: the tier-1 note text is byte-exact with the LIVE (fetched) description" (the four-line note, live `(live fixture)` description).
    - Check: "D1: no literal ${ placeholder remains in the composed note".
    - Check: "R2: the strike ledger line is byte-exact: 'strike 4/3 bash read -> note read'".
    - Check: "the durable ledger file carries the [ISO] strike line".
- Group: R3 - cooldown (agent-r3: 9 calls, then 3 more, then the 13th).
    - Check: "R3: six cooldown-suppressed lines for the offenses inside the cooldown (calls 4-9)".
    - Check: "R3: the fresh agent's own first note fired at its 3rd offense (per-class threshold)".
    - Check: "R3: the suppressed line carries the total strikes: 'cooldown suppressed 8 bash read'".
    - Check: "R3: tier 2 escalates at 6 strikes since the note: 'escalated persistent section (8 strikes)'".
    - Check: "R3: still only TWO strike lines (no second note inside the cooldown)".
    - Check: "R3: nine cooldown-suppressed lines in total (calls 4-12)".
    - Check: "R3: the second note fires exactly when the cooldown elapses (window capped at 8)" ('strike 8/3 bash read -> note read').

## Fixtures

The harness world: one `Make(Validate({ logFile: Ledger }))` shared by both groups against the cleared harness tmpdir ledger, the live registry schema fixture (the `(live fixture)` marker discriminates a LIVE fetch), and the `Post` waterfall helper.

The R2 group replays the four calls of agent-r2 (cat, cat, sed, cat), and the R3 group drives the 9 + 3 + 1 calls of agent-r3 on the same run.

## Expected ledger strings (byte-exact)

- `: offense bash read <cat row>` (twice; `<cat row>` is the DEFAULT_PATTERNS row containing `(cat|less|more`)
- `: offense bash write <sed row>` (once; the row containing `\bsed\b`)
- `: strike 4/3 bash read -> note read` and its durable `] strike 4/3 bash read -> note read` form
- The note text: the four-line `Tool-coach note (strike 4, read-class bash pattern): ...` block with the live description line
- `: strike 3/3 bash read -> note read`, `: cooldown suppressed 8 bash read`, `: escalated persistent section (8 strikes)`, `: strike 8/3 bash read -> note read`

## Edge cases

- Mixed classes split the per-class counters, so 3 total offenses do NOT note when they span two classes (read at 2, write at 1).
- The cooldown suppresses the note but still logs every suppressed offense with its own line carrying the running total.
- The window cap (8) means the second note fires at the 10th judged call since the note, with the strike counter showing 8/3.

## Expected count

16 PASS.
