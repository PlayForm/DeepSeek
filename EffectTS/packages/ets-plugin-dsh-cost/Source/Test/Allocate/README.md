# Allocate

What this test verifies.

## Intent

`Allocate` - the attribution model (Documentation/Plans/COST-TRACK-PLUGIN.md section 2): one call's
price split into the direct half (the output side, weighted by changed bytes over the files the step
wrote) and the amortized half (the input side, weighted by per-file context mass), plus the one
unattributed row that absorbs the shared remainder.

## Scenario

- Check: "A1: the rows sum to the call's price within 1e-9 (the conservation law)" - the allocator
  itself asserts section 2.3; a violation throws.
- Check: "A1: the written files split the output half by changed bytes" - 30/10 deltas split an
  output of 8 into 6 and 2.
- Check: "A1: a file read early still carries its amortized mass into a later call" - a 50-token
  mass of a 100-token surface keeps half the input of a call that touches nothing.

## Fixtures

- The shared harness counter and the validated default config; no ledger file - the allocator is a
  pure function over the priced call, the touches and the mass.

## Expected count

3 PASS.
