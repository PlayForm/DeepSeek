# raw-write normalized fixture

This file was written via the raw-write tool with normalize TRUE.

The em-dash - a long dash - separates clauses. The en-dash - spans ranges
(2020-2024). Curly quotes "double" and 'single'. Ellipsis ... one character.
Unicode space (U+00A0) here and here. Fullwidth ABC123.

The question under test: does raw-write apply the six transforms?
Expected: yes - dashes→hyphen, quotes→straight, ellipsis→..., nbsp→space,
fullwidth→halfwidth.