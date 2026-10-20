# The Division of Labor Between This Skill and Plugin-Development

> Source: SKILL.md, Section 3 (Application), bullet 3.

## The Rule

The plugin-development skill covers the API contract. THIS skill covers
how every file is modified and how every piece of code is written.

## The Split, Precisely

| Concern | Skill |
|---------|-------|
| The cordis plugin API contract: dispatch modes, plugin anatomy, Config schemas, services, fibers/effects/HMR, tools, packaging | plugin-development |
| How every file gets modified (tool discipline, byte integrity, git) | code-authoring |
| How every piece of code gets written (atomization, naming, defaults, bindings, guards, hierarchy, refactor identity) | code-authoring |

## Why the Split Exists

1. **Different questions.** Plugin-development answers "what does the
   harness let a plugin do and require". Code-authoring answers "how
   does any agent write and change any file in this workspace". The
   first is about the platform's contract; the second is about the
   author's conduct. Neither implies the other.

2. **Different audiences and moments.** Plugin-development loads before
   writing plugin code. Code-authoring loads before EVERY file
   modification - including markdown, skills, and non-plugin files
   where the plugin contract is irrelevant. Merging them would force
   the plugin contract into every doc edit and lose the discipline in
   plugin noise.

3. **Independent evolution.** The platform's API evolves with harness
   versions; the authoring discipline evolves with incidents and user
   mandates. Separate homes let each change at its own rate without
   merge churn.

## The One Overlap and How It Is Handled

The guardian note (see
./references/guardian-placement-home.md) deliberately lives in
both: the enforcement DESIGN here, the API implementation notes in
plugin-development. That is the sanctioned pattern for overlaps: the
discipline states WHAT and WHY; the technical skill states HOW.

## Failure Modes

- Duplicating API details here (dispatch modes, schemas) - this skill
  would drift from plugin-development's authoritative version.
- Letting plugin-development absorb file-handling rules "since plugin
  work is file work" - then every non-plugin task loses the
  discipline's home.
- Citing this skill in plugin-development for style questions instead
  of API questions - each skill should be cited for its own scope.
