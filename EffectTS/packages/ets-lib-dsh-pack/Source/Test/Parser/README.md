# Parser

The strict YAML-subset parser and the pack reader.

## Scenarios

- P1: a pack-shaped mapping/sequence tree parses (sequence-of-maps items
  included).
- P2: comments, blank lines and the `---` / `...` document markers are
  dropped.
- P3: single-quoted (`''` escape), double-quoted (JSON escapes) and flow
  scalars; `[]` and `{}`.
- P4: booleans, null/`~`, integers and decimals; a leading-zero token stays
  a string.
- P5: the unsupported constructs throw a line-numbered error: tabs,
  anchors, aliases, tags, block scalars, non-empty flow mappings, duplicate
  keys, bad indentation and an unterminated quote.
- P6: `Read` parses `.yml` and `.json`, and refuses a non-mapping root.

## Expected count

6 PASS.
