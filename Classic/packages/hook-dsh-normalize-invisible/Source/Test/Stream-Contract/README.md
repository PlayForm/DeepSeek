# Stream-Contract

What this test verifies.

## Intent

The full llm/stream waterfall contract of the Run-1 stream: the next()
mechanics (called exactly once, synchronously, before any upstream
iteration), the deep-frozen options invariant, the passthrough-by-identity
groups (block-start, tool-call-delta with its raw JSON argumentsDelta, usage,
finish), the removal groups (the replacement is the empty string, so the
invisible characters vanish from the text-delta, the reasoning-delta and the
three block-end fields while every rewritten chunk is a new object with the
index preserved), the count ledger line ("normalized 9 invisible char(s) in
one stream" - 3 delta + 2 reasoning + 2 block-end + 1 thinking), the byte
exact logger line and the P5 journal routing of the count event (the
factory-level PRE-BIND buffer, stage 2, not the per-State queue, stage 3).
The assertions are moved verbatim from `Classic/smokes/invisible-smoke.mjs`
sections "The waterfall listener, exercised" and "Run 1 (P5 journal): the
count event lands in the shared storage domain" (the source suite stays in
place during the migration; this folder is the future home of the same
contract).

## Scenario

- Group: the next() mechanics and the options invariant.
    - Sub: "next() called exactly once, synchronously (before iteration)"
        - assert.ok(NextCalls === 1)
    - Sub: "next() was called BEFORE any upstream iteration"
        - assert.ok(IteratedAtNext === false)
    - Sub: "deep-frozen options untouched (still frozen)"
        - assert.ok(Object.isFrozen(Request))
- Group: the passthrough-by-identity groups and the pipeline shape.
    - Sub: "chunk order/count preserved (1 in, 1 out)"
        - assert.ok(Out.length === Chunks.length)
    - Sub: "chunk type sequence identical to upstream"
        - assert.ok(Out.map((C) => C.type).join(",") ===
          Chunks.map((C) => C.type).join(","))
    - Sub: "block-start passthrough BY IDENTITY"
        - assert.ok(Out[0] === Chunks[0])
    - Sub: "tool-call-delta passthrough BY IDENTITY (argumentsDelta raw JSON
      untouched)"
        - assert.ok(Out[2] === Chunks[2])
    - Sub: "argumentsDelta zero-width space still verbatim"
        - assert.ok(Out[2].argumentsDelta.includes(the zero-width space))
    - Sub: "usage passthrough BY IDENTITY"
        - assert.ok(Out[7] === Chunks[7])
    - Sub: "finish passthrough BY IDENTITY"
        - assert.ok(Out[8] === Chunks[8])
- Group: the removal groups (the text-delta, the reasoning-delta and the
  three block-end fields - the replacement is the empty string, so the
  invisible characters are removed outright).
    - Sub: "text-delta normalized (U+200B/U+200C/U+00AD removed)"
        - assert.ok(Out[1].text === "abcd")
    - Sub: "rewritten text-delta is a new object, index preserved"
        - assert.ok(Out[1] !== Chunks[1] && Out[1].index === 0)
    - Sub: "reasoning-delta normalized when reasoning=on (ZWJ + BOM removed)"
        - assert.ok(Out[3].text === "x")
    - Sub: "block-end TextBlock.text normalized (word joiner + LRM removed)"
        - assert.ok(Out[4].block.text === "keptgone")
    - Sub: "block-end ReasoningBlock.text normalized (rc.2 field)"
        - assert.ok(Out[5].block.text === "y")
    - Sub: "block-end runtime `thinking` field normalized (defensive, RLO
      override)"
        - assert.ok(Out[6].block.thinking === "z")
    - Sub: "rewritten block-end is a new object"
        - assert.ok(Out[5] !== Chunks[5])
- Group: the ledger and the logger (the count line, exactly once).
    - Sub: "count ledger line written after the 9-replacement stream (N>0)"
        - assert.ok(Log1.includes("normalized 9 invisible char(s) in one
          stream"))
    - Sub: "exactly ONE count line for the stream"
        - assert.ok(one "normalized" line in the ledger file)
    - Sub: "logger line 'hook-dsh-normalize-invisible: normalized 9 invisible
      char(s) in one stream' (3 delta + 2 reasoning + 2 block-end + 1
      thinking)"
        - assert.ok(exactly one "normalized" logger line, byte-equal to the
          string above)
- Group: the P5 journal - the count event lands in the shared storage domain.
    - Sub: "exactly ONE 'normalized' journal record after the 9-replacement
      stream"
        - assert.ok(JournalRun1.length === 1)
    - Sub: "the 'normalized' record carries an empty path (stream-level
      event)"
        - assert.ok(JournalRun1[0] !== undefined && JournalRun1[0].path ===
          "")
    - Sub: "journal detail byte-identical to the ledger count line"
        - assert.ok(JournalRun1[0].detail === "normalized 9 invisible char(s)
          in one stream")
    - Sub: "the 'normalized' record carries a numeric timestamp"
        - assert.ok(typeof JournalRun1[0].at === "number")
    - Sub: "the record routes to the factory pre-bind buffer (stage 2), not
      the per-State queue"
        - assert.ok(Run1.State.Queue has zero "normalized" records)

## Fixtures

The shared harness (`../Harness.js`): the REAL factory instance (`Furnace`),
the fake ctx, the REAL `apply`, `Validate` and the ledger path
`/tmp/invisible-smoke-ledger.log` (removed at the folder's start). The stream
fixture embeds this flavor's own character class: the text-delta carries the
zero-width space (U+200B), the zero-width non-joiner (U+200C) and the soft
hyphen (U+00AD); the reasoning-delta the zero-width joiner (U+200D) and the
BOM (U+FEFF); the block-end fields the word joiner (U+2060), the LRM
(U+200E), the LRE (U+202A) and the RLO (U+202E); the tool-call JSON a
zero-width space. Nine replacements total in one stream. The options object
is deep-frozen to prove non-mutation.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-invisible: normalized 9 invisible char(s) in one stream`
  (ledger file, logger line and journal detail)

## Edge cases

- The identity groups are exact: the untouched chunk kinds are compared BY
  REFERENCE, so a hidden copy-then-mutate would fail.
- The rewritten chunks are also compared by reference (`!==`) - new objects,
  not in-place edits - with the index preserved.
- The tool-call JSON (argumentsDelta) is never normalized on the stream path,
  even though it embeds a zero-width space: execution-critical strings stay
  byte-identical.
- The journal arithmetic is exact: exactly one "normalized" record in the
  pre-bind buffer, none in the per-State queue.

## Expected count

25 PASS.
