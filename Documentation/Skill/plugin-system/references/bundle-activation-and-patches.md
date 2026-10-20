# Bundle Activation and Patches

> Source: SKILL.md, Section 1 (The loader contract), rule 3.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The bundle layers compose at boot:

- Activation: the profile's `dsh.profile.bundles` list PLUS the
  `link:` dependencies are the activation. A `file:` dependency alone
  is NOT activation.
- Patches: `cordis.patch.yml` entries either DECLARE a new entry
  (`insert:`) or PATCH an existing one (a bare `id:` row - the config
  REPLACES the entry config wholesale; unknown ids are rejected).

## Why: The Full Philosophy

1. **`link:` vs `file:` is activation vs availability.** A `file:`
   dependency only tells the resolver where a package lives on disk -
   it makes the package available, not loaded. The
   `dsh.profile.bundles` list (and a `link:` dependency, which is a
   profile-scoped link into the live bundle set) is what actually puts
   the plugin into the boot graph. Developers who add a `file:` entry
   and expect the plugin to load produce the classic "my plugin is
   installed but does nothing" state.
2. **Patch configs replace wholesale, on purpose.** A bare `id:` row
   in `cordis.patch.yml` means "this entry's config becomes exactly
   what I wrote here." Partial-merge semantics would make the live
   config the product of an invisible fold across the base defaults and
   every patch layer - undebuggable. Wholesale replacement means the
   effective config is always visible in one place.
3. **Unknown ids are rejected, not ignored.** A patch naming an id that
   does not exist is a boot-time error, because a silently ignored
   patch is the worst failure mode: the developer believes a behavior
   was changed when it was not. Loud rejection costs a failed boot;
   silent acceptance costs weeks of false belief.

## Examples

### Good

```
dsh.profile.bundles:
	- ./Bundles/hook-dsh-govern        # activation
dependencies:
	hook-dsh-govern: link:./Packages/hook-dsh-govern   # linked + active
```

### Bad

```
dependencies:
	hook-dsh-govern: file:../hook-dsh-govern   # available only - NOT active
```

```
# cordis.patch.yml - patching an existing entry by bare id:
- id: hook-dsh-govern
	config:
		parallel: true        # REPLACES the whole entry config
```

## Exceptions

- None. The two-part activation rule has no carve-out: every family
  plugin that must run live is in the bundles list, and every patch
  goes through `cordis.patch.yml` with a known id.

## Failure Modes

- **file:-only installs:** the package resolves, types check, smokes
  pass, and the live profile never loads it. Cost: a silent feature
  absence discovered by behavior, not error.
- **Assuming patch configs merge:** writing one field into a bare
  `id:` row and assuming the rest of the entry config survives. Cost:
  every other field of that entry's config resets to schema defaults -
  a regression that only shows live (the smokes do not cover patch
  layers; see ./references/smokes-prove-mechanics.md).
- **Misspelled patch ids:** expected to be rejected loudly; if a build
  or script silently drops unknown rows instead, the error surface is
  lost. Cost: patches that never apply.

## Arbiters

- The live battery: patch layers, load order, and config interplay are
  live-profile findings, not smoke findings (see
  ./references/smokes-prove-mechanics.md).
- Boot itself: unknown patch ids fail LOUD at load.
- Review: any diff adding a `file:` dependency must answer "what makes
  this active?" in the same diff.
