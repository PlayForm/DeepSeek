# Never Edit File Content Through the Terminal

> Source: SKILL.md, Section 1 (Tool discipline), rule 1.
> User-mandated 2026-10-03. This file carries the full philosophy; SKILL.md only points here.

## The Rule

Never edit file CONTENT through the terminal. No `sed -i`, no `awk`, no
`perl -pi`, no Python in-place rewrites, no shell heredoc file surgery.
Every content change to every file goes through the harness tool API:
the `write` tool (create or fully replace) and the `edit` tool (literal
replace with validation).

This is a hard rule, not a preference. It applies to every file the agent
touches: source code, markdown, configuration, JSON, YAML, generated
artifacts, documentation, and the skill files themselves.

## The Boundary of "Content Edit"

The rule draws a precise line between two categories of terminal work:

| Category | Terminal status | Examples |
|----------|-----------------|----------|
| File CONTENT edit | FORBIDDEN | `sed -i`, `awk` in place, `perl -pi -e`, `python3 -c` rewrite, `tee`, redirection into a source file, heredoc `> file`, `dd`, `truncate`, `patch` |
| Command operations | ALLOWED | running tests, `pnpm build`, `npm install`, `node --check`, `rm` (whole-file deletion), `mkdir`, `stat`, `ls`, process inspection |

The line is: an operation that decides WHAT BYTES APPEAR INSIDE a file is a
content edit, and it belongs exclusively to the tool API. An operation that
removes a whole file, creates a directory, or runs a program is a command
operation, and the terminal is the right place for it.

## Why: The Full Derivation

1. **Visibility.** A terminal edit produces no observation event in the
   harness. The `fs/observed` chain that drives the governor, pinner, and
   Cargo-flavor plugins fires only on tool-layer writes. A `sed -i` is
   invisible to the entire plugin stack: no governance, no pinning, no
   ledger line, no audit trail. See
   ./references/mechanism-fs-observed-governance.md for the full
   mechanism rationale.

2. **Validation.** The `edit` tool validates that `old_string` matches the
   file exactly before replacing it. A failed match is a caught error, not
   silent corruption. A `sed -i` expression that does not match simply does
   nothing, and one that matches more broadly than intended rewrites
   everything it touched, silently.

3. **The API contract.** The edit tool preserves the replace-once semantics
   and the surrounding bytes. The terminal offers no such contract; every
   escaping decision (`$`, `/`, quotes, newlines inside a `sed` program) is
   an opportunity to mangle content in a way nobody reviews.

4. **The live incident (2026-10-03).** A Python in-place patch injected
   `await` into a synchronous function and produced a syntax error. The
   patch was written as a transformation script rather than as an edit
   call, so nothing validated the result before it landed. The file was
   broken; the repair cost exceeded the edit's cost many times over.
   See ./references/why-terminal-edits-fail-incident.md.

5. **Reviewability.** The session log shows tool calls as first-class
   events: what file, what replacement, when. A terminal edit appears only
   as a command string, and its effect on the file must be reconstructed
   by hand. Review passes read the log; invisible edits cannot be reviewed.

6. **Determinism across agents.** The tool API is the same for every agent
   and every model. Terminal one-liners are model-specific improvisation.
   Standardizing on the tools makes the discipline model-independent.

## Examples

### Good

```
edit(file_path="src/Library.rs", old_string="  fn run(&self) {", new_string="  fn execute(&self) {")
write(file_path="README.md", content="<full new content>")
```

### Bad

```
sed -i '' 's/fn run/fn execute/' src/Library.rs
python3 -c "from pathlib import Path; p=Path('README.md'); p.write_text(p.read_text().replace('a','b'))"
perl -pi -e 's/old/new/g' src/*.ts
cat <<'EOF' > src/config.rs
... file content ...
EOF
```

## Failure Modes

- The expression matches nothing and the agent believes the change landed.
- The expression matches too much (global replace) and rewrites unrelated
  lines.
- Escaping mangles the content: quotes, slashes, `$` variables, embedded
  newlines.
- No plugin sees the change: no governance, no pin, no ledger entry.
- No undo path: the original bytes were never captured by any tool layer.
- Multi-file loops (`for f in *.md; do sed -i ...`) turn one mistake into
  a corpus-wide corruption event.

## Exceptions

- `rm` for whole-file deletion is explicitly allowed (user-clarified
  2026-10-03). See ./references/deletion-via-rm-allowed.md.
- Commands that happen to touch files as a side effect of their primary
  purpose (a formatter run the user explicitly requests, a build step
  writing its own outputs into a `dist/` directory) are command
  operations, not content edits. The agent must not use this as a
  loophole: if the agent's INTENT is to change the content of a file it
  is editing, the tool API is the only path.

## Arbiters

- Session-log review: no `sed -i` / `awk` / `perl -pi` / Python rewrite /
  heredoc-to-file commands anywhere in the log.
- The fs/observed ledger: every content change an agent made must appear
  as a tool-layer write event.
- Any content change the agent made that lacks a corresponding write/edit
  event in the log is a discipline violation, regardless of the result's
  quality.
