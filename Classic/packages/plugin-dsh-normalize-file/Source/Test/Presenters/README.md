# Presenters

This page records what the test verifies.

## Intent

The presenters are the pure, outcome-metadata driven view layer that turns a tool call and a tool result into cards.

This folder stands alone because the presenter contract is user-visible UI behavior with its own rules.

A call-time presenter cannot see file content, so it renders the generic card.

A changed result renders a diff card with the real before/after.

A no-op and an error render no card.

The folder holds the source suite's Run 7, moved verbatim.

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

The harness uses a fake ctx, the REAL factory, and the REAL normalize-file apply.

The tool's presenter methods are pure, so no tool call is made and the journal counters stay at zero.

The metadata objects carry the source suite's exact values: the changed outcome
`{ path: /tmp/normalize-file-smoke-fixture.txt, count: 7, changed: true,
before: All6, after: Normalized6 }` and the no-op outcome
`{ path: /tmp/normalize-file-smoke-clean.txt, count: 0, changed: false }`.

The harness clears the durable ledger at folder start and reads no ledger.

## Expected ledger strings (byte-exact)

This folder asserts none.

The cards' titles are `Normalize /tmp/normalize-file-smoke-fixture.txt`
and `Normalize /tmp/normalize-file-smoke-clean.txt`.

The diff card's oldText/newText are the All6/Normalized6 fixtures, which follow the same six-transform contract as the pipeline folder.

## Edge cases

- Call time and result time differ, so the call card is generic because content is not yet known.
- A no-op result renders NO diff card, and an error result renders NO card at all.

## Expected count

8 PASS.
