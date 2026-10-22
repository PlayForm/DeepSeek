# Waterfall-And-Guards - the waterfall discipline and the guards tests

The two waterfall listeners through the real captured listeners: the
next()-first discipline, the pass/deny/ask envelopes, the synthesized
proposal, the excluded-target silence, the own-actor exemption, the
recursion guard, the outcome observer, and the fail-open containment.

## Scenarios

- W1: the pre-execute listener awaits `next()` first and returns the
  downstream decision unchanged on a pass; a passing gate emits the
  byte-exact `passed op:w1 (write /repo/src/a.ts)` line (logger and durable
  file) and the observer emits `observed op:c2 (accepted)`.
- W2: a denial returns the `{ kind: "deny", reason: "govern: ..." }`
  envelope; an escalation returns the `{ kind: "ask", ... }` envelope with
  the byte-exact `escalated op:w4 (approval required)` line.
- W3: a plain tool call (no attached proposal) synthesizes a minimal
  proposal from the call and passes with the byte-exact
  `passed op:c5 (edit /repo/src/a.ts)` line.
- W4: an excluded target passes through in silence (no decision lines); the
  hook's own activity (the actor identity check) is never gated.
- W5: the recursion guard: with loopBound 2, the third and fourth gate of
  the same operation are dropped with the byte-exact
  `loop op:loop (recursion guard)` line (twice, logger and durable file)
  while the first two still gate normally.
- W6: the post-execute observer records accepted and errored outcomes with
  the byte-exact `observed op:<id> (accepted | errored)` lines (logger and
  durable file).
- W7: a gate error never breaks a dispatch: the broken state fails inside
  the listener, a `govern: ...; the dispatch passes through` warn line is
  recorded, and the downstream decision is returned unchanged.

## Fixtures

The shared Harness (fake ctx + the REAL built factory + the REAL built
plugin apply); the waterfall listeners are the apply-captured
`tools/pre-execute` and `tools/post-execute` listeners.

## Expected ledger strings (byte-exact, `govern: ` prefix)

`passed <op> (<kind> <target>)`, `escalated <op> (approval required)`,
`loop <op> (recursion guard)`, `observed op:<id> (accepted)`,
`observed op:<id> (errored)`.

## Expected count

10 PASS.
