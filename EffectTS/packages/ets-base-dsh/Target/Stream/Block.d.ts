/**
 * @module Block
 *
 * The generic block-end normalizer for the assembled block carried by a
 * `block-end` chunk.
 *
 * @remarks
 *
 * The assembled block carries the fully-assembled block - the deltas and the
 * block must agree, or consumers see inconsistencies between the live stream
 * view and every assembler/replay consumer. A content block is normalized
 * field-wise:
 *
 * - TextBlock - the `text` field.
 * - ReasoningBlock - the `text` field, plus a `thinking` string field when
 *   one is present at runtime (the published 0.2.0-rc.2 type names the
 *   reasoning payload `text`, while the llm-streaming doc prose says
 *   "thinking" - both spellings are normalized so a consumer cannot disagree
 *   with whichever shape the live runtime emits).
 * - ToolCallBlock - the `arguments` string field when the caller's tool-args
 *   flag is on (config `normalizeToolArguments`); the flag is implemented
 *   (not future work), default off: the arguments are execution-critical raw
 *   JSON (a character inside them is a string literal the parser may need
 *   verbatim), so turning it on is the user's accepted risk (this profile's
 *   patch yml enables it) - and the per-chunk dispatch forwards the same flag
 *   here so the deltas and the block agree. With the flag on, the gate is
 *   three-way, not two-way:
 *
 *   - normalize - the default: rewrite the arguments.
 *   - name-exempt - a block whose `name` is "edit", "raw-write" or
 *     "normalize-file" passes through by identity even with the flag on: the
 *     edit tool's `old_string` must match the real file bytes, so a
 *     rewritten character inside an edit call would silently break every
 *     edit, the raw-write tool owns its content normalization through its
 *     explicit `normalize` parameter (default false = verbatim) - a
 *     rewritten stream copy of its arguments would fight the tool's own
 *     decision - and the normalize-file tool's arguments carry a file path,
 *     so normalizing a dash inside a filename would corrupt the target.
 *   - raw-marked - a call whose arguments JSON opens with the
 *     `{"__normalize":false` marker (the FIRST key; forwarded here as `Raw`
 *     by the per-chunk dispatch) passes through unnormalized - the explicit
 *     per-call opt-out - and the marker entry itself is stripped from the
 *     arguments (Stream/Strip) so the executed call carries no unknown key
 *     (the harness's tools validate with `additionalProperties: false`). The
 *     strip rewrites the text but keeps count 0: the ledger counts
 *     normalized characters, not marker removals.
 *
 * - Anything else - passed through by identity.
 *
 * The block shape is structural, not nominal: `BlockShape` describes only the
 * fields this dispatch touches, so every consumer's own real Content Block
 * union (each bundle compiles against its own copy of the shared LLM types -
 * its members' kinds fall inside the `{ type: string }` catch-all, and the
 * text and reasoning members satisfy the narrowed shapes) satisfies the
 * constraint. The generic `T` infers the caller's exact block type and the
 * return preserves it - no cast needed at the caller, and no import of the
 * shared LLM types here: the core stays dependency-free, so a consumer's own
 * LLM type copy can never clash with a core-held one.
 *
 * The replace step is injected, not hardcoded: the caller passes the
 * transform (each flavor closes over its table + replacement - e.g.
 * `(Text) => Replace(Text, Dashes, "-")`), so the normalizer owns the
 * structure (which fields of which block types) and the flavor owns the
 * substitution. The injected transform must be pure and total on any string.
 *
 * The payload reads are guarded casts (the family's convention): the
 * `{ type: string }` catch-all member of `BlockShape` matches every
 * discriminant, so narrowing can never remove it and no field can be read
 * off the narrowed union directly. Each cast is guarded by the case condition
 * that precedes it - the same runtime checks the original nominal-typed
 * version performed (the text case always asked `typeof ... === "string"`;
 * the reasoning case did too, for both the `text` and the runtime-extra
 * `thinking` spellings; the tool-call case carries `arguments` per the
 * streaming protocol - while its `name` is optional per the real 0.2.0-rc.2
 * type and is read as such).
 *
 * Pure: returns `{ block, count }`; `count === 0` keeps the original block
 * by identity, and a changed field produces a shallow copy with only that
 * field replaced (the rest of the block - attachment refs, tool ids - is
 * preserved untouched). The one deliberate exception is the raw-marker strip
 * above: it may rewrite `arguments` while keeping `count: 0` - marker removal
 * is not normalization, so the ledger must not count it.
 */
type BlockShape = {
    type: "text";
    text: string;
} | {
    type: "reasoning";
    text?: string | undefined;
} | {
    type: "tool-call";
    name?: string;
    arguments?: string;
} | {
    type: string;
};
export default _default;
declare function _default<T extends BlockShape>(Input: T, Replace: (Text: string) => {
    text: string;
    count: number;
}, ToolArgs?: boolean, Raw?: boolean, Conversation?: boolean): {
    block: T;
    count: number;
};
