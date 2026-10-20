# Never Read File Content Through the Terminal

> Source: SKILL.md, Section 1 (Tool discipline), rule 3.
> User-mandated 2026-10-03. This file carries the full philosophy; SKILL.md only points here.

## The Rule

Never read file content through the terminal. No `cat`, no `sed -n`, no
`head`/`tail` of source files, no `grep` of file contents, no `less`, no
`awk '{print}'` dumps. The read-side of the discipline mirrors the
write-side exactly.

The dedicated tools own the read surface:

| Need | Tool |
|------|------|
| Read a file's content (line-numbered) | `read` tool |
| Search file contents | `grep` tool |
| Find files by path pattern | `glob` tool |
| Filesystem metadata (size, mtime, permissions, existence) | `stat`, `ls`, `find` in the terminal |
| Process state | `ps`, `lsof`, etc. in the terminal |

## Why: The Full Derivation

1. **Symmetry with the write-side.** The write-side rule exists because
   tool-layer writes produce observation events the plugin stack depends
   on. The read-side rule exists for the same architectural reason from
   the other direction: the tool API is the agent's ONLY structured
   interface to file content. When content flows through the tools, the
   session log records exactly what the agent saw; the reasoning can be
   traced file by file, line by line. When content flows through a
   terminal, the log records only a command string and an unstructured
   stdout blob - the agent's knowledge of the file becomes
   unreconstructable.

2. **Line-numbered grounding.** The `read` tool returns line numbers.
   Subsequent `edit` calls are anchored on those exact lines. A `cat`
   dump strips that anchor, and the agent ends up composing `old_string`
   values from memory or from mangled terminal output (wrapped lines,
   tabs expanded, ANSI sequences) - the direct cause of failed edits.

3. **The mangle risk.** Terminal reads corrupt perception silently:
   - `cat` collapses nothing but the terminal width wraps long lines;
     the agent copies the wrapped form as if it were the file.
   - Tabs vs spaces are visually indistinguishable in terminal output.
   - Unicode characters may render as look-alikes or be dropped by the
     pty.
   - Truncated output (the executor's tail-cap) hides the middle of a
     large file while looking complete.
   The `read` tool returns the file's actual UTF-8 text with exact
   structure, offset/limit pagination, and no pty in the path.

4. **Grep tool, not grep command.** The `grep` tool returns grouped,
   line-numbered matches with structured limits and integration with
   follow-up reads. `grep`/`rg` in the terminal produces the same
   information in a form the session log cannot re-anchor. The rule is
   about the channel, not the algorithm: same search, structured tool.

5. **Glob tool, not `find` for content discovery.** Locating files by
   pattern is a read-side concern and belongs to the `glob` tool, which
   normalizes matching (hidden files, ignored files) and returns paths
   ready for read/edit. `find` remains allowed only for filesystem
   metadata questions (sizes, dates, permissions).

## The Legitimate Terminal Surface

The terminal is for RUNNING COMMANDS:

- tests (`pnpm test`, `cargo test`)
- packaging and installs (`pnpm pack`, `npm install`, `pnpm install`)
- syntax checks (`node --check file.js`)
- whole-file deletion (`rm` - see
  ./references/deletion-via-rm-allowed.md)
- filesystem METADATA and process state (`ls`, `stat`, `find` for
  metadata only, `du`, `ps`, `lsof`, `git` checks - see
  ./references/git-checks-only.md)

"Metadata only" is the key qualifier for `find`/`ls`: printing a file's
name, size, or timestamp is fine; printing its CONTENTS is not.

## Examples

### Good

```
read(file_path="src/Library.rs", offset=40, limit=80)
grep(pattern="fn execute", include="*.rs", path="src")
glob(pattern="**/*.{md,markdown}")
ls -la src/           # metadata: names, sizes, times
node --check dist/plugin.js
```

### Bad

```
cat src/Library.rs
sed -n '40,80p' src/Library.rs
head -100 README.md
tail -20 build.log | grep error      # content of files via terminal
grep -rn "fn execute" src/
find . -type f -exec cat {} \;
```

## Exceptions

- Output of RUNNING COMMANDS may be read freely: a build's stdout, a
  test's log, `git diff` output. That is process output, not file
  content access. The line is whether the terminal command was chosen to
  observe a file's bytes (`cat`) or to do work whose output happens to
  mention files (a build).
- Byte-level verification of written files (the post-bulk-write scan,
  see ./references/byte-verify-after-bulk.md) uses a scripted bytes
  read (e.g. Python) because the check is about BYTES, not text: zero
  NUL bytes, no stray control characters, valid UTF-8. That scan is an
  arbiter mandated by SKILL.md Section 1c and is the sanctioned
  exception; the read tool cannot see byte values.

## Failure Modes

- An edit fails because `old_string` was composed from a wrapped or
  truncated `cat` dump.
- The agent "reads" a 4000-line file via `tail -500` and misses the
  definition it needed at line 300.
- Review cannot reconstruct what the agent knew when it made a change,
  because the knowledge arrived through unlogged terminal dumps.

## Arbiters

- Session-log review: no `cat`, `head`, `tail`, `sed -n`, `less`, `awk`
  prints, or content `grep`/`rg` commands on source files.
- Every fact the agent cites about a file's content must trace to a
  `read`/`grep`/`glob` tool event (or to the sanctioned byte-scan
  exception).
