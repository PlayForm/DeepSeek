# Runs

What this test verifies.

## Intent

The Run-2 through Run-7 matrix: the reasoning-off passthrough, the $-literal safety of the custom
replacement, the upstream-throw propagation, the identity stream, the fresh-state (HMR-safety) probe
and the tool-args normalization, including their cumulative pre-bind journal counts.

Each run is its own mini-scenario against a fresh apply.

Run 2 proves the reasoning gate (nothing replaced means no count line and no new journal record).

Run 3 proves that the configurable replacement string is inserted LITERALLY (the `"$&"` pattern is
not interpreted, because the knob of the CLASS flavor is a plain string).

Run 4 proves that an upstream throw propagates without leaving a count line or a record.

Run 5 proves the identity passthrough for a clean chunk.

Run 6 proves that two applies build two distinct State objects (no module-level globals, the
HMR-safety contract).

Run 7 proves the tool-args normalization end-to-end (the deltas AND the assembled block agree, with
one journal record for the pair).

The assertions are moved verbatim from `EffectTS/smokes/ellipsis-smoke.mjs` sections "Run 2" through
"Run 7".

## The silent seed (this folder's special fixture)

The source suite ran Runs 1-7 in ONE process, so the cumulative journal assertions of Runs 2-7 count
the `normalized` record of the Run-1 waterfall in the pre-bind buffer of the factory (Run 2 expects 1
prior record, Run 3 expects its own record to be the second, and Run 7 expects the third).

Each test folder here runs in its OWN process, so this folder begins by silently replaying the Run-1
waterfall (the same data and drive as Stream-Contract, with NO Check calls), and the replay exists
only to place that one prior record.

If the replay fails to produce it, the first cumulative assertion of Run 2 fails loudly, so the seed
cannot make the folder vacuously green.

No assertion is duplicated by the replay, and every Check in this folder belongs to Runs 2-7 exactly
as the source suite ordered them.

## Scenario

- Group: Run 2 - reasoning off.
    - Sub: "reasoning-delta passthrough (identity) when
      normalizeReasoning=off"
    - Sub: "stream completed with both chunks"
    - Sub: "stream completed"
    - Sub: "NO count line when nothing replaced (N=0)"
    - Sub: "NO journal record when nothing was replaced (N=0)"
- Group: Run 3 - custom replacement + $-literal safety.
    - Sub: "volatile unwrap: custom replacement unwrapped"
    - Sub: "custom replacement inserted LITERALLY (function replacer, no
      $-pattern interpretation)"
    - Sub: "count line reflects custom-replacement run"
    - Sub: "the custom-replacement run adds its 'normalized' journal record"
    - Sub: "custom-replacement journal detail mirrors the ledger line"
- Group: Run 4 - upstream throw propagates, no count line.
    - Sub: "upstream throw propagates through the wrapper"
    - Sub: "NO count line after an upstream throw"
    - Sub: "NO journal record after an upstream throw"
- Group: Run 5 - identity when nothing to replace.
    - Sub: "unchanged text-delta passes through BY IDENTITY (count 0)"
    - Sub: "identity stream (count 0) adds no journal record"
- Group: Run 6 - HMR-safety probe (no module-level state).
    - Sub: "each apply builds a FRESH state (no module-level globals)"
- Group: Run 7 - tool args ON (normalizeToolArguments: true).
    - Sub: "plain fields: ToolArgs=true when normalizeToolArguments=on"
    - Sub: "activation line reflects toolArgs=on"
    - Sub: "tool-call-delta argumentsDelta normalized when
      normalizeToolArguments=on"
    - Sub: "rewritten tool-call-delta is a new object (id/index/name
      preserved)"
    - Sub: "block-end ToolCallBlock.arguments normalized too (the deltas AND
      the block agree)"
    - Sub: "count line includes the tool-args replacements (delta + block)"
    - Sub: "tool-args replacements journal too (delta + block in one count
      record)"

## Fixtures

The shared harness (`../Harness.js`): `Furnace`, the fake ctx, the REAL `apply`, `Validate` and the
ledger path `/tmp/ellipsis-smoke-ledger.log` (removed before the seed and again before every run
except Run 5, exactly as the source suite does).

The silent seed replays the Run-1 nine-replacement stream.

Run 3 configures `replacement: "$&"` and streams one horizontal ellipsis before "end", the upstream
generator of Run 4 throws "transport boom", and the tool-call fixtures of Run 7 embed a horizontal
ellipsis (U+2026) in `path`.

`Run1` of Run 6 is the State of the seed run (the Run-1 replay), compared against the fresh State of
Run 5.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-ellipsis: normalized 1 ellipsis char(s) in one stream`
  (Run 3, ledger file and journal detail)
- `hook-dsh-normalize-ellipsis: normalized 2 ellipsis char(s) in one stream`
  (Run 7, ledger file and journal detail)

Run 2, Run 4 and Run 5 assert the ABSENCE of count lines and records (the N=0 rules).

Run 6 asserts State identity and no strings, and the activation line of Run 7 is asserted by its
`toolArgs=on` tail.

## Edge cases

- The cumulative journal arithmetic is the point of the folder: 1 record after the seed, 2 after Run 3, still 2 after Runs 4 and 5, and 3 after Run 7, so any drift fails loudly.
- The `$&` safety of Run 3 is exact: the replacement is inserted literally and not as a match expansion, because a pattern-interpreting replacer would produce `\u2026end` (the match) instead of `$&end`.
- Run 4: the throw must leave NOTHING behind, with no count line and no record.
- Run 6 compares State objects by reference (`!==`) plus the Replacement string on both ("..."), which pins the no-module-globals contract.

## Expected count

23 PASS.
