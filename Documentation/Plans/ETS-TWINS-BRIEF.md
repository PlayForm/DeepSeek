---
title: The Planned Plugin Suite - the ETS twins brief (the 29 EffectTS mirrors)
category: Plans
kind: living-plan
date: 2026-10-22
status: planned
registry: Documentation/Plans/ETS-TWINS-BRIEF.md
index: Documentation/INDEX.md
statuses:
	- name: the ETS twin set (29 packages)
		state: planned
		evidence: this document section 2
	- name: the mirror pass (the generator + the per-package diff)
		state: planned
		evidence: this document section 3
	- name: the twin verification (build + parity smokes)
		state: planned
		evidence: this document section 6
---

# THE PLANNED PLUGIN SUITE - THE ETS TWINS BRIEF

> The end-phase companion to Documentation/Plans/POC-BRIEF.md. The Classic PoC set lands first; the
> 29 EffectTS twins follow. The family contract: Documentation/Skill/plugin-system/SKILL.md (the ETS
> variant and the byte-identical ledger law). The POC brief still governs the mode (source first,
> verification after).

## 1. The verified shape of a twin

Read the existing pair before porting:

- Classic/packages/hook-dsh-live-containers/Source/Library.ts
- EffectTS/packages/ets-hook-dsh-live-containers/Source/Library.ts

The entries are near-mirrors: the same object form, the same service names (`pluginFactory`,
`tools`, ...), the same ledger strings. What differs is the package identity and the ETS dependency
names:

| Classic                        | EffectTS                           |
| ------------------------------ | ---------------------------------- |
| `@playform/hook-dsh-<x>`       | `@playform/ets-hook-dsh-<x>`       |
| `@playform/plugin-dsh-<x>`     | `@playform/ets-plugin-dsh-<x>`     |
| `@playform/lib-dsh-core`       | `@playform/ets-base-dsh`           |
| `@playform/plugin-dsh-factory` | `@playform/ets-plugin-dsh-factory` |
| `Classic/packages/<pkg>`       | `EffectTS/packages/ets-<pkg>`      |
| the version 0.1.0              | the same version                   |

The Effect machinery lives in `ets-base-dsh` and `ets-plugin-dsh-factory`; the hooks and tools
consume the same service names. The ledger strings stay byte-identical - the ETS tree is the same
contract expressed twice.

## 2. The scope (29 packages)

The 26 planned ETS twins plus the three candidate twins:

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

The precedent: Maintain/generate-ets-live-containers.mjs - the additive-file mirror under the
identity substitutions only, "the output is diff-verified afterwards". The same pattern applies here
at package granularity:

1. A generator `Maintain/generate-ets-planned.mjs` walks the Classic package roots of the 29 twins
   and writes the ETS tree under the substitutions in section 1 (package.json name + dependencies,
   the imports, the comment mentions of the factory package, the directory). The generator is
   written with the write tool, run once from the monorepo root, and the output is diff-verified per
   package.
2. The per-package diff check: every ETS twin's Source must differ from its Classic source only in
   the substitution tokens (a `diff` of the two trees with the substitutions applied must be empty).
   Any other difference is either an intentional ETS fix (recorded) or a defect.
3. The intentional ETS fixes are limited to what the ETS conventions demand: the `ets-base-dsh`
   imports for the shared machinery, the ETS factory dependency, and the client-half conventions for
   `ets-lib-dsh-workspace-live` and the client twins.

## 4. The lane groups (the verification pass)

Eight port lanes, each owning a group, each diff-verifying its packages and recording the
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
- T2 the dependency names are the ETS names (no `plugin-dsh-factory` or `lib-dsh-core` left in the
  ETS tree).
- T3 the ledger strings are byte-identical to the Classic twin's.
- T4 the diff-with-substitutions is empty or every remaining difference is recorded as an
  intentional ETS fix.
- T5 the ETS build (`pnpm --dir EffectTS/packages/<pkg> run prepublishOnly`) exits 0 once the ETS
  factory is built first (the family rule: rebuild the factory before any consumer, serialized
  builds).
- T6 the parity smokes: the same assertion sets, the ETS additions recorded (the smoke-writing
  parity rule).

## 6. The order

1. The Classic PoC set lands and the Classic build pass is green.
2. The mirror pass: the generator + the per-package diff.
3. The eight port lanes: the intentional fixes, the twin checks T1-T4.
4. The ETS build pass (the factory first, serialized) and the parity smokes.
5. The record: POC-LEDGER.md finalized with the 29 twin rows.
