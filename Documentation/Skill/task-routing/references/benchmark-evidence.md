# The Benchmark Evidence (The Numbers Behind This Policy)

> Source: SKILL.md, section 6 "Benchmark evidence". Every number here is
> a load-bearing fact of the routing policy.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The evidence base for the routing policy:

- 27 runs, 3 rounds, 2 task classes (exploration, coding), all
  adjudicated.
- Correctness is identical across `low`/`high`/`max` on BOTH task
  classes.
- Coding `max` cost **6.4x** `low` for identical correctness ($0.112 vs
  $0.018 - 83k vs 11k output tokens; the extra output was report length).
- Exploration `max` cost **5.8x** `low` ($0.065 vs $0.011).
- `high` costs 1.5-3x `low` with no correctness advantage.
- Failover protocol proven twice (qwen death -> `high` replacement,
  clean results both times; exploration and coding).
- At scale the blended cost is ~$50 per billion total tokens (mostly
  cached reads at $0.03/M). Output is 3.3x input price; each 1% of
  output adds ~$5 per billion tokens. Knob choices are worth $5-100 per
  billion tokens.

## Why: The Full Philosophy

1. **Correctness parity is the founding finding.** If higher effort
   bought correctness, routing everything to `max` would be justified.
   It does not: across `low`, `high`, and `max`, correctness is
   identical on both task classes (exploration and coding). Every
   effort-based price difference in the policy is therefore pure waste
   unless a rule explicitly buys something else with it (speed of
   failure detection, depth of planning).
2. **The coding 6.4x gap.** Coding at `max` cost $0.112 vs `low`'s
   $0.018 for identical correctness. The token breakdown explains it:
   83k vs 11k output tokens, and the extra output was report length -
   the model wrote longer, not better. This number is why the coding
   ladder tries `low`/`high` before any `max` involvement.
3. **The exploration 5.8x gap.** Exploration at `max` cost $0.065 vs
   `low`'s $0.011. Same lesson: paying 5.8x for the same correctness is
   why the exploration protocol pins effort at `low` with only one
   narrow exception.
4. **`high` sits in between at 1.5-3x with no correctness advantage.**
   That is why `high` is reserved for routine coding (where retry-after-
   a-`low`-failure is the ladder's second step) and the single
   exploration re-run - not used as a general "safety" upgrade.
5. **The failover was proven, not theorized.** When the qwen model died
   mid-run, the `high` replacement produced clean results both times -
   once for exploration, once for coding. This is the empirical basis
   for trusting the ladder's escalation and replacement steps.
6. **The scale economics.** At scale, blended cost is ~$50 per billion
   total tokens, dominated by cached reads at $0.03/M. Output tokens
   cost 3.3x input price, so each 1% of output share adds ~$5 per
   billion tokens - which is why report length (the 6.4x finding's own
   cause) is itself a cost knob. Knob choices (model, effort, prompt
   size, output length) are worth $5-100 per billion tokens: the policy
   exists to set them deliberately.
7. **All numbers were adjudicated.** The 27 runs across 3 rounds were
   independently adjudicated, and costs were extracted from session logs
   per the method in ./references/adjudication-protocol.md - none
   of these figures are estimates.

## Examples

### Good

- Citing "coding max = 6.4x low, $0.112 vs $0.018" when explaining why
  a routine coding task starts at `high` instead of `max`.
- Using "~$50 per billion tokens blended" in a budget estimate and
  noting the $0.03/M cached-read dominance.
- Re-running a benchmark and extracting costs from session logs before
  updating any number here.

### Bad

- "I used max because it seemed more accurate" - the founding finding
  says correctness is identical; only the cost differs.
- Reporting a cost number that does not trace to `data.usage` fields in
  a session log.
- Treating the numbers as stale and replacing them with intuition
  without new adjudicated runs.

## Exceptions

- None to the findings themselves. The policy's documented exceptions
  (exploration re-run at `high`, archaeology at `max`, explicit-user
  coding `max`) are justified in their own references; they are narrow
  precisely because these numbers are broad.

## Failure Modes

- **Numbers divorced from logs**: quoting benchmark figures without the
  extraction method. Cost: unverifiable claims drift from reality.
- **Over-updating**: re-deriving policy from a single casual run that
  was not adjudicated. Cost: replacing 27 adjudicated runs with noise.
- **Forgetting the cause**: the 6.4x gap came from report length, not
  compute depth - so trimming output length is a real cost lever;
  missing this makes teams fear `max` for the wrong reason.

## Arbiters

- Any future benchmark must use the same protocol: 2 task classes,
  multiple rounds, independent adjudication, costs extracted from
  session-log `data.usage` (inputTokens, outputTokens, cacheReadTokens)
  - see ./references/adjudication-protocol.md.
- The prices quoted here must remain consistent with the catalog in
  ./references/model-catalog.md ($0.15/$0.50/$0.03 for GLM,
  $0.30/$1.20/$0.006 for deepseek-v4.1, $0.44/$1.32/$0.044 for
  deepseek-v4); a mismatch means one of the two
  files is out of date.
- 2026-10-20: the v4-vs-v4.1 comparison
  (Test/model-comparison-v4-v41 - four runs: each model as orchestrator
  and as worker on one shared task) is the v4.1 evidence base; update
  this file with its adjudicated numbers when it concludes.
