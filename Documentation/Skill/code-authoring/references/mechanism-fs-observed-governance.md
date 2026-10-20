# The Mechanism Rationale: Terminal Edits Are Invisible to the Plugin System

> Source: SKILL.md, Section 1 (Tool discipline), rule 7 (second - the user-mandated mechanism rationale).
> User-mandated 2026-10-03. This file carries the full philosophy; SKILL.md only points here.

## The Rule

Terminal file edits are invisible to the plugin system. The harness's
`fs/observed` chain - the trigger of the governor, pinner, and
Cargo-flavor plugins - fires ONLY on tool-layer writes (`write`,
`edit`, `str_replace_editor`). A `python3 -c`, `sed`, or heredoc edit
run in bash produces NO observation event: no plugin sees it, no
governance, no pinning, no ledger line.

Using the write/edit tools IS the plugin usage. Every agent edit becomes
a real governed event. Any file the agent needs to touch goes through
the tools, period. This is what makes the whole plugin stack work
"everywhere and for every agent."

## The Mechanism, Step by Step

```
TOOL-LAYER PATH (visible):
  agent -> write/edit tool call
             |
             v
        fs/observed chain fires
             |
             +--> governor plugin    (governs the change event)
             +--> pinner plugin      (pins versions/dependencies)
             +--> cargo-flavor plugin (Cargo.toml chain: pass + update stages)
             +--> ledger line        (auditable record)
             |
             v
        file bytes on disk (governed, pinned, recorded)

TERMINAL PATH (invisible):
  agent -> bash: sed -i / python3 -c / heredoc
             |
             v
        file bytes change DIRECTLY
             |
             (nothing fires: no observation, no governor,
              no pin, no cargo stage, no ledger line)
             |
             v
        the plugin stack now believes a state of the world
        that is no longer true
```

## Why This Makes the Tools the Plugin Usage

1. **The observation IS the contract.** The plugins do not watch the
   filesystem with a watcher on every inode; they react to observation
   events produced by the tool layer. This design choice is deliberate:
   it makes the event stream structured, attributable (which agent,
   which call), and replayable. The cost is that any byte-change outside
   the tool layer is unobservable by design.

2. **"Everywhere and for every agent" only holds if every agent uses the
   tools.** The plugin stack was built to govern agent edits at scale -
   across models, across sessions, across subagents. The universal
   property comes from the channel, not from the plugins: as long as
   every edit is a tool-layer write, every edit is governed. One agent
   using sed in one session breaks the invariant for that file, that
   session - and the ledger's guarantee ("the file state matches the
   recorded events") is silently void.

3. **Stale-belief cascades.** A governor decision, a pin, or a ledger
   line made from an unobserved state is worse than none: it is a
   confident record of a false world. Later agents and later plugin runs
   consume those records. The unobserved edit does not merely escape
   governance - it poisons the governance of everything after it.

4. **The skill's own postcondition.** Section 3's review passes check
   "no terminal edits in the session log." This rationale is WHY that
   check exists and why it is not enough for the check to be cosmetic:
   the log is the plugin-visible truth. If the log shows only tool
   events but the bytes were changed by hand, review is certifying a
   fiction.

## What "the Tools, Period" Concedes and Why That Is Fine

The tool API is more verbose than a one-liner. That cost is accepted
because the one-liner's savings are paid for by:

- ungoverned change (no governor, no pin),
- unrecorded change (no ledger),
- unvalidated change (no match check),
- unreviewable change (no structured event).

None of these can be recovered after the fact. The verbosity is paid
up front; the failures it prevents are paid for in debug time.

## Failure Modes

- An agent "quickly" fixes a typo with sed; the pinner never sees the
  version bump; a later build resolves a wrong version.
- A bulk refactor via script rewrites Cargo.toml and source files; the
  cargo plugin's pass/update stages never run; the dependency chain is
  inconsistent with the recorded state.
- A heredoc writes a config the governor would have flagged; the
  configuration ships unreviewed.

## Arbiters

- Session-log review: every content change appears as a tool-layer
  write event.
- Ledger reconciliation: for every file the agent touched, the recorded
  events and the file's state agree.
- The absence of an event for a byte change is itself the finding - it
  is not excused by the change being correct.
