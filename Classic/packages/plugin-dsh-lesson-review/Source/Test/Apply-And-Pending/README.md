# Apply-And-Pending

This folder covers the review end to end and the write fence: propose by default, land on
acceptance, and degrade loudly.

## Intent

This folder proves the central promise of the package.

A review that writes to the corpus unasked is worse than no review, so the shipped posture
(`policy.write: approve`) queues every accepted operation and the corpus stays untouched until
`Accept`.

The `write: auto` opt-in is the same pipeline with the queue replaced by the guarded write.

The four degradation paths each end in an outcome class instead of a throw, because the review runs
inside a maintenance task of a caller.

## Scenario

- "A1: the shipped posture PROPOSES - nothing lands, the queue grows".
- "A2: Accept lands a queued proposal and empties its row".
- "A3: write:auto lands the accepted operation itself".
- "A4: an agreement operation is ALWAYS queued, even under write:auto" - this
  service never writes the `AGENTS.md` of the user.
- "A5: the write fence refuses a create over an existing skill" (`exists`).
- "A6: the write fence refuses a patch on a missing skill" (`missing`).
- "A7: no llm service is `unavailable`, never a throw".
- "A8: no model route is `unavailable`".
- "A9: a provider failure is `failed`, with the cause".
- "A10: an unparseable reply is `failed`, not an empty proposal".
- "A11: `Nothing to save.` is `nothing`, with no queue and no write".
- "A12: the request carries the digest, the prompt and the route of the agent".
- "A13: the knobs override the route when they name one".
- "A14: the proposed-review ledger lines are byte-exact".

## Fixtures

The fixtures are the shared Harness with the real built class, the fake ctx, and the temp HOME, plus
its `FakeLlm`, which answers with the reply split across two `text-delta` frames and records the
request.

`FakeLlm(..., { fail: true })` throws synchronously out of `stream`, which is the provider-exploded
path.

`Apply` is imported directly for the fence checks, with a literal `{ skillsRoot, archiveRoot }`,
because the own knobs of the service are private and because the fence must hold even when someone
calls it outside a review.

## Expected ledger strings (byte-exact)

- `lesson: queued create <name>`
- `lesson: review proposed (<a> applied, <q> queued, <r> refused)`
- `lesson: review applied (<a> applied, <q> queued, <r> refused)`
- `lesson: review unavailable (<reason>)`
- `lesson: review failed (<reason>)`
- `lesson: nothing to save`
- `lesson: accepted <op> <name> -> <path>`

The service appends ` (logFile <logFile>)` to each line, and the `Messages` helper of the harness
strips it for the message-only assertions.

## Expected count

14 PASS.
