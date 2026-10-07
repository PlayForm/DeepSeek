// Block - the GENERIC block-end normalizer: the assembled block carried by
// a `block-end` chunk (it carries the FULLY-ASSEMBLED block - the deltas
// AND the block must agree, or consumers see inconsistencies between the
// live stream view and every assembler/replay consumer). A content block is
// normalized field-wise:
//
//   TextBlock      - the `text` field;
//   ReasoningBlock - the `text` field, plus a `thinking` string field when
//                    one is present at runtime (the published 0.2.0-rc.2
//                    type names the reasoning payload `text`, while the
//                    llm-streaming doc prose says "thinking" - both
//                    spellings are normalized so a consumer cannot disagree
//                    with whichever shape the live runtime emits);
//   ToolCallBlock  - the `arguments` string field WHEN the caller's
//                    tool-args flag is on (config
//                    `normalizeToolArguments`); the flag is IMPLEMENTED
//                    (not future work), default OFF: the arguments are
//                    execution-critical raw JSON (a character inside them
//                    is a string literal the parser may need verbatim), so
//                    turning it on is the user's accepted risk (this
//                    profile's patch yml enables it) - and the per-chunk
//                    dispatch forwards the SAME flag here so the deltas AND
//                    the block agree. With the flag on, the gate is
//                    THREE-WAY, not two-way:
//                      * normalize - the default: rewrite the arguments;
//                      * name-exempt - a block whose `name` is "edit",
//                        "raw-write" or "normalize-file" passes through BY
//                        IDENTITY even with the flag on: the edit tool's
//                        `old_string` must match the real file bytes, so a
//                        rewritten character inside an edit call would
//                        silently break every edit, the raw-write tool owns
//                        its content normalization through its explicit
//                        `normalize` parameter (default false =
//                        verbatim) - a rewritten stream copy of its
//                        arguments would fight the tool's own decision - and
//                        the normalize-file tool's arguments carry a FILE
//                        PATH, so normalizing a dash inside a filename
//                        would corrupt the target;
//                      * raw-marked - a call whose arguments JSON opens
//                        with the `{"__normalize":false` marker (the
//                        FIRST key; forwarded here as `Raw` by the
//                        per-chunk dispatch) passes through UNNORMALIZED -
//                        the explicit per-call opt-out - and the marker
//                        entry itself is STRIPPED from the arguments
//                        (Stream/Strip) so the executed call carries no
//                        unknown key (the harness's tools validate with
//                        `additionalProperties: false`). The strip
//                        rewrites the text but keeps count 0: the ledger
//                        counts NORMALIZED characters, not marker
//                        removals;
//   anything else  - PASSED THROUGH BY IDENTITY.
//
// The block shape is STRUCTURAL, not nominal: `BlockShape` describes only
// the fields this dispatch touches, so every consumer's own real Content
// Block union (each bundle compiles against its own copy of the shared LLM
// types - its members' kinds fall inside the `{ type: string }` catch-all,
// and the text and reasoning members satisfy the narrowed shapes) satisfies
// the constraint. The generic `T` infers the caller's exact block type and
// the return preserves it - no cast needed at the caller, and no import of
// the shared LLM types here: the core stays dependency-free, so a
// consumer's own LLM type copy can never clash with a core-held one.
//
// The replace step is INJECTED, not hardcoded: the caller passes the
// transform (each flavor closes over its table + replacement - e.g.
// `(Text) => Replace(Text, Dashes, "-")`), so the normalizer owns the
// STRUCTURE (which fields of which block types) and the flavor owns the
// SUBSTITUTION. The injected transform must be pure and total on any
// string.
//
// The payload reads are GUARDED CASTS (the family's convention): the
// `{ type: string }` catch-all member of `BlockShape` matches every
// discriminant, so narrowing can never remove it and no field can be read
// off the narrowed union directly. Each cast is guarded by the case
// condition that precedes it - the same runtime checks the original
// nominal-typed version performed (the text case always asked
// `typeof ... === "string"`; the reasoning case did too, for both the
// `text` and the runtime-extra `thinking` spellings; the tool-call case
// carries `arguments` per the streaming protocol - while its `name` is
// OPTIONAL per the real 0.2.0-rc.2 type and is read as such).
//
// Pure: returns `{ block, count }`; `count === 0` keeps the original block
// BY IDENTITY, and a changed field produces a shallow copy with only that
// field replaced (the rest of the block - attachment refs, tool ids - is
// preserved untouched). The ONE deliberate exception is the raw-marker
// strip above: it may rewrite `arguments` while keeping `count: 0` -
// marker removal is not normalization, so the ledger must not count it.
import Strip from "./Strip.js";

type BlockShape =
	| { type: "text"; text: string }
	| { type: "reasoning"; text?: string | undefined }
	| { type: "tool-call"; name?: string; arguments?: string }
	| { type: string };

export default <T extends BlockShape>(
	Input: T,
	Replace: (Text: string) => { text: string; count: number },
	ToolArgs = false,
	Raw = false,
): { block: T; count: number } => {
	switch (true) {
		// TextBlock: the visible text payload.
		case Input.type === "text" && typeof (Input as { text?: unknown }).text === "string": {
			const Result = Replace((Input as { text: string }).text);
			return {
				block: (Result.count > 0 ? { ...Input, text: Result.text } : Input) as T,
				count: Result.count,
			};
		}
		// ReasoningBlock: the reasoning payload - `text` per the published
		// 0.2.0-rc.2 type, `thinking` per the doc prose; normalize whichever
		// string field is present (both, defensively).
		case Input.type === "reasoning": {
			let Count = 0;
			const Next: { type: string; text?: string | undefined } = { ...Input };
			switch (true) {
				case typeof (Input as { text?: unknown }).text === "string": {
					const Result = Replace((Input as { text: string }).text);
					Next.text = Result.text;
					Count += Result.count;
					break;
				}
			}
			const Extra = Input as { thinking?: unknown };
			switch (true) {
				case typeof Extra.thinking === "string": {
					const Result = Replace(Extra.thinking as string);
					(Next as { thinking?: unknown }).thinking = Result.text;
					Count += Result.count;
					break;
				}
			}
			return { block: (Count > 0 ? Next : Input) as T, count: Count };
		}
		// Raw-marked tool call: the arguments pass through UNNORMALIZED and the
		// leading marker entry is stripped (Stream/Strip) - the assembled block
		// agrees with the stripped deltas, and the executed call carries no
		// unknown key. Count stays 0 even when the strip rewrote the text (the
		// exception documented above): marker removal is not normalization.
		case Input.type === "tool-call" && Raw: {
			const Text = (Input as { arguments: string }).arguments;
			const Stripped = Strip(Text);
			return {
				block: (Stripped !== Text ? { ...Input, arguments: Stripped } : Input) as T,
				count: 0,
			};
		}
		// ToolCallBlock: the raw-JSON arguments payload - normalized ONLY when
		// the caller's tool-args flag is on (default OFF: execution-critical
		// raw JSON, the user's accepted risk when they enable it) and the call
		// has NO exemption. The edit call (`name === "edit"`), the raw-write
		// call (`name === "raw-write"`) and the normalize-file call
		// (`name === "normalize-file"`) are exempt even with the flag on - the
		// edit tool's `old_string` must match the real file bytes, the raw-write
		// tool owns its normalization through its explicit `normalize`
		// parameter, and the normalize-file tool's arguments carry a FILE PATH
		// (normalizing a dash inside a filename would corrupt the target).
		case Input.type === "tool-call" &&
			ToolArgs &&
			(Input as { name?: string }).name !== "edit" &&
			(Input as { name?: string }).name !== "raw-write" &&
			(Input as { name?: string }).name !== "normalize-file": {
			const Result = Replace((Input as { arguments: string }).arguments);
			return {
				block: (Result.count > 0 ? { ...Input, arguments: Result.text } : Input) as T,
				count: Result.count,
			};
		}
		// ImageBlock, FileBlock, tool-change blocks, unknown merge-extensible
		// types - and ToolCallBlock while the tool-args flag is off, while the
		// call is name-exempt (edit, raw-write, normalize-file), or while it is raw-marked:
		// passthrough by identity.
		default:
			return { block: Input, count: 0 };
	}
};
