# Inbox-Handoff - the decision handoff into the inbox

The suite writes a recorded decision into the agent-team inbox of the harness, which is
the channel that plugin-dsh-batchstate consumes, and the ingester seam now finds the real
service.

## Scenarios

- H1: the decision is injected into the inbox of the origin agent exactly once, the
  injected text is the byte-exact `[BATCH DECISION - <id>]` envelope over the recorded
  decision, and the ledger carries `inbox prop-1: delivered to agent-a`.
- H2: the return-address resolution works in two steps, because without an origin the
  initiator of the harness receives the decision (`inbox prop-2: delivered to
  agent-initiator`) and without an initiator the first live agent does (`inbox prop-3:
  delivered to agent-first`).
- H3: without an agent registry the handoff gives the honest
  `inbox prop-1: no live agent` line, and the bus emission still carries the decision.
- H4: the LIVE ingester seam works, so a service registered as `ingester` with
  `Apply(proposal, decision)` receives the proposal AND the decision, and its result is
  logged byte-exactly.
- H5: a registered `batchIngester` seam is still preferred over the live name, so the
  declared seam wins.

## Fixtures

The shared Harness supplies the fake ctx with the service registry behind `Context.get`,
the `batch/proposed` listener capture, and the tool capture, plus a fake harness agent
registry whose `inject` is captured.

## Expected ledger strings (byte-exact, `hook-dsh-batch-decision: ` prefix)

`inbox <id>: delivered to <agent>`, `inbox <id>: no live agent`.

## Expected count

7 PASS.
