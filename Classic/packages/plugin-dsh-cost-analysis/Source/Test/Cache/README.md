# Cache

What this test verifies.

## Intent

`Analysis.Cache` - the cache efficiency per file (Documentation/Plans/COST-TRACK-PLUGIN.md section
16.4): the share of the file's surface-weighted input tokens the prompt cache served -
`SUM(cacheReadTokens * w) / SUM((inputTokens + cacheReadTokens) * w)`, where `w` is the share of
each call's surface the file occupied (`ContextTokens / SurfaceTokens`) - the measurable half of
"did reading this file make the later edit cheaper".

## Scenario

- Check: "T5: the cache ratio sits between zero and one" - a.ts is read by call 1 and carried by
  call 2's surface, so its ratio is strictly inside (0, 1).
- Check: "T5: the ratio is the cached over the cached plus uncached tokens" - call 2 reads 40 of
  its 100 input tokens from the cache and a.ts occupies half of its surface, so the weighted cached
  tokens are 20 against 50 weighted input tokens and the ratio is 20 over 50.

## Fixtures

- A temporary ledger under the OS tmpdir (removed afterwards), built by importing the sibling
  ledger package's `Open` and `Drain` from its Target: one client, one price row (input 1, output
  2, cache read 0.1 per million), one session whose read of a.ts precedes a cached call whose
  surface carries a.ts.
- The analysis plugin's own `Open` and `Analysis` over that ledger, read-only, through the shared
  harness counter.

## Expected count

2 PASS.
