# Resume

This test verifies the following behavior.

## Intent

`Resume` is the recovery rule every workspace counter shares: a value restored from storage raises the in-memory counter but never lowers it.

It is its own folder because the rule is a contract shared by five recovery clauses over five different storage shapes, where a change here silently changes what every module restores after a restart.

## Scenario

- Group: Resume - the monotonic recovery rule (raise, never lower, no-op).
    - Check (one ok group): the three cases.
        - Leaf: a recovered value above the current one wins.
        - Leaf: a recovered value below it is ignored.
        - Leaf: an equal value is a no-op.

## Fixtures

None.

The test makes pure function calls against the REAL built `Target/Library.js`, with no fs, no ctx, and no factory.

## Expected ledger strings (byte-exact)

None. The helper writes no line.

## Edge cases

- A zero current value with any positive recovery takes the recovery.
- The rule is one-directional on purpose: a counter that moved down after a restart would reissue ids.

## Expected count

1 PASS.
