# Tool Discipline: The Writers, the Mismatch Path, and the Subagents

The rule: file content is modified only through the tool API. This file
states the mechanics and the reasons the rule is not negotiable.

## The writers

| Writer          | Use for                                                        | Normalization |
| --------------- | -------------------------------------------------------------- | ------------- |
| `write`         | New files, full replacements, ordinary ASCII content           | Streamed text is normalized by the active hooks |
| `raw-write`     | Byte-faithful content: typographic fixtures, exact copies, demo pairs | Verbatim by default; `normalize` opts in |
| `edit`          | One literal replacement inside an existing file                | Identity-exempt outside the replaced span |
| `normalize-file`| Whole-file normalization of a file already on disk             | Applies the selected transforms |

`raw-write` options:

- `normalize` absent or `false`: write the bytes verbatim.
- `normalize: true`: apply all six transforms.
- `normalize: ["dash", "quotes"]`: apply only the named flavors.
- `govern: true` or a name array: route a manifest write through the
  direct-govern chain; `false` is the explicit escape hatch.

`raw-write` refuses to overwrite a file it has not seen in the session.
Read first. It resolves relative paths against the profile root, not the
current directory: pass an absolute path for repository targets.

`edit` matches literal text. When the match fails, the file changed or
the copied bytes were wrong. Re-read the exact span, copy it verbatim, and
retry. Never fall back to a shell rewrite.

## Why the terminal is not a writer

1. **The model cannot verify what the shell wrote.** A `sed -i` or a
   heredoc is a command whose effect on bytes is inferred, not observed.
   The tool API returns the content it wrote, so the next read is a check
   rather than a guess.
2. **The governance hooks fire on tool-layer writes only.** `fs/observed`
   drives the package governor, the pinner, and the cargo governor. A
   terminal write is invisible to all three; the family's own plugins do
   not see it.
3. **The transcript is the audit.** Every content change appears as a
   tool call with its arguments. A shell rewrite leaves no comparable
   record, so a review cannot reconstruct what happened.
4. **The incident.** On 2026-10-03 a Python in-place patch injected
   `await` into a synchronous function. The edit tool would have rejected
   the mismatched context; the shell accepted it silently.

## The read side

The `read`, `grep`, and `glob` tools own content inspection. The terminal
runs commands: builds, tests, package managers, git checks, listings,
byte scans. `cat`, `head`, `tail`, and content `grep` are not inspection
tools here; they bypass the read surface and the hooks.

## Deletion

`rm` is allowed: deletion is a command operation, not a content edit.
Verify the resolved absolute path first, especially when it was built from
a variable. Never run `rm -rf` against a computed path you have not
printed and checked.

## Subagents

Every delegated coding task carries these lines in its prompt:

```text
File content: use the write/raw-write/edit tools only. Never sed, awk,
perl, python in-place, or heredoc surgery. Never read file content with
cat/head/tail/content grep; use the read/grep/glob tools.
Deletion: rm is allowed after verifying the absolute path.
Read before edit; on a mismatch, re-read and retry with the edit tool.
Git: read-only checks only. Report READY-TO-COMMIT; never commit.
```

A subagent that cannot follow the discipline is a failed delegation, not
an exception to the rule.

## Programmatic enforcement (deferred)

The durable fix is a hook that intercepts the terminal at
`tools/pre-execute` and detects content-edit patterns. Two modes are
designed: deny with a structured reason, or rewrite the command into the
equivalent tool call. Neither ships yet. Until then the discipline is
prompt-level, and this file is the prompt.
