# raw-write verbatim fixture

This file was written via the raw-write tool with normalize ABSENT.

The em-dash — a long dash — separates clauses. The en-dash – spans ranges
(2020–2024). Curly quotes “double” and ‘single’. Ellipsis … one character.
Unicode space (U+00A0) here and here. Fullwidth ＡＢＣ１２３.

The question under test: does raw-write keep these bytes VERBATIM?
Expected: yes — this file stays byte-identical.