# Seed

The P3 OFFLINE SEED: the deterministic warm start of the learned knowledge, with no LLM and no session history.

## The seed source

- **An EXPLICIT pack's canonical candidates.** Every target of the pack's `search/` families whose prior is 1.0 (the "canonical location" tier) is seeded, including a glob target such as the package families.

    The illustrative `<...>` placeholders, the rows marked `family: true`, and the fallback tiers (prior 0.6 / 0.3) stay cold.

- **The REPO'S OWN INDEX (the graph projection).** A canonical candidate the graph proves is seeded twice (count 2 / followed 2) instead of once.

The row is the ordinary `KnowledgeRow` with the `seed` marker set.

The seed never overwrites an existing row, runs only with `learn` and `seed` on and the plugin enabled, and does not save: the next real write (an emit, a follow, a dismissal) persists it, so a cold start leaves no file behind.

The literal built-in pack is retired, so a workspace without `.dsh/pack.yml` seeds nothing at all.

## Scenarios

- S1: the canonical rows of an explicit family fixture are seeded with their markers and the `seededAt` stamp, the placeholder / the aggregate / the fallback stay cold, and no stat moves.
- S2: a graph-proven row is seeded twice.
- S3: an existing row wins over the seed, and a second seed run moves no count.
- S4: the seed writes no knowledge file.
- S5: the apply-time seed reads only an explicit pack, so a workspace with none keeps `seed: false` and no rows.
- S6: `learn: false`, `seed: false`, and a disabled mount keep the deterministic cold start.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`activated (bundle 0.2.1, history, threshold 0.75)` only, because the seed adds no line.

## Expected count

11 PASS.
