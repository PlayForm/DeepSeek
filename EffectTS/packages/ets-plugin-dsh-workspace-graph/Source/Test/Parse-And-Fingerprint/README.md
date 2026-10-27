# Parse-And-Fingerprint

The folder states what this test verifies.

## Intent

The folder tests the v0 parser against the committed fixtures, plus the fingerprint formula recomputed independently.

It covers acceptance check A4 (the fixture TypeScript file yields exactly the expected File node, the expected Symbol nodes, the expected Block nodes, and the expected contains/imports edges) and the fingerprint half of the foundations of A5.

## Scenario

- **Group: the TypeScript fixture (A4).**

    - **Check: "parse: the TypeScript fixture yields exactly the expected File, Symbol and Block nodes (A4)".**

        The ten ids are exactly `File:/proj/src/fixture.ts`, the six Symbols (VERSION, greet, Greeter, Shape, Alias, counter), and the three Blocks (`:7:body`, `:11:body`, `:17:body`), with no extra node.

    - **Check: "parse: symbol spans sit inside the file span and block spans inside their symbol spans".**

        The file span is 1-22, greet is 6-8 with body 7-8, Greeter is 10-14 with body 11-14, and every node span of the file sits inside the span of the file.

    - **Check: "parse: the contains edges run File to child and carry the child's span".**

        The parse gives nine contains edges (six symbols plus three blocks), each with the span of the child.

    - **Check: "parse: the relative import edges to the resolved file id and the non-relative specifier is skipped".**

        Exactly one `imports` edge runs `File:/proj/src/fixture.ts` -> `File:/proj/src/helper` with the span of the import line.

        `node:path` produced no node and no edge, and the parser recorded it (State.SkippedImports is 1).

- **Group: the Markdown fixture (A4).**

    - **Check: "parse: the Markdown fixture yields exactly the four DocSections with the frozen spans".**

        The sections are `:1` (1-15), `:5` (5-12), `:9` (9-12), and `:13` (13-15) with the names Top, Inner, Deep, and Second.

- **Group: the test-path rule (A4).**

    - **Check: "parse: a test-path file yields the Test node plus its contains edge".**

        `Test:/proj/pkg/Source/Test/Demo/Test.ts` exists with the file span, and one contains edge runs File -> Test.

- **Group: the fingerprint formula, recomputed independently.**

    - **Check: "fingerprint: the formula is sha256 of normalized text, kind and name".**

        The fingerprints of the File, the Symbol VERSION, and the Block body equal an independent sha256 recomputation over the normalized span text, the kind, and the name.

- **Group: the unsupported language skip (byte-exact).**

    - **Check: "parse: an unsupported language is skipped with the byte-exact ledger line".**

        The `.json` path returns the skipped outcome with reason `unsupported language`, the logger carries `graph: skipped /proj/data/config.json (unsupported language)`, and the graph stored nothing.

## Fixtures

- **`Fixture.ts` (committed in this folder).**

    The file has 22 lines: two imports (one relative, one not), `const VERSION`, `function greet` (span 6-8, body 7-8), `class Greeter` with the nested `wave` method (NOT a symbol, because v0 does not resolve nested names; span 10-14, body 11-14), `interface Shape` (16-18, body 17-18), `type Alias` (20-20), and `let counter` (22-22).

- **`Fixture.md` (committed in this folder).**

    The file has 15 lines with the headings `# Top`, `## Inner`, `### Deep`, and `## Second`.

- **The fixture read.**

    The test reads the fixtures from the Source tree by URL (the Target only carries the compiled tests) and serves them to the service through the fake fs files map under the frozen fake paths.

- **The fake graph.**

    Each group gets one fake graph (the Harness `MakeGraph`), and the TS group indexes both fixtures in one graph to prove that the two files coexist in one snapshot.

## Expected ledger strings (byte-exact)

- **The skip line.**

    The line is `graph: skipped /proj/data/config.json (unsupported language)`.

- **The indexed lines.**

    The `graph: indexed ...` lines carry the node and edge counts, and the test asserts the counts through the snapshot and the outcome and not through the log line.

## Edge cases

The nested `wave` method and the `node:path` import produce nothing, and the relative import target has no file behind it and still gets its id (v0 honesty: the id form does not depend on existence).

## Expected count

8 PASS.
