> Specialized working copy (repo): synced from ~/.dsh/skills/code-authoring/ on 2026-10-20, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.

---
name: code-authoring
description: THE authoring discipline for every file operation and every code write in this harness - hard rule: file modifications ONLY through the write/edit tool API (never sed/awk/python/terminal edits), plus the atomized Rust-style writing conventions (one definition per file, nameless default exports, single-word PascalCase names, inlined single-use bindings, switch (true) guards). Load before editing any file or writing any code.
whenToUse: Mandatory before EVERY file modification and every code-writing task (plugin code, scripts, docs). If you are about to run sed, awk, perl, python in-place rewrites, or shell heredoc file surgery instead of the write/edit tools, STOP and use the tool API. If you are about to write code that is not atomized per the style section, STOP and apply the style.
---

# Code Authoring - Operating Manual

Two halves, both hard rules: **tool discipline** (how files get
modified) and **writing style** (how code gets structured). User-mandated
2026-10-03. This file is the index: every rule's full philosophy lives in
its reference file under `references/`, and the canonical skill structure
(all skills) is defined in
./references/skill-structure-template.md.

## 1. Tool discipline (how files are read and modified)

1. **Never edit file content through the terminal** (no `sed -i`, `awk`,
   `perl -pi`, Python in-place rewrites, heredoc surgery) - see
   ./references/never-terminal-content-edits.md
2. **Deletion via `rm` IS allowed** (a command operation, not a content
   edit; verify the resolved absolute path first) - see
   ./references/deletion-via-rm-allowed.md
3. **Never read file content through the terminal either** (`cat`,
   `head`/`tail`, content `grep` are forbidden; read/grep/glob tools own
   the read surface; the terminal runs commands, not content) - see
   ./references/never-terminal-content-reads.md
4. **Every modification uses the write/edit tool API** (`write` = create
   or fully replace; `edit` = validated literal replace) - see
   ./references/all-modifications-via-write-edit.md
5. **The same rules bind every subagent**: coder prompts explicitly
   forbid terminal content edits AND terminal content reads; `rm`
   deletions permitted - see
   ./references/subagents-bound-to-discipline.md
6. **Edit mismatch: read first, copy the exact bytes, retry with the
   edit tool - never fall back to the terminal** - see
   ./references/edit-mismatch-read-first.md
7. **The incident rationale (2026-10-03)**: a Python in-place patch
   injected `await` into a sync function; the edit tool validates matches
   and preserves the API contract - see
   ./references/why-terminal-edits-fail-incident.md
8. **The mechanism rationale**: terminal edits are invisible to the
   plugin system - the `fs/observed` chain (governor, pinner, Cargo
   plugins) fires only on tool-layer writes, so using write/edit IS the
   plugin usage - see
   ./references/mechanism-fs-observed-governance.md

## 1b. Future - programmatic enforcement (the guardian plugin; note only, implementation deferred)

The discipline must become model-independent, enforced by the plugin
system itself - the full mandate, status, and part list: see
./references/guardian-plugin-future.md

1. **The guardian hook**: intercept bash via `tools/pre-execute` and
   detect the terminal file-edit patterns - see
   ./references/guardian-hook-detection.md
2. **Mode A - surface the error**: deny with a structured reason so the
   agent infers the constraint from the plugin's own feedback - see
   ./references/guardian-mode-a-surface-error.md
3. **Mode B - the silent rewrite flag (the ideal, later)**: rewrite the
   terminal command into the equivalent tool call invisibly - see
   ./references/guardian-mode-b-silent-rewrite.md
4. **The note lives here AND in plugin-development** (the guardian is a
   new plugin archetype: a discipline-enforcement hook) - see
   ./references/guardian-placement-home.md

## 1c. Byte-integrity - no NUL/control bytes, ever (post-incident 2026-10-07)

A bulk markdown conversion wrote NUL bytes into 25 files; the write tool
writes VERBATIM, so the risk surface is the content generated before the
write - the incident and the hard rule: see
./references/byte-no-null-control-bytes.md

1. **Never write NUL bytes or control characters** (outside `\n \r \t`)
   into file content - see
   ./references/byte-no-null-control-bytes.md
2. **Never build content through NUL-terminated/separated conventions**
   (no `printf '%s\0'`, no `-print0`/`-0` into files, no C-string
   truncation, no buffer padding) - see
   ./references/byte-no-nul-conventions.md
3. **Never generate the escape-representation of null** (`\0`, `\x00`,
   `\u0000` that could materialize); regenerate BEFORE the write - see
   ./references/byte-no-escape-representation.md
4. **After any bulk transformation, verify the written bytes before
   reporting done**: the byte-level scan (zero NUL, zero stray controls,
   valid UTF-8) plus a spot-check read - see
   ./references/byte-verify-after-bulk.md
5. **The verification gate is part of the prompt**: every
   bulk-transformation agent spec mandates the byte scan as an arbiter -
   see ./references/byte-verification-gate-in-prompt.md

## 1d. Git: checks only - never mutate (user-mandated 2026-10-10)

No `git add/commit/reset/push/tag/rm/checkout/branch/merge/stash/clean`;
agents' git work is read-only checks (`status`, `log`, `diff`, `show`,
`rev-parse`, `ls-files`, `fetch`); the user owns every mutation; commits
are reported as READY-TO-COMMIT - see
./references/git-checks-only.md

## 2. Writing style (how code is structured)

The atomized Rust-style tree, battle-tested on
`@local/dsh-hook-package-governor` (mirrors `Cargo/Run`'s
`Source/Library.rs` + `Fn/` + `Struct/` pattern):

1. **One definition per file** - every function and type in its own
   deeply nested folder/file so any piece can be borrowed in isolation -
   see ./references/one-definition-per-file.md
2. **Nameless default exports** - `export default async () => {}`
   everywhere; only the plugin ENTRY carries the loader-contract named
   exports (`name`, `apply`, `Config`, `inject`) - see
   ./references/nameless-default-exports.md
3. **Naming rules** - PascalCase, one word, action-oriented, present
   tense, singular, full words (Configuration not Config, Environment
   not Env); exceptions only when documented - see
   ./references/naming-rules-full-words.md
4. **Inline every single-use binding** - a binding survives only when
   used more than once or as a documented setup-time invariant - see
   ./references/inline-single-use-bindings.md
5. **`switch (true)` guards** - if-chains become Rust-style switch with
   returns inside every arm - see
   ./references/switch-true-guards.md
6. **Hierarchy** - barrels for grouped folders; depth grows with
   specificity; least-utility modules float to the top - see
   ./references/hierarchy-barrels-depth.md
7. **Behavior-identical refactors** - ledger strings, observable
   behavior, and the silence invariant stay byte-identical; the smoke
   suite is the arbiter - see
   ./references/behavior-identical-refactors.md

## 3. Application

- **Coder agents receive this discipline in their prompt** (the rules
  verbatim, plus the one-file-per-response protocol when relevant) - see
  ./references/coder-prompt-receipt.md
- **Review passes check**: no terminal edits in the session log, one
  definition per file, nameless defaults, naming rules, inlined
  bindings - see ./references/review-pass-checklist.md
- **The division of labor**: plugin-development covers the API contract;
  THIS skill covers how every file is modified and how every piece of
  code is written - see
  ./references/skill-division-of-labor.md

## Skill structure (the canonical template for all skills)

Every skill (this one included) follows one structure: SKILL.md as the
summary + pointer index, `references/` for text, `scripts/` for scripts,
every bullet expanded fully in its reference - the template and the
conversion protocol: see ./references/skill-structure-template.md
