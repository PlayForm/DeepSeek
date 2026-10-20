# No Live Config Edits While Subagents Run - Non-Negotiable 4

> Source: SKILL.md, the non-negotiables rule 4. Canonical skill
> structure: the mandate of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

1. Never edit the agent-loop config while subagents are running.
2. A live re-apply destroys the running agents' inbox projections and
   can crash the host.
3. Config changes require a restart with no active subagents.

## Why: The Full Philosophy

1. **Running agents hold projections of the config.** Each active
   subagent's inbox is a projection derived from the configuration at
   its start. Re-applying the config mid-flight invalidates those
   projections: the agent's queued messages and state references can
   be destroyed underneath it.
2. **The blast radius is the whole host.** The failure is not scoped
   to the edited field; a crashed host takes every lane down at once -
   the entire batch state (the active lanes, the idle queue, the
   partial work) is put at risk to change one setting.
3. **The config is not the urgent surface.** Configuration changes are
   planning-level work; nothing in a running batch is so urgent that
   it justifies gambling every lane. The change waits for a clean
   boundary.
4. **A restart with no active subagents is the safe boundary.** Drain
   the lanes (let them finish or stop them cleanly), restart, apply
   the change, relaunch. That ordering IS the rule.

## Examples

### Good

- The batch is running and a config improvement is needed -> note it
  in the process record, apply it after the lanes drain at the next
  restart.
- Only idle agents are queued (none working) -> still wait for the
  restart unless the harness surface documents live-safety for that
  exact change.

### Bad

- Editing the agent-loop config "just to fix the route" while three
  lanes are running.
- Assuming a small config edit is safe because it "only touches one
  field".

## Exceptions

- None recorded. If a future harness surface documents a live-safe
  change, that documentation - not convenience - creates the
  exception.

## Failure Modes

- **Mid-flight re-apply:** the running lanes lose inbox projections;
  messages in flight vanish. Cost: the lanes must be re-dispatched
  from their last verifiable state.
- **Host crash:** every lane dies simultaneously; the batch state must
  be reconstructed from the process record and the handoff files.
- **A partial config:** an edit applied while the host is mid-write
  can leave a configuration that is neither the old one nor the new
  one.

## Arbiters

- Config edits in the transcript appear only at boundaries where no
  subagent was active.
- After any host restart, the config change is recorded before the
  relaunch, and the relaunch re-passes the explicit routing parameters
  (see ./references/explicit-routing-params.md).
