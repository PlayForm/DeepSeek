---
title: The Batch Edit Tool - the package form and the governance risks
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/PACKAGE-AND-GOVERNANCE.md
index: Documentation/INDEX.md
statuses:
	- name: the package anatomy (@playform/plugin-dsh-batch-edit)
		state: open
		evidence: this document only - the planned plugin form
	- name: the recursive governance risk and the govern actor marker mitigation
		state: open
		evidence: this document only; Gate.ts route 2 - re-route, never bypass
	- name: the no-client-half v1 decision
		state: resolved
		evidence: this document only - presentationMeta alone (the cookbook path) in v1
---

# THE BATCH EDIT TOOL - THE PACKAGE FORM AND THE GOVERNANCE RISKS

> Granular section of the Batch Edit Tool feature research (R-BET-1). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. This document carries section 6 of the research,
> byte-preserved.

---

## 6.1 The anatomy

`@playform/plugin-dsh-batch-edit` is a tool-primary plugin, and it carries the `plugin-` prefix
because a tool is the primary surface, like plugin-dsh-factory:

- **Source/Library.ts** - the loader contract: `name`, `apply`, `Config`,
  `inject = ['pluginFactory', 'tools', 'fs', 'jobs', 'systemPrompt', 'shell', 'shellEnv', 'workingDirectory']`
  on the default object (the default-object-shadows pitfall).
- **Source/Function/** - Apply.ts (registration only), Machine.ts (the state machine and the process
  cells), Ops.ts (the transition-table executor), Tools.ts (the `batch_edit` defineTool), Present.ts
  (the state presentation), and Ledger.ts (the strings).
- **Source/Variable/** - Config.ts (all volatile) and the DefaultCheckSets.ts reuse.
- **Source/Interface/** - State.ts, Process.ts (Process<File>), and Events.ts.
- Config (all volatile, hot-editable, with the P10 refresh): enabled (default false, which is the
  IDLE-forever posture like the live containers), machinesPerAgent, opsPerCommit, deadlineMs (<=
  120000), strictMode (search-not-found errors against skips), interceptBash (off by default in v1),
  and monitorChecksets.
- **No client half in v1**, because the Web UI gets the diff card through `presentationMeta` alone
  (the cookbook path), and a client plugin is later work and not a dependency.
- The smokes: the fake-ctx + real-factory harness pattern (smoke-writing), every timing transition
  driven by the fake clock, the vacuously-green trap guarded, and the Classic/EffectTS parity per
  the family discipline.

## 6.2 The risks and the mitigations

| Risk                                                                         | Reality                                                                                                               | Mitigation                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Recursive governance: the batch's writes fire fs/observed INTO the governors | REAL if the writes run the plain waterfall path - the governors would try to govern package.json/Cargo.toml mid-batch | Use the **`govern` actor marker** (Gate.ts route 2): the batch tool wraps its actor with the `govern` field, runs the selected steps ITSELF through the factory's direct path (Govern + RegisterGovern), and the event path skips the marked events silently. The Stash idempotence gate (route 5) catches re-emits. Never bypass governance - RE-ROUTE it deliberately. |
| Tool-schema limits                                                           | defineTool is flat-typed; no nested objects                                                                           | The flat field set (the schema document) + the `opfile` ingest escape hatch (the report grammar, no schema limit)                                                                                                                                                                                                                                                        |
| Event-loop hazards                                                           | fs/observed listeners MUST be synchronous, side-effect-only; the emit is unguarded (filesystem.md:185)                | The machine's fs/observed listener only flips cells and enqueues; ALL async work (reads, previews, writes) runs at checkpoints or through ctx.jobs - the no-timers discipline verbatim                                                                                                                                                                                   |
| Waterfall hazards                                                            | A throwing listener breaks the tool pipeline; missing next() swallows downstream behavior                             | next() FIRST everywhere; fail-open try/catch with a logger.warn; never deny in v1 (advisory intercept only)                                                                                                                                                                                                                                                              |
| Deadline vs the inline cap                                                   | The model's call has its own deadline                                                                                 | deadlineMs capped at 120000; overflow continues as a background job with the typed jobId handle (the cookbook's background branch)                                                                                                                                                                                                                                       |
| Stale-version races                                                          | A held file changes between insert and commit                                                                         | The held version is checked at commit time; a mismatch HALTS the file (not the machine) and re-presents state - the halted process, protected and resumable                                                                                                                                                                                                              |
| The scope-of-ambition risk                                                   | "Eliminate bash entirely" cannot be enforced by this plugin alone                                                     | v1 is OPT-IN (enabled=false default), advisory interception, the layered-government roadmap: one control layer per plugin, fs/write-intent slot ownership being the future enforcement plugin's job                                                                                                                                                                      |
| KV-cache cost                                                                | A chattering state section fragments the prompt cache                                                                 | The silence invariant (the state-machine document) as a HARD contract with smoke assertions                                                                                                                                                                                                                                                                              |
