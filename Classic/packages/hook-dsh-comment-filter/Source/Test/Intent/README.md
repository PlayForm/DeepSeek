# Intent

This file states what the test verifies.

## Intent

The suite covers the per-task intent gate: the agent/pre-step stash, which holds the text of the last
user message lowercased per agent, and the per-call decision it feeds.

It has its own folder because the stash is a separate integration surface from the overpass arm: it
has its own listener, its own payload contract as a pure observer that returns the downstream decision
unchanged, its own state (`IntentMap` keyed by the agent object plus the `Global` fallback), and its
own failure mode, because a step with no user message must NOT wipe the stash.

## Scenario

- I0: registration. Check: "intent: the agent/pre-step arm is registered".
- I1: the observer contract. Check: "intent: the pre-step listener returns the
  downstream decision unchanged".
- I2: the comment task. Check: "intent: a task ABOUT comments leaves the read
  result untouched".
- I3: the normal task. Check: "intent: a normal task strips the read result".
- I4: per-agent isolation. Check: "intent: the stash is PER AGENT (B's comment
  task leaves B untouched)".
- I5: isolation, the other direction. Check: "intent: A still strips after B's
  comment task (per-agent isolation)".
- I6: the global fallback. Check: "intent: a call with no agent identity uses
  the global fallback".
- I7: the no-user-message step. Check: "intent: a step with no user message
  keeps the previous intent".
- I8: a non-target tool. Check: "intent: a non-target tool passes by identity".
- I9: the blunt mode. Check: "intent: intent off always strips (the blunt
  mode)".
- I10: the off switch. Check: "intent: enabled off never strips (and no ledger
  line)".
- I11: the activation line survives the off switch. Check: "intent: enabled off
  still records the activation line in the ledger".

## Fixtures

The harness supplies the fake ctx with the REAL factory and the REAL comment-filter apply.

One apply uses the REAL schema defaults for the per-agent cases, and two plain objects stand in for
the Agent instances of the harness, because the Map keys by identity.

The I9 and I10 groups use their own applies (`intent: false`, `enabled: false`), so a switch never
leaks across a check, and the durable ledger is cleared at folder start.

## Expected ledger strings (byte-exact)

- `hook-dsh-comment-filter: activated (targets 2, intent on, notice on, logFile=/tmp/comment-filter-smoke-ledger.log)`
  (and the `intent off` / `notice off` variants that the other applies print; the folder asserts the
  filtered line only through the Overpass folder, so no intent-specific string is invented here).

## Edge cases

- The stash is keyed by the agent OBJECT, because `exec.agent` is the same object the step payload
  carries, so two agents never share an intent.
- A call with no agent identity falls back to the last text seen by ANY agent.
- A step with no user message, which is a tool-result or assistant-only step, keeps the previous
  intent, because otherwise the gate would work only on step one.
- `intent: false` strips unconditionally, and `enabled: false` never strips, yet its activation line
  still reaches the ledger because `enabled` maps onto `State.Active` and never onto the ledger gate
  of the factory.

## Expected count

12 PASS.
