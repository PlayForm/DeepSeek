# Digest-And-Prompt

What the review SENDS: the bounded digest of the conversation and the constant
review prompt.

## Intent

Both artifacts are where an unattended review fails quietly. A digest that cuts
between a tool call and its result hands the reviewer an unanswered call; a
digest of assistant turns only hides the corrections the review exists to catch;
a prompt whose rules drift from the judge produces operations the judge then
refuses. This folder pins the digest's three rules and the prompt's order.

## Scenario

- Check: "D1: a short conversation is kept verbatim, nothing collapsed" - four
  messages under a 24-message tail: kept 4, collapsed 0, both roles present.
- Check: "D2: a long conversation collapses the older turns and keeps the tail"
  - forty messages: the leading sixteen collapse into one summary that keeps
  both sides, the newest turn stays verbatim.
- Check: "D3: the tail never starts on a tool result" - a two-message tail over
  `user, assistant, tool, tool` grows to three so it starts on the assistant
  message.
- Check: "D4: the character cap trims from the front and says so" - a 200-char
  cap drops the oldest collapsed turn and keeps the newest.
- Check: "D5: an empty conversation is a marker, never an empty string".
- Check: "P1: the prompt is the blocks in the judge's order" - the task first,
  the reply contract last.
- Check: "P2: both stores are named, with the one-store rule".
- Check: "P3: an explicit focus is appended after the contract".
- Check: "P4: the service's prompt is the same bytes as the function's" - the
  service delegates, it does not re-compose.

## Fixtures

The shared Harness (the real built class + fake ctx) plus the built
`Target/Function/Digest.js` and `Target/Function/Prompt.js` imported directly:
the digest's cap is exercised below the service's `maxInputChars` floor, which
the knobs deliberately refuse.

## Expected ledger strings (byte-exact)

None - the digest and the prompt are pure and log nothing.

## Expected count

9 PASS.
