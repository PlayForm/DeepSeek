# The Lane Laws for the Site Build

> Source: SKILL.md, section 6, subsection "The lane laws for the site build
> (this repo's Site/ - Aphrodite inherits them)". Converted to the canonical
> skill structure on 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The lane laws apply to this repo's `Site/` build, and Aphrodite's Site
inherits them unchanged. There are four:

1. NO dev servers, NO `tsc` runs, NO git mutations (git is checks only -
   the git law, see ./references/git-law.md).
2. The build IS the verification: `cd Site && pnpm prepublishOnly` (astro
   build, outDir `./Target`), then verify the BUILT HTML/CSS in `Target/` -
   grep the built output, never trust the source alone.
3. The raw-write/identity-exempt-edit rule for any unicode glyph - the
   normalize hooks are active while authoring site content (the file-write
   law, see ./references/file-write-law.md).
4. The site content is documentation-first: each page built from the
   packages' real READMEs/Sources, byte-accurate names, absolute links
   (`https://github.com/PlayForm/DeepSeek/tree/Current/...` for repo
   targets).

## Why: The Full Philosophy

1. **The lane defines what "working on the site" may touch.** A lane law is
   a constraint that holds for the whole workstream, not per-task advice.
   Dev servers, `tsc` runs, and git mutations are excluded so the build is
   the single source of truth for what the site actually is - no parallel
   "it works in dev" reality.
2. **Build-as-verification closes the source/reality gap.** Astro source can
   pass every read and still produce broken or stale HTML. The built output
   in `Target/` is what users receive; verification must happen there.
   Grepping the built HTML/CSS catches template errors, dead includes, and
   cache staleness that source inspection structurally cannot.
3. **The normalize hooks follow the content, not the repo.** Authoring site
   content streams through the same normalization as any other write, so a
   streamed unicode glyph in a page will be silently replaced. Any required
   glyph must go through `raw-write` or identity-exempt `edit` (the
   file-write law). This is restated in the lane because site authoring is
   exactly the kind of high-volume content work where the failure occurs.
4. **Documentation-first is an accuracy law, not a style preference.** Each
   page must be built from the packages' real READMEs/Sources - so page
   content is derived from the actual packages, not invented marketing copy.
   Byte-accurate names prevent the tiny corruptions (a wrong character in a
   package name) that make instructions unexecutable. Absolute links to
   `https://github.com/PlayForm/DeepSeek/tree/Current/...` for repo targets
   ensure links work from the deployed site regardless of page depth.

## Examples

### Good

- After editing a plugin detail page: run `cd Site && pnpm prepublishOnly`,
  then grep the generated HTML under `Target/` for the changed strings to
  confirm the build carried them.
- Writing a page's code samples and package names by copying from the
  package READMEs byte-accurately, and linking repo targets as absolute
  `https://github.com/PlayForm/DeepSeek/tree/Current/...` URLs.
- Needing a unicode glyph in a page: writing it via `raw-write` or an
  identity-exempt `edit`, never trusting a streamed write.

### Bad

- Starting `astro dev` (or any dev server) to "check a page quickly" - dev
  servers are excluded from the lane.
- Running `tsc` over the site sources as a verification step - not part of
  this lane's verification.
- Committing site changes directly - git mutations are forbidden; report
  READY-TO-COMMIT (see ./references/git-law.md).
- Verifying a page by re-reading its source after the edit and skipping the
  build - the built output is the verification surface.
- Writing a repo link as a relative URL (e.g. `../../something`) - repo
  targets use the absolute `tree/Current` form.

## Exceptions

- None documented. The four laws have no per-task carve-outs; they are the
  lane's definition. The only cross-reference flexibility is which deep
  reference to load first - the laws themselves always apply.

## Failure Modes

- Dev-server reality: verifying against a dev server's output, which can
  differ from the built site (HMR-injected code, unminified source), then
  shipping unbuilt assumptions.
- Source-only verification: trusting edited source without a rebuild;
  `Target/` remains stale and the claim of "done" is false.
- Glyph corruption in pages: streamed unicode glyphs silently normalized
  during site authoring; the published page shows the replacement character.
- Invented content: page copy not derived from the packages' READMEs/
  Sources; names drift from byte-accurate forms; relative links break
  deployment paths.

## Arbiters

- The built output: `Site/Target/` (produced by `cd Site && pnpm
  prepublishOnly`) is the only verification surface; checks against dev
  servers or source alone do not count.
- The transcript: any `astro dev`/dev-server start, any `tsc` run in the
  lane, or any git mutation during site work is a lane violation.
- Link check: repo-target links in built HTML must be absolute
  `https://github.com/PlayForm/DeepSeek/tree/Current/...` URLs.
- Name check: package names appearing in built pages must match the
  published names byte-accurately (see ./references/published-family.md).
