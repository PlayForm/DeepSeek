# Parser

The strict YAML-subset parser and the pack reader.

## Scenarios

- P1: a pack-shaped mapping/sequence tree parses (sequence-of-maps items included).
- P2: the parser drops comments, blank lines, and the `---` / `...` document markers.
- P3: it reads single-quoted (`''` escape), double-quoted (JSON escapes), and flow scalars, plus
  `[]` and `{}`.
- P4: it reads booleans, null/`~`, integers, and decimals, and a leading-zero token stays a string.
- P5: the unsupported constructs throw a line-numbered error: tabs, anchors, aliases, tags, block
  scalars, non-empty flow mappings, duplicate keys, bad indentation, and an unterminated quote.
- P6: `Read` parses `.yml` and `.json`, and it refuses a non-mapping root.

## Expected count

6 PASS.
