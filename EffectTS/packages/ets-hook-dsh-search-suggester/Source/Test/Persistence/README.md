# Persistence

The plan's suite 6 covers the knowledge file: the atomic write, the documented JSON schema, the reload, and the corruption fallback.

## Scenarios

- P1: an emit writes the file atomically (temp + rename, no `.tmp` left) with mode 0600, and the JSON carries the documented top-level keys (`schema`, `intents`, `journal`, `dismissals`, `seed`, `seededAt`, `stats`), schema 1, the seeded rows, the journal entry, and the stats.
- P2: the saved knowledge reloads (stats, seed marker, rows, journal).
- P3: a corrupt file degrades to the cold start (with `seed: false`, the observable empty state), still emits from the static pack, and is overwritten by the next save.
- P4: a foreign schema (schema 2) degrades to the cold start.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`suggest Version 0.92 7 candidates` (the emit that writes the file).

## Expected count

8 PASS.
