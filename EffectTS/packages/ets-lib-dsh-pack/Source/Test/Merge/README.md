# Merge

The pack merge rules in isolation (pure object fixtures, no filesystem).

## Scenarios

- M1: families merge by id, and the override's priority, threshold, note, and signals replace the
  base's.
- M2: targets merge by path: a same-path target replaces the base row in place, and a new path
  appends in override order.
- M3: the merge keeps a family that is absent from the override, and it adds a new family key.
- M4: arrays replace (the override's signature list wins).
- M5: nested section objects (`indexer`) merge key by key, and the arrays inside them replace.
- M6: the `policy` map merges per action.
- M7: a duplicate path inside the override keeps the last override row.
- M8: an override with no families keeps the base families.

## Expected count

8 PASS.
