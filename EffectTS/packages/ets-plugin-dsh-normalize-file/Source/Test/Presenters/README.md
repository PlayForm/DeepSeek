# Presenters

What this test verifies.

## Intent

The presenters: the pure, outcome-metadata driven view layer that turns a tool call and a tool
result into cards.

This is its own folder because the presenter contract is user-visible UI behavior with its own
rules - a call-time presenter cannot see file content (generic card), a changed result renders a
diff card with the real before/after, and no-ops and errors render no card.

The source suite's Run 7 is moved verbatim.

## Scenario

- Group: Run 7 - the presenters (pure, outcome-metadata driven).
    - Check: "presentCall: the generic follow-along card (a call-time
      presenter has no access to the file's content)".
    - Check: "presentCall: the file location for editor follow-along".
    - Check: "presentationMeta projects the changed outcome's before/after".
    - Check: "presentResult: the diff card for a changed file".
    - Check: "the diff card shows the outcome's real before/after (the
      same-turn visibility)".
    - Check: "presentationMeta for a no-op: changed=false, no
      before/after".
    - Check: "presentResult: no diff card for a no-op (the generic result
      renders)".
    - Check: "presentResult: no card for an error result".

## Fixtures

The harness fake ctx + the REAL factory + the REAL normalize-file apply (the tool's presenter
methods are pure - no tool call is made, so the journal counters stay at zero).

The metadata objects are constructed with the source suite's exact values: the changed outcome
`{ path: /tmp/normalize-file-smoke-fixture.txt, count: 7, changed: true,
before: All6, after: Normalized6 }` and the no-op outcome
`{ path: /tmp/normalize-file-smoke-clean.txt, count: 0, changed: false }`.

The durable ledger is cleared at folder start, and the folder reads no ledger content.

## Expected ledger strings (byte-exact)

None.

The cards' titles are `Normalize /tmp/normalize-file-smoke-fixture.txt` and
`Normalize /tmp/normalize-file-smoke-clean.txt`; the diff card's oldText/newText are the
All6/Normalized6 fixtures (the same six-transform contract as the pipeline folder).

## Edge cases

- Call time vs result time: the call card is generic because content is not yet known.
- A no-op result renders NO diff card, and an error result renders NO card at all.

## Expected count

8 PASS.
