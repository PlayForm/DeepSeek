# The File-Write Law (The Normalize Hooks Are Active)

> Source: SKILL.md, section 4 ("The file-write law (the normalize hooks are
> ACTIVE)"). Converted to the canonical skill structure on 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

File writes go ONLY through the `write`/`raw-write`/`edit` tool API - never
terminal content edits. Forbidden: sed/awk/perl/python in-place rewrites,
heredoc file surgery.

The normalize hooks are ACTIVE in this profile: streamed model output is
normalized live (dashes, curly quotes, ellipsis, unicode spaces, invisible
characters, fullwidth forms). Consequences:

1. Prefer ASCII-safe content; never need a real unicode glyph inside a
   streamed write.
2. When a real unicode glyph IS required (byte-faithful copies, unicode test
   data), use `raw-write` (exempt from normalization by name) or `edit`
   (identity-exempt).
3. Never build file content through NUL-terminated/NUL-separated conventions;
   after any bulk transformation, byte-scan the touched files (zero NUL
   bytes, valid UTF-8) before reporting done.

## Why: The Full Philosophy

1. **The tool API is the observable, governed path.** Writes through
   `write`/`raw-write`/`edit` are visible in the transcript, countable, and
   reversible by review. Terminal rewrites (sed -i, heredoc redirection) are
   invisible to the model's own record: the model cannot know exactly what
   bytes the shell wrote, so it cannot honestly verify its own work.
2. **The normalize hooks change what a streamed write MEANS.** Because the
   profile normalizes streamed model output live, a streamed write of a
   curly quote or an em dash arrives as its ASCII replacement. That is a
   feature for prose (stable, ASCII-clean files) and a hazard for content
   that must preserve exact bytes. The law makes the distinction explicit:
   ASCII by default, byte-faithful paths when bytes matter.
3. **`raw-write` is exempt by name; `edit` is identity-exempt.** When a real
   unicode glyph is required - byte-faithful copies of existing files,
   unicode test data, a document whose content must contain a specific
   glyph - the two paths that bypass normalization are `raw-write` (its
   stream traffic is exempt from the normalize family by name) and `edit`
   (which applies an exact old->new replacement, identity-exempt). These are
   the sanctioned doors; there are no others.
4. **NUL bytes are the signature of a broken pipeline.** NUL-terminated or
   NUL-separated content conventions produce files with embedded NUL bytes -
   invalid for most consumers and a marker that content was assembled by
   scripting rather than by the tool API. The law forbids the convention and
   mandates a byte-scan after any bulk transformation, so a violation is
   caught before "done" is reported, not after a consumer fails.

## Examples

### Good

- Writing a new markdown reference with `write` in pure ASCII - hyphens for
  dashes, straight quotes, three-dot ellipsis written as `...`.
- Copying a unicode test fixture byte-faithfully with `raw-write`, so the
  glyphs survive normalization untouched.
- Fixing one exact string inside a large file with `edit` (identity-exempt)
  instead of rewriting the file through a shell one-liner.
- After any bulk transformation, scanning the touched files for NUL bytes
  and validating UTF-8 before reporting completion.

### Bad

- `sed -i 's/old/new/' file` to patch a file - a terminal content edit;
  forbidden even for a one-character fix.
- A heredoc (`cat > file <<EOF`) writing a config file - file surgery
  through the shell; the model cannot verify the resulting bytes.
- Streaming a curly quote or em dash inside a `write` call and assuming the
  glyph arrived - the normalize hooks replaced it; the file now differs from
  intent.
- Building a file as NUL-separated records "because it is convenient" - the
  NUL bytes are the failure signature, not a format choice.

## Exceptions

- `raw-write` and `edit` are not exceptions to the law - they ARE the law's
  sanctioned paths for byte-faithful content. The law's exception surface is
  otherwise empty: there is no scenario in which a terminal in-place rewrite
  becomes acceptable.
- Bulk transformations (when genuinely required) are not exempt from
  verification: the mandatory byte-scan after the pass is part of the rule,
  not an alternative to it.

## Failure Modes

- Silent glyph replacement: a streamed write silently normalizes a unicode
  glyph to ASCII; the file is valid but no longer byte-faithful - a test
  fixture or copy no longer matches its source.
- Unverifiable shell writes: content written via sed/heredoc cannot be
  confirmed by the model, so "done" is claimed on faith.
- NUL contamination: content assembled through NUL-separated conventions
  leaves NUL bytes in the file; downstream parsers fail or silently truncate.
- Missed post-pass verification: a bulk transformation is run and reported
  done without the byte-scan; the contamination is discovered by a consumer
  later.

## Arbiters

- The transcript: every file-content mutation must appear as a
  `write`/`raw-write`/`edit` call; a shell command that modifies file
  content is a violation by inspection.
- The byte-scan: touched files must show zero NUL bytes and valid UTF-8
  after any bulk transformation; the scan result is reported before "done".
- The normalize hook list is checkable: dashes, curly quotes, ellipsis,
  unicode spaces, invisible characters, fullwidth forms are the transforms
  active on streamed output.
