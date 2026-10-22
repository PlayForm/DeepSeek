# Resolve-And-Rename - the resolve/rename/refusal semantics

The lazy model build through the default TypeScript adapter, the byte-exact
resolve and refusal lines, the symbol lookup and the reference list, the
invalidation-driven rebuild, the index cap, the any-file adapter seam, the
rename plan and its refusal arms, and the statistics triple.

## Scenarios

- R1: resolve builds the model through the adapter (the exact symbols,
  references, dependencies, freshness); the resolve line is byte-exact and
  the file is read exactly once; the lookup and the reference list read the
  built model.
- R2: a path with no adapter refuses (`refused <path> (no adapter for
  .md)`); an excluded path refuses before any read; an empty path and a
  missing file fail with byte-exact lines.
- R3: without a text reader the resolve fails byte-exactly (`failed <path>
  (no fs text reader)`).
- R4: an observed write invalidates the model and forces a rebuild; the
  index caps at maxEntries by oldest revision.
- R5: adapt() registers an any-file adapter (the 8-extensions line); a
  re-registration replaces the adapter (last wins).
- R6: the rename plan rewrites every occurrence at reference certainty
  (`planned rename foo -> baz in <path> (3 edits, references)`); a
  non-identifier span, an empty new name, an unadapted extension, and an
  unresolved excluded path each refuse with their byte-exact line.
- R7: the rename plans without writing anything (zero writeText).

## Expected ledger strings (byte-exact, `semantics: ` prefix)

`resolved /src/a.ts (1 symbols, 1 references)`,
`refused /doc/readme.md (no adapter for .md)`,
`ignored /repo/skipme/x.ts (excluded)`,
`failed resolve (empty path)`,
`failed /src/a.ts (no fs text reader)`,
`indexed /src/a.ts version 2 (revision 2)`,
`adapters registered (8 extensions)`,
`resolved /doc/readme.md (0 symbols, 0 references)`,
`planned rename foo -> baz in /src/a.ts (3 edits, references)`,
`refused /src/a.ts (rename: adapter not certain)`,
`refused /src/a.ts (rename: empty name)`,
`refused /src/skipme/x.ts (rename: no model)`.

## Expected count

18 PASS.
