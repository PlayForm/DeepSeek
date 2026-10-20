# The Arbiters Are the Lanes' Own (and the Non-Execution Law)

> Source: SKILL.md, section "The loop (incremental + synchronous in
> wall-clock time)", step 5 (VERIFY); and section "THE FORMALIZED
> ORCHESTRATION MODEL", point 9 (the relay + non-execution). The
> non-execution law is user-mandated 2026-10-09 (the slip lesson); the
> relay form restated in the 2026-10-10 model.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

1. **The arbiters are the lanes' own**: every activation carries the arbiter
   mandate - each lane runs its own verification and reports the numbers:
   - The code lanes run the suites, which print their own totals:
     Classic 733 / EffectTS 746.
   - The site lanes run the build + the built-HTML/CSS + the measured checks
     themselves, and report the numbers.
2. **THE ORCHESTRATOR DOES NOT EXECUTE** (the user-mandated law, 2026-10-09 -
   the slip lesson, enforced after the orchestrator ran a build that cleared
   Target/ + pre-investigated feedback surfaces): no builds, no site edits,
   no measurement runs, NO surface-location investigation before relaying
   feedback. The feedback goes to the idlers VERBATIM, and the idlers
   investigate + locate + execute + build + verify.
3. **The orchestrator's hands-on work is LIMITED to**:
   (a) relaying the user's feedback verbatim to the idle agents;
   (b) keeping the records (the handoff, the Tasks/, the process records);
   (c) read-only spot-checks of the agents' REPORTED claims - greps over the
       committed/built output only. Trust the agents' PRINTED TOTALS over
       prose claims; a claim that contradicts the printed totals is wrong -
       e.g. 795/808 were arithmetic phantoms.
4. The user commits mid-session - the index state is theirs.
5. (Model point 9, same law restated:) the user's feedback relays VERBATIM;
   the orchestrator never executes (no builds, no site edits, no research) -
   dispatch + relay + verify only.

## Why: The Full Philosophy

1. **Why the arbiters live in the lanes:** the lane that does the work has
   the freshest build, the full context of its change, and the ability to
   iterate. Centralizing verification in the orchestrator would make the
   orchestrator a build server - the exact role the non-execution law
   forbids - and would separate the evidence from the work.
2. **Why the non-execution law exists - the slip lesson:** in one incident
   the orchestrator itself ran a build (which cleared Target/), and
   pre-investigated feedback surfaces before relaying feedback. The costs:
   the lanes' arbiter state was destroyed (the cleared Target/), and the
   pre-investigation biased/added latency to what should have been a verbatim
   relay. The user mandated the law 2026-10-09; every item in the forbidden
   list (builds, site edits, measurement runs, pre-investigation) maps to
   that incident.
3. **Why feedback is relayed verbatim:** the orchestrator's paraphrase is a
   lossy translation. The user's words carry nuance ("looks wrong" is not
   "is wrong"); the lane must see exactly what the user saw. Pre-investigating
   before relaying also risks the orchestrator concluding "no fix needed" and
   never relaying - which steals the user's decision.
4. **Why printed totals beat prose:** prose can be optimistic, misremembered,
   or aspirational; a suite's printed total is emitted by the verifier
   itself. The 795/808 incident: prose claimed numbers that arithmetic on
   the real counts could not support - phantoms. The rule is therefore
   asymmetric: printed totals are trusted; contradicting prose is discarded.
5. **Why the index state is the user's:** the user commits mid-session;
   HEAD moves under the orchestrator and the lanes (see the environment
   discipline in session-resume-protocol.md). The orchestrator neither
   commits nor stages; its records note the state it observed.

## Examples

### Good

- User feedback: "the pause cursor is red but should not be" -> relayed
  VERBATIM to an idle lane; that lane investigates, locates, fixes, builds,
  verifies, and reports its numbers.
- Spot-check: grep the committed/built output for the string the lane
  claimed to have removed - read-only, over committed artifacts only.
- Lane reports "733 passed" in prose but its transcript shows the suite
  printed 746 -> the prose claim is wrong; the printed total stands.

### Bad

- The orchestrator runs `pnpm prepublishOnly` to "save a lane time" -
  clears Target/, destroys the lanes' arbiter state, violates the law.
- Paraphrasing feedback: "user says the cursor color is off" instead of the
  verbatim sentence.
- Investigating which file contains the bug before relaying - that is the
  lane's job; the orchestrator's pre-investigation is forbidden.
- Accepting "all tests pass" as a result without printed totals.

## Exceptions

- The read-only spot-check (limit c) is the sole sanctioned hands-on act -
  and it is greps over committed/built output ONLY, never a run, never an
  edit.
- Orchestrator record-keeping (writes to the handoff, Tasks/, process
  records) is execution of the RECORDS, not of the project - allowed.
- If the user explicitly instructs the orchestrator to perform a specific
  act (e.g. "run the build yourself"), the user's direct instruction
  overrides the standing law for that one act - but it must be explicit.

## Failure Modes

- Pre-investigating feedback: latency, bias, and the relay arrives late and
  colored; in the worst case the orchestrator decides "no fix needed" and
  never relays.
- Trusting prose over printed totals: phantoms (795/808) propagate into
  reports and decisions.
- Spot-checks drifting into edits or runs: the read-only boundary is the
  law's last line; once crossed, the orchestrator is executing again.

## Arbiters

- Every report the orchestrator relays upstream must cite printed totals
  (suite output), not prose claims.
- Every feedback relay must be verbatim - a paraphrase in the record is a
  violation.
- The spot-check trail: only read-only greps over committed/built output;
  any build command, edit, or measurement run executed by the orchestrator
  is a violation of the user-mandated 2026-10-09 law.
- The lane-side arbiter mandate is present in every activation message.
