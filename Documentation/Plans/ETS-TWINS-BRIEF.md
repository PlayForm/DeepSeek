---
title: The Planned Plugin Suite - the ETS twins brief (the 29 EffectTS mirrors, delivered as 30)
category: Plans
kind: living-plan
date: 2026-10-22
status: complete
registry: Documentation/Plans/ETS-TWINS-BRIEF.md
index: Documentation/INDEX.md
statuses:
	- name: the ETS twin set (29 packages)
		state: implemented
		evidence: the 29 twins exist under EffectTS/packages/; the delivery added one more
		  (ets-client-dsh-workspace-live) for 30 new twins total
	- name: the mirror pass (the generator + the per-package diff)
		state: implemented
		evidence: Maintain/generate-ets-planned.mjs; the 30 twins built and diff-verified
	- name: the twin verification (build + parity smokes)
		state: implemented
		evidence: 97/97 builds green; the aggregate 359 suites / 5,337 checks green
---

# THE PLANNED PLUGIN SUITE - THE ETS TWINS BRIEF

> The end-phase companion to Documentation/Plans/POC-BRIEF.md. The Classic PoC set lands first, and
> the EffectTS twins follow. The brief scoped 29 mirrors, and the delivery produced 30 new twins
> because ets-client-dsh-workspace-live joined the set, for 46 EffectTS packages total. The family
> contract is Documentation/Skill/plugin-system/SKILL.md with the ETS variant and the byte-identical
> ledger law, and the POC brief still governs the mode of source first and verification after.

## 1. The verified shape of a twin

Read the existing pair before porting:

- Classic/packages/hook-dsh-live-containers/Source/Library.ts
- EffectTS/packages/ets-hook-dsh-live-containers/Source/Library.ts

The entries are near-mirrors with the same object form, the same service names (`pluginFactory`,
`tools`, and the rest), and the same ledger strings.

What differs is the package identity and the ETS dependency names:

| Classic                        | EffectTS                           |
| ------------------------------ | ---------------------------------- |
| `@playform/hook-dsh-<x>`       | `@playform/ets-hook-dsh-<x>`       |
| `@playform/plugin-dsh-<x>`     | `@playform/ets-plugin-dsh-<x>`     |
| `@playform/lib-dsh-core`       | `@playform/ets-base-dsh`           |
| `@playform/plugin-dsh-factory` | `@playform/ets-plugin-dsh-factory` |
| `Classic/packages/<pkg>`       | `EffectTS/packages/ets-<pkg>`      |
| the version 0.1.0              | the same version                   |

The Effect machinery lives in `ets-base-dsh` and `ets-plugin-dsh-factory`, and the hooks and tools
consume the same service names.

The ledger strings stay byte-identical, because the ETS tree is the same contract expressed twice.

## 2. The scope (29 packages)

The scope holds the 26 planned ETS twins plus the three candidate twins:

ets-hook-dsh-convention-suggester, ets-hook-dsh-doc-suggester, ets-hook-dsh-edit-suggester,
ets-hook-dsh-graph-suggester, ets-hook-dsh-replay-suggester, ets-hook-dsh-search-suggester,
ets-hook-dsh-test-suggester, ets-hook-dsh-workspace-approve, ets-hook-dsh-workspace-audit,
ets-hook-dsh-workspace-govern, ets-hook-dsh-workspace-journal, ets-hook-dsh-workspace-merge,
ets-hook-dsh-workspace-monitor, ets-hook-dsh-workspace-observe, ets-hook-dsh-workspace-operate,
ets-plugin-dsh-batch-edit, ets-plugin-dsh-batchstate, ets-plugin-dsh-feedback,
ets-plugin-dsh-gitguard, ets-plugin-dsh-queue, ets-plugin-dsh-route, ets-plugin-dsh-workspace,
ets-plugin-dsh-workspace-authority, ets-plugin-dsh-workspace-context,
ets-plugin-dsh-workspace-evidence, ets-plugin-dsh-workspace-graph, ets-plugin-dsh-workspace-reflect,
ets-plugin-dsh-workspace-semantics, ets-lib-dsh-workspace-live.

## 3. The mirror pass (the fast path)

The precedent is Maintain/generate-ets-live-containers.mjs, which is the additive-file mirror under
the identity substitutions only, with the output diff-verified afterwards.

The same pattern applies here at package granularity:

1. **The generator.**

    A generator `Maintain/generate-ets-planned.mjs` walks the Classic package roots of the 29 twins
    and writes the ETS tree under the substitutions of section 1: the package.json name and
    dependencies, the imports, the comment mentions of the factory package, and the directory.

    The generator is written with the write tool, run once from the monorepo root, and the output is
    diff-verified per package.

2. **The per-package diff check.**

    Every Source of an ETS twin must differ from its Classic source only in the substitution tokens,
    so a `diff` of the two trees with the substitutions applied must be empty.

    Any other difference is either an intentional ETS fix that is recorded or a defect.

3. **The intentional ETS fixes.**

    The intentional ETS fixes are limited to what the ETS conventions demand: the `ets-base-dsh`
    imports for the shared machinery, the ETS factory dependency, and the client-half conventions
    for `ets-lib-dsh-workspace-live` and the client twins.

## 4. The lane groups (the verification pass)

Eight port lanes each own a group, and each lane diff-verifies its packages and records the
intentional fixes:

| Group | Packages                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| E1    | ets-hook-dsh-workspace-observe, ets-plugin-dsh-workspace-graph                                                            |
| E2    | ets-hook-dsh-workspace-operate, ets-hook-dsh-workspace-merge                                                              |
| E3    | ets-hook-dsh-workspace-govern, ets-plugin-dsh-workspace-authority                                                         |
| E4    | ets-hook-dsh-workspace-journal, ets-hook-dsh-workspace-audit, ets-hook-dsh-workspace-approve                              |
| E5    | ets-plugin-dsh-workspace-context, ets-hook-dsh-workspace-monitor, ets-hook-dsh-workspace-semantics                        |
| E6    | ets-plugin-dsh-workspace, ets-plugin-dsh-workspace-evidence, ets-plugin-dsh-workspace-reflect, ets-lib-dsh-workspace-live |
| E7    | ets-plugin-dsh-batch-edit, ets-plugin-dsh-batchstate, ets-plugin-dsh-gitguard, ets-plugin-dsh-route, ets-plugin-dsh-queue |
| E8    | ets-plugin-dsh-feedback, the seven ets-hook-dsh-*-suggester twins                                                         |

## 5. The twin checks

- T1 the ETS package directory exists with the full anatomy and the ETS package identity.
- T2 the dependency names are the ETS names, with no `plugin-dsh-factory` or `lib-dsh-core` left in
  the ETS tree.
- T3 the ledger strings are byte-identical to the strings of the Classic twin.
- T4 the diff-with-substitutions is empty, or every remaining difference is recorded as an
  intentional ETS fix.
- T5 the ETS build (`pnpm --dir EffectTS/packages/<pkg> run prepublishOnly`) exits 0 once the ETS
  factory is built first, under the family rule that rebuilds the factory before any consumer with
  serialized builds.
- T6 the parity smokes hold the same assertion sets, and the ETS additions are recorded under the
  smoke-writing parity rule.

## 6. The order

1. **The Classic set.**

    The Classic PoC set lands and the Classic build pass is green.

2. **The mirror pass.**

    The mirror pass runs the generator and the per-package diff.

3. **The eight port lanes.**

    The eight port lanes apply the intentional fixes and run the twin checks T1 to T4.

4. **The ETS build pass.**

    The ETS build pass runs the factory first and serialized, then the parity smokes.

5. **The record.**

    POC-LEDGER.md is finalized with the 29 twin rows.
