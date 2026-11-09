# Fold-And-Format - the model layer folded and formatted

The suite tests the model layer directly against the real built Target: the
formatters and the fold of `Source/Function/Fold.ts` are loaded through the
built `Target/Function/*.js` modules (the shared Harness registers the alias
hooks first, so every alias import inside the built code resolves to the real
Target too), and every assertion runs against that built code, never a
re-implementation.

## Scenarios

- F1: the Price ladder acceptance cases from Design.md section 13.3, verbatim:
  `Price(0, "USD")` -> `$0.00`; `Price(0.0123, "USD")` -> `$0.0123`;
  `Price(0.000123, "USD")` -> `$0.000123`; `Price(1.5, "USD")` -> `$1.50`;
  `Price(1234.567, "USD")` -> `$1,234.57`; `Price(-0.0123, "USD")` ->
  `-$0.0123`; `Price(0.0123, "EUR")` -> `EUR 0.0123`; `Price(null, "USD")` ->
  `-`; `Price(0.0000001, "USD")` -> `<$0.000001`.
- F2: the integer and compact token formatters: `Count(47300)` -> `47,300`;
  `Count(null)` -> `-`; `CountShort(47300)` -> `47.3K`; `CountShort(999)` ->
  `1.00K` (two decimals below 1,000); `CountShort(12000000)` -> `12.0M`;
  `CountShort(null)` -> `-`.
- F3: the percentage and signed-line formatters: `Rate(0.8035)` -> `80.35%`;
  `Rate(0)` -> `0.00%`; `Rate(null)` -> `-`; `Lines(12)` -> `+12`;
  `Lines(-3)` -> `-3`; `Lines(null)` -> `` (the empty string).
- F4: the square-root bar scale: `Share(25, 100)` -> `0.5`;
  `Share(100, 100)` -> `1`; `Share(0, 100)` -> `0`; and the harness body's
  guard `Share(50, 0)` -> `1` (a non-positive scale is a full track).
- F5: folding a response whose `calls` is `[]` returns `turns []`,
  `steps 0`, and the summary object it was given - the same reference, not a
  recomputed copy (Design.md section 10, rule 5).
- F6: one turn with two calls handed to the fold out of step order (the fold
  must sort ascending by step): the cost buckets sum (`total 1`, `input
  0.375`, `cacheRead 0.3125`, `output 0.3125`, `other 0`), the token buckets
  sum (`input 300`, `cacheRead 900`, `cacheWrite 100`, `output 100`,
  `total 1400`), `steps` is `2`, and the turn cache hit is the token-weighted
  rate `(600 + 300) / (600 + 300 + 100 + 200 + 100 + 0)` = `900 / 1300`,
  with the per-step hits `0.75` and `0.6` computed by the same helper.
- F7: the dominant provider and model follow the largest call `cost.total`
  (`model-b` at 1 over `model-a` at 0.25), and the tie rule keeps the earlier
  step's model: two steps with equal money and equal tokens leave `model-a`
  (the first step) on the turn, because a later step must strictly exceed on
  money, or on tokens at equal money, to take over.
- F8: the counters and the mixed marker: one unpriced call (`priced: false`)
  counts `unpriced 1`; one call with `error !== null` counts `errors 1`;
  retries are the sum of `max(0, attempts - 1)` (`attempts 3` plus
  `attempts 1` -> `retries 2`); two steps carrying `USD` and `EUR` set
  `mixed true` and the turn currency is the first step's (`USD`); the
  control turn with two `USD` steps stays `mixed false`.
- F9: the tallies. The file tally keys by path and sums across steps: `a.ts`
  touched by both steps carries `count 2`, `direct 0.375`, `amortized 0.125`,
  `total 0.5`, `lines 15`, and the stage of its largest entry (`write`);
  the sort is total descending then path ascending (`b.ts` 0.875, then
  `a.ts` and `d.ts` tied at 0.5 with the path ascending, then `c.ts`
  0.125); the allocation-only `c.ts` renders its money with `stage null`.
  The tool tally counts each touched file carrying a tool (`edit` 2,
  `write` 2), a count tie sorts by name ascending (`edit`, `write`), the
  untouched `read` tool is absent, and a tool tally row carries `total 0`.
- F10: the fold is total: `Fold({} as any)`, `Fold({ calls: null } as any)`,
  a calls array of non-objects, and a call missing every optional field all
  return a snapshot without throwing - `turns []` with the zero summary for
  the blank and broken envelopes, and one well-formed turn for the sparse
  call (`steps 1`, zeroed buckets, `total 0`, `cacheHit null`, empty
  provider and model, empty tallies, `mixed false`).

## Fixtures

The suite builds its rows locally and folds them through the real fold:

- `Tokens(input, cacheRead, cacheWrite, output)` - a `CostTokens` object
  with `total = input + cacheRead + cacheWrite + output` and
  `reported: null`.
- `Money(total, input, cacheRead, output)` - a `CostBuckets` object with
  `cacheWrite 0`, `reasoning 0` and the computed `other` residual.
- `Call(overrides)` - one full `CostCall`-shaped row (turn 1, step 1,
  `priced true`, `currency "USD"`, `error null`, `attempts 1`, empty
  `files`), spread under the overrides.
- `Touch(path, overrides)` - one `CostFile` row for a call's `files`
  (allocation-only by default: `touched false`, no tool, no lines).
- `Response(calls, summary)` - one `CostResponse` envelope with `ok true`
  and the summary carried into the fold.

Fixtures are cast through `as any` where the shape is intentionally partial
(the strict compiler is on); the fold itself is total, so a fixture that
makes it throw fails its check through the harness's `Check` wrapper rather
than crashing the runner.

## Known blind spots

- The fold never reads the database: the suite folds route envelopes, so the
  ledger read behind them (`Read.ts`, `Serve.ts`, `Fetch.ts`, `Query.ts`) is
  out of scope here. Read and Serve are covered by the live parent check and
  the route suite (`Serve-Route`).
- `Clock.ts` and `Stamp.ts` are local-time formatters; asserting their
  literals would pin the runner's time zone, so this suite does not cover
  them.
- The F7 tie rule is proven only for the full tie (equal money, equal
  tokens); the partial tie (equal money, strictly greater tokens) taking the
  turn over is implemented but not separately asserted.
- The route-side summary (the SQL aggregates and the five-entry `topFiles`
  limit) is carried verbatim by the fold but computed by the reader, so the
  summary's own numbers are out of this suite's scope.
- The view limits (`StepLimit 24`, `FilePillLimit 3`, `DetailFileLimit 100`)
  are the view's constants; the fold accepts every turn the envelope
  carries, so truncation is unexercised here.

## Expected count

10 PASS.
