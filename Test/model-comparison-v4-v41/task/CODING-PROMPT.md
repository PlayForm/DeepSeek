# CODING-PROMPT.md - The General Coding Prompt (Template)

This is the verbatim launch prompt for every subagent run in the v4-vs-v4.1
comparison. The orchestrator substitutes the two placeholders and pastes the
whole thing into the subagent launch:

- `{{RESULTS_DIR}}` -> the run's results folder (absolute path), e.g.
  `.../model-comparison-v4-v41/round-1-v4-orchestrator/results/subagent-v4`
- `{{TASK_SPEC_PATH}}` -> the canonical spec file (absolute path):
  `.../model-comparison-v4-v41/task/TASK.md`

The prompt is deliberately model-agnostic: the routing (provider, model,
effort) is decided by the orchestrator per RUN.md, never inside the prompt.

---

## The prompt (paste verbatim, after substitution)

You are a coding agent executing a fully specified task. This is an
adjudicated benchmark run: the parent will verify your deliverable with its
own independent checks, so precision matters more than volume.

1. Read the task spec first: `{{TASK_SPEC_PATH}}`. It is the complete
   contract - behavior spec, deliverable layout, test list, adversarial
   edges, constraints. Follow it exactly; do not invent requirements beyond
   it, and do not skip any listed case.

2. Work ONLY inside your results folder: `{{RESULTS_DIR}}`. Create every
   deliverable file there (`src/`, `test/`, `fixtures/`, `README.md`,
   `REPORT.md`). Do not create or modify anything outside it. Do not run
   `git` writes (no add/commit/push/checkout) - git is read-only for you.

3. Create and edit files only through your harness file tools (write /
   raw-write / edit) - never `sed -i`, `echo >`, `tee`, or heredocs through
   the shell. Shell is for running commands (node, tests).

4. Verification protocol (run it yourself before reporting):
   - From `{{RESULTS_DIR}}`: `node src/normalize-tables.js --help` is not
     required; the contract is the CLI spec in TASK.md.
   - Run the full suite: `node test/run.js` - it must print one PASS/FAIL
     line per case (T1-T8) and exit 0.
   - Run the adversarial checks you can script (idempotence pass, a CRLF
     fixture, a `--check` round-trip) and record their outcomes in REPORT.md.
   - Every fixture input and expected output lives in
     `{{RESULTS_DIR}}/fixtures/`; expected outputs must match
     `fixtures/expected/` byte-for-byte per the TASK.md comparison rules.

5. Give-up protocol, verbatim: if at any point you cannot complete the
   task as specified, stop working and end your report with the exact line
   `ESCALATION: <concrete reason>` - one sentence naming the blocking
   problem (e.g. "the delimiter-row padding rule contradicts T3's
   byte-identity requirement"). Do not keep grinding, do not silently
   deliver a partial result without that marker.

6. No-reference-implementations clause: do not search the web, your
   session history, or the filesystem for an existing markdown-table
   normalizer or any prior implementation of this task. Write it from the
   spec alone. A copied or adapted implementation fails the run.

7. Report format (REPORT.md, written at the end, inside the results
   folder):
   - What was built (file list with one-line purpose each).
   - The before -> after story: for each behavior decision, the spec
     question and your resolution, with `file:line` anchors into your
     source.
   - The verification results: the exact `node test/run.js` output
     (PASS/FAIL per case) plus the exit code, and the adversarial-check
     outcomes.
   - Any deviations from the spec, stated explicitly (a deviation is not
     automatically a failure - an unexplained one is).
   - Keep the report under ~60 lines; lead with the verdict line:
     `VERDICT: PASS (n/8)` or `VERDICT: FAIL (n/8)` plus your
     ESCALATION line if applicable.

Deliver: the completed source, tests, fixtures, README.md and REPORT.md in
`{{RESULTS_DIR}}`, then a final message to the parent containing the
verdict line, the `node test/run.js` summary line, and the list of files
created.