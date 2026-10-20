# The Spec-Writing Rules (The Parent Writes the Coding Prompt)

> Source: SKILL.md, section 4 "Coding protocol", "Spec-writing rules"
> bullets. This file carries the full philosophy; SKILL.md only points
> here.

## The Rule

Spec-writing rules (the parent writes the coding prompt):

- Every coding task ships with a verification protocol: build command +
  explicit test cases + expected outputs, including adversarial edge
  cases (non-repo dirs, permissions, empty inputs, stale locks,
  binary/UTF-8 input). Deterministic test batteries are free to run -
  always include them.
- Every coding prompt MUST instruct: "If you cannot complete this task,
  do NOT silently give up - end your report with a section starting
  exactly with `ESCALATION: <concrete reason>`." This marker is what
  triggers the failover.
- Forbid the subagent from reading reference implementations when the
  task is a replication benchmark.

## Why: The Full Philosophy

1. **The verification protocol is the contract.** A coding prompt
   without a build command, explicit test cases, and expected outputs is
   not a spec - it is a wish. The protocol is what makes the parent's
   adjudication objective (re-run the same battery) and what makes
   "done" decidable by anyone, including a future session.
2. **Why adversarial edge cases are mandatory, not optional.** The
   benchmark evidence is concrete: the v1 `high` replica's lock flaw
   (false timeouts on non-repo directories) was only caught by an edge
   case BEYOND the spec's list, not by the spec's own tests. Edge cases
   for the listed classes - non-repo dirs, permissions, empty inputs,
   stale locks, binary/UTF-8 input - are the cheapest bug catchers in
   the whole pipeline because they run deterministically and cost no
   LLM tokens.
3. **Why the ESCALATION instruction is verbatim-included.** The marker
   is a designed protocol string, not a convention the child might
   guess. If the prompt does not carry the exact instruction, a stuck
   child defaults to silent give-up, which is harder to detect (see
   ./references/failure-signals.md). The phrase must start the
   section exactly with `ESCALATION:` so the parent can grep for it.
4. **Why replication benchmarks forbid reference implementations.** If
   the task is to replicate behavior, reading the original reduces the
   test to copying - the replica looks correct without the reasoning
   being exercised. Forbidding it keeps the benchmark honest.

## Examples

### Good

- Prompt: "Implement X. Build: `cargo build`. Tests: `cargo test -- --
  test-threads 1`. Case 1: empty input -> exit 0, no file written.
  Case 2: directory without write permission -> exit 1 with message
  'permission denied'. Case 3: file locked by another process -> skip
  lock, no timeout. Case 4: UTF-8 BOM input -> parsed same as plain.
  If you cannot complete this task, do NOT silently give up - end your
  report with a section starting exactly with `ESCALATION: <concrete
  reason>`."
- Replication benchmark prompt includes: "Do NOT read the original
  implementation; you are replicating behavior from the spec only."

### Bad

- "Implement the feature, make it robust." - no build command, no test
  cases, no expected outputs; not a spec.
- Test list covering only the happy path - the adversarial classes
  (non-repo dirs, permissions, empty inputs, stale locks,
  binary/UTF-8) are mandatory.
- Omitting the ESCALATION instruction "since the agent will figure it
  out" - it won't; silent give-up follows.
- Replication task where the prompt links the original repo "for
  reference" - benchmark corrupted.

## Exceptions

- None to including the three elements. The edge-case list may grow
  per-task (task-specific adversarial cases are encouraged), but the
  listed classes are the minimum, and the ESCALATION instruction is
  always verbatim.
- If a task genuinely has no build (pure text output), the verification
  protocol still exists: it names the deterministic checks that do
  apply (e.g. file existence, format validation).

## Failure Modes

- **Spec without protocol**: the child builds nothing testable; the
  parent cannot adjudicate objectively. Cost: disagreements about
  "done", wasted attempts.
- **Happy-path-only tests**: the flaw class that actually bit the
  benchmark (lock behavior on non-repo dirs) hides until the parent's
  extra edge case runs. Cost: failed deliverables discovered late.
- **Paraphrased marker instruction**: "tell me if you get stuck"
  instead of the exact ESCALATION sentence. Cost: no grep-able trigger;
  silent give-ups.
- **Reference leakage**: replica agent reads the original and copies.
  Cost: benchmark results are meaningless.

## Arbiters

- Prompt review: every coding prompt must contain (a) build command,
  (b) explicit test cases with expected outputs including the
  adversarial classes, (c) the exact ESCALATION sentence; replication
  tasks must contain the no-reference clause.
- The parent's adjudication runs the same battery plus extra edge
  cases (see ./references/adjudication-protocol.md); a spec whose
  battery cannot be re-run is a spec violation.
