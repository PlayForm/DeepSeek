# Packet - the orientation-packet renderer tests

The packet's fixed eight-line grammar, tested as a pure function against the real built
`Target/Library.js`.

## Scenarios

- P1: the full packet renders the complete grammar byte-exact - WORKSPACE/SCOPE, one MAP line per
  entry, the FOCUS line, one line per NEIGHBORS/EVIDENCE/OPEN entry, and the STALE line.
- P2: absent bands render `(none)` placeholders (the grammar is always complete, never partially
  omitted), and the optional FOCUS/STALE lines are omitted when absent.
- P3: STALE renders only when the caller's version differs, and a fresh packet carries no STALE
  line.

## Fixtures

The shared Harness (the counter plus the real built library exports - the library is pure, so there
is no fake ctx, no fs, and no clock).

## Expected format (byte-exact)

`WORKSPACE <name> @ <indexRevision>`, `SCOPE <scope>`, `MAP <entry>` /
`MAP (none)`, `FOCUS <node>`, `NEIGHBORS <edge>` / `NEIGHBORS (none)`,
`EVIDENCE <file>` / `EVIDENCE (none)`, `OPEN <question>` / `OPEN (none)`,
`STALE <version>`.

## Expected count

3 PASS.
