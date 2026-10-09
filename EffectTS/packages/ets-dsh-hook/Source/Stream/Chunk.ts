// Chunk - the GENERIC per-chunk dispatch: one chunk in, the (possibly
// rewritten) chunk and the replaced-character count out. The waterfall
// contract (docs/subsystems/llm-streaming.md:1108-1125, :296-304):
//
//   text-delta       - the `text` field is rewritten (always);
//   reasoning-delta  - the `text` field is rewritten WHEN the caller's
//                      reasoning flag is on (the md passes its config
//                      `normalizeReasoning`, default: on);
//   tool-call-delta  - the `argumentsDelta` text is rewritten WHEN the
//                      caller's tool-args flag is on (the flavor passes its
//                      config `normalizeToolArguments`); the flag is
//                      IMPLEMENTED (not future work), default OFF: tool-call
//                      arguments are execution-critical raw JSON - a
//                      character inside them is a string literal the parser
//                      may need verbatim - so turning it on is the user's
//                      accepted risk (this profile's patch yml enables it).
//                      With the flag on, the gate is THREE-WAY, not two-way:
//                        * normalize - the default: rewrite the arguments;
//                        * name-exempt - a delta whose `name` is "edit",
//                          "raw-write" or "normalize-file" passes through BY
//                          IDENTITY even with the flag on: the edit tool's
//                          `old_string` must
//                          match the real file bytes, so a rewritten
//                          character inside an edit call would silently
//                          break every edit, and the raw-write tool owns
//                          its content normalization through its explicit
//                          `normalize` parameter (default false =
//                          verbatim) - a rewritten stream copy of its
//                          arguments would fight the tool's own decision -
//                          and the normalize-file tool's arguments carry a
//                          FILE PATH, so normalizing a dash inside a
//                          filename would corrupt the target;
//                        * raw-marked - a call whose arguments JSON opens
//                          with the `{"__normalize":false` marker (the
//                          FIRST key; the caller tracks it per call id and
//                          passes `Raw`) passes through UNNORMALIZED - the
//                          explicit per-call opt-out - and the marker entry
//                          itself is STRIPPED from the text (Stream/Strip)
//                          so the executed call carries no unknown key (the
//                          harness's tools validate with
//                          `additionalProperties: false`). The strip
//                          rewrites the text but keeps count 0: the ledger
//                          counts NORMALIZED characters, not marker
//                          removals.
//   block-end        - the assembled block's text is rewritten via the
//                      generic block-end normalizer (Stream/Block), which
//                      receives the SAME tool-args flag AND the same Raw
//                      marker so the deltas AND the block agree (both only
//                      matter to Block's tool-call case, so forwarding them
//                      cannot mis-gate a text/reasoning block);
//   everything else  - PASSED THROUGH BY IDENTITY, ALWAYS: block-start and
//                      usage/finish carry no text payload (usage/finish
//                      ordering is part of the adapter contract); with the
//                      tool-args flag off - or the call name-exempt (edit,
//                      raw-write, normalize-file) or raw-marked - tool-call-delta joins
//                      them.
//
// The chunk shape is STRUCTURAL, not nominal: `ChunkShape` describes only
// the fields this dispatch touches, so every consumer's own real stream-
// chunk union (each bundle compiles against its own copy of the shared LLM
// types - its members' kinds fall inside the `{ type: string }` catch-all,
// and the delta and block-end members satisfy the narrowed shapes - the
// real delta's REQUIRED `id`/`index` are extra fields the optional `id?`/
// `name?` members simply do not name) satisfies the constraint. The generic
// `T` infers the caller's exact chunk type and the return preserves it - no
// cast needed at the caller, and no import of the shared LLM types here: the
// core stays dependency-free, so a consumer's own LLM type copy can never
// clash with a core-held one. The shapes are internal to the dispatch (not
// exported, not re-exported from Library).
//
// The replace step is INJECTED, not hardcoded: the caller passes the
// transform (each flavor closes over its table + replacement - e.g.
// `(Text) => Replace(Text, Dashes, "-")` or `(Text) => Map(Text, Quotes)`),
// so the dispatch owns the STRUCTURE (which fields of which chunk types)
// and the flavor owns the SUBSTITUTION. The injected transform must be
// pure and total on any string.
//
// The payload reads are GUARDED CASTS (the family's convention): the
// `{ type: string }` catch-all member of `ChunkShape` matches every
// discriminant, so narrowing can never remove it and no field can be read
// off the narrowed union directly. Each cast is guarded by the case
// condition that precedes it - per the streaming protocol a chunk of that
// discriminant always carries the field (text-delta and reasoning-delta
// carry `text`, tool-call-delta carries `argumentsDelta` - while its `name`
// is OPTIONAL per the real 0.2.0-rc.2 type and is read as such - and
// block-end carries the assembled `block`), which is what the original
// nominal-typed version expressed by its union narrowing.
//
// Pure: `count === 0` keeps the original chunk BY IDENTITY (the smoke
// asserts object identity for every untouched chunk type); a rewritten field
// produces a shallow copy preserving ORDER and every other field. The ONE
// deliberate exception is the raw-marker strip above: it may rewrite
// `argumentsDelta` while keeping `count: 0` - marker removal is not
// normalization, so the ledger must not count it.
import Block from "./Block.js";
import Strip from "./Strip.js";

type BlockShape =
	| { type: "text"; text: string }
	| { type: "reasoning"; text?: string | undefined }
	| { type: string };

type ChunkShape =
	| { type: "text-delta"; text: string }
	| { type: "reasoning-delta"; text: string }
	| {
			type: "tool-call-delta";
			id?: string;
			name?: string;
			argumentsDelta: string;
	  }
	| { type: "block-end"; block: BlockShape }
	| { type: string };

export default <T extends ChunkShape>(
	Input: T,
	Replace: (Text: string) => { text: string; count: number },
	Reasoning: boolean,
	ToolArgs = false,
	Raw = false,
): { chunk: T; count: number } => {
	switch (true) {
		case Input.type === "text-delta": {
			const Result = Replace((Input as { text: string }).text);
			return {
				chunk: (Result.count > 0 ? { ...Input, text: Result.text } : Input) as T,
				count: Result.count,
			};
		}
		case Input.type === "reasoning-delta" && Reasoning: {
			const Result = Replace((Input as { text: string }).text);
			return {
				chunk: (Result.count > 0 ? { ...Input, text: Result.text } : Input) as T,
				count: Result.count,
			};
		}
		case Input.type === "block-end": {
			// The copy decision compares BLOCK IDENTITY, not the count: the
			// raw-marker strip inside Block rewrites the block while keeping
			// count 0 (marker removal is not normalization), and a count-based
			// check would silently drop the stripped block. Block preserves the
			// original block by identity whenever it changed nothing, so the
			// comparison is exact.
			const Original = (Input as { block: BlockShape }).block;
			const Result = Block(Original, Replace, ToolArgs, Raw);
			return {
				chunk: (Result.block !== Original ? { ...Input, block: Result.block } : Input) as T,
				count: Result.count,
			};
		}
		// Raw-marked tool call: the arguments pass through UNNORMALIZED and the
		// leading marker entry is stripped (Stream/Strip). The pattern is
		// anchored at the start of the arguments text, so only the delta that
		// OPENS the arguments (the call's first delta) can ever match; every
		// later delta of the call is untouched - identity, count 0. Count stays
		// 0 even when the strip rewrote the text (the exception documented
		// above): marker removal is not normalization.
		case Input.type === "tool-call-delta" && Raw: {
			const Text = (Input as { argumentsDelta: string }).argumentsDelta;
			const Stripped = Strip(Text);
			return {
				chunk: (Stripped !== Text ? { ...Input, argumentsDelta: Stripped } : Input) as T,
				count: 0,
			};
		}
		// Tool call with the tool-args flag on and NO exemption: normalize.
		// The edit call (`name === "edit"`), the raw-write call
		// (`name === "raw-write"`) and the normalize-file call
		// (`name === "normalize-file"`) are exempt even with the flag on - the
		// edit tool's `old_string` must match the real file bytes, the raw-write
		// tool owns its normalization through its explicit `normalize` parameter
		// (default false = verbatim), so a rewritten stream copy of its
		// arguments would fight the tool's own decision, and the normalize-file
		// tool's arguments carry a FILE PATH (normalizing a dash inside a
		// filename would corrupt the target).
		case Input.type === "tool-call-delta" &&
			ToolArgs &&
			(Input as { name?: string }).name !== "edit" &&
			(Input as { name?: string }).name !== "raw-write" &&
			(Input as { name?: string }).name !== "normalize-file": {
			const Result = Replace((Input as { argumentsDelta: string }).argumentsDelta);
			return {
				chunk: (Result.count > 0 ? { ...Input, argumentsDelta: Result.text } : Input) as T,
				count: Result.count,
			};
		}
		// block-start, usage, finish - and reasoning-delta while the reasoning
		// flag is off; tool-call-delta while the tool-args flag is off, while
		// the call is name-exempt (edit, raw-write, normalize-file), or while it is raw-marked:
		// passthrough by identity.
		default:
			return { chunk: Input, count: 0 };
	}
};
