# Stream-Contract

What this test verifies.

## Intent

This folder covers the full llm/stream waterfall contract of the Run-1 stream: the next() mechanics of the wrapper, the untouched options, the passthrough-by-identity groups, the rewrite groups, the count ledger line, and the P5 journal routing of the count event.

This is the core behavior of the stream flavor: a single mixed stream exercises every branch of the wrapper in one pass.

The stream holds four curly quotes in the text, a tool-call delta, a reasoning delta, three block-end shapes, usage, and finish.

Block-start, usage, and finish pass through BY IDENTITY.

The tool-call-delta passes through untouched, because the arguments are execution-critical raw JSON at defaults.

The text-delta, reasoning-delta, and block-end fields are rewritten as new objects.

Exactly one count line is written to the ledger AND logged.

The count event lands in the pre-bind journal buffer of the factory (stage 2), not the per-State queue (stage 3).

The assertions are moved verbatim from `EffectTS/smokes/quotes-smoke.mjs` sections "The waterfall listener, exercised" and "Run 1 (P5 journal)".

## Scenario

- Group: the next() mechanics and the options invariant.
    - Check: "next() called exactly once, synchronously (before iteration)".
    - Check: "next() was called BEFORE any upstream iteration".
    - Check: "deep-frozen options untouched (still frozen)".
- Group: the passthrough-by-identity groups and the pipeline shape.
    - Check: "chunk order/count preserved (1 in, 1 out)".
    - Check: "chunk type sequence identical to upstream".
    - Check: "block-start passthrough BY IDENTITY".
    - Check: "tool-call-delta passthrough BY IDENTITY (argumentsDelta raw JSON untouched)".
    - Check: "argumentsDelta curly quote still verbatim".
    - Check: "usage passthrough BY IDENTITY".
    - Check: "finish passthrough BY IDENTITY".
- Group: the rewrite groups (the text-delta, the reasoning-delta, and the three block-end fields).
    - Check: "text-delta normalized (U+2018/U+2019 -> ', U+201C/U+201D -> ")".
    - Check: "rewritten text-delta is a new object, index preserved".
    - Check: "reasoning-delta normalized when reasoning=on".
    - Check: "block-end TextBlock.text normalized".
    - Check: "block-end ReasoningBlock.text normalized (rc.2 field)".
    - Check: "block-end runtime `thinking` field normalized (defensive)".
    - Check: "rewritten block-end is a new object".
- Group: the ledger and the logger (the count line, exactly once).
    - Check: "count ledger line written after the 10-replacement stream (N>0)".
    - Check: "exactly ONE count line for the stream".
    - Check: "logger line '...normalized 10 quote char(s) in one stream' (4 delta + 2 reasoning + 3 block-end + 1 thinking)".
- Group: the P5 journal, where the count event lands in the shared storage domain.
    - Check: "exactly ONE 'normalized' journal record after the 10-replacement stream".
    - Check: "the 'normalized' record carries an empty path (stream-level event)".
    - Check: "journal detail byte-identical to the ledger count line".
    - Check: "the 'normalized' record carries a numeric timestamp".
    - Check: "the record routes to the factory pre-bind buffer (stage 2), not the per-State queue".

## Fixtures

The shared harness (`../Harness.js`) supplies `Furnace` (the REAL factory), the fake ctx, the REAL `apply`, `Validate`, and the ledger path `/tmp/quotes-smoke-ledger.log`, which is removed at the folder's start.

The stream data is one text-delta carrying four curly quotes, one tool-call-delta whose argumentsDelta embeds a curly quote, one reasoning-delta, three block-end shapes (text, reasoning rc.2, reasoning with runtime `thinking`), usage, and finish.

The options object is double-frozen to prove the wrapper never touches it.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-quotes: normalized 10 quote char(s) in one stream`

The count line is asserted in the ledger file, in the logger capture, and as the `detail` of the journal record.

The record also carries `path: ""` and a numeric `at`.

The rewrite labels above use ASCII arrows, and the Test.ts source spells them as U+2192 escapes.

## Edge cases

- The tool-call-delta at defaults passes BY IDENTITY with the curly quote still verbatim inside the raw JSON (normalizeToolArguments=false).
- The block-end rc.2 `text` field and the runtime `thinking` field are both rewritten, which covers two spellings of the same payload.
- The identity negatives: block-start, usage, and finish are compared by reference (===), not deepEqual, so a cloned object would fail.
- The journal record is asserted to be ABSENT from the per-State Queue even though it exists in the pre-bind buffer, so the routing, not just the presence, is the contract.

## Expected count

25 PASS.
