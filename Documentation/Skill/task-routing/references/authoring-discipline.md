# The Authoring Discipline (File Rules Belong to code-authoring)

> Source: SKILL.md, section 7 "Authoring discipline". This section
> delegates the file rules to the dedicated skill and explains the
> mechanism why.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

File modifications and code style live in the dedicated skill:
**`code-authoring`** - hard rules: never edit files through the terminal
(`sed`/`awk`/python in-place) and never read file content through the
terminal (`cat`/`grep`/`sed -n`); always use the read/write/edit tool
API; plus the atomized Rust-style writing conventions. THE MECHANISM:
terminal edits are invisible to the plugin system - `fs/observed` fires
only on tool-layer writes, so tool edits are what make the
governor/pinner/cargo plugins actually run. Load it before editing or
reading any file.

## Why: The Full Philosophy

1. **One skill owns the file rules.** This routing skill deliberately
   does not restate them in full; it points to `code-authoring` as the
   dedicated home. A single owner means the rules are amended in one
   place and every other skill's pointer keeps working - the same
   single-source-of-truth discipline the routing policy itself applies
   to models (see ./references/policy-scope.md).
2. **The terminal prohibition covers both directions.** Never EDIT
   through the terminal (`sed`, `awk`, python in-place rewrites) and
   never READ through the terminal (`cat`, `grep`, `sed -n`). Both
   halves exist because the harness observes files through the tool
   layer: an unobserved edit is as dangerous as an unobserved read,
   because each breaks the observation pipeline in its own way.
3. **THE MECHANISM is why this is not stylistic preference.** Terminal
   edits are invisible to the plugin system: `fs/observed` fires only on
   tool-layer writes. The governor, pinner, and cargo plugins run on
   those observed-write events. A terminal edit changes bytes without
   firing the event, so the plugins never run for that change - the
   file is modified but the machinery that maintains its invariants is
   silently skipped. Tool API edits are what make the plugins actually
   run; that is the load-bearing reason.
4. **The atomized Rust-style writing conventions** are part of
   `code-authoring` too: style rules live with the file-editing rules,
   so an agent loading one discipline loads both.
5. **Load it BEFORE acting.** The rule is "load it before editing or
   reading any file" - before, not after. Post-hoc loading cannot undo
   an edit that bypassed observation.

## Examples

### Good

- Before editing a file: load `code-authoring`, then use the read/edit
  tools - the observed write fires and the plugins run.
- Needing a value from a config file: use the read tool, not `grep`.
- Keeping this skill's pointer to `code-authoring` intact rather than
  copying its rules here.

### Bad

- `sed -i 's/old/new/' file` - unobserved edit; governor/pinner/cargo
  never run for it.
- `cat file` or `grep pattern file` in the terminal - unobserved read.
- "Quick fix" via a python one-liner rewriting a file in place - same
  bypass, same silent skip of the plugin machinery.

## Exceptions

- None. The delegation to `code-authoring` is the standing arrangement;
  its own skill file documents any scoped exceptions it permits.

## Failure Modes

- **Restating instead of pointing**: copying code-authoring's rules into
  other skills. Cost: rule drift when one copy is updated and others
  are not.
- **Believing the mechanism is style**: treating "no terminal edits" as
  a preference and bypassing it under time pressure. Cost: plugins
  silently skip; invariants (pinning, governance) quietly lapse.
- **Loading the discipline after editing**: the first edit already
  bypassed observation; loading later does not repair it.

## Arbiters

- The `fs/observed` event stream itself: a file change with no
  corresponding tool-layer write event indicates a terminal bypass.
- Plugin behavior: governor/pinner/cargo actions that fail to appear
  after a file change are the observable symptom of the mechanism being
  bypassed.
- Skill hygiene: this file must keep pointing to `code-authoring`
  verbatim; a rewrite that drops the pointer is a conversion defect.

