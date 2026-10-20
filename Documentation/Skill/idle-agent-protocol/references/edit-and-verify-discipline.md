# The Surgical-Edit and Build-Verified Discipline

> Source: SKILL.md, "The environment + the scope discipline", bullets 4-5 (user-mandated 2026-10-08). Skill: idle-agent-protocol.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

1. **THE SURGICAL-EDIT discipline.** Every file modification goes through the harness TOOL API ONLY: the read tool first, then the edit tool (the literal match, the surgical per-region fix). NEVER use python/sed/awk/scripts to mutate file content. bash/python run COMMANDS - the builds, the tests, the scans - never edits. A bulk transformation is FORBIDDEN: per-file surgical edits, with the build verified after each file. This is the code-authoring discipline: the write/edit tools are the governed path (the fs/observed chain fires on them).
2. **THE BUILD-VERIFIED rule.** After EVERY file you touch, the relevant arbiter must pass before you continue - the site build for the site files, the smokes for the packages. Never leave the tree in a broken state at any moment: if your edit breaks the build, fix it immediately before moving on.

## Why: The Full Philosophy

1. **The tool API is the governed path.** The harness's write/edit tools sit inside the fs/observed chain - the governance layer that observes and verifies what an agent writes. A sed or python in-place rewrite bypasses that chain entirely: the mutation is invisible to governance and unauditable in the transcript. The rule exists so that every byte an agent changes has a governed, reviewable trail.
2. **Read-before-edit is not ceremony - it is the edit's precondition.** The edit tool matches literal bytes; without a fresh read you are matching against a memory of the file, and in a concurrent batch (see ./references/batch-environment.md) that memory is stale by definition. The read is what makes the edit surgical: you match the current bytes, in the one region, and nothing else moves.
3. **Scripts split into two roles.** bash/python are for COMMANDS: builds, tests, scans - the things that read the tree and print results. They are never the things that write the tree. The split keeps the mutation surface entirely inside the governed tools while keeping full script power for verification.
4. **Bulk transformations are forbidden because they are ungovernable at scale.** A scripted pass over 40 files produces 40 unreviewed mutations in one step; a failure mode in the script replicates across all of them; the diff is unattributable per-file. Per-file surgical edits make every mutation individually reviewable and individually revertible.
5. **Build-verified is the tree's invariant, not a final check.** In a shared repository, a broken state is not private - every other lane that builds inherits your breakage. "Never leave the tree broken at any moment" turns the arbiter into a per-step gate: edit, verify, continue.
6. **Per-file verification localizes failures.** If the build breaks after file N, the cause is file N - not one of the last dozen edits. The per-file cadence is what makes the arbiter diagnostic instead of merely terminal.

## Examples

### Good

- The cycle for each file: read the file (tool) -> edit the exact region (tool, literal match) -> run the relevant arbiter (bash: the site build or the package's smokes) -> the printed result is green -> next file.
- A rename touching 12 files: 12 separate read/edit pairs, each followed by the arbiter, each reported with its own file:line anchor.
- The edit's old_string copied byte-for-byte from the just-taken read, tabs and all.

### Bad

- `sed -i 's/old/new/g' src/**/*.ts` - a bulk, ungoverned mutation; forbidden even when the pattern is "obviously safe".
- `python -c "open(f,'w').write(...)"` to "quickly fix" a file - a terminal-path edit; the governance chain never saw it.
- Editing from a read taken 20 minutes ago - the literal match silently lands on stale bytes, or matches a region another lane has since changed.
- Five files edited in a row, then one build at the end - the tree sat broken-or-unverified for the whole stretch, and a failure is now ambiguous across five files.

## Exceptions

- **Whole-file deletion via rm is allowed** (with the resolved absolute path verified first) - deletion is not a content mutation and has no in-place rewrite to govern; creating directories (mkdir) is likewise allowed.
- **New-file creation goes through the write tool** - the governed path applies to creation too; the "edit" half of the discipline concerns existing files.
- **There is no exception to the build-verified cadence.** When an edit breaks the build, the obligation is immediate repair before continuing - the tree's green state at every moment outranks the spec's schedule.

## Failure Modes

- **The terminal shortcut.** "It's just one substitution" via sed. Cost: an ungoverned mutation; the transcript cannot show what changed; the verification chain was bypassed.
- **The bulk pass.** Cost: N simultaneous mutations, shared blame for any breakage, per-file attribution destroyed.
- **The stale read.** Cost: silent clobbering of another lane's bytes, or a failed match that tempts the agent toward riskier tools.
- **The deferred build.** Cost: a broken tree visible to every other lane; the failure localized to nowhere.
- **The unverified claim.** Reporting a file as done without its arbiter run. Cost: false completion aggregated by the parent (see ./references/flag-and-report.md).

## Arbiters

- **The transcript.** Every content mutation must appear as a read/edit (or write) tool call; a changed file with no tool-API trail is a violation discoverable by any reviewer.
- **The arbiters of record.** The site build for site files, the smokes for packages - run, printed, pasted (see ./references/universal-batch-rules.md).
- **The tree state at every handoff.** At any moment another lane or the user may look at the tree; the invariant is that it builds whenever it is observed.
