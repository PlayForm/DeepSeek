---
name: session-orientation
description:
    "The first-load protocol for this repository: it loads the repository's own skills, its current
    state, and the laws that govern the work before any action is taken, and it supplies the
    repository map, the skill routing table, and the orientation checklist that every later action
    assumes."
whenToUse:
    At the start of every fresh session here, and after any resume, fork, or long gap; before the
    first read that informs real work and before any write, build, or delegation.
version: 3.1.0
updated: 2026-10-28
---

# Session Orientation

A fresh session knows nothing except what it loads.

This skill fixes the loading order so two sessions in the same tree reach the same working model,
and it gives the map and the laws that every later action assumes.

Skipping it does not save time; it produces work against a stale or invented picture of the
repository.

The orientation is deliberately a reading protocol rather than a writing protocol: it tells you what
to load and in what order, and it ends when you can answer the six questions in the verification
section without opening another file.

## When to use

- First action of a new session in this repository.
- After a resume, fork, crash, or a gap long enough that the tree moved.
- Before delegating: the delegated agent does not see this conversation, so the parent must carry
  the current facts into the spec.
- Do not use for: the rules themselves. Each law has an owner; load the owner when you act on it.

## The loading order

1. **The repo's own skills.**

    `Documentation/Skill/` is the specialized truth for this monorepo; `${DSH_HOME}/skills/` is the
    fallback for sessions outside it.

    Where the two disagree, the repo copy wins, because it is the anonymised specialization that
    names this repository's real paths and laws.

    `Documentation/Skill/STANDARD.md` is read once per session.

2. **The current state.**

    The order is `README.md` (the family's public state), `Documentation/INDEX.md` (the
    documentation map), the active documents in `Documentation/Plans/`, then the relevant manual in
    `Documentation/Guides/` for the deep detail.

    Plans are the state of the work; Guides are the manuals.

    The whole tree is not read.

3. **The laws.**

    The owner skill is loaded for each law about to be touched: `code-authoring` (file writes, byte
    integrity, git), `task-routing` (models and effort).

    Plugin work adds `plugin-system` and `plugin-development`; suite work adds `smoke-writing`; site
    work adds `site-authoring`.

4. **The tree state.**

    Read-only git checks run in the root and in `Site/` (which is its own repository):
    `git status --short`, `git log --oneline -5`.

    Uncommitted work and recent commits are noted; the user commits mid-session, so HEAD can move
    under you.

5. **The act.**

    No write, build, or delegation happens before steps 1-4.

## The repository map

| Path             | What it is                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| `Classic/`       | The plain-TypeScript release: 58 packages plus the smoke suites         |
| `EffectTS/`      | The Effect-TS release: 48 packages plus `ets-base-dsh` and the smokes   |
| `Site/`          | The Astro static site; its own git repository, gitignored from the root |
| `Test/`          | Fixture archives, governance batteries, probes                          |
| `Documentation/` | Framework, guides, plans, skills, archive, reports                      |
| `Maintain/`      | The formatting, smoke, wiring, and link-check entry points              |
| `diagrams/`      | Source diagrams                                                         |

`Boilerplate/` no longer exists.

Documentation that still calls it a third implementation is stale; the two release trees are the
code.

## Facts and their owners

Every drifting fact has exactly one owner.

Do not copy a fact into a second skill; read the owner or run the verify command.

| Fact                           | Owner                                | Verify                                               |
| ------------------------------ | ------------------------------------ | ---------------------------------------------------- |
| Package inventory and roles    | `plugin-system`, family inventory    | `ls Classic/packages EffectTS/packages`              |
| Release version and effect pin | `plugin-system`, family inventory    | grep `"version"` and `"effect"` in the manifests     |
| Smoke totals and caveats       | `smoke-writing`, the arbiter section | the manifest line in each tree's `smokes/README.md`  |
| Site pages and content model   | `site-authoring`                     | `find Site/Target -name "*.html" \| wc -l`           |
| Model catalog and routes       | `task-routing`, the catalog          | `list_subagent_models`                               |
| Active plans                   | `Documentation/Plans/` frontmatter   | `grep -H '^status: active' Documentation/Plans/*.md` |

The README, the registry documents, and the guides lag the tree in places.

The package directories, the manifests, the smoke READMEs, and the built site are the arbiters.

## Decision table

| If the task is...              | Load first                                               |
| ------------------------------ | -------------------------------------------------------- |
| Any file edit or code write    | `code-authoring`                                         |
| Any delegation or model choice | `task-routing`, then `worker-strains`                    |
| A multi-agent batch            | `orchestrator-batch`; `idle-agent-protocol` for children |
| Plugin code (API or family)    | `plugin-development` and `plugin-system`                 |
| A smoke suite                  | `smoke-writing`                                          |
| Site source or content         | `site-authoring`                                         |
| Typographic fixtures           | `instructional-writing`                                  |
| Runtime introspection          | `harness-observability`                                  |

## Verification

You are oriented when you can answer, without opening another file:

- Which directories are the two release trees, and why must they never be mixed in one dependency
  graph?
- How many packages ship, at which version, and how do you check?
- Where do the smoke totals live, and what do they exclude?
- Which three models may be requested, and which one runs the main agent?
- What is the file-write law, and what is the git law?
- Which plans are active right now?

A wrong answer means re-run the step that owns the fact.

Do not proceed on a guess; a guess at this stage propagates into every later decision.

## Anti-patterns

| Mistake                                             | Cost                                            | Do instead                             |
| --------------------------------------------------- | ----------------------------------------------- | -------------------------------------- |
| Acting before orientation                           | Work against a stale map; wrong tree, wrong law | Steps 1-4 first                        |
| Trusting README counts over the tree                | Repeats stale numbers (the 733/746 class)       | Verify with the command in the table   |
| Loading the global skill and skipping the repo copy | Misses the project-specific specialization      | Repo copy first; global is fallback    |
| Reading the whole Documentation tree                | Burns context; misses the active plan           | README, INDEX, active Plans, one Guide |
| Treating `Site/` as part of the root repo           | Wrong git status, wrong commit surface          | Check `Site/.git` separately           |

## References

| File                                  | Covers                                                 | Read when                               |
| ------------------------------------- | ------------------------------------------------------ | --------------------------------------- |
| `references/repository-map.md`        | The trees, the package roles, the two release groups   | You need the layout or a package's role |
| `references/current-state.md`         | What each documentation surface states, and its order  | You need the state of the work          |
| `references/laws.md`                  | The five laws, one paragraph each, with owners         | You need the short form of a law        |
| `references/orientation-checklist.md` | The full first-session checklist and the failure modes | You are resuming a long batch           |
