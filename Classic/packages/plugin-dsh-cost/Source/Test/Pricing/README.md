# Pricing

What this test verifies.

## Intent

The pricing fixture set (Temporary/Cost-Research/Plan.md lane B4a; Documentation/Plans/
COST-TRACK-PLUGIN.md sections 6 and 17.2; the research's sections 2.2 and 2.3): one fixed set of
calls is booked through the drain against a plain card, a card with a cache-read rate, a windowed
card, a region-specific card, a tiered card, two conditional cards and an unknown model, and the
read answers the exact per-bucket money, the exact total and the unpriced coverage.

Three properties carry the lane:

- **Window and region belong to the card.** The tier family is bound to the resolved window beside
  the effective date, the mode and the region, so a peak card's bands are read inside the peak
  window and another window's band never enters the walk; an exact window or region match wins over
  a newer generic row.
- **Unpriced is not free.** A call whose rate card the book does not carry stores zero money, keeps
  its usage, keeps `PriceId` NULL, and is counted as unpriced - the summary states the count and
  the envelope's `coverage` states the count with the token buckets those calls spent. The report
  read states the same fact per session.
- **A conditional card is selected, not walked.** A rate row whose `Note` is
  `condition:at-or-below` or `condition:above` applies only when the request's total prompt size
  (uncached input plus both cache buckets) satisfies the bound held in its `TierFrom`, and it prices
  the whole request flat at its own rates instead of joining the marginal ladder.

## Scenario

- Check: "B4a: a plain card prices every bucket at its own rate" - 1M input at 2 and 500k output at
  4 gives 2.00, 2.00 and 4.00.
- Check: "B4a: a cache-read rate prices the cached bucket at its own rate, never the input rate" -
  1M input at 2 plus 2M cache read at 0.5 gives 2.00, 1.00 and 3.00.
- Check: "B4a: a windowed card is selected inside its window and its bands stay in that window" -
  the resolved card names the peak window at the peak floor rate, and 300k prompt tokens through
  the peak bands cost 4.00, not the 23.80 a walk that read the other window's band would produce.
- Check: "B4a: a region-specific card wins for its own region and the generic row prices a call
  with none" - the exact region row resolves at the older date for a `us` call (1.00) and the newer
  generic row prices the call with no region (0.10).
- Check: "B4a: a tiered card prices the portion below the threshold at the lower rate and only the
  excess above" - 200k at 3 plus 100k at 6 gives 1.20.
- Check: "B4a: an unknown card leaves the call unpriced, its usage recorded and its money zero" -
  the call reports `priced` false, 0 money, its 1000 input, 500 output and 200 cache-read tokens,
  and the resolution carries no price-row identity.
- Check: "B4a: the coverage counts the priced and the unpriced calls" - 11 calls, 10 priced, 1
  unpriced, and the summary's own count agrees.
- Check: "B4a: the coverage carries the unpriced calls' token buckets" - input 1000, output 500,
  cache read 200, cache write 0, reasoning 0, total 1700, reported null.
- Check: "B4a: the report read states the unpriced calls beside the priced ones" - the same counts
  and the same 1700 unpriced tokens from the report's coverage read.
- Check: "B4a: a conditional card at or below its threshold prices the whole request flat" - 100k
  prompt tokens at the conditional 5, never the base card's 10.
- Check: "B4a: a request above the conditional threshold falls back to the base card, which never
  inherits the conditional band" - 300k at the base 10 gives 3.00, not the 3.75 a ladder that read
  the conditional row as a band would produce.
- Check: "B4a: a conditional card above its threshold prices the whole request at its own rates" -
  300k at the above-threshold 40 gives 12.00.
- Check: "B4a: a request inside an above-threshold card's bound keeps the base card" - 100k at the
  base 10 gives 1.00.
- Check: "B4a: the fixture's priced money sums to the exact total" - the session's priced money is
  29.80 over all 11 calls.

## Fixtures

- A fresh OS tmpdir ledger opened through `Open`, priced from a two-row config book (test/plain at
  input 2 output 4, test/cached with a 0.5 cache-read rate) plus a `peak` price window covering UTC
  hours 12 to 18.
- Hand-inserted card rows for the four dimensions the config book cannot carry - the windowed card
  (a peak floor and band at 2026-01-01, an off-peak probe band at the same date, a newer generic row
  at 2026-02-01), the region-specific card (a `us` row at 2026-01-01, a generic row at 2026-02-01),
  the tiered card (0 to 200k at 3, above at 6) and the two conditional cards (a base card plus one
  `condition:at-or-below` row at 150k, and a base card plus one `condition:above` row at 150k).
- The call set is replayed as one session log through `Drain` at 2026-03-01: eleven
  assistant/message records, one per step, so the ledger books eleven calls at turn one. The reader
  answers the envelope and the report answers its coverage read.

## Expected count

14 PASS.
