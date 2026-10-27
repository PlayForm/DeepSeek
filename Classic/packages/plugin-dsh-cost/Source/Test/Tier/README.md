# Tier

What this test verifies.

## Intent

The marginal tier walk (Documentation/Plans/COST-TRACK-PLUGIN.md section 17.2): a rate card of
tier rows prices a prompt that crosses a threshold marginally - the tokens below the threshold at
the lower rate, only the excess at the higher one - with no cliff where one extra token doubles a
bill, and the walk runs per bucket, each against its own rate column, so a cached prefix that
crosses the same boundary is priced per portion too.

## Scenario

- Check: "T3: a prompt entirely below the threshold prices wholly at the first tier" - 100k tokens
  at the first tier's rate.
- Check: "T3: a prompt crossing the threshold prices the portion below at the first rate and only
  the excess at the second" - 200k at rate 2 plus 100k at rate 4 gives 0.8.
- Check: "T3: a cached bucket crossing the same threshold splits the same way against its own
  rate" - 200k at 0.2 plus 100k at 0.4 gives 0.08.
- Check: "T3: the sum of the portions equals the prompt tokens" - the two portions solve back to
  200k and 100k, summing to the 300k prompt.
- Check: "T3: the walk is marginal, never the cliff of the top rate over the whole prompt" - the
  crossing prompt prices strictly under the flat top-rate price.

## Fixtures

- A fresh OS tmpdir ledger opened through `Open` with an empty config book, seeded by hand with
  two tier rows of one effective-dated rate card (tier one: 0 to 200k tokens at input 2 and cache
  read 0.2; tier two: the open top at input 4 and cache read 0.4).

## Expected count

5 PASS.
