# Block

What this test verifies.

## Intent

`Block` is the generic block-end normalizer: the assembled-block twin of
`Chunk`. Where Chunk rewrites per streaming delta, Block rewrites the complete
block the model produced at the end of a stream turn - and the two MUST agree
(the same gates, the same exemptions, the same raw-marker semantics), because a
delta that passed through and a block that gets rewritten (or vice versa) would
corrupt the executed call. It is its own folder because the block-level contract
has its own edge cases (the count sums both reasoning fields; Raw only matters
to the tool-call case; unknown/merge-extensible blocks pass through untouched).
This is the source suite's section 8 (the Block half), moved verbatim. NOTE for
the ETS tree: `Block` is served by the shared `@playform/ets-base-dsh` base
(the same rule the source suite uses), while the tables/transform helpers come
from this bundle's own built Target - the import split is the only structural
difference from the Classic twin. The whole scenario tree lives in one Check
because the source suite counts it as one ok group.

## Scenario

- Group: Chunk + Block - the generic injected-transform dispatch.
    - Sub: Block - the generic block-end normalizer (one Check, the source ok
      label verbatim; the branches below are nested blocks inside it):
        - Branch: the text/reasoning/thinking rewrites - TextBlock.text and
          ReasoningBlock.text normalized; the runtime `thinking` field
          normalized; the count sums both reasoning fields (2).
        - Branch: the tool-call gate - flag off (default and explicit) passes
          the block through BY IDENTITY with raw JSON untouched; flag ON
          rewrites arguments into a new object (id/name preserved, count 1); an
          already-clean block still passes through BY IDENTITY with the flag on.
        - Branch: the EDIT exemption - an `edit` block passes through BY
          IDENTITY with the flag on; count 0.
        - Branch: the RAW-WRITE exemption - a `raw-write` block passes through
          BY IDENTITY with the flag on; count 0.
        - Branch: the NORMALIZE-FILE exemption - a `normalize-file` block passes
          through BY IDENTITY with the flag on AND with the flag off (its
          arguments carry a file path).
        - Branch: the PER-CALL RAW MARKER - the assembled block is unnormalized
          with the marker stripped (agrees with the stripped deltas); a
          marker-only block becomes "{}"; with the flag OFF the marker is STILL
          stripped.
        - Branch: Raw only matters to the tool-call case - a text block
          normalizes even when Raw is forwarded; an unknown/merge-extensible
          block (image) passes through BY IDENTITY.

## Fixtures

None (no fs, no ctx, no factory). The transform is the same local closure as the
Chunk folder: `ToDash = (Text) => Replace(Text, Dashes, "-")`. The block
fixtures are plain object literals (`text`, `reasoning` (with the runtime
`thinking` field), `tool-call` with arguments JSON strings, `image`).

## Expected ledger strings (byte-exact)

None. The core owns no ledger strings; this folder's contract is the returned
block shapes and counts, e.g. `"-kept -gone"` for the rewritten text, count 2
for the reasoning block, and `'{"path":"a-b"}'` for the normalized tool
arguments.

## Edge cases

- Count-0 passthroughs BY IDENTITY (tool-call flag off, unknown image block).
- Flag-OFF variants still strip the raw marker (removal is not normalization).
- The three exemptions (edit, raw-write, normalize-file) hold with the flag ON.
- Raw forwarded to a text block does NOT suppress its normalization.
- The count sums BOTH reasoning fields (text + thinking) in one block.

## Expected count

1 PASS.
