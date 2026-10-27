---
name: code-authoring
description:
    "Authoring discipline for every file operation and code write in this repository: the
    write/raw-write/edit tool API, byte integrity, git checks-only with the staged gcommit, and the
    atomized style (one definition per file, nameless default exports, full-word PascalCase names,
    inlined single-use bindings, switch (true) guards)."
whenToUse:
    Before every file modification and code-writing task, including docs, scripts, and manifests;
    also when a write may hold a deliberate unicode glyph, a bulk transformation is proposed, or a
    commit is requested.
version: 3.0.0
updated: 2026-10-28
---

# Code Authoring

Two halves, both hard rules: how files are modified, and how code is structured.

The first half is the tool discipline; it exists because terminal content operations are invisible
to the model's own record and bypass the governance hooks.

The second half is the writing style; it exists so any definition can be borrowed in isolation.

## When to use

- Any file creation, replacement, or edit.
- Any code write: plugin source, site source, scripts, tests, configs.
- Any bulk transformation or rename sweep.
- Any commit request: `git gcommit` with only the step's files staged; the retired variants of the
  commit alias are not used.
- Do not use for: reading files (use the `read` tool directly) or for the typographic-fixture
  rationale (that is `instructional-writing`).

## The rules

### Tool discipline

1. **The writers.**

    Content is modified only through `write`, `raw-write`, or `edit`.

    `sed -i`, `awk`, `perl -pi`, Python in-place rewrites, and heredoc surgery are never used.

    The tools validate, record, and fire the governance hooks; the shell does none of those.

2. **The readers.**

    Content is read only through `read`, `grep`, and `glob`.

    `cat`, `head`, `tail`, and a content `grep` in the terminal are never used.

    The terminal runs commands: builds, tests, package managers, git checks, listings.

3. **Read before edit.**

    The `edit` tool matches literal text; if the match fails, the file changed or the memory of it
    is wrong, so the exact bytes are re-read and the call is retried.

    A shell rewrite is never a fallback.

4. **The writer choice.**

    The writer is chosen by the content, not by habit.

    - `write`: ordinary content. Streamed text is normalized (dashes, quotes, ellipsis, spaces,
      invisibles, fullwidth), so write ASCII.
    - `raw-write`: content whose bytes must survive exactly (typographic fixtures, exact copies,
      demo before/after pairs). Read the file first; it refuses to overwrite an unseen file. Use
      absolute paths: relative paths resolve against the profile root, not the cwd.
    - `edit`: a literal replacement inside an existing file; identity-exempt, so it preserves any
      glyph outside the replaced span.

5. **The deletion.**

    `rm` is allowed for deletion, because it is a command operation, not a content edit.

    The resolved absolute path is verified first; a path built from an unverified variable is never
    deleted.

6. **The subagents.**

    The same rules bind every subagent.

    A coder prompt states both prohibitions (no terminal content edits, no terminal content reads),
    the allowed `rm`, and the read-before-edit rule.

### Byte integrity

7. **The NUL ban.**

    NUL bytes and control characters are never written outside `\n`, `\r`, `\t`.

8. **The NUL conventions.**

    Content is never built through NUL-terminated or NUL-separated conventions (`printf '%s\0'`,
    `-print0` into a file, buffer padding).

9. **The escape form.**

    The escape representation of NUL (`\0`, `\x00`, `\u0000`) is never generated in content that
    could materialize it.

10. **The bulk scan.**

    After any bulk transformation, the touched files are scanned for zero NUL bytes and valid UTF-8,
    and one file is spot-read, before done is reported.

### Git

11. **The allowed list.**

    Git is read-only checks plus the staged commit.

    Allowed: `status`, `log`, `diff`, `show`, `rev-parse`, `ls-files`, `fetch`,
    `log --diff-filter=D`, and `git gcommit` for the step's staged files.

    Forbidden: `add`, `commit`, `reset`, `push`, `tag`, `rm`, `checkout`, `branch`, `merge`,
    `stash`, `clean`, and every retired variant of the commit alias.

12. **The commit.**

    The commit is `git gcommit`, which stages only the step's files and never uses `git add -A`.

    A lane commits its own files only when its spec says so, and the parent commits the
    integrations; a lane that does not commit ends with READY-TO-COMMIT, naming the exact files and
    a suggested message.

### Writing style

13. **One definition per file.**

    One exported function or type sits per leaf, in its own folder; small private helpers used only
    by that definition may share the leaf.

    The assembly surface (the entry) is wiring only.

14. **Nameless default exports.**

    `export default async () => {}` everywhere.

    Only the plugin entry carries the loader-contract names: `name`, `apply`, `Config`, `inject`,
    and the assembled default object.

15. **The names.**

    Names are PascalCase, one word, action-oriented, present tense, singular, full words.

    `Configuration`, not `Config`; `Environment`, not `Env`.

    Genuine acronyms stay (DSH, ETS, CCR, JSON, URL).

    Documented exceptions: the loader's `Config` export, machine-read contract names, and the
    `State`/`Set`/`Count` domain vocabulary.

16. **The inlining.**

    A binding survives only if used more than once, or if it names a setup-time invariant the rest
    of the code must not recompute.

17. **The guard chains.**

    Three or more `if (x) return y;` lines become a `switch (true)` with a returning arm per case
    and a `default` that returns or throws.

    It is not forced on a single `if`, loops, or arms with side effects.

18. **The depth.**

    Depth is earned by specificity; barrels group siblings; the most-used modules sit shallowest.

    The tree's shape is a map of how the code is used, not an arbitrary filing system.

## The workflow

1. **The read.**

    The target file (and its neighbours) is read with the `read` tool.

2. **The writer.**

    The writer is decided: `write` for ordinary content, `raw-write` for byte-faithful content,
    `edit` for a literal replacement.

3. **The change.**

    One logical change is made per call.

    For a refactor, the change stays behavior-identical (section: refactors).

4. **The verification.**

    The relevant arbiter runs.

    Package code: the bundle's smoke suite (`smoke-writing`).

    Site: `cd Site && pnpm prepublishOnly`, then inspect `Site/Target/`.

    Docs: re-read the changed span.

5. **The byte scan.**

    If a bulk transformation was involved, the byte scan runs (rule 10).

6. **The report.**

    The report lists the files touched, the arbiter's printed result, and READY-TO-COMMIT with the
    suggested message.

    It does not end with a narrative about the change.

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
- **Git:** the session holds no mutating git command except the staged `git gcommit`; the report
  carries READY-TO-COMMIT or the commit hash.
- **Style:** every non-entry leaf has one anonymous default export; the naming table passes; guard
  chains of three or more are `switch (true)`.

A checker, when one is written, strips fenced code blocks and inline code spans before it counts,
because a checker that reads a shell comment starting with `# ` as a heading or a forbidden token
quoted in backticks as a violation reports a defect in a correct file.

On 21 October 2026 a heading count without that exemption reported twenty-seven false headings in a
file that had one, and a law that quoted the token that it forbade flagged itself.

A checker must also be able to fail, so prove it with a mutated copy before you trust its `PASS`.

A failure is fixed before the next file, not reported as a residual.

## Anti-patterns

| Mistake                                   | Cost                                        | Do instead                             |
| ----------------------------------------- | ------------------------------------------- | -------------------------------------- |
| `sed -i` or a heredoc to patch a file     | Invisible to the record; unverifiable bytes | `edit` with a literal match            |
| `cat`/`head` to inspect a file            | Bypasses the read surface and the hooks     | `read` with offset and limit           |
| Streaming a curly quote into `write`      | The normalize hooks replace it silently     | ASCII, or `raw-write`                  |
| Weakening a smoke to pass a change        | The arbiter stops arbitrating               | Fix the change (`smoke-writing`)       |
| Committing because the work "looks ready" | The user loses control of the tree          | Step's files staged, then `git gcommit` |
| Named exports spreading through the tree  | Uniformity decays; import sites multiply    | Anonymous defaults; contract only      |
| Abbreviations "just this once"            | The table becomes advisory                  | Full words, documented exceptions      |

## The moved tree

A failed literal match is evidence about the file, not about your memory of it. On 2026-10-27 an
edit failed with "file changed since it was read" on a document the session had written minutes
earlier; another session had committed the tree and run a formatter over the same file, which
rewrapped the frontmatter the edit was matching against.

The procedure is the same in both cases and does not depend on knowing who moved it: re-read the
exact span, retry the literal match, and if the span has genuinely changed, decide whether the
change belongs to you before writing over it. Never force the match through the shell, and never
restore the old bytes, because the other writer's change is not yours to revert.

The related symptom is a `git status` that shows files you never touched. They are another session's
work; stage only the step's files and leave the rest alone.

## References

| File                                 | Covers                                                       | Read when                    |
| ------------------------------------ | ------------------------------------------------------------ | ---------------------------- |
| `references/tool-discipline.md`      | The writers, the mismatch path, subagent rules, the incident | A write behaves unexpectedly |
| `references/byte-integrity.md`       | NUL and control bytes, the scan procedure, the incident      | Any bulk transformation      |
| `references/git-law.md`              | The allowed list and the READY-TO-COMMIT format              | A commit is requested        |
| `references/writing-style.md`        | The seven style rules with examples                          | Writing or reviewing code    |
| `references/review-and-refactors.md` | The behavior-identical refactor law and the review checklist | A refactor or a review pass  |
