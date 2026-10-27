---
title: The completion spec - the core, the existing family and the ETS twins
category: Plans/Completion-Spec
kind: living-plan
date: 2026-10-23
status: active
registry: Documentation/Plans/Completion-Spec/05-CORE-EXISTING-ETS.md
index: Documentation/INDEX.md
statuses:
    - name: the core and existing family deltas
      state: draft
      evidence: the sections below; the tilde fix landed in the core and the factory
---

# THE COMPLETION SPEC - THE CORE, THE EXISTING FAMILY AND THE ETS TWINS

> The shared core, the factory, the 14 pre-existing plugins that already run live, and the twin
> strategy that keeps the two release trees honest.

## 1. lib-dsh-core (A)

- Now: the pure harness-free commonalities, which hold the dependency-section list, the exclusion
  segments, the suppression composer, the update-policy loader, the refusal guard, and the `Expand`
  helper (landed).
- Target: the pure half of the trace vocabulary (the envelope types and the coalescing key), the
  pure half of the pack resolution (merge, extends, and cycle guard), and the decision-record type,
  all pure, with no harness, and usable outside DSH.
- Acceptance: the merge and extends fixtures, the coalescing key fixtures, and a tree that stays
  dependency-free.

## 2. plugin-dsh-factory (A)

- Now: the State builder, the ledger that now expands `~`, the exclusion match, the policy loader,
  the version-guarded write, the observation refresh, the detached continuation, the jobs and
  storage effects, the Schema factory, and the probe-once seam.
- Target: the policy-block schema helper (D6), the pack seam that resolves the pack for the current
  workspace, the trace seam where an adapter registers from a module, and the decision-record helper
  (D8), while every existing ledger string stays byte-exact.
- Acceptance: a plugin that declares a policy block gets the defaults, a pack override lands on the
  next judged call, and the ledger round-trips through the expanded path.

## 3. The 14 pre-existing plugins (live today)

They are complete against their own plans, and the completion program adds the cross-cutting layers
and never rewrites behaviour:

| Package                                                              | The delta                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| hook-dsh-package-governor                                            | the policy block (auto/approve per update class); the trace emit on a governed write |
| hook-dsh-package-pinner                                              | the policy block; the update-cooldown field stays                                    |
| hook-dsh-cargo-governor                                              | the policy block; the cargo-specific fields stay                                     |
| plugin-dsh-normalize-file                                            | the log path; the policy block (a normalize write is auto inside the pack)           |
| hook-dsh-normalize-{dash,quotes,ellipsis,spaces,invisible,fullwidth} | the log paths; the trace emit on a rewritten tool argument                           |
| hook-dsh-ccr                                                         | the log path; the journal compaction stays; the trace emit                           |
| hook-dsh-tool-coach                                                  | the log path; the notes' persistent flag stays; the trace emit                       |
| hook-dsh-live-containers                                             | the log path; the templates stay; the trace emit on a plant                          |

Acceptance per package: its existing smokes stay byte-identical, the new fields are in the schema,
the patch row, the README and SCHEME, and the profile row, and the live test plan passes.

## 4. The ETS twin strategy (the user's release decision: local only, no bumps)

- The twins mirror every behaviour change, with byte-identical ledger strings.
- The generator (`Maintain/generate-ets-planned.mjs`) is NOT re-run blindly, because it would
  overwrite the hand-ported ETS batch-edit Shield fix. The strategy is a mirror lane per wave that
  applies the changed files by hand, or extends the generator with an exclusion list, and then
  builds the ETS tree and runs the aggregate.
- The new packages of this program (`lib-dsh-trace`, the pack loader, and the policy helper) get
  their ETS twins in the same wave that lands them in Classic, or in wave 5 when the schedule of the
  wave requires it.
- Acceptance: `pnpm run build` is green for both trees, the aggregate prints every suite passing,
  and the ledger strings of the twin diff clean against the Classic strings.

## 5. The core's acceptance gate

The core is complete when the trace, pack, and policy primitives exist as pure library code, the
factory exposes the three seams, every pre-existing plugin carries the cross-cutting layers without
a behaviour change, and both trees are green with the twins in step.
