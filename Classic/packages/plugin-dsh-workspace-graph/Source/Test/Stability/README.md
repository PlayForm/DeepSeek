# Stability

This page records what the test verifies.

## Intent

The test pins the A5 invariants: stable ids and content-derived fingerprints.

Re-indexing the unchanged file keeps every fingerprint, while changing one symbol changes the fingerprint of that symbol and of the file and leaves the other symbols intact.

## Scenario

- Group: re-index the unchanged file.
    - Check: "stability: re-indexing the unchanged file keeps every id and every fingerprint (A5)" - the fingerprint map keyed by id is identical after the second index, and the revision went from "1" to "2", because each successful index bumps it.
- Group: edit one symbol, re-index.
    - Check: "stability: changing one symbol changes that symbol, its block and the file, and nothing else (A5)" - exactly `Symbol:...:greet`, `Block:...:7:body` and `File:...` changed fingerprints, while the VERSION, Greeter, Shape, Alias and counter symbols kept theirs.
    - Check: "stability: the id set is unchanged across the edit" - the sorted id set before and after is identical.
    - Check: "stability: every node carries the file version token from stat time" - each node's `version` is the fake stat's `v1`.

## Fixtures

- The committed `Fixture.ts` from the Parse-And-Fingerprint folder is read by URL and served under the fake path `/proj/src/stable.ts`, and the edited variant replaces only `return \`hello ${name}\`;` with ``return `hey ${name}`;`` (same line count, so every span is stable).
- One fake graph per group comes from the Harness `MakeGraph`.

## Expected ledger strings (byte-exact)

- The test asserts nothing here beyond the existence of the indexed lines, and it asserts the revision and the fingerprints through the service surface (statistics / snapshot).

## Edge cases

- The edit keeps the line count and every span, which isolates the fingerprint change from any span change.

## Expected count

4 PASS.
