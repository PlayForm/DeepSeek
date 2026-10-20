# The Adjudication Protocol (Keeps `low` Safe - This Is Mandatory)

> Source: SKILL.md, section 5 "Adjudication protocol", steps 1-5. This
> is the mechanism that makes cheap `low` exploration safe to accept.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every delegated result is verified by the parent BEFORE being accepted:

1. **Docs-over-disk rule**: whenever a report claims a file/directory
   exists, verify against the filesystem (`ls`, `test -e`,
   `git ls-tree`). NEVER trust README/AGENTS.md claims over disk.
   Measured failure: the `verify_tokens.py` stale-doc claim was repeated
   by 4 of 6 explorer runs (only max-effort runs and one low run checked
   disk).
2. **Spot-check novel claims**: 2-3 shell checks per report on anything
   surprising (paths, counts, commit hashes, file existence).
   Hallucination patterns to watch: name-association (a "Next" directory
   claimed to be Next.js when it is a Rust crate), phantom paths
   (`e/Branch/Current/...` that does not exist), stale doc references.
3. **Coding adjudication**: build it yourself + run the test battery +
   run edge cases BEYOND the spec's list. The v1 `high` replica's lock
   flaw (false timeouts on non-repo dirs) was only caught by an extra
   edge case, not by its own tests.
4. **Cost measurement**: token usage is in each subagent's session log
   (`~/.dsh/sessions/<workspace>/<agent-id>/session.v4.jsonl.zstd`,
   `data.usage` per assistant message: `inputTokens`, `outputTokens`,
   `cacheReadTokens`). Extract and report costs for any benchmark.
5. **Never** spend LLM tokens on verification. Shell checks are free and
   deterministic - that is the entire reason `low`-exploration is safe.

## Why: The Full Philosophy

1. **The protocol is the load-bearing wall of the economics.** The
   routing policy sends every exploration to glm-5.3-flash at `low`
   because `low` occasionally hallucinates minor details (measured: 1-2
   per report). That trade is only safe if someone catches those
   details deterministically and for free. The parent's shell checks are
   that someone. Remove adjudication and `low` becomes unsafe; with it,
   mistakes are corrected at the next stage without LLM re-review
   tokens.
2. **Docs-over-disk, step 1, exists because documentation lies by
   being stale.** The measured failure is exact: the `verify_tokens.py`
   stale-doc claim was repeated by 4 of 6 explorer runs; only max-effort
   runs and one low run actually checked the disk. Any claim of file or
   directory existence gets `ls`/`test -e`/`git ls-tree` - disk wins
   over README/AGENTS.md every time.
3. **Spot-checks, step 2, target the named hallucination patterns.**
   Name-association: a directory called "Next" described as Next.js when
   it is actually a Rust crate. Phantom paths: `e/Branch/Current/...`
   cited confidently but nonexistent. Stale doc references: claims
   inherited from old docs rather than current state. Two to three
   shell checks on the surprising claims catch these.
4. **Coding adjudication, step 3, must exceed the child's own tests.**
   The benchmark's v1 `high` replica passed its own test suite while
   carrying a lock flaw (false timeouts on non-repo directories) that
   only an extra edge case beyond the spec's list revealed. Build
   yourself, run the battery, then add edge cases.
5. **Cost measurement, step 4, is the feedback loop.** Each subagent's
   session log at
   `~/.dsh/sessions/<workspace>/<agent-id>/session.v4.jsonl.zstd`
   carries `data.usage` per assistant message: `inputTokens`,
   `outputTokens`, `cacheReadTokens`. Without extracting these, the
   policy's cost numbers (see ./references/benchmark-evidence.md)
   could never have been derived - and future re-benchmarks need the
   same extraction.
6. **Step 5 is the inversion that makes it all work: verification is
   free, so verification is mandatory.** Shell checks cost nothing and
   are deterministic; LLM re-review costs tokens and is not
   deterministic. The policy's entire price advantage rests on never
   buying LLM verification.

## Examples

### Good

- Explorer claims `src/hooks/useAuth.ts` exists -> `test -e src/hooks/
  useAuth.ts` before accepting the claim.
- Explorer says "the repo has 42 crates" -> `ls crates | wc -l` as one
  of the 2-3 spot-checks.
- Coding delegate reports success -> parent runs the build, the spec's
  battery, then adds a stale-lock and an empty-input edge case.
- Benchmark run -> parent extracts `inputTokens`/`outputTokens`/
  `cacheReadTokens` from each session log and reports the cost.

### Bad

- Accepting "the migration guide says the flag exists" without checking
  disk - docs lose to disk, always.
- Spot-checking zero claims because the report "reads confidently".
- Accepting a coding result because the child's own tests passed.
- Paying for an LLM pass to "double-check" the explorer's summary -
  that is exactly what step 5 forbids.

## Exceptions

- None to the mandatory nature: adjudication is required for every
  delegated result, exploration and coding alike.
- Depth may scale with risk (a one-line claim may need one check; a
  surprising architecture claim needs the full 2-3), but step 5 holds at
  every depth: no LLM tokens for verification.

## Failure Modes

- **Adjudication skipped**: results accepted unread. Cost: hallucinated
  details propagate into decisions - the exact failure `low` routing
  cannot survive.
- **Trusting docs over disk**: repeating the measured 4-of-6 stale-doc
  failure. Cost: decisions built on nonexistent files.
- **Edge cases skipped in coding adjudication**: the lock-flaw class of
  bug ships. Cost: failures found by users, not by tests.
- **LLM verification creep**: "just one quick model check" of a report.
  Cost: destroys the free-verification economics the whole policy
  stands on.

## Arbiters

- Acceptance discipline itself: a result accepted without a logged
  verification pass is a protocol violation.
- Cost numbers in any report/benchmark must trace to `data.usage`
  fields in real session logs at the documented path; invented cost
  numbers are detectable by re-extraction.
- For coding results: the parent's own build + battery + extra edge
  cases must exist as runnable commands, independent of the child's
  test suite.
