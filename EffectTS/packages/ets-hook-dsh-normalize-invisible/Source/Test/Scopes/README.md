# Scopes

What this test verifies.

## Intent

This folder covers the granular scope gates (Run S).

Each scope is tested on and off with everything else at defaults.

The effective-toolInput OR semantics with the deprecated `normalizeToolArguments` field are covered too, as is the S5 volatile scope flip applied to the NEXT stream without remount.

Conversation off passes text-deltas and the assembled text block by identity.

Reasoning off passes reasoning-deltas even with `normalizeReasoning=on`.

The effective toolInput gate is an OR of the deprecated field and the `scopes.toolInput` scope: either one on normalizes, and both off passes by identity.

The loader/volatile-update dispatch of the factory flips a scope for the next stream without remounting.

The assertions are moved verbatim from `EffectTS/smokes/invisible-smoke.mjs` section "Run S (additive): the granular scope gates".

## Scenario

- Group: S1 - conversation off (text-delta identity, no count line).
    - Check: "scopes.conversation off: text-delta passes by identity".
        - assert.ok(OutS1[0] === TextChunkS)
    - Check: "scopes.conversation off: no count line".
        - assert.ok(S1.Lines.every((L) => !L.includes("normalized")))
- Group: S2 - reasoning scope off (reasoning-delta identity).
    - Check: "scopes.reasoning off: reasoning-delta passes by identity".
        - assert.ok(OutS2[0] === ReasonChunkS)
- Group: S3 - conversation off (assembled text block identity).
    - Check: "scopes.conversation off: text block passes by identity".
        - assert.ok(OutS3[0].block === TextBlockChunkS.block)
- Group: S4 - the effective toolInput OR gate.
    - Check: "effective toolInput (deprecated field on, scope off): still normalizes (removal)".
        - assert.ok(OutS4[0].argumentsDelta === '{"a":""}')
    - Check: "toolInput both off: passes by identity".
        - assert.ok(OutS4b[0] === ArgsChunkS)
    - Check: "effective toolInput (scope on, deprecated field off): normalizes (removal)".
        - assert.ok(OutS4c[0].argumentsDelta === '{"a":""}')
- Group: S5 - the volatile scope flip.
    - Check: "volatile scope flip: conversation off applies to the NEXT stream without remount".
        - assert.ok(OutS5[0] === TextChunkS)

## Fixtures

The shared harness (`../Harness.js`) supplies the fake ctx, the REAL `apply`, and the ledger path `/tmp/invisible-smoke-ledger.log`.

The config is hand-built with a `scopes` volatile cell whose getter returns a mutable object (the stable-reference simulation) plus `replacement: ""`, the removal default, which is explicit here because the hand-built config bypasses the defaults.

The fixtures use this flavor's own character: a zero-width space (U+200B) in the text chunk, the reasoning chunk, the assembled text block, and the tool-call JSON.

Normalization REMOVES it (replacement ""), so the normalized expectations are the surrounding characters with the invisible char gone (for example `{"a":""}` inside the JSON).

## Expected ledger strings (byte-exact)

None.

This folder asserts the ABSENCE of count lines (S1's no-line rule), and no ledger string is asserted positively here.

## Edge cases

- The identity comparisons are by reference (`===` on the chunk and on the assembled block), so a hidden rewrite would fail them.
- The OR semantics are pinned from both sides: deprecated field on and scope off normalizes, both off passes, and scope on with the deprecated field off normalizes.
- S5's flip goes through the REAL volatile-update dispatch, which proves the scope state is read per-stream and not captured at apply time.

## Expected count

8 PASS.
