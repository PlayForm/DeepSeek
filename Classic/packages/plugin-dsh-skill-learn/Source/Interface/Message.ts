// Message - the STRUCTURAL conversation message the digest and the requests use.
//
// TAKEN FROM `@deepseek-ai/dsh-llm`'s message and block declarations, which this
// package cannot import: a message is `{role, content}` where `content` is a
// list of typed blocks (`dsh-llm/lib/types/message.d.ts:139-172`, roles closed
// at `MessageRoleMap`; blocks at `dsh-llm/lib/types/types.d.ts:46-51` for
// `text`, `:85-92` for `tool-call`, and the map at `:122-131`).
//
// THE BLOCK UNION IS NARROWED TO WHAT THE DIGEST READS. The harness knows seven
// block types (`text`, `reasoning`, `image`, `file`, `tool-call`,
// `tool-addition`, `tool-removal`); the digest's projection is exactly "text
// contributes its text, tool-call contributes its name, everything else
// contributes nothing" (plan section 4.4). Declaring the other five here would
// invite a reader to use content this plugin never sends to a model, and
// `Function/Transcript` already drops them at the projection boundary.
//
// `name` IS OPTIONAL because the digest's assistant line is defined to print `?`
// when a name is absent (plan section 4.4, from `_digest_history` at
// `agent/background_review.py:351-354`), so an absent name is a representable
// state rather than a missing one.
export interface TextBlock {
	readonly type: "text";
	readonly text: string;
}

export interface ToolCallBlock {
	readonly type: "tool-call";
	/** The tool's name; absent when the model's call carried none. */
	readonly name?: string;
}

/** The two block types this plugin reads; every other block is dropped upstream. */
export type ContentBlock = TextBlock | ToolCallBlock;

export default interface Message {
	/**
	 * The five roles the harness's message map closes over. `developer` is
	 * included for completeness: a projected history may carry one, and the
	 * digest must be able to state that it contributes nothing.
	 */
	readonly role: "system" | "user" | "assistant" | "tool" | "developer";
	/** The model-facing blocks, in order. */
	readonly content: readonly ContentBlock[];
}
