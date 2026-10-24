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

> How a plugin becomes DONE, and how the 35 disabled rows come back one at a time. The user's
> decision (D6 of the interview): enable one plugin, restart, a subagent runs the plugin's live test
> plan plus its smokes, reports back, then the next plugin.

## 1. The four acceptance checks

A plugin is complete only when all four pass:

1. PLAN: every non-later-stage item of its own plan is implemented; the deferred items are listed in
   its SCHEME/README with a reason, never silently dropped.
2. SMOKES: every folder passes with byte-exact ledger strings; every new capability has a folder;
   the README's `## Expected count` matches the printed count; the folder count never shrinks.
3. BUILD: the package builds with the repo's full chain in Classic and its ETS twin builds too. 3b.
   TYPES: the package passes the honest repo-level type gate, `node Maintain/Run-Types.mjs` (also
   `pnpm test:types`), which runs `tsc -p Configuration/TypeScript.noemit.json --pretty false` in
   every package of both trees and fails (exit 1) if any package has diagnostics;
   `--tree classic|effect-ts` scopes the run. The build alone is NOT a type gate: the Build tool's
   TypeScript step logs diagnostics without failing, and `prepublishOnly` checks only
   `Source/Test/**`.
4. LIVE: the plugin's live test plan (Documentation/Testing/<package>.md) has been executed against
   the running app; the report is recorded; the user has not rejected the behaviour.

## 2. The activation loop (one plugin at a time)

    pick the next disabled row
      -> flip its profile row to enabled: true (the config file, by an agent)
      -> the user restarts the app
      -> a subagent runs the live test plan + the package's smoke folders
      -> the subagent reports: activation proof, the exact ledger lines, the live observations
      -> the Lead verifies read-only (the ledger file now exists and carries the activation line)
      -> the row stays enabled; the next row starts

Rules:

- Never enable two plugins in one restart: a live failure must be attributable to one plugin.
- The activation proof is the ledger line: the plugin's log file must exist at
  `~/.dsh/playform/<package>.log` and carry the byte-exact `activated (...)` line.
- A failed live test disables the row again and the defect goes back to a lane; the next plugin does
  not start until the row is green or explicitly deferred by the user.
- The restart is always the user's action; an agent never restarts the app.

## 3. The live test plan (per plugin)

`Documentation/Testing/<package>.md` carries: the identity, the activation checks, the T1-T5 cases
(the exact triggers and the expected outputs), the known gaps, the fix loop, the report stub. A lane
executing it fills the stub with: the tests run, the defects (file:line - cause - fix), the
rebuild/smoke result, the residuals.

## 4. The dogfood scenarios (the cross-plugin acceptance)

Beyond the per-plugin plans, the program's end-to-end scenarios:

1. THE FOREIGN REPO: open a session in a repo without a pack; the suggesters stay silent with the
   `foreign-workspace` abstention; no note names a path from another repo.
2. THE PACK BOOTSTRAP: a repo with a proposed pack; the learner proposes it, the user approves, the
   notes follow the pack.
3. THE INDEX LOOP: `workspace_index` populates the graph; `workspace_map` returns the real map; an
   edit re-indexes through the trace; the context packet carries the new node.
4. THE BATCH LOOP: a batch proposal is approved, applied, journaled and reverted; every ledger line
   is present and byte-exact.
5. THE QUEUE: a queued task actually starts a subagent; the seat is released; the restart
   reconciles.
6. THE SUGGESTION LOOP: an accepted note raises the companion's rank on the next call; a rejected
   one lowers it; the weights survive a restart.
7. THE PANEL: a host plugin's status renders in the panel; a config form edits a volatile knob; the
   live tab shows a trace event.

## 5. The records

- `Documentation/Plans/POC-LEDGER.md` - the live matrix and the log; the Lead updates it after every
  accepted lane (the evidence, not the prose).
- `Documentation/Testing/<package>.md` - the per-plugin live report.
- `Documentation/INDEX.md` - the registry row for every new document; the doc graph stays coherent.
- The user commits; every lane ends READY-TO-COMMIT with the exact file list and a message.

## 6. The verification gate for the program

The program is complete when: both trees build; the aggregate smoke run is green (every folder in
both trees); every plugin's live test plan is recorded; the seven dogfood scenarios pass; the 35
rows are either enabled (verified live) or explicitly deferred by the user; and the profile carries
every documented option for every row.
