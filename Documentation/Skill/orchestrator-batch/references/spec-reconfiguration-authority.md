# The Spec-Reconfiguration Authority (User-Granted)

> Source: SKILL.md, section "The spec-reconfiguration authority
> (user-granted)" (both bullets); amended by the idle-amendment law
> (2026-10-19, see idle-amendment-law.md). Mandate date: 2026-10-20
> (canonical restructure).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The user granted the orchestrator the authority to RE-CONFIGURE specs as
requirements arrive, change, and as other agents report feedback:

1. **Amend an idle agent's spec** via send_message; the agent acknowledges
   with the line "<NAME> SPEC AMENDED - IDLE".
2. **Amend a working agent's mandate mid-flight** only when the change is
   compatible - delivered as a checkpoint message. (Restricted since
   2026-10-19: suggestions, improvements, and subsequent ideas must NOT go
   to a working lane mid-flight - see idle-amendment-law.md. The mid-flight
   amendment remains for compatible, corrective changes only.)
3. **Re-apply the changed requirements** to the not-yet-started agents'
   prompts before they are launched.
4. **Re-dispatch failed agents** with the corrected specs.

Amendments override the base specs where they conflict. The durable queue
plus the new agents are recorded in Documentation/Plans/TOMORROW-REVIEW.md
(the process record - the numbered items) so the state survives connectivity
losses and session switches.

## Why: The Full Philosophy

1. **Why the authority exists:** requirements are not static. Between a
   lane's launch and its completion, the user speaks again, other lanes
   surface findings, and the world the spec described changes. Without the
   authority, every change means killing and relaunching lanes - losing
   seated context and paid-for progress.
2. **Why idle amendments are the cheap form:** an idle lane has done no
   work; amending its spec costs one message. That is why the preferred
   routing for new requirements is: amend idle specs first, re-apply to
   not-yet-started prompts next, and touch working lanes last.
3. **Why mid-flight amendment is restricted to compatible changes:** a
   working lane is executing a single mandate (see idle-amendment-law.md).
   Adding an unrelated improvement mid-flight splits its focus and limits
   its execution. A compatible change (e.g. a correction to a detail of the
   same task) can be absorbed as a checkpoint message without breaking the
   mandate.
4. **Why amendments override base specs:** two documents describing the
   same lane invite "which one wins?" ambiguity. The rule is explicit: the
   latest amendment wins wherever the texts conflict - no reconciliation
   needed, no stale clause can silently survive.
5. **Why the record lives in TOMORROW-REVIEW.md:** the queue exists in
   agent contexts that die with sessions. The process record is the
   durable copy: connectivity loss, session switch, or crash - the next
   reader reconstructs the queue (including every amendment and every new
   agent) from the numbered items.

## Examples

### Good

- New feedback lands on an idle lane's surface -> send_message with the
  amendment -> lane replies "LANE-C SPEC AMENDED - IDLE" -> amendment noted
  in TOMORROW-REVIEW.md.
- A failed lane is re-dispatched with the same spec plus the correction
  that addresses why it failed.
- A requirement changes while three lanes are not yet launched -> their
  prompts are edited before launch, so the change costs nothing.

### Bad

- Sending a new feature idea to a working lane mid-flight (violates the
  idle-amendment law; new ideas become NEW IDLE lanes).
- Amending without recording: the session then ends and the amendment is
  lost - the relaunched lane works to the stale spec.
- Leaving a conflicting clause in the base spec after amending: the lane
  reads both and cannot tell which governs.

## Exceptions

- The idle-amendment law (2026-10-19) redirects suggestions/improvements/
  subsequent ideas to NEW IDLE lanes instead of mid-flight amendments; the
  spec-reconfiguration authority still applies to idle and not-yet-started
  lanes and to compatible corrections of working lanes.
- If an amendment would fundamentally change a working lane's task, do not
  amend mid-flight: pause or complete the lane per the two-active regime
  (see the-two-active-regime.md) and re-dispatch with the corrected spec.

## Failure Modes

- Recording gaps: an amendment applied but not written to TOMORROW-REVIEW.md
  dies with the session.
- Amendment flooding: too many small amendments to one idle spec make it
  incoherent - consolidate before sending.
- Mid-flight idea injection: the working lane's focus splinters; its
  original mandate suffers (the direct lesson behind the 2026-10-19 law).

## Arbiters

- Every amendment must produce the acknowledgment line ("<NAME> SPEC
  AMENDED - IDLE" for idle lanes) and a TOMORROW-REVIEW.md entry.
- Conflict check: the amendment text must explicitly override the base spec
  clauses it replaces, or the base spec must be re-issued consolidated.
- Working-lane amendments are audited against the idle-amendment law: only
  compatible corrections qualify; ideas do not.
