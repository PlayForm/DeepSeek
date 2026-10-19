# Stream-Contract

What this test verifies.

## Intent

The llm/stream waterfall contract of the dash flavor: what the registered
listener promises to every upstream consumer. This is its own folder because
the contract is structural, not just behavioral - next() is called exactly
once and synchronously before any iteration, the request options are never
mutated, the chunk sequence is preserved one-for-one, the non-text chunks
pass through BY IDENTITY, and every rewrite is a new object with an exact
ledger string. The source suite's waterfall section plus Run 2 (reasoning
off) and the Run 5 identity leaf, moved verbatim.

## Scenario

- Group: the waterfall listener, exercised.
    - Check: "next() called exactly once, synchronously (before iteration)".
    - Check: "next() was called BEFORE any upstream iteration".
    - Check: "deep-frozen options untouched (still frozen)".
    - Check: "chunk order/count preserved (1 in, 1 out)".
    - Check: "chunk type sequence identical to upstream".
    - Check: "block-start passthrough BY IDENTITY".
    - Check: "tool-call-delta passthrough BY IDENTITY (argumentsDelta raw
      JSON untouched)".
    - Check: "argumentsDelta dash still verbatim" (the tool-args gate is off
      by default).
    - Check: "usage passthrough BY IDENTITY".
    - Check: "finish passthrough BY IDENTITY".
    - Check: "text-delta normalized (em/en/U+2011/U+2015 -> '-')" (the four
      dash codepoints all map to the replacement).
    - Check: "rewritten text-delta is a new object, index preserved".
    - Check: "reasoning-delta normalized when reasoning=on".
    - Check: "block-end TextBlock.text normalized".
    - Check: "block-end ReasoningBlock.text normalized (rc.2 field)".
    - Check: "block-end runtime `thinking` field normalized (defensive)".
    - Check: "rewritten block-end is a new object".
    - Check: "count ledger line written after the 10-replacement stream
      (N>0)" (the durable file).
    - Check: "exactly ONE count line for the stream".
    - Check: "logger line 'hook-dsh-normalize-dash: normalized 10 dash
      char(s) in one stream' (4 delta + 2 reasoning + 3 block-end + 1
      thinking)" (Run1.Lines[1], byte-exact).
- Group: Run 2 - reasoning off.
    - Check: "reasoning-delta passthrough (identity) when
      normalizeReasoning=off".
    - Check: "stream completed with both chunks".
    - Check: "stream completed".
    - Check: "NO count line when nothing replaced (N=0)" (the negative
      control - the ledger file gains nothing).
- Group: Run 5 - identity when nothing to replace.
    - Check: "unchanged text-delta passes through BY IDENTITY (count 0)"
      (the count-0 negative control; the journal-count sibling of this
      stream lives in Journal-And-Custom).

## Fixtures

The harness fake ctx + the REAL factory + the REAL dash apply. The waterfall
stream is the source suite's nine-chunk sequence (block-start, text-delta
with the four dash codepoints, tool-call-delta, reasoning-delta, three
block-ends, usage, finish) driven through a counting next(); the request
options are double Object.freeze-ed. The durable ledger is the harness's
fixed path; the folder clears it at start and after each stream read point
(the source suite's rm points). The 10ms settle waits before every ledger
read are kept.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-dash: normalized 10 dash char(s) in one stream` (the
  logger line and the durable file line share the message text; Run1.Lines[1]).

## Edge cases

- N=0 produces NO count line and NO rewrite (Run 2 and Run 5).
- normalizeReasoning=off leaves reasoning-deltas at identity even though the
  conversation scope is on.
- A rewritten chunk is always a new object; passthrough chunks are the same
  reference - the identity checks pin both halves.

## Expected count

25 PASS.
