# Guardian Mode B: The Silent Rewrite Flag (The Ideal, Later)

> Source: SKILL.md, Section 1b, part 3. Future note - implementation deferred (user-mandated 2026-10-04).

## The Design

The guardian does NOT resurface the command at all. It best-effort
REWRITES the terminal command into the equivalent regular tool call
(e.g. a `sed -i` on one file becomes the corresponding edit call),
executes the rewrite invisibly, and the agent never notices the
surface-level engineering - the "water-tight tension of the whole
table" shifting under the model.

The model experiences: it asked for a sed; the work happened; the file
changed. Underneath: a governed, observed, validated tool-layer write
carried the change - the plugin stack saw everything, the fs/observed
chain fired, the ledger recorded it.

## Why This Is the Ideal

1. **Zero friction, full compliance.** Mode A teaches, but each denial
   costs a turn and risks a frustrated retry loop. Mode B removes the
   cost entirely: the forbidden channel silently becomes the required
   channel. The model never needs to learn the rule because it can
   never successfully violate it.

2. **The discipline becomes invisible infrastructure.** The strongest
   form of a behavioral rule is one the user (here: the model) cannot
   even trigger. Like a guardrail that silently steers rather than a
   wall that stops.

3. **The plugin stack keeps its guarantees.** Because the rewrite
   produces a real tool-layer write, every downstream consumer -
   governor, pinner, cargo stages, ledger - sees a legitimate event.
   The guarantees of
   ./references/mechanism-fs-observed-governance.md hold even when
   the model tries to bypass them.

## Why It Is Later: The Rewrite Machinery Is Its Own Effort

The note is explicit that Mode B is a later implementation, because it
requires a translation layer that Mode A does not:

- **Command -> tool-call translation**: parsing the shell command
  enough to know its intent (which file, what substitution).
- **Path extraction**: resolving the target path(s) reliably, including
  globs and variables.
- **Content capture**: reading the current bytes through the tool API
  (not `cat`) to build the edit's `old_string`/`new_string` - or a
  `write` for transformations too broad for an edit.
- **Edit application**: running the change through the write/edit
  channel so the fs/observed chain fires with a well-formed event.

Each of these is real engineering with failure modes (ambiguous
commands, multiple files, partial matches). A mis-rewrite that corrupts
a file would be worse than a denial - so Mode B must be built on the
prerequisite base (the governor/pinner/cargo family and the factory)
and hardened before it goes silent.

## The Risk Mode B Must Never Enter

- Rewriting a command it misunderstood into a tool call that changes
  the WRONG bytes, silently. Denial fails safe; a bad rewrite fails
  unsafe. Until the translation is trustworthy, Mode A is the correct
  mode.

## Status

Future note only. Nothing implements it today. The note is preserved
verbatim in intent so the design direction (silent steer over loud
deny) is not lost to a later implementation that only knows Mode A.
