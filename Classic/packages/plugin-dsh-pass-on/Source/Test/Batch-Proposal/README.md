# Batch-Proposal - the real batch-contract wiring

The prepared proposal becomes the canonical batch proposal, is emitted on
`batch/proposed`, and is delivered into the harness agent-team inbox - the
channel plugin-dsh-batchstate splices from.

## Scenarios

- B1: the canonical conversion - the emitted object is deep-equal to the
  contract (the intent OBJECT becomes the intent LABEL, the operations carry
  `kind` beside the literal find/replace, the preview ARRAY becomes
  `{ entries, changes, skipped }`), and its digest/id are the internal
  proposal's own fence.
- B2: the inbox delivery - exactly one `agent.inject` into the origin
  agent's inbox, the message is a user message with a fresh id, the injected
  text is the byte-exact `[BATCH PROPOSAL - <id>]` envelope over the emitted
  JSON, and the delivery is journaled
  (`{"at":<epoch>,"event":"delivered","proposal":<id>,"digest":<digest>,"targets":1,"note":"inbox agent-a"}`)
  beside the unchanged prepared line.
- B3: the honest absence - without an agent registry the delivery journals
  `"note":"inbox none"` and the bus emission still carries the proposal.
- B4: the origin resolution - the harness initiator
  (`AgentRegistry.currentInitiator`) is the return address when no explicit
  origin is given, and an explicit origin wins over it.
- B5: a refused prepare (null) emits nothing, delivers nothing, and journals
  only its refusal.

## Fixtures

The shared Harness (the fake ctx with the `batch/proposed` emission capture
and the optional-service `get` probe) plus a fake agent registry whose
`inject` is captured. The preview region is recomputed in the test with the
plugin's own pure formula; the digest with the plugin's own Digest module.

## Expected journal strings (byte-exact, JSON lines)

`{"at":<epoch>,"event":"prepared","proposal":<id>,"digest":<digest>,"targets":1,"note":"prepared 1 targets"}`,
`{"at":<epoch>,"event":"delivered","proposal":<id>,"digest":<digest>,"targets":1,"note":"inbox <agent|none>"}`.

## Expected count

9 PASS.
