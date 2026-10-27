---
kind: framework
name: family-framework
description:
    The distilled requirements + the skill framework + the tomorrow TODOs for the DeepSeek Harness
    Plugin Family - the operating constraints gathered from the user's directives across the
    sessions, the meta-structure for the Documentation/Skill tree, and the referential documents for
    the next session's review.
title: The Family Framework - Requirements, Skills, TODOs
category: Documentation root
date: 2026-10-07
status: active
registry: Documentation/FRAMEWORK.md
index: Documentation/INDEX.md
statuses:
    - name: the requirements distillation (sections 1.1-1.7)
      state: implemented
      evidence: the framework the skills implement
    - name: the skill framework (the taxonomy, the format)
      state: implemented
      evidence: the skill tree under Documentation/Skill
    - name: the three core skills (instructional-writing, plugin-system, smoke-writing)
      state: implemented
      evidence: loadable bundles
    - name: the future skill branches (live-battery, case-study-writing, site-development)
      state: open
      evidence: candidates
    - name: the TODOs (section 3)
      state: in-progress
      evidence:
          the docs restructure verification is this conversion; the live battery and the release
          polish remain
---

# The Family Framework - Requirements, Skills, TODOs

> This document distills EVERY requirement that the user has given, in the taste of the user:
> direct, truthful, structured, and minimal. The skills implement this framework. The TODOs
> reference this framework.

---

## 1. THE REQUIREMENTS (distilled)

### 1.1 The family's identity

- The **DeepSeek Harness Plugin Family for PlayForm**, which is a plugin system and family for the
  DeepSeek Harness. The family covers model-output normalization, manifest governance, and
  file-content tools.
- The mission: "Tame the model's output and govern the project's files."
- Model-agnostic: the family normalizes the output of ANY LLM. The reference models are DeepSeek V4
  Flash and GLM 5.3 Flash.
- The **@-sentence identity**: EVERY name reads as `<kind> @ <platform> @ <role> @ <domain>` (Hook @
  DSH @ Governor @ Cargo). The kind taxonomy (DECIDED 2026-10-21): `plugin-` (the factory and the
  tool/service plugins), `hook-` (the event behaviors), `client-` (the UI halves), and `lib-` (the
  shared libraries, where the core is `lib-dsh-core`). The domain wording `manifest` vs `package`
  stays undecided.

### 1.2 The versions

- The **boilerplate** (the reference with personal paths intact, internal, NEVER released). The
  decision about a gitignore or a private submodule is pending.
- The **Classic release** (the anonymized normal implementation).
- The **Effect-TS release** (Effect v4.0.5, with the tracing, the ecosystem interaction, and the
  parallel-govern toggle designed in).
- All release packages sit at **0.1.0** and all are UNPUBLISHED. The family is now 101 packages: 53
  Classic and 48 EffectTS, which are the original 14 plugins plus the 36 packages of the 2026-10-22
  PoC delivery and their 30 ETS twins. The parity: the ledger strings are the byte-identical smoke
  contract across both trees.
- The future structure: EACH release package gets its own repository and is added as a **submodule**
  to the parent. The future structure also holds the per-repo gitignores.

### 1.3 The development regime

- All development runs through coder subagents. The smokes (and the site build) are the arbiter. The
  user commits (incrementally for each folder, innermost first, when they decide). The agents NEVER
  commit.
- The working lessons are the memory of the regime: the smoke/live fidelity gap, the load-order
  nondeterminism, the subagent stall pattern (scaffold-first plus bounded-reading prompts), the
  local/UTC timestamp confusion, the cross-agent git-checkout hazard, and the patch-layer shadowing
  as the meta-lesson.

### 1.4 The formatting + the style

- **Tabs everywhere** (the monorepo standard: useTabs, tabWidth 4, printWidth 100, proseWrap
  always). The YAML exception: tabs are invalid YAML indentation, so use spaces.
- The merged config comes from ONLY the project references, and the dotfiles and global config are
  NOT consulted.
- The .prettierignore is adapted to the repository (the Targets, the fixtures, the lockfiles, and
  the node_modules, and nothing else).

### 1.5 The design + the content

- **Blue + white only** (primary #003ec7 / primary-container #0052ff / the white surfaces / Inter +
  IBM Plex Mono). Clean headers, NO gradients.
- **Truthful + direct**: the real mechanics, NEVER an invented UI or fabricated metrics. The ledger
  strings appear verbatim.
- **The product's own voice**: NEVER the literal instruction or requirement phrasing. The
  requirements translate into the designed showcase.
- **Showcase the usage + the integration**, NOT the file-facing structure. The before/after examples
  (the internals before and after). The truthful injection points (where the family enters the
  DeepSeek internals). The integration with the other dsh packages.
- **The UI adapted to the functionality**: the real benchmarks (the integration surface, the smoke
  coverage of 511 suites and 6,610 checks across both trees, and the exposed failure cases plus the
  solutions). The configure-ability and the optionality (the multi-step ~/.dsh profile setup, the
  knobs, the defaults-off posture, and the escape hatches).
- **The case study emphasizes the WHY** (the structural rationale, which explains why the
  architecture is shaped this way). NOT the HOW (the process of writing it).

### 1.6 The skills

- The skills live at `Documentation/Skill/<name>/SKILL.md` as loadable bundles, and the filesystem
  provider discovers the project roots.
- The skills are operating manuals: DIRECT, with NO deliberation (the "we might not want to express
  deliberation" instruction).
- The skill tree branches: `instructional-writing` (the raw-write-only discipline for the
  literal-typography files), `plugin-system` (the plugin development manual of the family),
  `smoke-writing` (the smoke suite discipline), plus the broader skills now present in the tree
  (session-orientation, code-authoring, task-routing, worker-strains, orchestrator-batch,
  plugin-development, harness-observability, and more). More branches come as the functionality
  grows.

### 1.7 The test archive

- `Test/` is the curated family-only archive: `fixtures/manifest/` + `fixtures/markdown/` +
  `probes/` + the README index, and ONLY the fixtures of the family. The unrelated experiments are
  removed.
- The instructional fixtures keep their LITERAL typography, so the "this file has an em dash" notes
  are truthful. The raw-write tool writes the instructional fixtures.

## 2. THE SKILL FRAMEWORK (the meta-structure for Documentation/Skill)

The skills are the operating manuals of the project.

The framework:

### 2.1 The format

- EACH skill is a `<name>/SKILL.md` directory bundle (the loadable form), with the YAML frontmatter
  keys `name`, `description` (what it covers and when), and `whenToUse` (the trigger and the
  stop-condition).
- The body is the operating manual: numbered sections, direct statements, and NO deliberation. The
  decisions are stated and NOT argued.
- The name is a single lowercase word or compound (instructional-writing, plugin-system,
  smoke-writing).

### 2.2 The taxonomy (the branches)

| Branch                       | Covers                                                                                                                                                                        | Status  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `instructional-writing`      | the raw-write-only discipline for the literal-typography instructional/fixture files                                                                                          | done    |
| `plugin-system`              | the DSH plugin contract for the family: the loader surface, the bundle anatomy, the deterministic build, the module leaves vs the shared machinery, the smokes as the arbiter | done    |
| `smoke-writing`              | the smoke suites' discipline: the harness pattern, the byte-identical assertion contract, the vacuously-green trap, the smoke/live fidelity gap, the parity                   | done    |
| Future branches (candidates) | `live-battery` (the live-testing protocol), `case-study-writing` (the WHY-emphasizing narrative), `site-development` (the blue/white site conventions)                        | pending |

### 2.3 The hierarchy

- The skills implement this framework, and the statements of EACH skill are the requirements of the
  framework in operational form.
- The skills are loadable from the project, and the framework is the reference that the skills point
  to.

## 3. THE TODOS (the referential documents for tomorrow)

1. **The review.**

    Per `Documentation/Plans/TOMORROW-REVIEW.md`, the user reviews the preserved state.

    The corrections land as new packages.

2. **The case-review agent.**

    The WHY mandate: the spine of the case study is the structural rationale and NOT the writing
    process.

3. **THE SITE FIXES.**

    The `/workbench/` page does NOT work, so reproduce and repair it or rebuild it.

    The site keeps the remaining feedback per the directions.

4. **The submodule structure (#16).**

    The per-package repositories as submodules plus the per-repo gitignores.

    The gitignore decision for the Boilerplate.

5. **The release polish.**

    The naming refinements (the `lib-` kind decided 2026-10-21, and the `manifest` domain wording
    still open).

    The release polish: the per-package publish configs plus CHANGELOGs.

    The release polish: the "zero runtime dependencies" line of the EffectTS core README (the
    effect-backed rewrite, landed).

6. **The live battery.**

    The whole family re-verified LIVE after ANY source change (the ledgers, the interlock, the
    escape hatch, the direct-govern, the
    [v2 domain](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Journal.ts)).

7. **The loadability check.**

    The Documentation/Skill bundles verified as discovered by the filesystem provider.

8. **The docs restructure verification.**

    The integrity of the Documentation/ tree (the facts preserved and the cross-references updated)
    after the restructure agent lands.

---

_The family: DeepSeek Harness Plugin Family for PlayForm - Hook @ DSH @ Governor @ Cargo. Clean.
Governed. Normalized. Direct. Truthful._
