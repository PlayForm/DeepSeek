# Benchmark

The P4 REPLAY BENCHMARK (the plan's section 10.5), measured on the HISTORY path: the fixed fifty-call sequence replayed through the REAL built listener with a session history committed through the projection drive per lane, and the emitted notes scored against the companions the fixture says the lane really touched.

## The sequence

`Variable/Sequence` carries five lanes of ten calls (Version, Test, Doc, Config, Symbol), with one agent per lane.

The benchmark re-points each lane's FIRST call at a salted `History/<lane>/anchor.ts` of one temp workspace, and commits that lane's history (the anchor plus four companions under `History/<lane>/`) through the fake registry's eager drive.

Every later call keeps its Sequence path, so it abstains (no adjacency, or no root at all).

## The measured numbers (the recorded baseline)

```
benchmark: calls=50 notes=5 precision=1.00 recall=1.00 first-note=1
```

- notes 5, suggested 20, hits 20 (precision 1.00, because the committed history names exactly the companions the lane touched);
- expected 20, matched 20 (recall 1.00);
- first note at call 1 (the Version lane).

The expected block IS the seed, so a change that loses a companion shows up as a recall drop.

## Scenarios

- B1: one note per lane, four candidates each, the metrics, and the printed line.
- B2: the replay is deterministic, and a second identical run yields the same numbers and the same five `suggest` lines.
- B3: the config floor cannot lower the synthetic family's own 0.75 gate (the same numbers under the default config).

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

Five `suggest History 0.87 4 candidates` lines; no warning.

## Expected count

6 PASS.
