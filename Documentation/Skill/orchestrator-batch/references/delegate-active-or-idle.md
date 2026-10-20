# Delegate: Active or Idle

> Source: SKILL.md, section "The loop (incremental + synchronous in
> wall-clock time)", step 3 (DELEGATE). Mandate date: 2026-10-20
> (canonical restructure).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Delegation always takes one of two forms:

1. **An ACTIVE agent** - a lane that takes its slot in the serialized queue
   and starts working now. Under the two-active regime (see
   the-two-active-regime.md) at most two lanes are active at any moment.
2. **An IDLE agent** - the paused pattern: launch with a fully
   self-contained spec, the activation rules, and the confirmation line
   ("ACK: SPEC RECEIVED - IDLE" / "ACK: SPEC RETAINED - IDLE"). The lane
   holds the spec and does NOTHING until it receives "ACTIVATE" plus the
   current-state block.

In both forms, THE SPEC MUST BE SELF-CONTAINED - the subagent's conversation
cannot see this one. Everything the lane needs (scope, surface, exclusions,
sequence, the shared facts, the conventions, the report format, the routing)
is written into the spec itself.

## Why: The Full Philosophy

1. **The serialized queue is the concurrency control.** One active slot
   (historically; later two - see the-two-active-regime.md) exists because
   parallel lanes editing overlapping surfaces produce interleaved diffs,
   broken builds, and unattributable changes. The queue makes the batch
   deterministic: at any instant, the set of lanes allowed to write is known.
2. **The IDLE pattern exists to absorb bursty work cheaply.** Spawning a
   full agent at the moment a slot frees costs latency and risks losing the
   task's framing; pre-seating the agent with a retained spec means
   activation is a one-word message, and the agent's full context is already
   in place.
3. **Self-containment is not a preference - it is an information boundary.**
   A subagent starts with a fresh context; anything the orchestrator "knows"
   but did not write into the spec simply does not exist for the lane. Every
   forgotten detail reappears later as a wrong assumption the lane worked to
   completion.
4. **The confirmation line is the handshake.** "ACK: SPEC RECEIVED - IDLE"
   proves the lane holds the spec and will not act. Without it, the
   orchestrator cannot distinguish a seated lane from a lost one.

## Examples

### Good

- Launch: full spec (scope, surface, exclusions, sequence, facts, conventions,
  report format) + routing (cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash,
  reasoningEffort low) -> lane replies "ACK: SPEC RECEIVED - IDLE" ->
  orchestrator holds it in the queue until "ACTIVATE" with the state block.
- Activate: "ACTIVATE - current state: lane A finishing docs nav, lane B
  idle; your surface is X; surfaces Y and Z are off-limits; pending count 2."

### Bad

- A one-line launch ("fix the nav") relying on the lane to infer everything.
- Assuming the lane can see the orchestrator's transcript ("as discussed...").
- Activating an idle lane without the state block - it does not know what
  the other lanes are doing and may enter their surfaces.

## Exceptions

- A trivial, single-message task may be delegated active without a long
  spec, but the self-containment rule still applies: the one message must
  carry everything the lane needs.
- An idle lane whose surface becomes irrelevant is retired by message
  ("SPEC RETIRED - STAND DOWN") rather than activated into stale work.

## Failure Modes

- A non-self-contained spec: the lane fills gaps with guesses; the guesses
  surface as rework or as violations of the shared facts.
- Activating more lanes than the queue allows: the surface conflicts and the
  API throttling (see the-two-active-regime.md) both bite.
- Launching an idle lane without the confirmation handshake and later
  activating a lane that never actually received the spec.

## Arbiters

- Every launch must be verifiable: the spec text exists in the record, the
  routing fields are explicit, and the lane's ACK line is on file.
- The queue record shows, at every moment, which lanes are active, which are
  paused/idle, and which are queued - an unrecorded launch is non-compliant.
- The routing fields are checked on every launch (see routing-law.md): an
  omitted provider/model/effort is a violation, not a default.
