# Every Modification Through the write/edit Tool API

> Source: SKILL.md, Section 1 (Tool discipline), rule 4.
> User-mandated 2026-10-03. This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every file modification uses the harness tool API. There are exactly two
instruments:

| Tool | Semantics | Use when |
|------|-----------|----------|
| `write` | create or FULLY REPLACE the file with the given UTF-8 content, verbatim | new file; or the new content differs so broadly that an edit would be a sham |
| `edit` | literal `old_string` -> `new_string` replacement; the match is VALIDATED | targeted change inside an existing file |

No third path exists for changing bytes inside a file. Anything else that
changes file content - a terminal command, a script, a piped redirection -
is a violation of the discipline (see
./references/never-terminal-content-edits.md).

## The Two Tools' Full Contracts

### write

- Creates the file if absent; fully replaces it if present.
- Content is taken VERBATIM: what the agent provides is what lands on
  disk. There is no escaping layer, no interpolation, no shell quoting.
  The verbatim property is also the risk surface: malformed content
  (NUL bytes, control characters) lands as-is. See
  ./references/byte-no-null-control-bytes.md.
- Read-before-overwrite is policy: the harness requires reading an
  existing file before `write` replaces it. This prevents the classic
  accident of clobbering a file whose content the agent never saw.

### edit

- Requires `old_string` to match the file EXACTLY - including whitespace,
  tabs vs spaces, and every character. A non-match is an error, never a
  fuzzy fallback.
- When `replace_all` is false (the default), `old_string` must appear
  exactly once; this makes single-point replacements unambiguous.
- Because the match is validated, a failed edit is a SAFE failure: the
  file is untouched, and the agent's recovery path is read-then-retry
  (see ./references/edit-mismatch-read-first.md).

## Why the Tool API Is the Only Path

1. **Observability.** Tool-layer writes are the events the harness's
   fs/observed chain distributes to the governor, pinner, and
   Cargo-flavor plugins. The write IS the governance trigger. See
   ./references/mechanism-fs-observed-governance.md.
2. **Validation.** `edit` refuses bad matches; `write` demands prior
   reads. Both tools fail loudly and safely. Terminal edits fail softly
   and silently.
3. **Verbatim fidelity.** No shell escaping layer sits between the
   agent's intent and the bytes. With `sed`/`awk`/heredocs, the shell's
   quoting rules are an unreviewed transformation of the content.
4. **Uniformity.** Every agent, every model, every session uses the same
   two operations. Skills, reviews, and automation can assume the shape
   of every change event.

## Choosing Between write and edit

```
Is the file new?                      -> write
Does the change replace > ~30% of
the file, or reorder whole sections?  -> write (full replacement, honest
                                         and easier to review than a
                                         chain of large edits)
Is it a localized change?             -> edit with a minimal old_string
                                         anchor (the smallest string that
                                         is still unique)
```

An `old_string` should be large enough to be unique but no larger: a
single line that appears once is better than a ten-line block that
introduces more mismatch risk.

## Failure Modes

- Using `write` to "replace" a file the agent never read - blocked by
  read-before-overwrite policy, and in violation of it.
- Writing a huge `old_string` for `edit` (the whole file) - fragile, and
  equivalent to a rewrite disguised as an edit; prefer `write` then.
- Piping tool-shaped content through the shell anyway (`echo "..." >
  file`) - the exact violation this rule exists to prevent.

## Arbiters

- Session-log review: every content change appears as a `write` or
  `edit` tool event.
- The fs/observed ledger: the change events and the file states agree.
- Any file whose bytes changed without a write/edit event is a
  violation regardless of how good the resulting content is.
