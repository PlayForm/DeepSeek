# Tables

What this test verifies.

## Intent

The six normalization tables are the data behind the whole normalize family: four
character-class regex sources (Dashes, Ellipsis, Spaces, Invisible - each compiled
per call with the g flag) and two character maps (Quotes, Fullwidth). They are
their own folder because the tables are the byte-exact identity of each flavor -
one changed codepoint in a table changes every rewrite that flavor performs, and
the pattern sources are asserted VERBATIM (the Dashes source is the dash identity).
This is the ETS suite's section 5 (the Classic arbiter section, byte-identical),
moved verbatim.

## Scenario

- Group: the normalization tables - the six exact contents.
    - Check 1: "tables: the four character classes carry their exact patterns
      (Dashes = the dash identity, verbatim)".
        - Leaf: Dashes.flags === "g".
        - Leaf: Ellipsis.flags, Spaces.flags, Invisible.flags are all "g".
        - Leaf: Dashes.source is the dash pattern verbatim (the exact
          escape-sequence string from the source suite).
        - Leaf: Ellipsis.source is the single ellipsis character class.
        - Leaf: Spaces.source is the unicode space class (Zs minus ASCII).
        - Leaf: Invisible.source is the zero-width/invisible class.
    - Check 2: "tables: the two maps carry their exact contents (Quotes
      curly-to-straight, Fullwidth the standard 94-entry table)".
        - Leaf: the Quotes map deepEquals the eight curly-to-straight quote
          entries.
        - Leaf: the Fullwidth map deepEquals the standard fullwidth-to-halfwidth
          table, computed entry-by-entry in the test (U+FF01..U+FF5E mapped to
          U+0021..U+007E) rather than hard-coded.

## Fixtures

None beyond the REAL built `Target/Library.js` import: the tables are exported
constants; the Fullwidth expectation is computed with the same 94-iteration loop
the source suite uses.

## Expected ledger strings (byte-exact)

None. Data assertions only - the core owns no ledger strings. The exact pattern
sources live in the test file as verbatim escape-sequence strings (for example
`[\u2026]` for Ellipsis); they are the contract for the tables, not ledger lines.

## Edge cases

- The regex sources are compared as STRINGS (`.source`), so the exact escape
  sequences are the contract - a re-ordered or re-escaped class fails.
- Fullwidth is verified against an independently computed 94-entry table, not a
  copy of the constant.
- All four classes carry the g flag (compiled per call in the replacers; a
  sticky/global misuse would surface as lastIndex drift in the Replace folder).

## Expected count

2 PASS.
