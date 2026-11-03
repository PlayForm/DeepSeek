# Persistence

The plan's suite 6 covers the knowledge file: the atomic write, the documented JSON schema, the reload, and the corruption fallback.

## Scenarios

- P1: an emit writes the file atomically (temp + rename, no `.tmp` left) with mode 0600, and the JSON carries the documented top-level keys (`schema`, `intents`, `journal`, `dismissals`, `seed`, `stats`), schema 1, the learned `History` rows, the journal entry, and the stats.
- P2: the saved knowledge reloads (stats, the seed marker, the rows, the journal).
- P3: a corrupt file degrades to the cold start, still emits from the session history, and is overwritten by the next save.
- P4: a foreign schema (schema 2) degrades to the cold start.

## The seed marker

The offline seed's source is an EXPLICIT pack, so this workspace (one temp tree with no `.dsh/pack.yml`) seeds nothing: the file carries `seed: false` and no `seededAt` stamp, and the documented optional field appears only after a pack seed (`Function/Seed`).

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`suggest History 0.87 2 candidates` (the emit that writes the file).

## Expected count

8 PASS.
