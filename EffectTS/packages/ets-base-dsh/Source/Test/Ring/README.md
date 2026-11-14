# Ring

This test verifies the following behavior.

## Intent

`Ring` is the bounded-collection machine every module with a recent set shares: append one entry, drop from the front until the cap is honoured, return the last entry dropped so the module can ledger it.

It is its own folder because the eviction order is a contract shared by five modules, where a change here silently changes which entry every module's `capped` line names.

## Scenario

- Group: Ring - the bounded ring (append, evict the oldest, honour a shrunken cap).
    - Check (one ok group): the three rules.
        - Leaf: under the cap the entry is appended and nothing is dropped.
        - Leaf: over the cap the oldest entry is dropped and returned.
        - Leaf: a cap that shrank below the array length drops from the front until the bound holds.

## Fixtures

None.

The test makes pure function calls against the REAL built `Target/Library.js`, with no fs, no ctx, and no factory.

## Expected ledger strings (byte-exact)

None. The ring writes no line; the module composes its own through `Capped`.

## Edge cases

- A cap of zero leaves the ring empty and returns the entry just pushed.
- The drop order is oldest first, so the newest `Cap` entries always survive.

## Expected count

1 PASS.
