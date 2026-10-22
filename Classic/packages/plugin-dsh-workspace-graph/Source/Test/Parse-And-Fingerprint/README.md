# Parse-And-Fingerprint

What this test verifies.

## Intent

The v0 parser against the committed fixtures, plus the fingerprint formula
recomputed independently. Covers acceptance check A4 (the fixture TypeScript
file yields exactly the expected File node, the expected Symbol nodes, the
expected Block nodes, and the expected contains/imports edges) and the
fingerprint half of A5's foundations.

## Scenario

- Group: the TypeScript fixture (A4).
    - Check: "parse: the TypeScript fixture yields exactly the expected File,
      Symbol and Block nodes (A4)" - the ten ids are exactly
      `File:/proj/src/fixture.ts`, the six Symbols (VERSION, greet, Greeter,
      Shape, Alias, counter), the three Blocks (`:7:body`, `:11:body`,
      `:17:body`), and no extra node.
    - Check: "parse: symbol spans sit inside the file span and block spans
      inside their symbol spans" - the file span is 1-22, greet is 6-8 with
      body 7-8, Greeter is 10-14 with body 11-14, and every node span of the
      file sits inside the file's span.
    - Check: "parse: the contains edges run File to child and carry the
      child's span" - nine contains edges (six symbols plus three blocks),
      each with the child's span.
    - Check: "parse: the relative import edges to the resolved file id and
      the non-relative specifier is skipped" - exactly one `imports` edge,
      `File:/proj/src/fixture.ts` -> `File:/proj/src/helper` with the span of
      the import line; `node:path` produced no node and no edge and was
      recorded (State.SkippedImports is 1).
- Group: the Markdown fixture (A4).
    - Check: "parse: the Markdown fixture yields exactly the four DocSections
      with the frozen spans" - `:1` (1-15), `:5` (5-12), `:9` (9-12),
      `:13` (13-15) with the names Top, Inner, Deep, Second.
- Group: the test-path rule (A4).
    - Check: "parse: a test-path file yields the Test node plus its contains
      edge" - `Test:/proj/pkg/Source/Test/Demo/Test.ts` exists with the file
      span, and one contains edge File -> Test.
- Group: the fingerprint formula, recomputed independently.
    - Check: "fingerprint: the formula is sha256 of normalized text, kind and
      name" - the File, the Symbol VERSION and the Block body fingerprints
      equal an independent sha256 recomputation over the normalized span text,
      the kind and the name.
- Group: the unsupported language skip (byte-exact).
    - Check: "parse: an unsupported language is skipped with the byte-exact
      ledger line" - the `.json` path returns the skipped outcome with reason
      `unsupported language`, the logger carries
      `graph: skipped /proj/data/config.json (unsupported language)`, and
      nothing was stored.

## Fixtures

- `Fixture.ts` (committed in this folder): 22 lines - two imports (one
  relative, one not), `const VERSION`, `function greet` (span 6-8, body
  7-8), `class Greeter` with the nested `wave` method (NOT a symbol - nested
  names are not resolved in v0; span 10-14, body 11-14), `interface Shape`
  (16-18, body 17-18), `type Alias` (20-20), `let counter` (22-22).
- `Fixture.md` (committed in this folder): 15 lines - headings `# Top`,
  `## Inner`, `### Deep`, `## Second`.
- The fixtures are read from the Source tree by URL (the Target only carries
  the compiled tests), and served to the service through the fake fs files
  map under the frozen fake paths.
- One fake graph per group (the Harness `MakeGraph`); the TS group indexes
  both fixtures in one graph to prove the two files coexist in one snapshot.

## Expected ledger strings (byte-exact)

- `graph: skipped /proj/data/config.json (unsupported language)`.
- The `graph: indexed ...` lines carry the node and edge counts; the counts
  are asserted through the snapshot and the outcome, not through the log line.

## Edge cases

- The nested `wave` method and the `node:path` import produce nothing; the
  relative import target has no file behind it and still gets its id (v0
  honesty: the id form does not depend on existence).

## Expected count

8 PASS.
