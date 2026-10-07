---
kind: framework
name: family-framework
description: The distilled requirements + the skill framework + the tomorrow TODOs for the DeepSeek Harness Plugin Family - the operating constraints gathered from the user's directives across the sessions, the meta-structure for the Documentation/Skill tree, and the referential documents for the next session's review.
---

# The Family Framework - Requirements, Skills, TODOs

> The distillation of every requirement the user has given, in the
> user's taste: direct, truthful, structured, minimal. This document is
> the framework the skills implement and the TODOs reference.

---

## 1. THE REQUIREMENTS (distilled)

### 1.1 The family's identity

- The **DeepSeek Harness Plugin Family for PlayForm** - a plugin system /
  family for the DeepSeek Harness: model-output normalization +
  manifest governance + file-content tools.
- The mission: "Tame the model's output and govern the project's files."
- Model-agnostic: normalizes ANY LLM's output (the reference models:
  DeepSeek V4 Flash, GLM 5.3 Flash).
- The **@-sentence identity**: every name reads as
  `<kind> @ <platform> @ <role> @ <domain>` (Hook @ DSH @ Governor @
  Cargo). The kind taxonomy: `plugin-` (the factory), `hook-` (the
  behaviors), `lib-` (the core - a proposal, undecided); the domain
  wording `manifest` vs `package` - undecided.

### 1.2 The versions

- The **boilerplate** (the reference - personal paths intact, internal,
  never released - gitignore or a private submodule decision pending).
- The **Classic release** (the anonymized normal implementation).
- The **Effect-TS release** (Effect v4.0.1 - the tracing, the ecosystem
  interaction, the parallel-govern toggle designed in).
- All release packages at **0.0.1**; the parity: the ledger strings are
  the byte-identical smoke contract across all three implementations.
- The future structure: each release package its own repository, added
  as **submodules** to the parent; the per-repo gitignores.

### 1.3 The development regime

- All development through coder subagents; the smokes (and the site
  build) as the arbiter; the user commits (incrementally per folder,
  innermost first, when they decide); the
  agents never commit.
- The working lessons are the regime's memory: the smoke/live fidelity
  gap, the load-order nondeterminism, the subagent stall pattern
  (scaffold-first + bounded-reading prompts), the local/UTC timestamp
  confusion, the cross-agent git-checkout hazard, the patch-layer
  shadowing as the meta-lesson.

### 1.4 The formatting + the style

- **Tabs everywhere** (the monorepo standard - useTabs, tabWidth
  4, printWidth 100, proseWrap always); the YAML exception (tabs are
  invalid YAML indentation - spaces).
- The merged config from ONLY the project references; the
  dotfiles/global NOT consulted.
- The .prettierignore adapted to the repository (the Targets, the
  fixtures, the lockfiles, the node_modules - nothing else).

### 1.5 The design + the content

- **Blue + white only** (primary #003ec7 / primary-container #0052ff /
  the white surfaces / Inter + IBM Plex Mono), clean headers, no
  gradients.
- **Truthful + direct**: the real mechanics, never an invented UI or
  fabricated metrics; the ledger strings verbatim.
- **The product's own voice**: NEVER the literal instruction/requirement
  phrasing - the requirements translate into the designed showcase.
- **Showcase the usage + the integration**, not the file-facing
  structure: the before/after examples (the internals before + after),
  the truthful injection points (where the family enters the DeepSeek
  internals), the integration with the other dsh packages.
- **The UI adapted to the functionality**: the real benchmarks (the
  integration surface, the smoke coverage - Classic 733 / EffectTS 746,
  the exposed failure cases + the solutions), the configure-ability +
  the optionality (the multi-step ~/.dsh profile setup, the knobs, the
  defaults-off posture, the escape hatches).
- **The case study emphasizes the WHY** (the structural rationale -
  why the architecture is shaped this way), NOT the HOW (the process of
  writing it).

### 1.6 The skills

- The skills live at `Documentation/Skill/<name>/SKILL.md` (the
  loadable bundles; the filesystem provider discovers the project
  roots).
- The skills are operating manuals - DIRECT, no deliberation (the
  "we might not want to express deliberation" instruction).
- The skill tree branches: `instructional-writing` (the raw-write-only
  discipline for the literal-typography files), `plugin-system` (the
  family's plugin development manual), `smoke-writing` (the smoke
  suite discipline) - more branches as the functionality grows.

### 1.7 The test archive

- `Test/` is the curated family-only archive: `fixtures/manifest/` +
  `fixtures/markdown/` + `probes/` + the README index - ONLY the
  family's fixtures; the unrelated experiments removed.
- The instructional fixtures keep their LITERAL typography (the "this
  file has an em dash" notes are truthful) - written via the raw-write
  tool.

## 2. THE SKILL FRAMEWORK (the meta-structure for Documentation/Skill)

The skills are the project's operating manuals. The framework:

### 2.1 The format

- Each skill = a `<name>/SKILL.md` directory bundle (the loadable
  form), with the YAML frontmatter: `name`, `description` (what it
  covers + when), `whenToUse` (the trigger + the stop-condition).
- The body: the operating manual - numbered sections, direct
  statements, no deliberation (the decisions are stated, not argued).
- The name: a single lowercase word or compound (instructional-writing,
  plugin-system, smoke-writing).

### 2.2 The taxonomy (the branches)

| Branch | Covers | Status |
|---|---|---|
| `instructional-writing` | the raw-write-only discipline for the literal-typography instructional/fixture files | ✅ |
| `plugin-system` | the DSH plugin contract for the family: the loader surface, the bundle anatomy, the deterministic build, the module leaves vs the shared machinery, the smokes as the arbiter | ✅ |
| `smoke-writing` | the smoke suites' discipline: the harness pattern, the byte-identical assertion contract, the vacuously-green trap, the smoke/live fidelity gap, the parity | ✅ |
| Future branches (candidates) | `live-battery` (the live-testing protocol), `case-study-writing` (the WHY-emphasizing narrative), `site-development` (the blue/white site conventions) | pending |

### 2.3 The hierarchy

- The skills implement the framework (this document): each skill's
  statements are the framework's requirements operationalized.
- The skills are loadable from the project; the framework is the
  reference the skills point to.

## 3. THE TODOS (the referential documents for tomorrow)

1. **The review** (per `Documentation/Plans/TOMORROW-REVIEW.md`): the
   user reviews the preserved state; the corrections land as new
   packages.
2. **The case-review agent** (the WHY mandate): the case study's spine
   = the structural rationale, not the writing process.
3. **THE SITE FIXES**: the `/workbench/` page does not work (reproduce
   + repair or rebuild); the site's remaining feedback per the
   directions.
4. **The submodule structure (#16)**: the per-package repositories as
   submodules + the per-repo gitignores; the Boilerplate's gitignore
   decision.
5. **The release polish**: the naming refinements (lib-/manifest - decide), the
   per-package publish configs + CHANGELOGs, the EffectTS core README's
   "zero runtime dependencies" line (the effect-backed rewrite, landed).
6. **The live battery**: the whole family re-verified live after any
   source change (the ledgers, the interlock, the escape hatch, the
   direct-govern, the v2 domain).
7. **The loadability check**: the Documentation/Skill bundles verified
   discovered by the filesystem provider.
8. **The docs restructure verification**: the Documentation/ tree's
   integrity (the facts preserved, the cross-references updated) after
   the restructure agent lands.

---

*The family: DeepSeek Harness Plugin Family for PlayForm - Hook @ DSH @
Governor @ Cargo. Clean. Governed. Normalized. Direct. Truthful.*