# Journal-And-Custom

What this test verifies.

## Intent

The journaling mechanics of the dash flavor plus the custom-replacement run
and the transport-boom error path. This is its own folder because the P5
journal record is a storage-domain contract (event/path/detail/at, routed to
the factory-level pre-bind buffer) and because its arithmetic is CUMULATIVE
across the whole source suite - isolating it lets the cumulative counts be
reproduced deterministically. The source suite's Run 1 journal block, Run 2
journal leaf, Run 3, Run 4, Run 5 journal leaf, and the journal leaves of
Runs 7/7b/7c/7d, moved verbatim.

## Scenario

- Fixture: Run 1's 10-replacement waterfall stream (silent; its own
  assertions live in Stream-Contract).
    - Check: "exactly ONE 'normalized' journal record after the
      10-replacement stream".
    - Check: "the 'normalized' record carries an empty path (stream-level
      event)".
    - Check: "journal detail byte-identical to the ledger count line".
    - Check: "the 'normalized' record carries a numeric timestamp".
    - Check: "the record routes to the factory pre-bind buffer (stage 2),
      not the per-State queue".
- Fixture: Run 2's reasoning-off stream (silent; 0 records).
    - Check: "NO journal record when nothing was replaced (N=0)".
- Group: Run 3 - custom replacement + $-literal safety.
    - Check: "volatile unwrap: custom replacement unwrapped"
      (State.Replacement === "$&").
    - Check: "custom replacement inserted LITERALLY (function replacer, no
      $-pattern interpretation)".
    - Check: "count line reflects custom-replacement run".
    - Check: "the custom-replacement run adds its 'normalized' journal
      record" (the cumulative count reaches 2).
    - Check: "custom-replacement journal detail mirrors the ledger line".
- Group: Run 4 - upstream throw propagates, no count line.
    - Check: "upstream throw propagates through the wrapper" (the
      transport-boom error path).
    - Check: "NO count line after an upstream throw".
    - Check: "NO journal record after an upstream throw" (still 2).
- Fixture: Run 5's identity stream (silent; count 0).
    - Check: "identity stream (count 0) adds no journal record" (still 2).
- Fixture: Run 7's tool-args stream (silent; +1 record).
    - Check: "tool-args replacements journal too (delta + block in one
      count record)" (3, detail of the third record byte-exact).
- Fixture: Run 7b's edit-exemption stream (silent; 0 records).
    - Check: "NO journal record for an edit-only stream (nothing
      normalized)" (still 3).
- Fixture: Run 7c's raw-marked stream (silent; 0 records).
    - Check: "NO journal record for a raw-marked stream (the strip is not a
      normalization)" (still 3).
- Fixture: Run 7d's raw-marker-reset stream (silent; +1 record).
    - Check: "the run 7d record journals only the normalized call (the raw
      call stays invisible)" (4, detail of the fourth record byte-exact).

## Fixtures

The harness fake ctx + the REAL factory + the REAL dash apply. The factory
instance is the harness Furnace; `Furnace.PendingJournal` is the cumulative
counter. The fixture streams replay, in suite order and byte-identically,
the exact chunks of the source suite's Runs 1, 2, 3, 4, 5, 7, 7b, 7c and 7d
so the cumulative journal arithmetic reproduces the source suite's values
(1, 1, 2, 2, 2, 3, 3, 3, 4) in this folder standalone AND under the
aggregate. The durable ledger is cleared at folder start and at the source
suite's rm points; the 10ms settle waits before ledger reads are kept. The
Run 3 config is `Validate({ replacement: "$&" })`.

## Expected ledger strings (byte-exact)

- `normalized 10 dash char(s) in one stream` (the journal detail of the
  first record; the ledger line's own message text).
- `normalized 1 dash char(s) in one stream` (the custom-replacement record
  and the 7d record; the ledger line read via `includes`).
- `normalized 2 dash char(s) in one stream` (the tool-args record).
(The full logger lines carry the `hook-dsh-normalize-dash: ` prefix; the
journal detail is the message text alone.)

## Edge cases

- N=0, upstream throw, and count-0 identity streams add NO record - the
  three negative controls pin the "journal only when something was actually
  replaced" rule.
- The record routes to the factory pre-bind buffer, not the per-State queue
  (Queue stays empty).
- The custom replacement is inserted by a function replacer - "$&" would be
  a pattern under a string replacer; the literal insertion proves the
  function path.

## Expected count

19 PASS.
