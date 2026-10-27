# Replace

What this test verifies.

## Intent

`Replace` and `ReplaceMap` are the two generic replacement mechanics that the whole normalize family builds its flavors on: `Replace` swaps every match of a character-class regex for a replacement string, and `ReplaceMap` swaps individual characters through a map.

Both return `{ text, count }` and both are count-driven: `count === 0` means "unchanged" and the caller keeps the original segment by identity instead of allocating a copy.

They share one folder (the merged smallest pair of sections 6 and 7 of the source suite: both mechanics, the same shape, the same literal-`$&` and count-0 contracts), and each keeps its own Check with the source ok label verbatim.

## Scenario

- Group: the replacement mechanics.
    - Check 1: "Replace: the generic class-to-string replacer (the Dashes flavor, literal replacement, count 0 unchanged)".
        - Leaf: a string with two dashes deepEquals `{ text: "a - b - c", count: 2 }` through the Dashes class.
        - Leaf: a string with no match deepEquals `{ text: "plain", count: 0 }`.
        - Leaf: the replacement "$&" is inserted LITERALLY (function replacer, no $-pattern interpretation), so "\u2014end" becomes "$&end".
        - Leaf: the regex of the caller is never mutated, and `Dashes.lastIndex` stays 0.
    - Check 2: "ReplaceMap: the char-to-char map replacer (the Quotes + Fullwidth flavors, literal values, count 0 unchanged)".
        - Leaf: four curly quote characters deepEquals the straight counterparts with count 4 through the Quotes map.
        - Leaf: three fullwidth characters deepEquals "Aj0" with count 3 through the Fullwidth map.
        - Leaf: a map value "$&" is inserted LITERALLY.
        - Leaf: no key match deepEquals `{ text: "plain", count: 0 }`.

## Fixtures

None.

The test makes pure function calls against the REAL built `Target/Library.js`, and the class and map arguments are the real exported tables (Dashes, Quotes, Fullwidth), plus one ad-hoc map `{ a: "$&" }` for the literal-value leaf.

## Expected ledger strings (byte-exact)

None.

The core owns no ledger strings, and the byte-exact data contract lives in the asserted values: `{ text: "a - b - c", count: 2 }`, `"$&end"`, `"'x'\"y\""`, `"Aj0"`, `"$&"`, and the count-0 unchanged results.

## Edge cases

- Count 0: the text is returned unchanged and the count is exactly 0, so the caller keeps the original by identity (this is what keeps the pass-through-by-identity guarantees in the Chunk/Block folders possible).
- The replacement/map values are inserted literally, so "$&" must never be interpreted as the matched substring (both mechanics use a function replacer).
- The shared regex source is never mutated across calls (lastIndex stays 0).

## Expected count

2 PASS.
