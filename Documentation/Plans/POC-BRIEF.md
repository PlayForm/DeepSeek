---
title: The Planned Plugin Suite - the proof-of-concept brief (the PoC-first delivery)
category: Plans
kind: living-plan
date: 2026-10-22
status: active
registry: Documentation/Plans/POC-BRIEF.md
index: Documentation/INDEX.md
statuses:
	- name: the PoC mode (source first, verification at the end)
		state: complete
		evidence: the 36 Classic PoCs written and build-green; the 30 ETS twins generated and build-green
	- name: the full planned-package scope and the lane groups
		state: complete
		evidence: Documentation/Plans/POC-LEDGER.md - 16 PoC groups + 9 smoke lanes, all reported and verified
	- name: the end-phase verification (build, tsc, smokes, ETS twins)
		state: in-progress
		evidence: Classic build pass 3 51/51 PASS; Classic smokes 82 folders / 1,132 checks green; ETS build 46/46 PASS; ETS smoke sweep 172 PASS / 0 FAIL + one batch-edit twin folder under repair; the aggregate re-run is the last gate
---

# THE PLANNED PLUGIN SUITE - THE PROOF-OF-CONCEPT BRIEF (THE POC-FIRST DELIVERY)

> MISSION (the user's binding directive, 2026-10-22): deliver a proof of concept for EVERY planned
> plugin, FAST. Testing, tsc checking, the smoke suites, and the ETS twins come at the END. The
> lanes write the package and the Source; they do NOT block on builds or tests. The Lead
> orchestrates, verifies, and runs the end-phase. The live matrix:
> Documentation/Plans/POC-LEDGER.md. The route: cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash /
> reasoningEffort low, for every lane.

---

## 1. The laws every lane loads first

| Law             | Path                                            |
| --------------- | ----------------------------------------------- |
| Code authoring  | Documentation/Skill/code-authoring/SKILL.md     |
| Plugin API      | Documentation/Skill/plugin-development/SKILL.md |
| Family contract | Documentation/Skill/plugin-system/SKILL.md      |

Skip the smoke-writing law in the PoC phase, because it owns the end-phase.

The hard rules in short form: content through the write and edit tools only (no sed, awk, perl,
heredoc, or cp); read through the read, grep, and glob tools only; `rm` allowed after the absolute
path is verified; no git mutations; no `pnpm install`; never edit Target/ by hand; one definition
per file; nameless default exports; PascalCase full-word names.

## 2. The PoC mode (binding)

1. **The deliverable is the package directory and its Source implementation.**

    Write a real implementation of the role in the plan and not a stub with TODO-only bodies, and
    where the plan is ambiguous take the smallest faithful reading and record it under DECISIONS in
    the report.

2. **Do NOT write a smoke suite in this phase.**

    Do NOT run `prepublishOnly`, tsc, or the aggregate.

    If the Source is complete and a build costs little, you may run it and report the errors, but
    never block on it and never weaken the implementation to satisfy it.

3. **The family anatomy is still mandatory**: `package.json` (name, version 0.1.0, the
   live-containers shape, the dependencies, `dsh.bundle.patch`), `tsconfig.json`, `Configuration/`
   (ESBuild.ts, Test-ESBuild.ts, TypeScript.noemit.json, TypeScript-Test.noemit.json),
   `Source/prepublishOnly.sh` + `Source/Run.sh` (the live-containers scripts), `Source/Library.ts`
   (the loader contract: `name`, `apply`, `Config`, `inject`; `apply` returns nothing),
   `Source/Function/`, `Source/Interface/`, `Source/Variable/`, `cordis.patch.yml`
   (`enabled: false`), `README.md`, `SCHEME.md`.

4. **The contract details stay mandatory**: the Schemastery Config with all tunables as fields, the
   inject list, the module-owned ledger strings that stay byte-stable, the identity in the four
   agreeing places, and the declaration merging for a provided service.

5. **Self-contained PoC**: declare the shapes of the sibling services in your own `Interface/` from
   the contract of the plan, and do NOT import from sibling workspace packages that may not exist
   yet, because the end-phase wires the real imports.

6. **Report under 40 lines.**

    The context of the Lead is the bottleneck, so a compact and factual report is the contract.

## 3. The anatomy template

Read `Classic/packages/hook-dsh-live-containers` (package.json, tsconfig.json, Configuration/*,
Source/prepublishOnly.sh, Source/Run.sh, Source/Variable/, and Source/Test/Harness.ts),
`Classic/packages/plugin-dsh-factory/Source/Library.ts` for the class Service form,
`Source/Function/Journal.ts` for the storage domain pattern, and `Source/Function/Wire.ts` for the
`ctx.root.on("fs/observed", ...)` pattern.

Write the new files with the write tool, and never copy with `cp`.

## 4. The per-package sources (the knowledge pool)

For each package:

1. **The MANIFEST entry.**

    Grep `Temporary/npm-bootstrap/MANIFEST.json` for the package name, because the entry carries
    `tier`, `tree`, and `provenance`.

2. **The provenance plan document or documents** that the entry names.

3. **The role document** when the package is a workspace role:
   `Documentation/Plans/Workspace-Family/<ROLE>.md` (OBSERVE, OPERATE, MERGE, GOVERN, AUTHORITY,
   JOURNAL, MONITOR, CONTEXT, APPROVE, AUDIT, EVIDENCE, GRAPH, REFLECT, SEMANTICS, LIVE,
   WORKSPACE-AGENT, SHARED-LIBRARY, DATABASES-AND-CLOUD, PITFALLS-LOG, NAMING-BY-ROLE).

4. **The schema and slice decisions**: `Documentation/Plans/WORKSPACE-FAMILY-V4-1.md`, which
   supersedes the corpus where they disagree.

5. **The family map**: `Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md` with the 16
   roles and the orchestration order.

6. **The orchestration plans**: `ROUTING-ENFORCER-PLUGIN.md`, `SUBAGENT-QUEUE-PLUGIN.md`,
   `BATCH-STATE-PLUGIN.md`, `HONEST-FEEDBACK-PLUGIN.md`, `PASS-ON-AND-INGESTER.md`,
   `PATTERN-GRAPH-PLUGIN.md`, `ORCHESTRATION-FAMILY.md`, `BATCH-EDIT-TOOL-FEATURE.md`, and
   `Documentation/Plans/Batch-Edit-Tool/*` for the batch-edit engine.

7. **The suggester family**: `SEARCH-SUGGESTER-PLUGIN.md` plus the
   `Documentation/Plans/Workspace-Family/` role docs where they touch the suggesters.

8. **The UI family**: `UI-FAMILY-V4-1.md` plus `Documentation/Plans/UI-Family/*` for the client
   packages.

9. **The W1 foundation contract**: `Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md` with the
   graph and observe services that the later roles consume.

If the provenance is absent or thin, use the closest sibling plan and record the choice in
DECISIONS.

## 5. The full scope and the lane groups

The target is every 2-planned Classic package and every 3-candidate Classic package.

The ETS twins (26 plus 3) are the end-phase, generated or ported after the Classic set lands.

| Group | Packages (Classic)                                                                                          |
| ----- | ----------------------------------------------------------------------------------------------------------- |
| W1    | plugin-dsh-workspace-graph, hook-dsh-workspace-observe (running)                                            |
| G1    | hook-dsh-workspace-operate, hook-dsh-workspace-merge                                                        |
| G2    | hook-dsh-workspace-govern, plugin-dsh-workspace-authority                                                   |
| G3    | hook-dsh-workspace-journal, hook-dsh-workspace-audit                                                        |
| G4    | plugin-dsh-workspace-context, hook-dsh-workspace-monitor                                                    |
| G5    | plugin-dsh-workspace-semantics, plugin-dsh-workspace-evidence                                               |
| G6    | hook-dsh-workspace-approve, plugin-dsh-workspace-reflect                                                    |
| G7    | plugin-dsh-workspace, lib-dsh-workspace-live                                                                |
| G8    | client-dsh-panel-family, client-dsh-panel-family-host, client-dsh-workspace-live                            |
| G9    | plugin-dsh-batch-edit                                                                                       |
| G10   | plugin-dsh-batchstate, plugin-dsh-gitguard                                                                  |
| G11   | plugin-dsh-route, plugin-dsh-queue                                                                          |
| G12   | plugin-dsh-feedback, plugin-dsh-pass-on, plugin-dsh-ingester                                                |
| G13   | plugin-dsh-pattern, hook-dsh-batch-decision                                                                 |
| G14   | hook-dsh-search-suggester, hook-dsh-edit-suggester, hook-dsh-doc-suggester                                  |
| G15   | hook-dsh-convention-suggester, hook-dsh-graph-suggester, hook-dsh-replay-suggester, hook-dsh-test-suggester |

Rejected and NOT built: `hook-dsh-batch-edit`, which the MANIFEST rejected in favour of
plugin-dsh-batch-edit.

## 6. The report format

```text
TASK <task id> - <the package(s)>
STATUS: done | partial | blocked
FILES: <the created paths, one per line - the package roots are enough>
SOURCE: <the plan documents used>
DECISIONS: <the smallest-faithful readings taken>
RESIDUALS: <what the end-phase must finish, one line each>
READY-TO-COMMIT: <the package roots and a suggested commit message>
```

If the task cannot be completed, do not silently give up, and end the report with a section that
starts exactly with `ESCALATION: <concrete reason>`.

## 7. The knowledge pool

- **The Team board** holds one task per group with the write scopes.
- **Documentation/Plans/POC-LEDGER.md** is the live matrix of the Lead, and lanes do not edit it.
- **The lane contexts are separate by design**, because each lane reads only the sources of its
  group and writes only the package directories of its group, while the Lead relays, verifies, and
  records.

## 8. The end-phase (after the Classic PoC set lands)

1. **The build pass.**

    Run `pnpm run build:classic` serialized, and fix the tsc errors package by package with a fix
    lane per failing package on the same route.

2. **The smoke pass.**

    Run the smoke suites per package with the fake-context harness and the expected counts in the
    READMEs, then the aggregate `node Maintain/Run/Smokes/Index.mjs`.

3. **The ETS twins.**

    Generate or port them from the Classic tree, keep the ledger strings byte-identical, and run the
    parity smokes.

4. **The wiring pass.**

    The bundle patch rows, the profile, and the live ledgers.

5. **The record.**

    POC-LEDGER.md is finalized, the plan statuses are updated, and the READY-TO-COMMIT report goes
    to the user.
