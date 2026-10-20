# The Repository Map (What This Monorepo Is)

> Source: SKILL.md, section 1 ("The repository itself").
> Converted to the canonical skill structure on 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The working repository is the PlayForm DeepSeek monorepo: the DeepSeek
Harness (DSH) plugin family for PlayForm. A session must be able to state
its composition and layout before working in it:

- **The family**: the factory, the core, the governance trio, and the
  seven-member normalize family.
- **The trees**: published trees Classic + EffectTS, plus the internal
  Boilerplate baseline that was never released.
- **The site**: the published static site under `Site/` - 21 pages: the
  landing page, the plugins registry + 12 plugin detail pages, the
  workbench, versions, setup, flavors, matrix, models, case-study.
- **The layout**: `Classic/`, `EffectTS/`, `Boilerplate/`, `Site/`,
  `Test/`, `Documentation/`, `Maintain/`.
- **The site build**: `cd Site && pnpm prepublishOnly` (astro build, outDir
  `./Target`). The site verifies via its built HTML/CSS, never via a dev
  server.

## Why: The Full Philosophy

1. **A map prevents misdirected work.** The most common early error of a
   fresh session is editing or building in the wrong tree - e.g. treating
   `Boilerplate/` (internal, never released) as a publishable tree, or
   editing `Site/` source and believing the site changed without a build.
   Knowing the seven top-level directories and what each is for makes every
   subsequent path decision mechanical.
2. **The two published splits are separate by design.** `Classic/` and
   `EffectTS/` are two published trees of the same family; `Boilerplate/`
   is the internal baseline they were generated from and is never released.
   Keeping the three conceptually distinct prevents cross-tree "fixes" that
   would mix generated and source code.
3. **The 21-page site inventory is part of the map.** The site is a
   deliverable of the family, and its page list (landing, plugins registry +
   12 plugin detail pages, workbench, versions, setup, flavors, matrix,
   models, case-study) is how a session verifies completeness of site work.
   Counting pages is a real check, not trivia.
4. **The build command is the single verification path for the site.**
   `cd Site && pnpm prepublishOnly` runs the astro build into `./Target`.
   The site is verified via the built HTML/CSS in `Target/` - never via a
   dev server. This is a lane law for the site (see
   ./references/lane-laws.md); the map states it because the build
   command is part of the repository's basic description.
5. **`Test/`, `Documentation/`, `Maintain/` are first-class.** Tests,
   documentation (including the specialized skill copies and plans), and
   maintenance tooling live in the monorepo proper. A session that only
   knows the code trees will not know where the governance documents or the
   smoke suites live.

## Examples

### Good

- A session asked to change a plugin detail page edits the site source and
  then runs `cd Site && pnpm prepublishOnly`, verifying the built HTML/CSS
  under `Site/Target/`.
- A session looking for the active plan first opens `Documentation/Plans/`
  rather than guessing from the code trees.

### Bad

- A session publishes or modifies `Boilerplate/` as if it were a released
  tree - it is the internal baseline, never released.
- A session starts a dev server to "check the site" instead of building and
  inspecting `Target/`.
- A session counts site pages against the 21-page inventory and finds fewer,
  then assumes the inventory was wrong instead of investigating what was
  removed or renamed.

## Exceptions

- None documented. The map is descriptive; the only flexibility is the order
  in which a session internalizes it, not whether the facts hold.

## Failure Modes

- Wrong-tree edits: changes made in `Boilerplate/` expecting release effects,
  or changes made in one published split expecting the other to follow.
- Unbuilt site claims: reporting site changes as done when only the source
  was edited and `pnpm prepublishOnly` was never run into `./Target`.
- Page-inventory drift: site pages added or removed without reconciling the
  21-page inventory, so later sessions inherit a wrong count.

## Arbiters

- The directory listing: the seven top-level directories (`Classic/`,
  `EffectTS/`, `Boilerplate/`, `Site/`, `Test/`, `Documentation/`,
  `Maintain/`) are checkable with a single listing.
- The built output: `Site/Target/` is the verification surface for the site;
  grep the built HTML/CSS, never trust the source alone.
- The page count: the site's 21 pages are enumerable from the built output.
