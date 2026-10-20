# The Surgical-Edit Discipline (hard rule)

> Source: SKILL.md, section 6, bullet 4 (user-mandated 2026-10-08).
> Canonical skill structure: the mandate of 2026-10-20. This file
> carries the full philosophy; SKILL.md only points here.

## The Rule

1. Every file modification goes through the harness TOOL API only: the
   read tool first, then the edit tool (literal match, per-region
   fixes).
2. NEVER python / sed / awk / scripts for content mutation. The
   terminal runs COMMANDS - the builds, the tests, the scans - never
   edits.
3. Bulk transformations are forbidden: per-file surgical edits, with
   the arbiter verified after EVERY file.
4. The write/edit tools are the governed path - the fs/observed chain
   fires on them; that governance is the family's whole point.

## Why: The Full Philosophy

1. **Governance attaches to the tools, not to the filesystem.** The
   fs/observed chain (the harness's read-before-edit and observation
   policies) fires when changes go through write/edit. A scripted
   rewrite bypasses the chain: no observation, no governance, no
   record - the change becomes invisible to the very system whose
   behavior the batch is validating.
2. **Scripts edit blindly; tools edit by evidence.** The read tool
   shows the exact bytes (tabs vs spaces); the edit tool matches them
   literally. A sed one-liner matches a pattern and replaces
   occurrences - including the ones nobody meant. Surgical means
   per-region, evidence-backed, verified.
3. **Bulk is how history gets rewritten.** A bulk pass over many files
   produces a diff nobody reviews line by line. The discipline forces
   per-file edits, so each file's change is inspected and its arbiter
   runs immediately after it.
4. **The terminal's role is execution, not mutation.** Builds, tests,
   scans, and generators run as commands are the terminal's legitimate
   work. The boundary: a command whose OUTPUT is the deliverable is
   fine; a command whose effect is mutating tracked source content is
   not.
5. **Arbiter-after-every-file bounds the damage.** A mistake made in
   one file is caught before the next file is touched. Bulk passes
   detect their mistakes at the end, when the cause is far away.

## Examples

### Good

- read file -> edit file (an exact literal match of the region) ->
  re-read the region -> run the arbiter -> next file.
- Running the test suite, the build, or a scan - terminal commands
  whose output informs the next surgical edit.

### Bad

- "Normalize all the files with a python script" - forbidden, even
  once.
- sed -i "s/old/new/g" across the package - forbidden.
- Rewriting a whole file with write when a one-line edit would do, and
  skipping the arbiter because "the change is trivial".

## Exceptions

- Whole-file deletion via rm is allowed (verify the resolved absolute
  path first) - deletion is not content mutation.
- mkdir is allowed.
- Generated artifacts produced by running the project's own build
  commands are terminal output, not surgical edits - the source files
  the generator consumes are still edited only through the tools.

## Failure Modes

- **Scripted mutation:** the change bypasses governance; the batch's
  observations no longer match reality.
- **Over-matching:** a pattern edit replaces unintended occurrences;
  the damage spans files.
- **Deferred verification:** a bulk pass ends with a dozen broken
  files and no idea which edit broke which.
- **Normalization surprises:** whitespace or encoding changes from a
  script corrupt byte-exact contracts (the quoted ledger strings).

## Arbiters

- The transcript shows read -> edit pairs for every changed file; no
  content-mutating terminal commands.
- The arbiter runs after every file (see
  ./references/build-verified-rule.md).
- The diffs are per-file and reviewable line by line.
