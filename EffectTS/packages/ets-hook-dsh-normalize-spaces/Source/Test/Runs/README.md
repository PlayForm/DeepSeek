# Runs

What this test verifies.

## Intent

This folder holds the Run-2 through Run-7 matrix.

The matrix covers the reasoning-off passthrough, the custom replacement with its literal insertion, the upstream-throw propagation, the identity stream, the fresh-state (HMR-safety) probe, and the tool-args normalization, including their cumulative pre-bind journal counts.

Each run is its own mini-scenario against a fresh apply.

Run 2 proves the reasoning gate: nothing replaced means no count line and no new journal record.

Run 3 proves the configured replacement is inserted LITERALLY (the function replacer, not a regex-style expansion) with its own journal record.

Run 4 proves an upstream throw propagates without leaving a count line or a record.

Run 5 proves the identity passthrough for a clean chunk.

Run 6 proves two applies build two distinct State objects (no module-level globals, the HMR-safety contract).

Run 7 proves the tool-args normalization end-to-end: deltas AND the assembled block agree, with one journal record for the pair.

The assertions are moved verbatim from `EffectTS/smokes/spaces-smoke.mjs` sections "Run 2" through "Run 7".

## The silent seed (this folder's special fixture)

The source suite ran Runs 1-7 in ONE process, so the cumulative journal assertions of Runs 2-7 count the `normalized` record of the Run-1 waterfall in the pre-bind buffer of the factory (Run 2 expects 1 prior record, Run 3 expects its own record to be the second, and Run 7 expects the third).

Each test folder here runs in its OWN process, so this folder begins by silently replaying the Run-1 waterfall (the exact waterfall data and drive of the spaces flavor from the "waterfall listener" section, with NO Check calls); the replay exists only to place that one prior record and to give Run 6 its `Run1.State` reference.

If the replay fails to produce it, the first cumulative assertion of Run 2 fails loudly, so the seed cannot make the folder vacuously green.

No assertion is duplicated by the replay; every Check in this folder belongs to Runs 2-7 exactly as the source suite ordered them.

## Scenario

- Group: Run 2 - reasoning off.
    - Check: "reasoning-delta passthrough (identity) when normalizeReasoning=off".
    - Check: "stream completed with both chunks".
    - Check: "stream completed".
    - Check: "NO count line when nothing replaced (N=0)".
    - Check: "NO journal record when nothing was replaced (N=0)".
- Group: Run 3 - custom replacement and literal insertion.
    - Check: "volatile unwrap: custom replacement unwrapped".
    - Check: "custom replacement inserted LITERALLY (function replacer)".
    - Check: "count line reflects custom-replacement run".
    - Check: "the custom-replacement run adds its 'normalized' journal record".
    - Check: "custom-replacement journal detail mirrors the ledger line".
- Group: Run 4 - an upstream throw propagates with no count line.
    - Check: "upstream throw propagates through the wrapper".
    - Check: "NO count line after an upstream throw".
    - Check: "NO journal record after an upstream throw".
- Group: Run 5 - identity when there is nothing to replace.
    - Check: "unchanged text-delta passes through BY IDENTITY (count 0)".
    - Check: "identity stream (count 0) adds no journal record".
- Group: Run 6 - HMR-safety probe (no module-level state).
    - Check: "each apply builds a FRESH state (no module-level globals)".
- Group: Run 7 - tool args ON (normalizeToolArguments: true).
    - Check: "plain fields: ToolArgs=true when normalizeToolArguments=on".
    - Check: "activation line reflects toolArgs=on".
    - Check: "tool-call-delta argumentsDelta normalized when normalizeToolArguments=on".
    - Check: "rewritten tool-call-delta is a new object (id/index/name preserved)".
    - Check: "block-end ToolCallBlock.arguments normalized too (the deltas AND the block agree)".
    - Check: "count line includes the tool-args replacements (delta + block)".
    - Check: "tool-args replacements journal too (delta + block in one count record)".

## Fixtures

The shared harness (`../Harness.js`) supplies `Furnace`, the fake ctx, the REAL `apply`, `Validate`, and the ledger path `/tmp/spaces-smoke-ledger.log`, which is removed before the seed and again before every run, exactly as the source suite does, except before Run 5, where the source suite does NOT call rm.

The silent seed replays the Run-1 nine-replacement stream.

Run 3 streams a single no-break space before "end" with the replacement configured to "_"; Run 4's upstream generator throws "transport boom"; Run 7's tool-call fixtures embed a no-break space in `path`.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-spaces: normalized 1 space char(s) in one stream` (Run 3, ledger file and journal detail)
- `hook-dsh-normalize-spaces: normalized 2 space char(s) in one stream` (Run 7, ledger file and journal detail)

Run 2, Run 4, and Run 5 assert the ABSENCE of count lines and records (the N=0 rules).

Run 6 asserts State identity and no strings.

The activation line of Run 7 is asserted by its `toolArgs=on` tail.

## Edge cases

- The cumulative journal arithmetic is the point of the folder: 1 record after the seed, 2 after Run 3, still 2 after Runs 4 and 5, and 3 after Run 7, so any drift fails loudly.
- Run 3's replacement is inserted literally: the no-break space becomes exactly "_end", with no regex-style escaping or expansion.
- Run 4 leaves NOTHING behind after the throw: no count line and no record.
- Run 6 compares State objects by reference (`!==`), plus the Replacement value on both, which pins the no-module-globals contract.

## Expected count

23 PASS.
