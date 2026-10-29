---
title: The completion spec - verification, activation and the dogfood loop
category: Plans/Completion-Spec
kind: living-plan
date: 2026-10-23
status: active
registry: Documentation/Plans/Completion-Spec/06-VERIFICATION.md
index: Documentation/INDEX.md
statuses:
    - name: the verification protocol
      state: draft
      evidence: this document; the Testing/ plans; the POC-LEDGER section 7
---

# THE COMPLETION SPEC - VERIFICATION, ACTIVATION AND THE DOGFOOD LOOP

> How a plugin becomes DONE, and how the 35 disabled rows come back one at a time. The decision of
> the user (D6 of the interview): enable one plugin, restart, a subagent runs the live test plan of
> the plugin plus its smokes, reports back, and then the next plugin starts.

## 1. The four acceptance checks

A plugin is complete only when all four pass:

1. **Plan.**

    Every item of its own plan outside "later stage" is implemented, and the deferred items are
    listed in its SCHEME and README with a reason and are never silently dropped.

2. **Smokes.**

    Every folder passes with byte-exact ledger strings, every new capability has a folder, the
    `## Expected count` of the README matches the printed count, and the folder count never shrinks.

3. **Build.**

    The package builds with the full chain of the repo in Classic, and its ETS twin builds too.

3b. **Types.**

    The package passes the honest repo-level type gate, `node Maintain/Run/Types/Index.mjs` (also `pnpm test:types`), which runs `tsc -p Configuration/TypeScript.noemit.json --pretty false` in every package of both trees and fails with exit 1 if any package has diagnostics, and `--tree classic|effect-ts` scopes the run.

    The build alone is NOT a type gate, because the TypeScript step of the Build tool logs diagnostics without failing and `prepublishOnly` checks only `Source/Test/**`.

4. **Live.**

    The live test plan of the plugin (Documentation/Testing/<package>.md) has been executed against the running app, the report is recorded, and the user has not rejected the behaviour.

## 2. The activation loop (one plugin at a time)

    pick the next disabled row
      -> flip its profile row to enabled: true (the config file, by an agent)
      -> the user restarts the app
      -> a subagent runs the live test plan + the package's smoke folders
      -> the subagent reports: activation proof, the exact ledger lines, the live observations
      -> the Lead verifies read-only (the ledger file now exists and carries the activation line)
      -> the row stays enabled; the next row starts

Rules:

- Never enable two plugins in one restart, because a live failure must be attributable to one
  plugin.
- The activation proof is the ledger line, so the log file of the plugin must exist at
  `~/.dsh/playform/<package>.log` and carry the byte-exact `activated (...)` line.
- A failed live test disables the row again and the defect goes back to a lane, and the next plugin
  does not start until the row is green or the user explicitly defers it.
- The restart is always the action of the user, and an agent never restarts the app.

## 3. The live test plan (per plugin)

`Documentation/Testing/<package>.md` carries the identity, the activation checks, the T1-T5 cases
with the exact triggers and the expected outputs, the known gaps, the fix loop, and the report stub.

A lane that executes it fills the stub with the tests run, the defects in the form file:line, cause,
and fix, the rebuild and smoke result, and the residuals.

## 4. The dogfood scenarios (the cross-plugin acceptance)

Beyond the per-plugin plans, the end-to-end scenarios of the program:

1. **The foreign repo.**

    Open a session in a repo without a pack, the suggesters stay silent with the `foreign-workspace`
    abstention, and no note names a path from another repo.

2. **The pack bootstrap.**

    A repo carries a proposed pack, the learner proposes it, the user approves it, and the notes
    follow the pack.

3. **The index loop.**

    `workspace_index` populates the graph, `workspace_map` returns the real map, an edit re-indexes
    through the trace, and the context packet carries the new node.

4. **The batch loop.**

    A batch proposal is approved, applied, journaled, and reverted, and every ledger line is present
    and byte-exact.

5. **The queue.**

    A queued task actually starts a subagent, the seat is released, and the restart reconciles.

6. **The suggestion loop.**

    An accepted note raises the rank of the companion on the next call, a rejected note lowers it,
    and the weights survive a restart.

7. **The panel.**

    The status of a host plugin renders in the panel, a config form edits a volatile knob, and the
    live tab shows a trace event.

## 5. The records

- `Documentation/Plans/POC-LEDGER.md` holds the live matrix and the log, and the Lead updates it
  after every accepted lane with the evidence and not the prose.
- `Documentation/Testing/<package>.md` holds the per-plugin live report.
- `Documentation/INDEX.md` holds the registry row for every new document, and the doc graph stays
  coherent.
- The user commits, and every lane ends READY-TO-COMMIT with the exact file list and a message.

## 6. The verification gate for the program

The program is complete when both trees build, the aggregate smoke run is green for every folder in
both trees, the live test plan of every plugin is recorded, the seven dogfood scenarios pass, the 35
rows are enabled and verified live or explicitly deferred by the user, and the profile carries every
documented option for every row.
