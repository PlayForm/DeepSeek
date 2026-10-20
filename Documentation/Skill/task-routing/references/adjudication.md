# The Adjudication Protocol

The parent verifies every delegated result before accepting it. This is
what makes `low` exploration safe: cheap models make minor mistakes, and
the parent catches them with free, deterministic checks.

## The five steps

1. **Docs lose to disk.** When a report claims a file or directory exists,
   verify it: `ls`, `test -e`, `git ls-tree`. Never trust a README or an
   AGENTS.md over the filesystem. Measured failure: a stale-doc claim was
   repeated by 4 of 6 explorer runs.
2. **Spot-check 2-3 surprising claims.** Watch for:
   - name association: a directory called "Next" described as Next.js when
     it is a Rust crate;
   - phantom paths: a confident path that does not exist;
   - stale references: claims inherited from old docs.
3. **Coding adjudication.** Build it yourself, run the spec's battery, then
   run edge cases beyond the spec's list. The child's own tests are not
   evidence of correctness.
4. **Cost measurement.** When reporting, extract the token usage from the
   subagent's session log at
   `~/.dsh/sessions/<workspace>/<agent-id>/session.v4.jsonl.zstd`:
   `data.usage.inputTokens`, `outputTokens`, `cacheReadTokens` per
   assistant message.
5. **Never spend LLM tokens on verification.** Shell checks are free and
   deterministic. An LLM "second opinion" on a report is forbidden by the
   economics that justify the routing policy.

## What to check, by result type

| Result type        | Minimum verification                                      |
| ------------------ | --------------------------------------------------------- |
| A path claim       | `test -e` or `ls`                                         |
| A count claim      | the counting command                                      |
| A code change      | build + the spec's tests + one extra edge case            |
| A site change      | `cd Site && pnpm prepublishOnly` + grep the built HTML    |
| A benchmark run    | the same battery, plus the cost extraction                |

## The hallucination patterns

- **Name association.** The model infers a technology from a name.
- **Phantom paths.** A plausible path that was never read.
- **Stale doc inheritance.** A claim true in an old document, repeated as
  current.
- **Count drift.** A number from memory instead of from the command.

## Failure modes

- **Adjudication skipped**: hallucinated details propagate into decisions.
- **Docs trusted over disk**: decisions built on nonexistent files.
- **Child tests trusted**: the lock-flaw class ships.
- **LLM verification creep**: one "quick check" destroys the free-check
  economics.

## The arbiter of the arbiter

A result accepted without a logged verification pass is a protocol
violation. In a review, the transcript must show the checks: the `test -e`
calls, the build, the battery, the extra edge case.
