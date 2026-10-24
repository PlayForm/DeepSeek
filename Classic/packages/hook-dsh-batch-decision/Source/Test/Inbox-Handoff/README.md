# Inbox-Handoff - the decision handoff into the inbox

A recorded decision is written into the harness agent-team inbox (the channel
plugin-dsh-batchstate consumes), and the ingester seam now finds the real
service.

## Scenarios

- H1: the decision is injected into the origin agent's inbox exactly once,
  the injected text is the byte-exact `[BATCH DECISION - <id>]` envelope over
  the recorded decision, and the ledger carries
  `inbox prop-1: delivered to agent-a`.
- H2: the return-address resolution - without an origin the harness
  initiator receives the decision (`inbox prop-2: delivered to
  agent-initiator`); without an initiator the first live agent does
  (`inbox prop-3: delivered to agent-first`).
- H3: without an agent registry the handoff is the honest
  `inbox prop-1: no live agent` line (the bus emission still carries the
  decision).
- H4: the LIVE ingester seam - a service registered as `ingester` with
  `Apply(proposal, decision)` receives the proposal AND the decision and its
  result is logged byte-exactly.
- H5: a registered `batchIngester` seam is still preferred over the live name
  (the declared seam wins).

## Fixtures

The shared Harness (the fake ctx with the service registry behind
`Context.get`, the `batch/proposed` listener capture, the tool capture) plus
a fake harness agent registry whose `inject` is captured.

## Expected ledger strings (byte-exact, `hook-dsh-batch-decision: ` prefix)

`inbox <id>: delivered to <agent>`, `inbox <id>: no live agent`.

## Expected count

7 PASS.
