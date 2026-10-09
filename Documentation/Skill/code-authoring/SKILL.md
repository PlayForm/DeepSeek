> Specialized working copy (repo): synced from ~/.dsh/skills/code-authoring/ on 2026-10-10, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.
---
name: code-authoring
description: THE authoring discipline for every file operation and every code write in this harness — hard rule: file modifications ONLY through the write/edit tool API (never sed/awk/python/terminal edits), plus the atomized Rust-style writing conventions (one definition per file, nameless default exports, single-word PascalCase names, inlined single-use bindings, switch (true) guards). Load before editing any file or writing any code.
whenToUse: Mandatory before EVERY file modification and every code-writing task (plugin code, scripts, docs). If you are about to run sed, awk, perl, python in-place rewrites, or shell heredoc file surgery instead of the write/edit tools, STOP and use the tool API. If you are about to write code that is not atomized per the style section, STOP and apply the style.
---

# Code Authoring — Operating Manual

Two halves, both hard rules: **tool discipline** (how files get modified) and
**writing style** (how code gets structured). User-mandated 2026-10-03.

## 1. Tool discipline (how files are read and modified)

1. **NEVER edit file CONTENT through the terminal.** No `sed -i`, `awk`,
   `perl -pi`, python in-place rewrites, or shell heredoc file surgery.
2. **Deletion via `rm` IS allowed** (user-clarified 2026-10-03) — it is a
   command operation (removing whole files), not a content edit. Verify the
   resolved absolute path before deleting.
3. **NEVER read file content through the terminal either** — no `cat`,
   `sed -n`, `head`/`tail` of source files, `grep` of file contents. File
   content is read with the **read** tool; content search uses the **grep**
   tool; file discovery uses the **glob** tool. Terminal is for RUNNING
   COMMANDS: tests, pack, install, `node --check`, `rm`, `stat`/`ls`/`find`
   for filesystem metadata and process state — never for reading or mutating
   source content.
4. Every file modification uses the harness tool API: **write** (create or
   fully replace) and **edit** (literal replace, which validates the match).
5. The same rules bind every subagent: prompts for coder agents must forbid
   terminal-based content edits AND terminal-based content reads explicitly
   (deletions via `rm` are permitted).
6. If an edit's `old_string` doesn't match, READ the file first (the edit
   tool requires it anyway), copy the exact bytes (including whitespace —
   tabs vs spaces), and retry with the edit tool. Never fall back to the
   terminal.
7. Rationale (live incident 2026-10-03): a python in-place patch that
   produced a syntax error (`await` injected into a sync function). The edit
   tool validates matches and preserves the API contract.
7. **THE MECHANISM RATIONALE (user-mandated 2026-10-03): terminal file edits
   are invisible to the plugin system.** The harness's `fs/observed` chain —
   the trigger of the governor, pinner, and Cargo-flavor plugins — fires ONLY
   on tool-layer writes (write/edit/str_replace_editor). A `python3 -c` /
   `sed` / heredoc edit in bash produces NO observation event: no plugin sees
   it, no governance, no pinning, no ledger line. Using the write/edit tools
   IS the plugin usage — every agent edit becomes a real governed event. Any
   file the agent needs to touch goes through the tools, period — this is
   what makes the whole plugin stack work "everywhere and for every agent."

## 1b. FUTURE — PROGRAMMATIC ENFORCEMENT (the guardian plugin; note only,
##      implementation deferred — user-mandated 2026-10-04)

The discipline above must NOT depend on the model's understanding or memory
of this skill. It must become MODEL-INDEPENDENT, enforced by the plugin
system itself, so that ANY future agent — no matter the model — is steered
away from terminal file-edit commands:

1. **The guardian hook**: a plugin that intercepts the bash tool's execution
   via `tools/pre-execute` (the sanctioned allow/deny waterfall) and detects
   terminal file-EDIT commands (`sed -i`, `awk`, `perl -pi`, python in-place
   rewrites, heredoc file surgery — the exact §1 patterns) in the command
   string.
2. **Mode A — surface the error**: deny with a structured reason (the
   guardian's own ledger + the pre-execute decision), so the agent INFERS
   from the surfaced error that the pattern is forbidden — the constraint
   becomes self-teaching from the plugin's own feedback, independent of any
   skill text.
3. **Mode B — the SILENT REWRITE flag (the ideal, later)**: the guardian
   does NOT resurface the command at all — it best-effort REWRITES the
   terminal command into the equivalent regular TOOL CALL (e.g. a `sed -i`
   on one file → the write/edit call), executes the rewrite invisibly, and
   the agent never notices the surface-level engineering — the "water-tight
   tension of the whole table" shifting under the model. This is a later
   implementation note — the rewrite machinery (command → tool-call
   translation, path extraction, content capture, edit-application) is its
   own plugin effort; the governor/pinner/cargo family and the factory are
   the prerequisite base.
4. This note lives HERE (the discipline's home) AND in plugin-development
   (the guardian is a new plugin archetype: a discipline-enforcement hook).

## 1c. BYTE-INTEGRITY — NO NULL/CONTROL BYTES, EVER (post-incident
##      2026-10-07, user-mandated)

A live incident: a bulk markdown conversion (inline links -> reference
links) wrote NUL bytes (0x00) where the link TEXTS should be — 25 files
corrupted (the refs, the definitions and the prose survived; the text
segments became null runs; the files turned binary and the links rendered
broken). The write tool writes VERBATIM — the risk surface is the content
that is generated or assembled before the write. Hard rules:

1. **NEVER write NUL bytes (0x00) or any control character (other than
   \n \r \t) into file content.** Text files are UTF-8 text, nothing else.
2. **NEVER build file content through NUL-terminated or NUL-separated
   string conventions** — no `printf '%s\0'`, no `find -print0`/`xargs -0`
   output piped into file content, no C-string truncation, no byte-buffer
   padding. If a pipeline or a string builder could emit a null byte, do
   not use it to produce file content.
3. **NEVER generate content containing the escape-representation of null**
   — if generated text contains a `\0` (or any control-escape) that could
   materialize as a real byte, regenerate or fix it BEFORE the write. A
   model emitting `\x00` bytes is a write-integrity failure, not
   acceptable output.
4. **After ANY bulk text transformation** (multi-file conversions,
   rewrites, replacements, renames of markup): verify the WRITTEN BYTES
   before reporting done — a byte-level scan of every touched file (zero
   `\x00`, zero stray control characters, valid UTF-8 — e.g. a python
   bytes-read check) plus a spot-check that the transformed segments read
   back as the intended text. A transformation is not complete until the
   files pass the byte scan.
5. The verification gate is part of the prompt: every bulk-transformation
   agent spec must mandate the byte-level scan as an arbiter, in addition
   to the content/rendering checks.

## 1d. GIT: CHECKS ONLY — NEVER MUTATE (user-mandated 2026-10-10)

The git discipline is a hard rule, mirroring the tool discipline: the
orchestrator and every agent NEVER mutate the repository through the
terminal — no `git add`, no `git commit`, no `git reset` (soft or hard),
no `git push`, no `git tag`/release creation, no `git rm`, no `git
checkout`/`branch`/`merge`/`stash` operations, no `git clean`. The user
owns every git mutation (they commit + push mid-session, and they see the
prompts in their editor); the agents' git work is LIMITED to read-only
CHECKS: `git status`, `git log`, `git diff`, `git show`, `git rev-parse`,
`git ls-files`, `git log --diff-filter=D` (history evidence), `git fetch`
(updating the remote-tracking refs is allowed — it does not mutate the
working tree or the index). Rationale (live slip 2026-10-09/10): the
orchestrator committed `23a313d` and `c920617` and ran `git rm` during the
session close-out — the user's decree: "never again do a `git reset` or
anything git related (save that to code authoring) only git checks". A
deliverable that needs a commit is reported as READY-TO-COMMIT (the files
changed + the suggested message), and the user commits it.

## 2. Writing style (how code is structured)

The atomized Rust-style tree, user-specified and battle-tested on
`@local/dsh-hook-package-governor` (mirrors `Cargo/Run`'s
`Source/Library.rs` + `Fn/` + `Struct/` pattern):

1. **One definition per file** — every function, every type lives in its own
   deeply nested folder/file so any piece can be borrowed in isolation.
2. **Nameless default exports** — `export default async () => {}` everywhere;
   only the plugin ENTRY may carry the loader-contract named exports
   (`name`, `apply`, `Config`, `inject`, `default { name, apply, Config, inject }`).
3. **Naming rules** — PascalCase, one word, action-oriented, present tense,
   singular, full words (no abbreviations). Exceptions only when documented
   (e.g. `State`, `Set`, `Count` map names).
4. **Inline every single-use binding** — no sloppy intermediate variables;
   a binding survives only when used more than once or when it names a
   setup-time invariant (documented exceptions).
5. **`switch (true)` guards** — convert `if (existsSync(Candidate)) return
Candidate;` chains into Rust-style `switch (true) { case …: return …; }`
   with returns inside every arm.
6. **Hierarchy** — group folders with barrel files; depth grows with
   specificity; least-utility modules float to the top (shallowest).
7. **Behavior-identical refactors** — when atomizing or rewriting, ledger
   strings, observable behavior, and the silence invariant stay
   byte-identical; the smoke suite is the arbiter.

## 3. Application

- Coder agents receive this discipline in their prompt (the skill's rules,
  verbatim, plus the one-file-per-response protocol when relevant).
- Review passes check: no terminal edits in the session log, one definition
  per file, nameless defaults, naming rules, inlined bindings.
- The plugin-development skill covers the API contract; THIS skill covers
  how every file is modified and how every piece of code is written.
