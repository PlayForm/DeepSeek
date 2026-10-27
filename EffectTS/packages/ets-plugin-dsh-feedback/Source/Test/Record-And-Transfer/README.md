# Record-And-Transfer - the council record and the transfer tests

The class plugin's constructor wiring, the record/journal path with the cap, the restore rule, the
mechanical Push hop with its no-ops and chain cap, and the transfer format.

## Scenarios

- F1: the wiring - the constructor registers the `feedback` service (reflect.provide) and exactly
  one `session/event` listener, and the schema fills the defaults (enabled true, maxBlockBytes
  4096, maxChain 8, summaryTerms 10) and the ledger resolves.
- F2: the record stores the block unread in the session's record, and the journal carries one
  `recorded` JSON line with the session, the agent id, and the block.
- F3: oversized text is capped with the `... [capped]` marker (share = max(64, maxBlockBytes/4)),
  never dropped.
- F4: the same agent's newer block replaces the older one in place (order preserved, journal event
  `restored`).
- T1: the Push hop lands the block in the parent session with the next hop in the TRANSFERRED chain
  and the honest content untouched; the destination session is new, so the journal event is
  `recorded` there.
- T2: the no-ops - a push back to the same session, and a push when `enabled: false`; Record still
  stores (and journals) while disabled.
- T3: the chain cap - a block whose chain exceeds `maxChain` is dropped, never recorded.
- R1: the transfer format is byte-exact, and the hopped form carries the joined DELTAS/TRANSFERRED
  chains and the read-status.

## Fixtures

The shared Harness (fake ctx with the captured session/event listener, the real built class, a real
temp-dir journal file).

The journal lines are parsed as JSON and compared on event/session/agentId/block only.

## Expected journal events

`recorded` (first record), `restored` (re-record, Push, Read).

## Expected count

14 PASS.
