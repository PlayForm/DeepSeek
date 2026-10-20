# Edit Mismatch: Read First, Copy Exact Bytes, Retry - Never the Terminal

> Source: SKILL.md, Section 1 (Tool discipline), rule 6.
> User-mandated 2026-10-03. This file carries the full philosophy; SKILL.md only points here.

## The Rule

When an `edit` call fails because `old_string` does not match:

1. READ the file first (the edit tool requires it anyway - read-before-
   edit policy), at the offset/limit around the target if the file is
   large.
2. Copy the exact bytes from the read output into `old_string` - paying
   attention to whitespace, TABS vs SPACES, trailing punctuation, and
   any characters that render similarly.
3. Retry with the edit tool.

Never "fall back to the terminal." A failed edit is a signal about the
agent's model of the file, not about the file; the fix is a better
model, obtained through the read tool.

## Why This Path Is Mandatory

1. **The mismatch is information.** The edit tool refused because the
   file is not what the agent believes. Possibilities, in rough order of
   frequency:
   - the agent composed `old_string` from memory or from stale context;
   - the file changed since the agent last read it (another agent, a
     build, an earlier edit of its own);
   - whitespace differs: tabs where spaces were assumed, or vice versa;
   - the anchor chosen is not unique and the tool refused ambiguity;
   - non-obvious characters: non-ASCII dashes, curly quotes, invisible
     characters (zero-width spaces, BOMs).
   Each has a different fix, and only a fresh read distinguishes them.

2. **The terminal "fallback" is the trap.** The temptation: "the edit
   tool is fussy, sed will just do it." That converts a safe failure
   into the exact violation the discipline forbids, removes the
   validation layer, and hides the change from the plugin stack. The
   failed edit was the system working; the sed is the system being
   bypassed.

3. **Read-before-edit is not optional anyway.** The harness's default
   file-observation policy requires reading a file before editing it.
   The retry loop is therefore not an extra step - it is the required
   step being performed at the right moment.

4. **Tabs vs spaces is the canonical silent mismatch.** Source files in
   this workspace mix both; terminal rendering makes them look
   identical. The read output preserves them exactly. When in doubt,
   anchor `old_string` on a line whose leading whitespace was copied
   verbatim from the latest read.

## The Recovery Protocol, Step by Step

```
edit fails (no match)
  |
  v
read the file (or the relevant window: offset/limit)
  |
  v
locate the intended target in the FRESH read output
  |
  v
copy old_string character-for-character from that output
  (whitespace, tabs, exact casing, exact punctuation)
  |
  v
retry edit
  |
  +-- fails again: read a wider window; try a smaller, more local
  |   anchor; if the target text is genuinely ambiguous, expand the
  |   anchor until unique
  |
  +-- the target no longer exists / was already changed: re-plan the
      edit against the current content, do not force the old plan
```

## Examples

### Bad (the drift pattern)

```
edit(old_string="  fn run(&self) -> Result<()> {")   # FAILS
bash: sed -i '' 's/fn run/fn execute/' src/Library.rs   # FORBIDDEN
```

### Good (the protocol)

```
edit(old_string="  fn run(&self) -> Result<()> {")   # FAILS
read(file_path="src/Library.rs", offset=120, limit=40)
# read shows the line uses a tab indent and reads "fn run(&self)"
edit(old_string="\tfn run(&self)", new_string="\tfn execute(&self)")
# succeeds: the anchor came from the fresh read
```

## Failure Modes

- Retrying the same `old_string` three times without reading - wasted
  turns, no information gained.
- Shrinking the anchor until it matches the WRONG location (e.g.
  anchoring on a line that appears in two files' contexts of the same
  path) - the replacement lands somewhere unintended, silently, because
  the smaller anchor WAS unique but not semantically unique.
- Assuming the file content from a previous session - files change
  between sessions and between subagents.

## Arbiters

- Session-log review: every edit failure is followed by a read event
  (of the same file) before the next edit attempt, with no terminal
  content command in between.
- The successful edit's `old_string` matches, byte for byte, a region
  of the most recent read output.
