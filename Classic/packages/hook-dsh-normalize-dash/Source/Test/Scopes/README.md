# Scopes

What this test verifies.

## Intent

The granular scope gates: the six per-surface switches that sit on top of the
legacy flags. This is its own folder because each gate is an independent
on/off axis with a default that must reproduce the pre-scope behavior
exactly, and because one gate (conversation) flips live through the factory's
volatile-update dispatch. The source suite's Run S (S1-S5), moved verbatim.

## Scenario

- Group: Run S - the granular scope gates.
    - Check: "scopes.conversation off: text-delta passes by identity" (S1).
    - Check: "scopes.conversation off: no count line" (S1's negative
      control).
    - Check: "scopes.reasoning off: reasoning-delta passes by identity" (S2,
      even with normalizeReasoning on).
    - Check: "scopes.conversation off: text block passes by identity" (S3,
      the assembled block obeys the same gate).
    - Check: "effective toolInput (deprecated field on, scope off): still
      normalizes" (S4 - the OR rule).
    - Check: "toolInput both off: passes by identity" (S4b - the negative
      control).
    - Check: "effective toolInput (scope on, deprecated field off):
      normalizes" (S4c - the other OR half).
    - Check: "volatile scope flip: conversation off applies to the NEXT
      stream without remount" (S5 - the live flip through the
      loader/volatile-update dispatch).

## Fixtures

The harness fake ctx + the REAL factory + the REAL dash apply. Each sub-run
hand-builds its config with a `scopes` volatile cell whose getter returns a
mutable object (the source suite's stable-reference simulation); S5 mutates
that object and dispatches `[["scopes", "conversation"]]` through the
registered `loader/volatile-update` listener. The stream driver feeds
one-chunk sequences (text-delta, reasoning-delta, block-end, tool-call-delta)
through the registered `llm/stream` listener with frozen options. No ledger
reads.

## Expected ledger strings (byte-exact)

None asserted in this folder - every check is identity/behavior on the
stream objects plus the "no count line" negative control on the captured
logger lines.

## Edge cases

- Defaults must equal the previous behavior exactly (every gate at its
  default = the legacy dispatch).
- The deprecated `normalizeToolArguments` field and the `toolInput` scope are
  OR-ed, not overridden - both directions pinned.
- A scope flip is applied to the NEXT stream without remount - no second
  activation line, same State object.

## Expected count

8 PASS.
