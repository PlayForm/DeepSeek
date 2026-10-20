# Read Before Overwrite: raw-write Refuses Unseen Files

> Source: SKILL.md Section 1, rule 3, expanded to full philosophy.

## The Rule

The raw-write tool refuses to overwrite a file it has not seen. Before
overwriting an existing file with raw-write, READ THE FILE FIRST - then issue
the raw-write call. This is a tool-enforced precondition, not a suggestion.

## Why (the full rationale)

- Overwriting a file whose current bytes you have never observed is the classic
  destructive-write bug: you may be replacing content that mattered, or
  replacing content that already satisfies the goal, or clobbering a change
  someone else made. The tool's refusal converts that silent risk into a
  forced observation step.
- For instructional and fixture files the stakes are doubled: the existing
  file may already carry deliberate characters placed by an earlier verbatim
  write. If you overwrite it without reading, you cannot know which characters
  you are obligated to preserve, and you may silently produce a "fixture" that
  has lost part of its inventory.
- The read also gives you the exact current bytes, which is what lets you
  compose a correct full replacement: verbatim writes are whole-file writes,
  so the new content must be a complete, correct file, not a mental patch
  against a file you never saw.

## The procedure, step by step

1. Read the target file with the read tool. Note its full current content,
   including which deliberate characters it contains.
2. Compose the new content in full - the complete file as it should exist,
   characters included, not a diff or an excerpt.
3. Issue the raw-write call with the absolute path and the full content.
4. Verify afterwards with the byte-checks (see the verification reference).

For NEW files (no existing content to clobber) no read is required; the rule
binds only the overwrite case.

## Good vs bad

- GOOD: read the existing fixture, observe it has an em dash in line 3 and a
  curly pair in line 7, compose the replacement keeping both (or deliberately
  restructure while keeping the inventory truthful to the prose), then
  raw-write.
- BAD: raw-write directly onto a file you have only heard about from another
  agent's summary. The tool refuses - and the correct response is to read,
  not to work around the refusal.
- BAD: reading only the first lines "to check it exists". The precondition is
  about knowing the file's content; a partial read that misses the character
  inventory defeats the purpose.

## Exceptions

- None. If the tool refuses because the file is unseen, the remedy is the
  read, never a workaround through the plain write (which would normalize) or
  through shell redirection (which is outside the tool API entirely).

## Failure modes

- Clobbering a verbatim-written fixture with a normalized rewrite because the
  overwrite was issued from memory of what the file "should" contain.
- Assuming the refusal is a sandbox permission problem and escalating or
  retrying with a different tool, instead of simply reading the file.

## Arbiters

- The raw-write tool itself is the first arbiter: it rejects the unseen
  overwrite before it happens.
- The post-write byte-checks catch the content-level damage if the procedure
  was skipped somehow.
