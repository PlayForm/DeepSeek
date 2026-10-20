# The Smokes Dir, Monorepo-Relative Imports, and the Sibling Symlinks

> Source: SKILL.md, section "The harness pattern", rule 3. Mandate:
> the canonical skill-structure conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The suites run FROM their bundle's `smokes/` directory and import the
code under test with MONOREPO-RELATIVE paths:

```
../packages/<bundle>/Target/Library.js
```

Additionally: the sibling symlinks inside the bundles' `node_modules`
are NOT pnpm-managed. After any package install, they must be
RECREATED by hand (the suite setup), because pnpm will not restore
them.

## Why: The Full Philosophy

1. **Running from `smokes/` fixes the resolution context.** A suite
   that can run from an arbitrary cwd resolves modules (and any
   relative fixture paths) differently per invocation - a non-starter
   for byte-identical output. The working directory is part of the
   suite's identity.
2. **Monorepo-relative imports point at the real built artifact.**
   The path `../packages/<bundle>/Target/...` is deliberately outside
   the bundle's own dependency graph: it loads the built `Target/`
   output directly (see
   ./references/harness-pattern-fake-ctx-real-factory.md) instead
   of a node_modules resolution that might return a published or
   stale copy.
3. **The symlinks are the fragile joint.** The bundles' node_modules
   sibling symlinks (bundle-to-bundle links) exist so imports resolve
   during the run, but pnpm does not manage those particular links -
   an install can silently remove or replace them. A missing symlink
   manifests as a module-not-found at suite time, which is annoying
   but honest; the dangerous variant is a stale symlink pointing at an
   OLD build, which makes a fresh-code suite pass against old code.
   Hence the rule: after every install, recreate them - never assume
   they survived.
4. **This rule is infrastructure, not assertion logic** - which is why
   it lives in the harness-pattern section: the suites' environment is
   part of the harness, and the harness must be reproducible for the
   arbiter's verdicts to mean anything.

## Examples

### Good

- The suite runner (or the recipe) `cd`s into the bundle's smokes dir
  first; imports read `../packages/<bundle>/Target/Library.js`.
- After a `pnpm install`, the setup step recreates the sibling
  symlinks before running any suite.

### Bad

- Running a suite from the repo root because "the import still
  resolves" - resolution now depends on cwd.
- Importing the bundle's code via its package name so node_modules
  decides which copy loads - the built Target artifact is bypassed.
- Skipping symlink recreation after an install because the suites
  "happened to run" - the next suite may load a stale or missing
  sibling silently.

## Exceptions

- No exceptions are on record. Path flexibility (absolute paths,
  package-name imports, alternate cwd) is not offered, because each
  variant reintroduces resolution nondeterminism the rule exists to
  kill.

## Failure Modes

- Wrong relative depth (`../../packages/...` from a nested dir) -
  import error at best, wrong artifact at worst.
- Symlink staleness after a version bump or reinstall: suites load the
  previous build; every green result is vacuous for the new code.
- Recreating symlinks ad hoc per machine instead of in the suite
  setup - a fresh clone fails its first suite run with no hint why.

## Arbiters

- The suite run itself: imports fail loudly if the symlinks are
  missing; a run recipe that recreates symlinks before invoking the
  suites makes the failure impossible to miss.
- Review: new suites are checked for the `../packages/<bundle>/Target/`
  import shape and for a setup that runs from the smokes dir.
