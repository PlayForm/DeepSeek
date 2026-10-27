# Stability

The folder states what this test verifies.

## Intent

The folder tests the invariants of A5: stable ids and content-derived fingerprints.

A re-index of the unchanged file keeps every fingerprint, and a change to one symbol changes the fingerprint of that symbol and of the file and leaves the other symbols intact.

## Scenario

- **Group: re-index the unchanged file.**

    - **Check: "stability: re-indexing the unchanged file keeps every id and every fingerprint (A5)".**

        The fingerprint map keyed by id is identical after the second index, and the revision went from "1" to "2", because each successful index bumps it.

- **Group: edit one symbol, re-index.**

    - **Check: "stability: changing one symbol changes that symbol, its block and the file, and nothing else (A5)".**

        Exactly `Symbol:...:greet`, `Block:...:7:body`, and `File:...` changed fingerprints, and the VERSION, Greeter, Shape, Alias, and counter symbols kept theirs.

    - **Check: "stability: the id set is unchanged across the edit".**

        The sorted id set before and after the edit is identical.

    - **Check: "stability: every node carries the file version token from stat time".**

        The `version` of each node is the `v1` of the fake stat.

## Fixtures

- **The committed fixture.**

    The test reads `Fixture.ts` from the Parse-And-Fingerprint folder by URL and serves it under the fake path `/proj/src/stable.ts`, and the edited variant replaces only `return \`hello ${name}\`;` with ``return `hey ${name}`;`` (same line count, so every span is stable).

- **The fake graph.**

    Each group gets one fake graph (the Harness `MakeGraph`).

## Expected ledger strings (byte-exact)

- **The indexed lines.**

    The folder asserts nothing beyond the existence of the indexed lines, because it asserts the revision and the fingerprints through the service surface (statistics / snapshot).

## Edge cases

The edit keeps the line count and every span, so it isolates the fingerprint change from any span change.

## Expected count

4 PASS.
