# Record-And-Transfer - the council record and the transfer tests

This folder covers the constructor wiring of the class plugin, the record and journal path with the
cap, the restore rule, the mechanical Push hop with its no-ops and chain cap, and the transfer
format.

## Scenarios

- F1: the wiring - the constructor registers the `feedback` service through
  reflect.provide and exactly one `session/event` listener; the schema fills
  the defaults (enabled true, maxBlockBytes 4096, maxChain 8, summaryTerms 10)
  and the ledger resolves.
- F2: the record stores the block unread in the record of the session, and the
  journal carries one `recorded` JSON line with the session, the agent id, and
  the block.
- F3: oversized text is capped with the `... [capped]` marker, where share =
  max(64, maxBlockBytes/4), and it is never dropped.
- F4: a newer block from the same agent replaces the older one in place, with
  the order preserved and the journal event `restored`.
- T1: the Push hop lands the block in the parent session with the next hop in
  the TRANSFERRED chain and the honest content untouched, and the destination
  session is new, so the journal event there is `recorded`.
- T2: the no-ops are a push back to the same session and a push with
  `enabled: false`, while Record still stores and journals when the service is
  disabled.
- T3: the chain cap drops a block whose chain exceeds `maxChain`, and the block
  is never recorded.
- R1: the transfer format is byte-exact, and the hopped form carries the joined
  DELTAS and TRANSFERRED chains plus the read-status.

## Fixtures

The fixtures are the shared Harness with the fake ctx that captures the session and event
listener, the real built class, and a real journal file in the temp dir.

The journal lines are parsed as JSON and compared on event, session, agentId, and block only.

## Expected journal events

`recorded` (first record), `restored` (re-record, Push, Read).

## Expected count

14 PASS.
