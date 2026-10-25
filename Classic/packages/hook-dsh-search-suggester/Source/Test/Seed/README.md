# Seed

The P3 OFFLINE SEED: the deterministic warm start of the learned knowledge
at load, with no LLM and no session history.

## The seed source

- the BUILT-IN pack's canonical candidates - every target of the ten
  search intents whose prior is 1.0 (the "canonical location" tier),
  including a glob target such as the package families; the illustrative
  `<...>` placeholders, the rows marked `family: true` and the fallback
  tiers (prior 0.6 / 0.3) stay cold;
- the REPO'S OWN INDEX - the graph projection: a canonical candidate the
  graph proves is seeded twice (count 2 / followed 2) instead of once.

The row is the ordinary `KnowledgeRow` with the `seed` marker set. The seed
never overwrites an existing row, runs only with `learn` and `seed` on and
the plugin enabled, and does not save: the next real write (an emit, a
follow, a dismissal) persists it, so a cold start leaves no file behind.

## Scenarios

- S1: the canonical rows are seeded (34 rows across the ten intents: 10
  Version, 2 Path, 3 Ledger, 3 Config, 3 Dependency, 3 Test, 3 Symbol, 2
  Doc, 2 Usage, 3 Owner); no stat moves and no file is written; the family
  globs and the fallback tiers are not rows.
- S2: a graph-proven row is seeded twice.
- S3: an existing row wins over the seed.
- S4: the first real save persists the seeded knowledge (`seed: true`, the
  seeded row markers, the emitted stat).
- S5: `learn: false`, `seed: false` and a disabled mount keep the
  deterministic cold start.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`activated (bundle 0.2.0, intents 10, threshold 0.75)` only - the seed adds
no line.

## Expected count

9 PASS.
