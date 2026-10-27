# Tool-Args-Exemptions

What this test verifies.

## Intent

The tool-args gate and its exemption family: the stream-level surfaces where tool arguments can and
cannot be rewritten.

This is its own folder because the exemption rules are the safety story.

The `old_string` of `edit` must match real file bytes, and the per-call `__normalize` marker is the
escape hatch of the user, while the plain gate rewrites the deltas AND the assembled block so that
consumers never see inconsistent arguments.

The source suite's Runs 7, 7b, 7c and 7d (minus the journal-count leaves, which live in
Journal-And-Custom), moved verbatim.

## Scenario

- Group: Run 7 - tool args ON (normalizeToolArguments: true).
    - Check: "plain fields: ToolArgs=true when normalizeToolArguments=on".
    - Check: "activation line reflects toolArgs=on".
    - Check: "tool-call-delta argumentsDelta normalized when
      normalizeToolArguments=on".
    - Check: "rewritten tool-call-delta is a new object (id/index/name
      preserved)".
    - Check: "block-end ToolCallBlock.arguments normalized too (the deltas
      AND the block agree)".
    - Check: "count line includes the tool-args replacements (delta + block)".
- Group: Run 7b - the edit exemption (normalizeToolArguments: on).
    - Check: "edit tool-call-delta passes through BY IDENTITY with the flag
      on (old_string must match real file bytes)".
    - Check: "edit argumentsDelta dash still verbatim".
    - Check: "edit ToolCallBlock passes through BY IDENTITY too (the deltas
      AND the block agree)".
    - Check: "edit block arguments dash still verbatim".
    - Check: "NO count line for an edit-only stream (nothing normalized)"
      (the negative control).
- Group: Run 7c - the per-call raw marker (normalizeToolArguments: on).
    - Check: "raw-marked call: the marker entry is stripped from the first
      delta".
    - Check: "raw-marked arguments pass through UNNORMALIZED (em dash
      survives)".
    - Check: "subsequent raw-call delta passes through untouched".
    - Check: "raw-marked assembled block: marker stripped, arguments
      unnormalized".
    - Check: "the stripped raw-marked block-end is a new object".
    - Check: "the executed arguments carry no __normalize key (no
      additionalProperties rejection)".
    - Check: "NO count line for a raw-marked stream (the strip is not a
      normalization)" (the negative control).
- Group: Run 7d - the marker state resets at the next call id.
    - Check: "the first call is raw-marked: marker stripped, dash
      unnormalized".
    - Check: "the next call id RESETS the marker state: normalization
      resumes".
    - Check: "count line counts only the normalized call (the raw call stays
      invisible)".

## Fixtures

The harness fake ctx + the REAL factory + the REAL dash apply.

Each run builds `Validate({ normalizeToolArguments: true, logFile })` and drives its stream through
the registered `llm/stream` listener: Run 7 feeds a tool-call-delta + block-end pair for `write`, 7b
feeds the same pair for `edit`, 7c feeds the marker-carrying first delta, a second delta and the
assembled block, and 7d feeds two calls with different ids.

The ledger file is cleared before every run (the rm points of the source suite) and read after the
10ms settle.

## Expected ledger strings (byte-exact)

- `normalized 2 dash char(s) in one stream` (Run 7's durable line, asserted
  via includes).
- `normalized 1 dash char(s) in one stream` (Run 7d's durable line, asserted
  via includes).
- The activation-line shape: starts with
  `hook-dsh-normalize-dash: activated` and contains `toolArgs=on`.

## Edge cases

- The edit exemption holds at BOTH levels (delta and assembled block) and with the flag on, because a rewrite would corrupt old_string matching.
- The raw marker is stripped but never counted as a normalization (no count line, no journal record).
- The marker state is per call id, so the next id resumes normalization (7d).
- The rewritten tool-call-delta keeps id/index/name (the new-object check).

## Expected count

21 PASS.
