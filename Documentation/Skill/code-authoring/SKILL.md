---
name: code-authoring
description:
    "The authoring discipline for every file operation and every code write in this repository: the
    write/raw-write/edit tool API, byte integrity, git checks-only, and the atomized writing style
    (one definition per file, nameless default exports, full-word PascalCase names, inlined
    single-use bindings, switch (true) guards)."
whenToUse:
    Before every file modification and every code-writing task, including docs, scripts, and
    manifests. Also load it when a write might contain a deliberate unicode glyph, when a bulk
    transformation is proposed, or when a commit is requested.
version: 2.0.0
updated: 2026-10-20
---

# Code Authoring

Two halves, both hard rules: how files are modified, and how code is structured. The first half is
the tool discipline; it exists because terminal content operations are invisible to the model's own
record and bypass the governance hooks. The second half is the writing style; it exists so any
definition can be borrowed in isolation.

## When to use

- Any file creation, replacement, or edit.
- Any code write: plugin source, site source, scripts, tests, configs.
- Any bulk transformation or rename sweep.
- Any commit request: the answer is READY-TO-COMMIT, never a commit.
- Do not use for: reading files (use the `read` tool directly) or for the typographic-fixture
  rationale (that is `instructional-writing`).

## The rules

### Tool discipline

1. **Modify content only through `write`, `raw-write`, or `edit`.** Never `sed -i`, `awk`,
   `perl -pi`, Python in-place rewrites, or heredoc surgery. The tools validate, record, and fire
   the governance hooks; the shell does none of those.
2. **Read content only through `read`, `grep`, and `glob`.** Never `cat`, `head`, `tail`, or content
   `grep` in the terminal. The terminal runs commands: builds, tests, package managers, git checks,
   listings.
3. **Read before edit.** The `edit` tool matches literal text; if the match fails, re-read the exact
   bytes and retry. Never fall back to a shell rewrite.
4. **Choose the writer by the content, not by habit.**
    - `write`: ordinary content. Streamed text is normalized (dashes, quotes, ellipsis, spaces,
      invisibles, fullwidth), so write ASCII.
    - `raw-write`: content whose bytes must survive exactly (typographic fixtures, exact copies,
      demo before/after pairs). Read the file first; it refuses to overwrite an unseen file. Use
      absolute paths: relative paths resolve against the profile root, not the cwd.
    - `edit`: a literal replacement inside an existing file; identity-exempt, so it preserves any
      glyph outside the replaced span.
5. **`rm` is allowed for deletion.** It is a command operation, not a content edit. Verify the
   resolved absolute path first; never delete a path built from an unverified variable.
6. **The same rules bind every subagent.** A coder prompt states both prohibitions (no terminal
   content edits, no terminal content reads), the allowed `rm`, and the read-before-edit rule.

### Byte integrity

7. **Never write NUL bytes or control characters** outside `\n`, `\r`, `\t`.
8. **Never build content through NUL-terminated or NUL-separated conventions** (`printf '%s\0'`,
   `-print0` into a file, buffer padding).
9. **Never generate the escape representation of NUL** (`\0`, `\x00`, `\u0000`) in content that
   could materialize it.
10. **After any bulk transformation, scan the touched files** for zero NUL bytes and valid UTF-8,
    and spot-read one file, before reporting done.

### Git

11. **Git is read-only checks.** Allowed: `status`, `log`, `diff`, `show`, `rev-parse`, `ls-files`,
    `fetch`, `log --diff-filter=D`. Forbidden: `add`, `commit`, `reset`, `push`, `tag`, `rm`,
    `checkout`, `branch`, `merge`, `stash`, `clean`.
12. **Report READY-TO-COMMIT.** A finished deliverable lists the exact files and a suggested commit
    message; the user commits.

### Writing style

13. **One definition per file.** One exported function or type per leaf, in its own folder; small
    private helpers used only by that definition may share the leaf. The assembly surface (the
    entry) is wiring only.
14. **Nameless default exports.** `export default async () => {}` everywhere. Only the plugin entry
    carries the loader-contract names: `name`, `apply`, `Config`, `inject`, and the assembled
    default object.
15. **Names: PascalCase, one word, action-oriented, present tense, singular, full words.**
    `Configuration`, not `Config`; `Environment`, not `Env`. Genuine acronyms stay (DSH, ETS, CCR,
    JSON, URL). Documented exceptions: the loader's `Config` export, machine-read contract names,
    and the `State`/`Set`/`Count` domain vocabulary.
16. **Inline single-use bindings.** A binding survives only if used more than once, or if it names a
    setup-time invariant the rest of the code must not recompute.
17. **`switch (true)` for guard chains.** Three or more `if (x) return y;` lines become a
    `switch (true)` with a returning arm per case and a `default` that returns or throws. Do not
    force it on a single `if`, loops, or arms with side effects.
18. **Depth is earned by specificity; barrels group siblings; the most-used modules sit
    shallowest.**

## The workflow

1. Read the target file (and its neighbours) with the `read` tool.
2. Decide the writer: `write` for ordinary content, `raw-write` for byte-faithful content, `edit`
   for a literal replacement.
3. Make one logical change per call. For a refactor, keep the change behavior-identical (section:
   refactors).
4. Verify: the relevant arbiter. Package code: the bundle's smoke suite (`smoke-writing`). Site:
   `cd Site && pnpm prepublishOnly`, then inspect `Site/Target/`. Docs: re-read the changed span.
5. If a bulk transformation was involved, run the byte scan (rule 10).
6. Report: files touched, the arbiter's printed result, and READY-TO-COMMIT with the suggested
   message.

## Decision table

| Situation                          | Writer        | Note                                      |
| ---------------------------------- | ------------- | ----------------------------------------- |
| New file, ordinary ASCII           | `write`       | Streamed content is normalized            |
| Exact bytes matter (fixture, copy) | `raw-write`   | Read first; absolute path                 |
| One literal replacement            | `edit`        | Re-read on mismatch; never shell-rewrite  |
| Delete a file                      | `rm`          | Verify the absolute path                  |
| Rename a symbol across many files  | `edit` each   | Mechanical sweep, guarded exceptions list |
| Bulk transformation with a script  | Tool API only | Then the byte scan; never a shell rewrite |

## Verification

- **Tool discipline:** the transcript shows every content change as a `write`/`raw-write`/`edit`
  call; no shell command modified content.
- **Byte integrity:** the scan prints zero NUL bytes and valid UTF-8.
- **Git:** the session contains no mutating git command; the report carries READY-TO-COMMIT.
- **Style:** every non-entry leaf has one anonymous default export; the naming table passes; guard
  chains of three or more are `switch (true)`.

A failure is fixed before the next file, not reported as a residual.

## Anti-patterns

| Mistake                                   | Cost                                        | Do instead                        |
| ----------------------------------------- | ------------------------------------------- | --------------------------------- |
| `sed -i` or a heredoc to patch a file     | Invisible to the record; unverifiable bytes | `edit` with a literal match       |
| `cat`/`head` to inspect a file            | Bypasses the read surface and the hooks     | `read` with offset and limit      |
| Streaming a curly quote into `write`      | The normalize hooks replace it silently     | ASCII, or `raw-write`             |
| Weakening a smoke to pass a change        | The arbiter stops arbitrating               | Fix the change (`smoke-writing`)  |
| Committing because the work "looks ready" | The user loses control of the tree          | READY-TO-COMMIT report            |
| Named exports spreading through the tree  | Uniformity decays; import sites multiply    | Anonymous defaults; contract only |
| Abbreviations "just this once"            | The table becomes advisory                  | Full words, documented exceptions |

## References

| File                                 | Covers                                                       | Read when                    |
| ------------------------------------ | ------------------------------------------------------------ | ---------------------------- |
| `references/tool-discipline.md`      | The writers, the mismatch path, subagent rules, the incident | A write behaves unexpectedly |
| `references/byte-integrity.md`       | NUL and control bytes, the scan procedure, the incident      | Any bulk transformation      |
| `references/git-law.md`              | The allowed list and the READY-TO-COMMIT format              | A commit is requested        |
| `references/writing-style.md`        | The seven style rules with examples                          | Writing or reviewing code    |
| `references/review-and-refactors.md` | The behavior-identical refactor law and the review checklist | A refactor or a review pass  |
