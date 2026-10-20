# Deletion Via rm IS Allowed

> Source: SKILL.md, Section 1 (Tool discipline), rule 2.
> User-clarified 2026-10-03. This file carries the full philosophy; SKILL.md only points here.

## The Rule

Deleting a whole file with `rm` is ALLOWED. This was explicitly clarified
by the user on 2026-10-03, against the natural reading of "never touch
files through the terminal."

The distinction: `rm` is a COMMAND OPERATION, not a content edit. It does
not decide what bytes appear inside any file; it removes an entire file
from the filesystem. The content-editing discipline governs how bytes get
into and out of files. Removing the file itself is a different category.

The other `rm`-family operations follow the same logic:

| Operation | Status | Reasoning |
|-----------|--------|-----------|
| `rm file` | ALLOWED | whole-file removal; no content decision |
| `rm -r dir` | ALLOWED | whole-directory removal; no content decision |
| `rm -f` / `rm -rf` | ALLOWED with care | same category, but suppresses the "no such file" error, so a wrong path fails silently |
| `mv a b` (rename/replace) | ALLOWED | a filesystem operation, not a content edit |
| overwriting a file's bytes via redirection (`> file`) | FORBIDDEN | that IS a content edit |

## The Safety Protocol

Because `rm -f` fails silently, the rule carries one hard precondition:

**Verify the resolved absolute path before deleting.** The command the
agent runs must target a path the agent has actually resolved and seen -
via `ls`/`stat`/`glob`/`find` - not a path assembled from a variable, a
glob, or an assumption about the working directory.

### The verification steps, concretely

1. Confirm the file exists and is the intended one: `ls -la <path>` or
   `stat <path>`, or a `glob` tool call matching the expected name.
2. Resolve any variable expansion mentally: what does the full literal
   path become? If the path is built from `${VAR:?}` and `VAR` is unset,
   the guard makes the command fail instead of deleting from the root.
3. Prefer the exact literal path over glob patterns in the `rm` itself.
   `rm src/old/Library.rs` is fine; `rm src/*/[LR]ibrary.rs` is not,
   because the agent has not enumerated what the glob expands to.
4. When deleting many files, list them first (`ls` the directory), then
   delete the explicit list.

### Good

```
ls -la src/old/
rm src/old/Library.rs
rm -r build/generated-cache/
```

### Bad

```
rm -rf $TARGET_DIR/            # TARGET_DIR unset: expands to "rm -rf /"
rm $(find . -name "*.tmp")     # never enumerated what find returns
rm /tmp/*.json                 # not verified which files match
```

## Why This Exception Exists

Without the exception, the agent has no way to complete ordinary work:
pruning generated artifacts, removing a superseded file before writing
its replacement, cleaning a failed scaffold. Forcing whole-file deletion
through the tool API would be artificial - the tool API has no delete
tool in this harness, and creating empty placeholder files instead of
deleting would be worse.

The exception stays narrow on purpose. It permits removal; it does not
permit any byte-level decision. The moment a terminal command both
removes and rewrites (`sed -i` then `rm`, or a move that merges content),
the content half is a violation.

## Failure Modes

- Deleting from an unset or wrong variable (the classic `rm -rf $VAR/`
  disaster) - prevented by the resolve-first protocol.
- Deleting a file that was still needed because a glob matched more than
  expected.
- Using `rm` as a workaround for an edit ("delete then heredoc it back")
  - that converts an allowed operation into a forbidden content edit.

## Arbiters

- Session-log review: every `rm` command must be preceded in the log by
  a verification of the exact path (`ls`, `stat`, or a glob/read hit) and
  must use a literal, resolved path.
- Any `rm` whose target contains an unexpanded variable, an unverified
  glob, or a path the log never shows being inspected is a violation.
