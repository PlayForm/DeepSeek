# Stream-Contract

What this test verifies.

## Intent

The full llm/stream waterfall contract of the Run-1 stream: the next() mechanics of the wrapper, the
untouched options, the passthrough-by-identity groups, the rewrite groups, the count ledger line and
the P5 journal routing of the count event.

This is the core behavior of the stream flavor.

A single mixed stream (four fullwidth glyphs in the text, a tool-call delta, a reasoning delta, three
block-end shapes, usage and finish) exercises every branch of the wrapper in one pass.

Block-start, usage and finish pass through BY IDENTITY, and the tool-call-delta passes through
untouched (the arguments are execution-critical raw JSON at defaults).

The text-delta, reasoning-delta and block-end fields are rewritten as new objects, exactly one count
line is written to the ledger AND logged, and the count event lands in the pre-bind journal buffer of
the factory (stage 2) and not the per-State queue (stage 3).

The assertions are moved verbatim from `EffectTS/smokes/fullwidth-smoke.mjs` sections "The waterfall
listener, exercised" and "Run 1 (P5 journal)".

## Scenario

- Group: the next() mechanics and the options invariant.
    - Sub: "next() called exactly once, synchronously (before iteration)"
    - Sub: "next() was called BEFORE any upstream iteration"
    - Sub: "deep-frozen options untouched (still frozen)"
- Group: the passthrough-by-identity groups and the pipeline shape.
    - Sub: "chunk order/count preserved (1 in, 1 out)"
    - Sub: "chunk type sequence identical to upstream"
    - Sub: "block-start passthrough BY IDENTITY"
    - Sub: "tool-call-delta passthrough BY IDENTITY (argumentsDelta raw JSON
      untouched)"
    - Sub: "argumentsDelta full-width letter still verbatim"
    - Sub: "usage passthrough BY IDENTITY"
    - Sub: "finish passthrough BY IDENTITY"
- Group: the rewrite groups (the text-delta, the reasoning-delta and the
  three block-end fields).
    - Sub: "text-delta normalized (U+FF21 -> A, U+FF11 -> 1, U+FF01 -> !,
      U+FF1F -> ?)"
    - Sub: "rewritten text-delta is a new object, index preserved"
    - Sub: "reasoning-delta normalized when reasoning=on (U+FF38 U+FF39 ->
      XY)"
    - Sub: "block-end TextBlock.text normalized (U+FF28 U+FF49 -> Hi)"
    - Sub: "block-end ReasoningBlock.text normalized (rc.2 field)"
    - Sub: "block-end runtime `thinking` field normalized (defensive)"
    - Sub: "rewritten block-end is a new object"
- Group: the ledger and the logger (the count line, exactly once).
    - Sub: "count ledger line written after the 10-replacement stream (N>0)"
    - Sub: "exactly ONE count line for the stream"
    - Sub: "logger line '...normalized 10 fullwidth char(s) in one stream'
      (4 delta + 2 reasoning + 2 block-end + 1 thinking)"
- Group: the P5 journal - the count event lands in the shared storage domain.
    - Sub: "exactly ONE 'normalized' journal record after the
      10-replacement stream"
    - Sub: "the 'normalized' record carries an empty path (stream-level
      event)"
    - Sub: "journal detail byte-identical to the ledger count line"
    - Sub: "the 'normalized' record carries a numeric timestamp"
    - Sub: "the record routes to the factory pre-bind buffer (stage 2), not
      the per-State queue"

## Fixtures

The shared harness (`../Harness.js`): `Furnace` (the REAL factory), the fake ctx, the REAL `apply`,
`Validate` and the ledger path `/tmp/fullwidth-smoke-ledger.log` (removed at the start of the
folder).

The stream data: one text-delta carrying the four fullwidth glyphs (U+FF21, U+FF11, U+FF01, U+FF1F),
one tool-call-delta whose argumentsDelta embeds U+FF21 and U+FF11, one reasoning-delta (U+FF38
U+FF39), three block-end shapes (text U+FF28 U+FF49, reasoning U+FF39, reasoning with runtime
`thinking` U+FF3A), usage and finish.

The options object is double-frozen to prove that the wrapper never touches it.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-fullwidth: normalized 10 fullwidth char(s) in one stream`

The count line is asserted in the ledger file, in the logger capture, and as the `detail` of the
journal record.

The record also carries `path: ""` and a numeric `at`.

The rewrite labels in the Test.ts source spell the fullwidth glyphs and arrows as \uXXXX escapes, for
example U+FF21 (fullwidth A) -> A.

## Edge cases

- The tool-call-delta at defaults passes BY IDENTITY with the fullwidth letters still verbatim inside the raw JSON (normalizeToolArguments=false).
- The rc.2 `text` field of the block-end and the runtime `thinking` field are both rewritten, because they are two spellings of the same payload and both are covered.
- The identity negatives: block-start, usage and finish are compared by reference (===) and not with deepEqual, so a cloned object would fail.
- The journal record is asserted to be ABSENT from the per-State Queue even though it exists in the pre-bind buffer, because the routing and not just the presence is the contract.

## Expected count

25 PASS.
