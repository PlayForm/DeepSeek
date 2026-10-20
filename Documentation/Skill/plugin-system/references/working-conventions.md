# The Working Conventions

> Source: SKILL.md, Section 5 (The working conventions), rules 1-3.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Three conventions govern HOW work is done in this family, independent
of WHAT the work is:

1. **One file per response; read before editing; content via
   write/edit; the terminal for builds/tests/metadata only.**
2. **No commits by agents - the user commits.**
3. **The family runs LIVE in the profile: the `~/.dsh` originals are
   never modified by monorepo development - the copies (Boilerplate/)
   are the reference; the releases (Classic/EffectTS) derive from it.**

## Why: The Full Philosophy

1. **One file per response keeps every change inspectable.** A response
   that edits many files produces a change set no reviewer can follow
   and no smoke run can attribute. One file per response means each
   step is a reviewable unit with a known cause and a checkable
   effect. The discipline is the same reasoning as the deterministic
   build (see ./references/deterministic-build.md): small, ordered,
   verifiable steps.
2. **Read before editing is the observation rule.** Editing without
   reading produces edits that match an imagined file, not the actual
   one - stale line numbers, duplicated blocks, clobbered recent
   changes. The read is the edit's prerequisite, always, even for
   files the agent "already knows".
3. **The write/edit API is the file-content channel; the terminal is
   not.** File content flows through write/edit so every change is
   visible, reviewable, and attributable. The terminal exists for
   builds, tests, and metadata (running the prepublishOnly chain,
   invoking smokes, checking package versions) - never for rewriting
   file content through shell passes, which bypass review and can
   silently mangle encoding.
4. **No commits by agents: the commit is the human's signature.** The
   commit boundary is where work becomes history; that decision -
   what goes in, in what order, with what message - belongs to the
   user. Agents prepare; the user commits. This keeps the git history
   a record of human-approved states.
5. **The three-tier layout protects the live profile.** Monorepo
   development happens in the repository copies (Boilerplate/ as the
   reference, Classic/EffectTS/ as the derived releases). The
   `~/.dsh` originals are the DEPLOYED family - editing them from
   development work would corrupt the running system and destroy the
   distinction between source and deployment. Development changes
   reach the live profile only through the deliberate deployment path.

## Examples

### Good

```
response 1: edit Source/Function/run.ts (read first)
response 2: run the bundle's smoke (terminal)
response 3: edit Variable/config.ts (read first)
```

```
// development flow, correct direction:
Boilerplate/ change -> review -> release derivation (Classic/EffectTS)
	-> deliberate deployment to the live profile
```

### Bad

```
sed -i 's/old/new/g' Source/**/*.ts     // file content via terminal
git commit -m "wip"                      // agent committing
vim ~/.dsh/Bundles/hook-dsh-x/...        // editing the live originals
```

## Exceptions

- None for "no commits by agents" - it is absolute.
- None for the three-tier rule: even an emergency live-profile fix is
  made by deploying a corrected release, not by editing `~/.dsh` in
  place; if a true hotfix is unavoidable, it is back-ported into the
  monorepo in the same session so the copies remain the truth.
- The terminal's file-adjacent uses (creating directories the build
  needs, reading metadata) remain legitimate - the prohibition is on
  file CONTENT mutation, not on the terminal itself.

## Failure Modes

- **Multi-file shotgun edits:** one response touching five files. Cost:
  unattributable change sets; a red smoke cannot point at its cause.
- **Edit-without-read:** the edit lands on assumptions. Cost: clobbered
  content, duplicate blocks, lost recent changes.
- **Terminal content passes:** sed/awk/heredoc rewrites. Cost: changes
  invisible to review, encoding damage, no attribution.
- **Agent commits:** history records unreviewed states; the user loses
  the authorship of their own repository.
- **Live-profile editing:** `~/.dsh` drifts from the monorepo; the
  next deployment overwrites the "fix" and the lesson with it.

## Arbiters

- Review: every response's diff shape is checked (one file, read
  evidenced, write/edit channel).
- The user's commit log: it must contain no agent-authored commits.
- The three-tier check: any diff touching `~/.dsh` from development
  work is rejected by default.
- The smokes: they verify the actual edited Source through the built
  Target (see ./references/smoke-arbiter.md), which catches content
  that does not match what the developer believed they wrote.
