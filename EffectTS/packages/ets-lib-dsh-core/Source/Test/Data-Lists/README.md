# Data-Lists

What this test verifies.

## Intent

The two exported data lists are pure constants the whole family builds on: `Section` (the canonical npm dependency sections, in the order the update engine walks them) and `Default` (the built-in exclusion segments, "anywhere mode, exclusion-first").

They are their own folder because they are the simplest contract surface of the core: a reorder, a rename, or an added segment in either list changes the behavior of every consumer (the directory walk of the factory, the section scope of the update engine) without any code path failing loudly.

The assertions are moved verbatim from `EffectTS/smokes/core-smoke.mjs` section 1 (the copy of the Classic arbiter section in the ETS suite; the source suite stays in place during the migration, and this folder is the future home of the same contract).

## Scenario

- Group: the data lists.
    - Check: "Section: the canonical npm dependency sections".
        - assert.deepEqual(Section, the four npm dependency sections)
    - Check: "Default: the built-in exclusion segments (anywhere mode, exclusion-first)".
        - assert.deepEqual(Default, the six built-in exclusion segments)

## Fixtures

None.

This is the one folder with no I/O at all: the test imports the REAL built `Target/Library.js` of `@playform/ets-lib-dsh-core` and asserts two exported constants.

There is no fake ctx, no factory, and no temp files.

## Expected ledger strings (byte-exact)

None.

The core owns no ledger strings and writes nothing, so this folder asserts data, not log lines (the check labels printed by the harness are the source ok labels, verbatim).

## Edge cases

- The lists are compared with deepEqual (exact contents AND exact order).
- The six exclusion segments include the ".dsh" state segment and the "DeepSeek Harness.app" application segment, and both must stay in the list.

## Expected count

2 PASS.
