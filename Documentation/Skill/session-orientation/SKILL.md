---
name: session-orientation
description: THE first-load protocol for ANY new session working in this repository (or any successor repository of the DSH Family) - orient from the repo's OWN skills FIRST (Documentation/Skill/ is the specialized truth; ~/.dsh/skills/ is the fallback), read the current state from the root README + Documentation/Plans/ + Documentation/Guides/, load the routing law (every subagent = cloudflare-workers-ai/@cf/zai-org/glm-5.3-flash, reasoningEffort low), apply the git checks-only law (never mutate git - report READY-TO-COMMIT), know the published DSH Family (all 25 @playform packages live at 0.0.1), and know the NEXT session's task - authoring the Aphrodite Site. Load FIRST, before anything else, in every fresh session.
whenToUse: Mandatory at session start, before any other skill, tool call, or delegation. If a fresh session is about to act in this repository without having read the repo's own skills and this orientation protocol, STOP and load this first.
---

# SESSION ORIENTATION - the first-load protocol for every new session

A fresh session knows NOTHING except what it loads. This skill is the loading order.
Follow it top to bottom. It is written to be self-contained: no prior conversation
is required to orient correctly.

## 0. The loading order (do this before anything else)

1. **The repo's OWN skills FIRST.** If the working repository has
   `Documentation/Skill/*.md`, read every `SKILL.md` there BEFORE any other
   orientation step. Those copies are the SPECIALIZED TRUTH for this project
   (each carries a header note marking it as the specialized working copy); the
   global skills at `~/.dsh/skills/<name>/SKILL.md` are the FALLBACK for sessions
   running outside a repo that carries its own skills. Where the two disagree,
   the repo copy wins; if you must correct a rule, sync the fix to BOTH copies.
2. **The current state.** Read the root `README.md`, then
   `Documentation/Plans/` (the active plan documents - each is dated and named
   for its subject) and `Documentation/Guides/`. The README is the state of the
   family; the Plans are the state of the work; the Guides are the state of the
   registry and the governance trio's deep documentation.
3. **The routing law** (section 2 below) and the **git law** (section 3 below)
   - load them now; they are non-negotiable.

## 1. The repository itself

This is the PlayForm DeepSeek monorepo - the DeepSeek Harness (DSH) plugin family
for PlayForm: the factory, the core, the governance trio, and the seven-member
normalize family, in published trees (Classic + EffectTS, plus the internal
Boilerplate baseline never released), with the published static site under
`Site/` (21 pages: the landing page, the plugins registry + 12 plugin detail
pages, the workbench, versions, setup, flavors, matrix, models, case-study).
Layout: `Classic/`, `EffectTS/`, `Boilerplate/`, `Site/`, `Test/`,
`Documentation/`, `Maintain/`. The build for the site is `cd Site && pnpm
prepublishOnly` (astro build, outDir `./Target`) - the site verifies via its
built HTML/CSS, never via a dev server.

## 2. THE ROUTING LAW (non-negotiable)

Every subagent delegation runs:

- provider: `cloudflare-workers-ai`
- model: `@cf/zai-org/glm-5.3-flash`
- reasoningEffort: `low`

No exceptions without the user's explicit instruction. The explicit triple is
ALWAYS passed - never rely on the child defaults (omission inherits the parent's
route, which is the expensive lane). The `task-routing` skill (repo copy first)
carries the full policy; this line is the enforcement floor.

## 3. THE GIT LAW (checks only - never mutate)

The orchestrator and every agent NEVER mutate the repository through the
terminal: no `git add`, no `git commit`, no `git reset`, no `git push`, no
`git tag`, no `git rm`, no checkout/branch/merge/stash, no `git clean`. The
user owns every git mutation. Allowed git work is read-only CHECKS ONLY:
`git status`, `git log`, `git diff`, `git show`, `git rev-parse`,
`git ls-files`, `git log --diff-filter=D`, and `git fetch`. Any deliverable that
needs a commit is reported as **READY-TO-COMMIT** - the exact file list plus the
suggested commit message - and the user commits it. (User-mandated 2026-10-10;
codified in the `code-authoring` skill section 1d.)

## 4. The file-write law (the normalize hooks are ACTIVE)

File writes go ONLY through the `write`/`raw-write`/`edit` tool API - never
terminal content edits (no sed/awk/perl/python in-place rewrites, no heredoc
file surgery). The normalize hooks are active in this profile: streamed model
output is normalized live (dashes, curly quotes, ellipsis, unicode spaces,
invisible characters, fullwidth forms). Consequences:

- Prefer ASCII-safe content; never need a real unicode glyph inside a streamed
  write.
- When a real unicode glyph IS required (byte-faithful copies, unicode test
  data), use `raw-write` (exempt from normalization by name) or `edit`
  (identity-exempt).
- Never build file content through NUL-terminated/NUL-separated conventions;
  after any bulk transformation, byte-scan the touched files (zero NUL bytes,
  valid UTF-8) before reporting done.

## 5. THE PUBLISHED FAMILY (all 25 packages live at 0.0.1)

The DSH Family is PUBLISHED: every package below exists at version `0.0.1`
under the `@playform` scope. The Classic split (`@playform/dsh-*`-named hooks +
the plugin) and the EffectTS split (`@playform/ets-*` - Effect v4 services and
layers, built on the `@playform/ets-base-dsh` base). The 25 names:

- `ets-base-dsh` - the EffectTS plumbing base every ets-* package builds on.
- Classic: `hook-dsh-core`; `plugin-dsh-factory`; `hook-dsh-cargo-governor`,
  `hook-dsh-package-governor`, `hook-dsh-package-pinner`;
  the 7 normalize flavors: `hook-dsh-normalize-dash`,
  `hook-dsh-normalize-quotes`, `hook-dsh-normalize-ellipsis`,
  `hook-dsh-normalize-spaces`, `hook-dsh-normalize-invisible`,
  `hook-dsh-normalize-fullwidth`, `hook-dsh-normalize-file`.
- EffectTS: `ets-hook-dsh-core`; `ets-plugin-dsh-factory`;
  `ets-hook-dsh-cargo-governor`, `ets-hook-dsh-package-governor`,
  `ets-hook-dsh-package-pinner`; the 7 normalize flavors:
  `ets-hook-dsh-normalize-dash`, `ets-hook-dsh-normalize-quotes`,
  `ets-hook-dsh-normalize-ellipsis`, `ets-hook-dsh-normalize-spaces`,
  `ets-hook-dsh-normalize-invisible`, `ets-hook-dsh-normalize-fullwidth`,
  `ets-hook-dsh-normalize-file`.

(That is 1 base + 12 Classic + 12 EffectTS siblings = 25. Never mix the two
splits in one dependency graph. The authoritative registry document is
`Documentation/Plugins/PLUGIN-FAMILY.md`.)

## 6. THE NEXT SESSION'S TASK (the Aphrodite Site)

The next session authors `~/Developer/Application/PlayForm/Aphrodite/Site` -
an ADVANCED ITERATION and richer-information variation of the website workflows
built here. NOTE the path: the Aphrodite repository lives at
`~/Developer/Application/PlayForm/Aphrodite` (an earlier `~/Developer/Application/Aphrodite`
path is stale - use the PlayForm-parented path). The reference is THIS repo's
`Site/`: an Astro static site in the "Technical Minimalist Harness" design
(blue + white only, Inter + IBM Plex Mono, 1px hairlines, zero elevation) with
21 pages - the landing page, the plugins registry + 12 plugin detail pages, the
workbench (live stream-gate terminals), versions, setup, flavors, matrix, models,
and the case study. Aphrodite's Site must be a BETTER + more-informed variation
of those workflows: same laws, richer documentation, evolved design.

### The lane laws for the site build (this repo's Site/ - Aphrodite inherits them)

- NO dev servers, NO `tsc` runs, NO git mutations (checks only - section 3).
- The build IS the verification: `cd Site && pnpm prepublishOnly` (astro build,
  outDir `./Target`), then verify the BUILT HTML/CSS in `Target/` - grep the
  built output, never trust the source alone.
- The raw-write/identity-exempt-edit rule for any unicode glyph (section 4) -
  the normalize hooks are active while authoring site content.
- The site content is documentation-first: each page built from the packages'
  real READMEs/Sources, byte-accurate names, absolute links
  (`https://github.com/PlayForm/DeepSeek/tree/Current/...` for repo targets).

## 7. The one-paragraph summary a fresh session must be able to recite

Orient from the repo's own skills (Documentation/Skill/ first, ~/.dsh/skills/
fallback), read README + Plans + Guides for the state, route every subagent to
cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / low, never mutate git
(checks only; report READY-TO-COMMIT), write files only through the tool API
(raw-write/edit for unicode glyphs - the normalize hooks are active), know the
25 published @playform packages at 0.0.1 (Classic + EffectTS + ets-base-dsh),
and know that the next session's task is authoring
~/Developer/Application/PlayForm/Aphrodite/Site - the advanced iteration of this
repo's Site/ workflows.
