# THE MODEL POINTER (2026-10-10)

> Source: SKILL.md, section 8 ("THE MODEL POINTER (2026-10-10)"). Converted
> to the canonical skill structure on 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The Aphrodite site batch runs the FORMALIZED ORCHESTRATION MODEL. A session
doing site-batch work must read, before orchestrating:

1. The orchestrator-batch skill's **THE FORMALIZED ORCHESTRATION MODEL**
   section, which carries: the 2-active law, the pair queue, the ACK-trap,
   the re-pause, the no-build law, the deploy alignment, the tracking.
2. The current queue.
3. The feedback ledger at `Site/Documentation/TRACKING.md`.

The ledger is the session's memory; the active pair is tracked only,
everything else PAUSED.

Dated 2026-10-10.

## Why: The Full Philosophy

1. **The batch is a long-lived process spanning many sessions.** No single
   session holds the batch's state in context; the state must live in
   files. The pointer tells each session where that state is (the queue and
   the ledger) and which formal model governs it, so a fresh session can
   resume the batch exactly where the previous one left off.
2. **The seven named mechanisms are the model's load-bearing parts.** The
   2-active law (only two agents active at once), the pair queue (work is
   queued as pairs), the ACK-trap (the known failure where an agent's
   acknowledgement is mistaken for completion), the re-pause (returning
   interrupted work to PAUSED), the no-build law (builds are not run
   opportunistically in the batch), the deploy alignment (deployment stays
   synchronized with the batch state), and the tracking (the ledger). Each
   is documented in the orchestrator-batch skill - the pointer deliberately
   does not restate them; it routes to them.
3. **The ledger is the session's memory.** `Site/Documentation/TRACKING.md`
   records what happened, what is active, and what is paused. "The active
   pair is tracked only, everything else PAUSED" is the state discipline:
   the ledger does not maintain rich status for the whole batch - it tracks
   the active pair precisely and holds everything else in a single PAUSED
   state, so resuming requires exactly one decision (resume the active
   pair), not many.
4. **Why a pointer instead of a copy.** Restating the model here would
   create a second authority that drifts from the orchestrator-batch skill.
   The pointer keeps one source of truth per mechanism and adds only the
   session-specific routing: where the queue is, where the ledger is.
5. **The date anchors the pointer.** 2026-10-10 marks when this pointer was
   formalized; if the batch's location or model changes, the pointer is
   updated with a new date rather than silently edited.

## Examples

### Good

- A session starting site-batch work reads the orchestrator-batch skill's
  THE FORMALIZED ORCHESTRATION MODEL section first, then the current queue,
  then `Site/Documentation/TRACKING.md`, and only then resumes or schedules
  work.
- A session resuming after a crash finds the active pair in the ledger,
  resumes exactly that pair, and leaves everything else PAUSED.

### Bad

- A session starts batch work from memory of a previous session's summary,
  skipping the ledger - it then runs a pair that was already completed or
  re-paused.
- A session updates rich per-agent status for all queued items in the
  ledger - violating the "active pair tracked only, everything else
  PAUSED" discipline and bloating the resume decision.
- A session treats an agent's ACK as completion (the ACK-trap) because it
  never read the formalized model's description of that failure.

## Exceptions

- None documented. Any session touching the site batch - starting it,
  resuming it, or even inspecting it with intent to act - reads the
  formalized model, the queue, and the ledger first. Read-only curiosity
  about the batch's existence needs no ledger read; action does.

## Failure Modes

- Ledgerless resume: acting on batch state reconstructed from memory or
  chat history; duplicated or conflicting pairs result.
- ACK-trap: mistaking an acknowledgement for completion, marking a pair
  done that never finished.
- Status sprawl: maintaining detailed state for paused items, making the
  next resume ambiguous.
- Model drift: improvising batch mechanics (3 active, no re-pause) instead
  of following the formalized model in the orchestrator-batch skill.

## Arbiters

- `Site/Documentation/TRACKING.md` is the ledger and the session's memory;
  the batch's true state is whatever it records, and every batch action
  must be reflected in it.
- The orchestrator-batch skill's THE FORMALIZED ORCHESTRATION MODEL section
  is the authority for the seven mechanisms; behavior contradicting it is a
  violation even if the output looks correct.
- The state discipline: the ledger shows exactly one tracked active pair;
  everything else PAUSED. Any other shape in the ledger is a failure to
  investigate.
- Date: the pointer is dated 2026-10-10; a pointer without its date or with
  a mismatched one has drifted from this reference.
