# Cache

What this test verifies.

## Intent

`Mass` + `Allocate` - the cache split (Documentation/Plans/COST-TRACK-PLUGIN.md sections 2.2 and
2.3): prompt caching is prefix-based, so the surface is walked in order and the first
`cacheReadTokens` worth of nodes are the cached ones; each file then carries an uncached mass and a
cached mass, the amortized input splits per bucket instead of by one blended ratio, and the
conservation law still holds to the cent.

## Scenario

- Check: "C1: the first node fills the budget and the second stays uncached" - the surface is 20,
  the cached surface 10, and PerPath keeps the total mass per file.
- Check: "C1: the cached and uncached masses split per file" - a.ts is entirely inside the cached
  prefix, b.ts carries no cached mass.
- Check: "C2: the cached input follows the cached mass, the uncached the rest" - with uncached
  input 8 and cached input 2, a.ts amortizes 2 and b.ts amortizes 8.
- Check: "C2: the conservation law still holds with the cache split" - the rows sum to the call's
  price within 1e-9 (asserted by the allocator itself).

## Fixtures

- The shared harness counter and the validated default config; a synthetic replay of two file
  reads whose tool results are the surface, priced by a fixed ten-token estimator; no ledger file -
  `Mass` and `Allocate` are pure functions.

## Expected count

4 PASS.
