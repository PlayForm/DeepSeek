# Review Passes: The Checklist

> Source: SKILL.md, Section 3 (Application), bullet 2.

## The Rule

Review passes check:

1. no terminal edits in the session log,
2. one definition per file,
3. nameless defaults,
4. naming rules,
5. inlined bindings.

## Why These Five and How to Run Each Check

### 1. No terminal edits in the session log

Scan the log for `sed -i`, `awk`, `perl -pi`, Python in-place rewrites,
heredoc-to-file commands, redirection into source files - and the
read-side violations (`cat`, `head`/`tail`, content `grep`). The
allowed terminal surface: tests, builds, installs, `node --check`,
`rm` with verified paths, metadata commands, git checks (see
./references/git-checks-only.md), and the sanctioned byte-scan.
Rationale: ./references/mechanism-fs-observed-governance.md.

### 2. One definition per file

Every leaf contains exactly one meaning-bearing definition; no
grab-bag files; the assembly surface is wiring only.
Rationale: ./references/one-definition-per-file.md.

### 3. Nameless defaults

Every non-entry leaf exports one anonymous default. The plugin entry
carries only the loader-contract names.
Rationale: ./references/nameless-default-exports.md.

### 4. Naming rules

Names pass: PascalCase, one word, action-oriented, present tense,
singular, full words (`Configuration` not `Config` outside the loader
contract, `Environment` not `Env`) - or cite a documented exception
(`Config` contract export; `State`/`Set`/`Count` maps).
Rationale: ./references/naming-rules-full-words.md.

### 5. Inlined bindings

Every binding is used more than once or is a documented setup-time
invariant; single-use bindings are inlined.
Rationale: ./references/inline-single-use-bindings.md.

## The Review's Stance

- The checklist is mechanical: each item is checkable from the log and
  the files, without taste judgments.
- A failed check is sent back with the specific finding, not fixed
  silently by the reviewer (the author agent learns from the finding;
  silent fixes hide the gap).
- The review covers SUBAGENT work with the same checklist - the log
  review reaches the delegation prompts and the children's outputs.

## Failure Modes

- Reviewing only the diff's content quality and skipping the five
  structural checks - the discipline decays one accepted exception at
  a time.
- Accepting "it's just a small script" as exempt - the rules bind
  every file operation, scripts included.
- The reviewer fixing violations directly instead of returning findings
  - the review's product is findings, and the fix loop belongs to the
  author under the same discipline.
