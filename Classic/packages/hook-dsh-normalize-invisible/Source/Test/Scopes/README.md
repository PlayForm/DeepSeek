# Scopes

What this test verifies.

## Intent

The granular scope gates (Run S): each scope on/off with everything else at
defaults, the effective-toolInput OR semantics with the deprecated
`normalizeToolArguments` field, and the S5 volatile scope flip applied to the
NEXT stream without remount. Conversation off passes text-deltas and the
assembled text block by identity; reasoning off passes reasoning-deltas even
with `normalizeReasoning=on`; the effective toolInput gate is an OR of the
deprecated field and the `scopes.toolInput` scope (either one on normalizes,
both off passes by identity); and the factory's loader/volatile-update
dispatch flips a scope for the next stream without remounting. The
assertions are moved verbatim from `Classic/smokes/invisible-smoke.mjs`
section "Run S (additive): the granular scope gates".

## Scenario

- Group: S1 - conversation off (text-delta identity, no count line).
    - Sub: "scopes.conversation off: text-delta passes by identity"
        - assert.ok(OutS1[0] === TextChunkS)
    - Sub: "scopes.conversation off: no count line"
        - assert.ok(S1.Lines.every((L) => !L.includes("normalized")))
- Group: S2 - reasoning scope off (reasoning-delta identity).
    - Sub: "scopes.reasoning off: reasoning-delta passes by identity"
        - assert.ok(OutS2[0] === ReasonChunkS)
- Group: S3 - conversation off (assembled text block identity).
    - Sub: "scopes.conversation off: text block passes by identity"
        - assert.ok(OutS3[0].block === TextBlockChunkS.block)
- Group: S4 - the effective toolInput OR gate.
    - Sub: "effective toolInput (deprecated field on, scope off): still
      normalizes (removal)"
        - assert.ok(OutS4[0].argumentsDelta === '{"a":""}')
    - Sub: "toolInput both off: passes by identity"
        - assert.ok(OutS4b[0] === ArgsChunkS)
    - Sub: "effective toolInput (scope on, deprecated field off): normalizes
      (removal)"
        - assert.ok(OutS4c[0].argumentsDelta === '{"a":""}')
- Group: S5 - the volatile scope flip.
    - Sub: "volatile scope flip: conversation off applies to the NEXT stream
      without remount"
        - assert.ok(OutS5[0] === TextChunkS)

## Fixtures

The shared harness (`../Harness.js`): the fake ctx, the REAL `apply` and the
ledger path `/tmp/invisible-smoke-ledger.log`. The config is hand-built with
a `scopes` volatile cell whose getter returns a mutable object (the
stable-reference simulation) plus `replacement: ""` - the removal default,
explicit here because the defaults are bypassed by the hand-built config.
The fixtures use this flavor's own character: a zero-width space (U+200B) in
the text chunk, the reasoning chunk, the assembled text block and the
tool-call JSON. Normalization REMOVES it (replacement ""), so the normalized
expectations are the surrounding characters with the invisible char gone
(e.g. `{"a":""}` inside the JSON).

## Expected ledger strings (byte-exact)

None. This folder asserts the ABSENCE of count lines (S1's no-line rule);
no ledger string is asserted positively here.

## Edge cases

- The identity comparisons are by reference (`===` on the chunk and on the
  assembled block) - a hidden rewrite would fail them.
- The OR semantics are pinned from both sides: deprecated field on/scope off
  normalizes, both off passes, scope on/deprecated field off normalizes.
- S5's flip goes through the REAL volatile-update dispatch, proving the
  scope state is read per-stream, not captured at apply time.

## Expected count

8 PASS.
