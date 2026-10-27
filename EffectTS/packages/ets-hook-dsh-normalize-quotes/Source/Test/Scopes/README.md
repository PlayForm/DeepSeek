# Scopes

What this test verifies.

## Intent

This folder covers the granular scope gates (Run S).

Each scope is tested on and off with everything else at defaults, along with the effective-toolInput OR semantics with the deprecated `normalizeToolArguments` field and the S5 volatile scope flip applied to the NEXT stream without remount.

The scopes feature lets a user narrow the normalization per channel (conversation, reasoning, toolInput, toolResults, files, batch), and this folder proves the stream-side gates.

Conversation off means text deltas AND assembled text blocks pass by identity with no count line.

Reasoning off means reasoning deltas pass even with `normalizeReasoning` on.

The effective toolInput gate is the OR of the deprecated field and the scope, so either one on means normalization inside the JSON.

S5 is the stability proof: the `scopes` cell of the config is a mutable object captured by reference, the volatile-update dispatch of the factory flips it in place, and the next stream observes the change with no re-apply.

The assertions are moved verbatim from `EffectTS/smokes/quotes-smoke.mjs` section "Run S (additive): the granular scope gates".

## Scenario

- Group: S1 - conversation off, text delta.
    - Check: "scopes.conversation off: text-delta passes by identity".
    - Check: "scopes.conversation off: no count line".
- Group: S2 - reasoning scope off.
    - Check: "scopes.reasoning off: reasoning-delta passes by identity".
- Group: S3 - conversation off, assembled text block.
    - Check: "scopes.conversation off: text block passes by identity".
- Group: S4 - the effective toolInput gate (the OR of the deprecated field and the scope).
    - Check: "effective toolInput (deprecated field on, scope off): still normalizes (curly -> straight inside the JSON)".
    - Check: "toolInput both off: passes by identity".
    - Check: "effective toolInput (scope on, deprecated field off): normalizes (curly -> straight inside the JSON)".
- Group: S5 - the volatile scope flip.
    - Check: "volatile scope flip: conversation off applies to the NEXT stream without remount".

## Fixtures

The shared harness (`../Harness.js`) supplies the fake ctx, the REAL `apply`, and the REAL factory through `Make`.

The config is hand-built per run with a `scopes` volatile cell whose getter returns a mutable object (the stable-reference simulation), with no schema call, exactly as the source suite does.

The stream data is one text-delta ("a \u201C b"), one reasoning-delta, one assembled text block-end, and one tool-call-delta with an embedded curly quote.

The S5 flip goes through the captured `loader/volatile-update` listener with the `[["scopes", "conversation"]]` dispatch shape.

## Expected ledger strings (byte-exact)

None.

This folder asserts identities and absences, not log lines.

The only string-adjacent check is "scopes.conversation off: no count line", which asserts that NO line containing "normalized" appears in the logger capture of the run.

The runs still emit their activation lines into the ledger file, but nothing reads them here.

## Edge cases

- The OR gate is proven from both directions: deprecated field on with scope off normalizes, scope on with deprecated field off normalizes, and both off pass by identity.
- The assembled text block (block-end) respects the conversation scope just like the streaming delta, so the gate covers both spellings.
- S5 flips the scope BEFORE driving the stream, which proves the gate is read per stream and not baked into the listener at registration.

## Expected count

8 PASS.
