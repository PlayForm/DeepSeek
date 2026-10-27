# Benchmark

The P4 REPLAY BENCHMARK (the plan's section 10.5): a fixed fifty-call sequence replayed through the REAL built listener and scored against the hand-labeled lane targets, with the numbers printed in the run.

## The sequence

`Variable/Sequence` carries five lanes of ten calls (Version, Test, Doc, Config, Symbol), with one agent per lane.

The first call of each non-Version lane carries its user message (the R12 context word), and the third same-intent call adds the R13 loop credit, which is what lifts the lane over the 0.75 gate of the pack (the section 3.9 arithmetic of the plan).

The expected block is the hand-labeled eventual target set per lane: the canonical sets of the plan plus the long-tail files the lane touched and the pack does NOT name (`Site/Source/pages/setup.astro`, `Documentation/FRAMEWORK.md`, `EffectTS/smokes/README.md`, `Source/Test/Config-And-Activation`, `Target`).

Thus the recall is honest, and a rule change that loses a target shows up as a recall drop.

## The printed numbers (the recorded baseline)

```
benchmark: calls=50 notes=5 precision=1.00 recall=0.70 first-note=1
```

- notes 5, suggested 26, hits 26 (precision 1.00, because the canonical pack has no false positive on these lanes);
- expected 37, matched 26 (recall 0.70);
- first note at call 1 (the Version lane), the first-edit anchor of the plan.

## Scenarios

- B1: one note per lane, the candidate counts per lane (7, 4, 5, 6, 4), the metrics, and the printed line.
- B2: the replay is deterministic, and a second identical run yields the same numbers and the same five `suggest` lines.
- B3: the threshold floor of the config cannot lower the per-intent gates of the pack (the same numbers under the default config).

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`suggest Version 0.92 7 candidates` and the four lane `suggest` lines; no warning.

## Expected count

6 PASS.
