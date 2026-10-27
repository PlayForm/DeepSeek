# Stream-Contract

What this test verifies.

## Intent

The full llm/stream waterfall contract of the Run-1 stream: the next()
mechanics of the wrapper, the untouched options, the passthrough-by-identity
groups, the rewrite groups, the count ledger line, and the P5 journal routing
of the count event. This is the core behavior of the stream flavor - a single
mixed stream (three horizontal ellipses in the text, a tool-call delta, a
reasoning delta, three block-end shapes, usage, and finish) exercises every
branch of the wrapper in one pass: block-start/usage/finish pass through BY
IDENTITY, the tool-call-delta passes through untouched (at defaults the
arguments are execution-critical raw JSON), the text-delta/reasoning-delta/
block-end fields are rewritten as new objects (each U+2026 horizontal ellipsis
replaced with the configured replacement "..."), exactly one count line is
written to the ledger AND logged, and the count event lands in the pre-bind
journal buffer of the factory (stage 2), not in the per-State queue (stage 3).
The assertions are moved verbatim from sections "The waterfall listener,
exercised" and "Run 1 (P5 journal)" of `Classic/smokes/ellipsis-smoke.mjs`.

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
    - Sub: "argumentsDelta ellipsis still verbatim"
    - Sub: "usage passthrough BY IDENTITY"
    - Sub: "finish passthrough BY IDENTITY"
- Group: the rewrite groups (the text-delta, the reasoning-delta and the
  three block-end fields).
    - Sub: "text-delta normalized (U+2026 -> '...')"
    - Sub: "rewritten text-delta is a new object, index preserved"
    - Sub: "reasoning-delta normalized when reasoning=on"
    - Sub: "block-end TextBlock.text normalized"
    - Sub: "block-end ReasoningBlock.text normalized (rc.2 field)"
    - Sub: "block-end runtime `thinking` field normalized (defensive)"
    - Sub: "rewritten block-end is a new object"
- Group: the ledger and the logger (the count line, exactly once).
    - Sub: "count ledger line written after the 9-replacement stream (N>0)"
    - Sub: "exactly ONE count line for the stream"
    - Sub: "logger line '...normalized 9 ellipsis char(s) in one stream' (3
      delta + 2 reasoning + 2 block-end + 1 thinking)"
- Group: the P5 journal - the count event lands in the shared storage domain.
    - Sub: "exactly ONE 'normalized' journal record after the
      9-replacement stream"
    - Sub: "the 'normalized' record carries an empty path (stream-level
      event)"
    - Sub: "journal detail byte-identical to the ledger count line"
    - Sub: "the 'normalized' record carries a numeric timestamp"
    - Sub: "the record routes to the factory pre-bind buffer (stage 2), not
      the per-State queue"

## Fixtures

The shared harness (`../Harness.js`): `Furnace` (the REAL factory), the fake
ctx, the REAL `apply`, `Validate`, and the ledger path
`/tmp/ellipsis-smoke-ledger.log` (removed at the start of the folder). The
stream data: one text-delta carrying three horizontal ellipses (U+2026), one
tool-call-delta whose argumentsDelta embeds one, one reasoning-delta, three
block-end shapes (text, reasoning rc.2, reasoning with runtime `thinking`),
usage, and finish. The options object is double-frozen to prove that the
wrapper never touches it.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-ellipsis: normalized 9 ellipsis char(s) in one stream`

(The count line: asserted in the ledger file, in the logger capture, and as
the `detail` of the journal record. The record also carries `path: ""` and a
numeric `at`. The rewrite label above uses an ASCII arrow; the Test.ts source
spells it as the U+2192 escape.)

## Edge cases

- The tool-call-delta at defaults: passes BY IDENTITY with the horizontal
  ellipsis still verbatim inside the raw JSON (normalizeToolArguments=false).
- The block-end rc.2 `text` field and the runtime `thinking` field are both
  rewritten - two spellings of the same payload, both covered.
- The identity negatives: block-start, usage, and finish are compared by
  reference (===), not deepEqual - a cloned object would fail.
- The journal record is asserted to be ABSENT from the per-State Queue even
  though it exists in the pre-bind buffer - the routing, not only the
  presence, is the contract.

## Expected count

25 PASS.
