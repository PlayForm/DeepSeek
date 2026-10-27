# Fixtures and the Deliberate Characters

## The archives

| Path                     | What it holds                                    |
| ------------------------ | ------------------------------------------------ |
| `Test/fixtures/markdown` | Markdown fixtures with deliberate typography     |
| `Test/fixtures/manifest` | Manifest fixtures for the governance chain       |
| `Test/probes`            | Probe fixtures (for example the raw-write probe) |

Verify the tree:

```sh
find Test -maxdepth 2 -type d
```

A fixture lives in exactly one place.

Do not copy one archive into another; the suite that consumes it reads the canonical path.

## The codepoint table

| Family    | Code points / examples                                         | Transform       |
| --------- | -------------------------------------------------------------- | --------------- |
| Dash      | U+2013 en dash, U+2014 em dash, U+2015 bar                     | `-`             |
| Quotes    | U+2018, U+2019, U+201A, U+201B, U+201C, U+201D, U+201E, U+201F | straight quotes |
| Ellipsis  | U+2026                                                         | `...`           |
| Spaces    | U+00A0, U+2000-U+200A, U+202F, U+205F                          | plain space     |
| Invisible | U+00AD, U+200B-U+200D, U+202A-U+202E, U+2060, U+FEFF           | removed         |
| Fullwidth | U+FF01-U+FF5E                                                  | ASCII halfwidth |

## The note pattern

A fixture documents itself with a truthful line:

```text
This file contains an em dash (U+2014) on line 3.
```

The note is written with `raw-write` too: the `write` tool would normalize the note's own glyph, and
the note would then be false.

The verification is the byte check: the character the note names is present at the line it names.

## The verification

```sh
python3 -c '
import pathlib, sys
text = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
print({hex(ord(c)) for c in text if ord(c) > 127})
' path/to/fixture
```

The set must contain the deliberate code points and nothing stray.

The consuming suite's fixture assertions are the final arbiter.

## The demo pairs

A before/after demo shows the raw input and the normalized output.

The raw side is byte-faithful (`raw-write`); the normalized side is ordinary ASCII (`write`).

The pair is the proof; an ASCII stand-in on the raw side destroys it.

## Failure modes

- **Fixture drift**: the note says one thing, the bytes another.
- **Duplicate archive**: two copies, one updated, one asserted.
- **Normalized demo**: the before side no longer contains the glyph.
- **Stray control characters**: the byte check finds code points the fixture did not intend.
