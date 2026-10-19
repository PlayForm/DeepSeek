# Runs

What this test verifies.

## Intent

The Run-2 through Run-7 matrix: the reasoning-off passthrough, the MAP's
special half-width values mapped literally in one segment, the
upstream-throw propagation, the identity stream, the fresh-state (HMR-safety)
probe and the tool-args normalization - including their cumulative pre-bind
journal counts. Each run is its own mini-scenario against a fresh apply:
Run 2 proves the reasoning gate (nothing replaced means no count line and no
new journal record), Run 3 proves the special values of the Fullwidth table
(U+FF04, U+FF3C, U+FF3E, U+FF5C) come out literally - a function replacer,
no replacement-pattern interpretation - with the journal record added, Run 4
proves an upstream throw propagates without leaving a count line or a
record, Run 5 proves the identity passthrough for a clean chunk, Run 6
proves two applies build two distinct State objects (no module-level globals
- the HMR-safety contract), and Run 7 proves the tool-args normalization
end-to-end (deltas AND the assembled block agree, one journal record for the
pair). The assertions are moved verbatim from
`Classic/smokes/fullwidth-smoke.mjs` sections "Run 2" through "Run 7".

## The silent seed (this folder's special fixture)

The source suite ran Runs 1-7 in ONE process, so Runs 2-7's cumulative
journal assertions count the Run-1 waterfall's `normalized` record in the
factory's pre-bind buffer (Run 2 expects 1 prior record, Run 3 expects its
own record to be the second, Run 7's to be the third). Each test folder here
runs in its OWN process, so this folder begins by silently replaying the
Run-1 waterfall (the same data and drive as Stream-Contract, NO Check
calls): the replay exists only to place that one prior record. If the replay
fails to produce it, Run 2's first cumulative assertion fails loudly - the
seed cannot make the folder vacuously green. No assertion is duplicated by
the replay; every Check in this folder belongs to Runs 2-7 exactly as the
source suite ordered them. Run 6 references the replay's State object as
`Run1.State` - the same name the source suite used.

## Scenario

- Group: Run 2 - reasoning off.
    - Sub: "reasoning-delta passthrough (identity) when
      normalizeReasoning=off"
    - Sub: "stream completed with both chunks"
    - Sub: "stream completed"
    - Sub: "NO count line when nothing replaced (N=0)"
    - Sub: "NO journal record when nothing was replaced (N=0)"
- Group: Run 3 - the MAP's special values in one segment (no replacement
  knob).
    - Sub: "special half-width values come out LITERALLY (U+FF04 -> $,
      U+FF3C -> \\, U+FF3E -> ^, U+FF5C -> | - function replacer, no
      replacement-pattern interpretation)"
    - Sub: "MAP flavor is 1:1 - one half-width char out per full-width char
      in"
    - Sub: "count line reflects the 4-code-point run"
    - Sub: "the special-values run adds its 'normalized' journal record"
    - Sub: "special-values journal detail mirrors the ledger line"
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
      normalizeToolArguments=on (fullwidth colon U+FF1A -> ASCII)"
    - Sub: "rewritten tool-call-delta is a new object (id/index/name
      preserved)"
    - Sub: "block-end ToolCallBlock.arguments normalized too (the deltas AND
      the block agree)"
    - Sub: "count line includes the tool-args replacements (delta + block)"
    - Sub: "tool-args replacements journal too (delta + block in one count
      record)"

## Fixtures

The shared harness (`../Harness.js`): `Furnace`, the fake ctx, the REAL
`apply`, `Validate` and the ledger path `/tmp/fullwidth-smoke-ledger.log`
(removed before the seed and again before every run, exactly as the source
suite does). The silent seed replays the Run-1 ten-replacement stream. Run 3
streams the special values of the Fullwidth table (U+FF04, U+FF3C, U+FF3E,
U+FF5C) in one text-delta; Run 4's upstream generator throws "transport
boom"; Run 7's tool-call fixtures embed U+FF1A (fullwidth colon) in `path`.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-fullwidth: normalized 4 fullwidth char(s) in one stream`
  (Run 3, ledger file and journal detail)
- `hook-dsh-normalize-fullwidth: normalized 2 fullwidth char(s) in one stream`
  (Run 7, ledger file and journal detail)

(Run 2, Run 4 and Run 5 assert the ABSENCE of count lines and records - the
N=0 rules. Run 6 asserts State identity, no strings. The activation line of
Run 7 is asserted by its `toolArgs=on` tail.)

## Edge cases

- The cumulative journal arithmetic is the point of the folder: 1 record
  after the seed, 2 after Run 3, still 2 after Runs 4 and 5, 3 after Run 7 -
  any drift fails loudly.
- Run 3's mapping is exact: the four special code points in, four ASCII
  chars out (`$\^|`), 1:1 - the literal values prove there is no
  replacement-pattern interpretation of the MAP flavor.
- Run 4: the throw must leave NOTHING behind - no count line, no record.
- Run 6 compares State objects by reference (`!==`), plus the Reasoning
  flag on both, pinning the no-module-globals contract.

## Expected count

23 PASS.
