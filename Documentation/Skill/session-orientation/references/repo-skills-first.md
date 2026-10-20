# Repo Skills First (Documentation/Skill/ Is the Specialized Truth)

> Source: SKILL.md, section 0, item 1 (the repo's OWN skills FIRST).
> Converted to the canonical skill structure on 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

If the working repository has `Documentation/Skill/*.md`, read every
`SKILL.md` there BEFORE any other orientation step. Those copies are the
SPECIALIZED TRUTH for this project - each carries a header note marking it as
the specialized working copy. The global skills at
`~/.dsh/skills/<name>/SKILL.md` are the FALLBACK, for sessions running
outside a repository that carries its own skills.

Precedence when the two disagree: **the repo copy wins.**

Correction rule: if you must correct a rule, sync the fix to BOTH copies -
the repo copy and the global copy - so the two never drift apart silently.

## Why: The Full Philosophy

1. **A repository knows itself better than the global skill set does.** The
   global skills at `~/.dsh/skills/` describe the DSH Family in general.
   The repo's `Documentation/Skill/` copies are checked into the repository
   and specialize every rule with the project's actual paths, lane laws,
   build commands, and current task state. A general rule plus a specialized
   override is more accurate than either alone - and the override is the one
   that is versioned, reviewed, and shipped with the code it governs.
2. **Versioning is the deep reason.** The global skills are a live profile:
   they change outside any repository's history. The repo copies change with
   commits, so a session can tell WHICH rule set was in force at the time a
   given change was made. Specialized truth being versioned with the work it
   governs makes audits possible.
3. **The fallback exists so the protocol is total, not partial.** Sessions
   also run outside any repo that carries its own skills (tooling sessions,
   cross-repo work). Without a fallback the protocol would have a hole; with
   it, every session - in a specialized repo or not - has a defined source
   for every skill.
4. **"The repo copy wins" removes arbitration overhead.** Without a declared
   precedence, every disagreement between copies becomes a judgment call
   made under time pressure, and different sessions resolve it differently.
   A fixed precedence turns a class of decisions into a lookup.
5. **Sync-both-copies prevents divergence from becoming doctrine.** If a fix
   lands only in the repo copy, the global copy keeps teaching the old rule
   to every other session; if it lands only in the global copy, the repo copy
   reverts the fix for this project on the next read. Correcting one side
   only guarantees the disagreement returns.

## Examples

### Good

- A fresh session in this repository lists and reads every
  `Documentation/Skill/*/SKILL.md` before reading the global
  `~/.dsh/skills/` copies of the same skills.
- The repo copy of `task-routing` states a project-specific route; the
  session applies the repo copy without hesitation, because repo truth wins.
- A session finds the repo copy's build command is outdated, corrects it,
  and edits BOTH the repo copy and the global copy in the same work item.

### Bad

- A session reads only `~/.dsh/skills/<name>/SKILL.md` while working in a
  repository that carries `Documentation/Skill/` - it applies the general
  rule and misses the specialized overrides.
- A session treats a disagreement as "probably a typo somewhere" and picks
  whichever copy it opened first - instead of applying the fixed precedence
  (repo wins) and syncing the fix to both.
- A session "fixes" the repo copy and leaves the global copy stale - the
  next session outside this repo inherits the wrong rule.

## Exceptions

- The fallback path is not an exception but a defined mode: when the working
  repository has NO `Documentation/Skill/` directory, the global skills at
  `~/.dsh/skills/<name>/SKILL.md` are authoritative by default, because there
  is no specialized copy to outrank them.
- No other exceptions are documented. A user instruction can override the
  precedence for one decision, but the default remains repo-copy-wins and
  the instruction does not become a new rule.

## Failure Modes

- Wrong-source orientation: the session works from the global copy in a
  specialized repo and violates a lane law or path rule that only the repo
  copy carries.
- One-sided sync: a correction lands in one copy only; the disagreement
  reappears for the next session and now looks intentional.
- Header-note blindness: the repo copies carry a header note marking them as
  the specialized working copy; ignoring that note leads a session to treat
  the two copies as interchangeable duplicates and merge them carelessly.
- Precedence drift: a session invents "newest file wins" or "global wins
  because it is the profile" - any invented precedence breaks the protocol's
  reproducibility.

## Arbiters

- The precedence is mechanical: if `Documentation/Skill/<name>/SKILL.md`
  exists, it governs; otherwise `~/.dsh/skills/<name>/SKILL.md` does. Any
  session can check which source it used by listing the repo's
  `Documentation/Skill/` directory.
- Cross-copy consistency: when a rule is corrected, both copies must show the
  corrected text; a review that finds the same rule stated differently in the
  two copies (with no header note explaining why) has found a sync failure.
- Session transcripts: reads of repo skill copies should precede reads of
  global skill copies in a specialized repository.
