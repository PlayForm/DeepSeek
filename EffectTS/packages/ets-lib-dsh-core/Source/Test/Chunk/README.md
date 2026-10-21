# Chunk

What this test verifies.

## Intent

`Chunk` is the generic per-chunk dispatch every normalize flavor's stream
listener drives: it receives one stream chunk, an injected transform (a
`Replace`- or `ReplaceMap`-backed closure), and a set of gates (reasoning,
tool-args, per-call raw marker), and returns either a rewritten chunk (new
object, count > 0) or the ORIGINAL chunk by identity (count 0). It is its own
folder because this is the family's stream-rewriting contract in one function -
the gate matrix and the three tool exemptions decide, per chunk, whether the
model's output may be touched at all. This is the source suite's section 8 (the
Chunk half of "Chunk + Block"), moved verbatim. NOTE for the ETS tree: `Chunk`
is served by the shared `@playform/ets-base-dsh` base (the same rule the source
suite uses), while the tables/transform helpers come from this bundle's own
built Target - the import split is the only structural difference from the
Classic twin. The whole scenario tree lives in one Check because the source
suite counts it as one ok group.

## Scenario

- Group: Chunk + Block - the generic injected-transform dispatch.
    - Sub: Chunk - the generic per-chunk dispatch (one Check, the source ok
      label verbatim; the branches below are nested blocks inside it):
        - Branch: the text-delta rewrites - em/en/U+2011/U+2015 dashes become
          "-", the rewritten chunk is a NEW object with the index preserved,
          count 4; an unchanged text-delta passes through BY IDENTITY.
        - Branch: the tool-call-delta gate - flag off (default and explicit)
          passes the delta through BY IDENTITY with raw JSON untouched; flag ON
          rewrites argumentsDelta into a new object (id/index/name preserved,
          count 1); an already-clean delta still passes through BY IDENTITY with
          the flag on.
        - Branch: the EDIT exemption - `edit` passes through BY IDENTITY with
          the flag on (old_string must match real file bytes) and with the flag
          off; count 0 either way.
        - Branch: the RAW-WRITE exemption - `raw-write` passes through BY
          IDENTITY with the flag on (the tool owns its normalize parameter) and
          with the flag off.
        - Branch: the NORMALIZE-FILE exemption - `normalize-file` passes through
          BY IDENTITY with the flag on (its arguments carry a file path) and
          with the flag off.
        - Branch: the PER-CALL RAW MARKER - a call whose arguments open with the
          `{"__normalize":false` marker is stripped and passed through
          UNNORMALIZED (count 0, new object); a marker-only call becomes "{}"; a
          whitespace-variant marker is still stripped; a subsequent delta of the
          same call passes through BY IDENTITY (the strip is anchored at the
          arguments start); with the flag OFF the marker is STILL stripped
          (removal is not normalization).
        - Branch: the reasoning gate - reasoning-delta normalized when the
          reasoning flag is on, passthrough by identity when off; block-start,
          usage and finish all pass through BY IDENTITY.
        - Branch: the block-end fields - TextBlock.text, ReasoningBlock.text
          (rc.2 field) and the runtime `thinking` field are all normalized; the
          rewritten block-end is a new object.
        - Branch: the second-flavor injection - a Quotes-map transform flows
          through the SAME dispatch.

## Fixtures

None (no fs, no ctx, no factory). The transform is a local closure over the REAL
exported tables: `ToDash = (Text) => Replace(Text, Dashes, "-")` and
`ToQuotes = (Text) => ReplaceMap(Text, Quotes)`. The chunk fixtures are plain
object literals (`text-delta`, `tool-call-delta` with argumentsDelta JSON
strings, `reasoning-delta`, `block-start`, `usage`, `finish`, `block-end`).

## Expected ledger strings (byte-exact)

None. The core owns no ledger strings; this folder's contract is the returned
chunk shapes and counts, e.g. `{ type: "text-delta", index: 0, text:
"a - b - c - d - e" }` with count 4, and `'{"path":"a-b"}'` for the normalized
tool arguments.

## Edge cases

- Count-0 passthroughs BY IDENTITY (unchanged text-delta, clean tool delta,
  flag-off reasoning delta, block-start/usage/finish) - identity equality is
  asserted, not deep equality.
- Flag-OFF variants still strip the raw marker (removal is not normalization).
- The three exemptions (edit, raw-write, normalize-file) hold with the flag ON.
- The raw-marker strip is anchored: a later delta of the same call (arguments
  starting with a comma) is untouched.
- The rewritten results are always NEW objects; the inputs are never mutated.

## Expected count

1 PASS.
