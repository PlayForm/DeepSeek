# The Guardian Hook: Detection in the Pre-Execute Waterfall

> Source: SKILL.md, Section 1b, part 1. Future note - implementation deferred (user-mandated 2026-10-04).

## The Design

A plugin that intercepts the bash tool's execution via `tools/pre-execute`
- the sanctioned allow/deny waterfall - and detects terminal file-EDIT
commands in the command string.

## What It Detects

The exact Section 1 patterns (see
./references/never-terminal-content-edits.md), recognized
lexically in the command the model is about to run:

| Pattern family | Examples of the trigger |
|----------------|--------------------------|
| In-place stream editors | `sed -i`, `sed -i ''`, `perl -pi`, `perl -i` |
| awk writing files | `awk` with redirection into a file or `> file` |
| Python in-place rewrites | `python3 -c "...open(...,'w')..."`, `python3` scripts that rewrite source paths |
| Heredoc file surgery | `cat <<'EOF' > path`, `tee path` |
| Redirection into existing source files | `> src/x.rs`, `>> src/x.rs` where the target is a source file |
| Bulk scripted passes | for-loops / `find -exec` that rewrite file contents |

Detection is best-effort lexical matching on the command string, not a
full shell parser: the goal is to catch the recognizable families and
fail closed (deny on suspicion) rather than to be a complete shell
interpreter.

## Why Pre-Execute Is the Right Hook

1. **It is the sanctioned decision point.** The waterfall already lets a
   plugin allow or deny a tool call with a structured reason. The
   guardian adds no new protocol; it is a resident of the existing one.
2. **It acts before execution.** A post-hoc detector could only report
   corruption; the pre-execute hook prevents it. Prevention is the
   point: the file bytes never change through the forbidden channel.
3. **It covers every agent uniformly.** The hook runs for every bash
   call in every session - the model-independent property the mandate
   requires.

## Why Detection, Not Just Prohibition, Is Tricky

- The same binary can be innocent (`sed -n` is a read; `awk` computing a
  sum from command output is fine). The guardian must distinguish
  content-targeting uses from benign ones - hence pattern families, not
  a blanket binary ban.
- The `rm` carve-out must be respected: the guardian does NOT deny
  deletions (see ./references/deletion-via-rm-allowed.md).
- Commands whose primary purpose is running builds may write generated
  outputs; the guardian targets SOURCE-file content edits, not build
  artifacts.

## Status

Future note. The prerequisite base is the plugin family's existing
pre-execute infrastructure and the governor/pinner/cargo plugins. The
guardian is a new plugin archetype: a discipline-enforcement hook (see
./references/guardian-placement-home.md).

## Failure Modes

- False negatives (a cleverly disguised rewrite slips through) - the
  fallback layer is the skill text and the session-log review.
- False positives (denying a legitimate build) - tuned by scoping
  detection to source-file targets and by the deny reason explaining
  itself, so a wrongly denied call can be rephrased by the model.
