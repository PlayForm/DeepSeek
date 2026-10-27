# Scopes

What this test verifies.

## Intent

The granular scope gates (Run S): each scope on/off with everything else at
defaults, the OR semantics of the effective toolInput with the deprecated
`normalizeToolArguments` field, and the S5 volatile scope flip applied to the
NEXT stream without remount. The scopes feature lets a user narrow the
normalization per channel (conversation, reasoning, toolInput, toolResults,
files, batch); this folder proves the stream-side gates: conversation off
means text deltas AND assembled text blocks pass by identity with no count
line, reasoning off means reasoning deltas pass even with `normalizeReasoning`
on, and the effective toolInput gate is the OR of the deprecated field and the
scope (either one on -> each horizontal ellipsis inside the JSON becomes the
replacement string). S5 is the stability proof: the `scopes` cell of the
config is a mutable object captured by reference, the volatile-update dispatch
of the factory flips it in place, and the next stream observes the change with
no re-apply. The assertions are moved verbatim from section "Run S (additive):
the granular scope gates" of `Classic/smokes/ellipsis-smoke.mjs`.

## Scenario

- Group: S1 - conversation off, text delta.
    - Sub: "scopes.conversation off: text-delta passes by identity"
    - Sub: "scopes.conversation off: no count line"
- Group: S2 - reasoning scope off.
    - Sub: "scopes.reasoning off: reasoning-delta passes by identity"
- Group: S3 - conversation off, assembled text block.
    - Sub: "scopes.conversation off: text block passes by identity"
- Group: S4 - the effective toolInput gate (the OR of the deprecated field
  and the scope).
    - Sub: "effective toolInput (deprecated field on, scope off): still
      normalizes"
    - Sub: "toolInput both off: passes by identity"
    - Sub: "effective toolInput (scope on, deprecated field off): normalizes"
- Group: S5 - the volatile scope flip.
    - Sub: "volatile scope flip: conversation off applies to the NEXT stream
      without remount"

## Fixtures

The shared harness (`../Harness.js`): the fake ctx, the REAL `apply`, and the
REAL factory through `Make`. The config is hand-built per run with a `scopes`
volatile cell whose getter returns a mutable object (the stable-reference
simulation) - no schema call, exactly as the source suite does; the
replacement stays at its default "...". The stream data: one text-delta ("a
U+2026 b"), one reasoning-delta, one assembled text block-end, and one
tool-call-delta with an embedded horizontal ellipsis (U+2026). The S5 flip goes
through the captured `loader/volatile-update` listener with the
`[["scopes", "conversation"]]` dispatch shape.

## Expected ledger strings (byte-exact)

None. This folder asserts identities and absences, not log lines: the only
string-adjacent check is "scopes.conversation off: no count line", which
asserts that NO line containing "normalized" appears in the logger capture of
the run. (The runs still emit their activation lines into the ledger file;
nothing reads them here.)

## Edge cases

- The OR gate is proven from both directions: deprecated field on with scope
  off normalizes; scope on with deprecated field off normalizes; both off pass
  by identity.
- The assembled text block (block-end) respects the conversation scope just
  like the streaming delta - the gate covers both spellings.
- S5 flips the scope BEFORE it drives the stream, which proves that the gate
  is read per stream, not baked into the listener at registration.

## Expected count

8 PASS.
