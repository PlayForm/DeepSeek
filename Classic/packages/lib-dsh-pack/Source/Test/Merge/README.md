# Merge

This folder covers the pack merge rules in isolation (pure object fixtures, no filesystem).

## Scenarios

- M1: families merge by id, and the override's priority, threshold, note, and signals replace the base's.
- M2: targets merge by path, where a same-path target replaces the base row in place and a new path appends in override order.
- M3: a family absent from the override is kept, and a new family key is added.
- M4: arrays replace (the override's signature list wins).
- M5: nested section objects (`indexer`) merge key by key, and arrays inside them replace.
- M6: the `policy` map merges per action.
- M7: a duplicate path inside the override keeps the last override row.
- M8: an override with no families keeps the base families.

## Expected count

8 PASS.
