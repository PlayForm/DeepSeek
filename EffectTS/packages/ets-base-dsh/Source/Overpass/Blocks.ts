// Blocks - the GENERIC text-block rewrite shared by the overpass arms: walk a
// content array, rewrite ONLY the text blocks through the caller's transform,
// and return the ORIGINAL array BY IDENTITY when nothing changed. The identity
// rule is the caller's no-op contract: an unchanged content array must be
// indistinguishable from the input, so a copy is made only when at least one
// block actually changed.
//
// The selection is deliberately narrow:
//   * `type === "text"` and a string `text` field - the only rewritable
//     shape. Tool-call/argument blocks carry execution-critical raw JSON,
//     reasoning and image blocks are not the overpass's scope, and unknown
//     block types are passed through untouched.
//   * the CCR MARKER GUARD - a text block whose content already carries the
//     CCR spill marker (`<<<CCR:`) is a compressed replacement and passes
//     through untouched. The guard makes the arm order-safe against the CCR
//     hook's own prepended post-execute listener under ANY bundle load
//     order.
//
// The transform is INJECTED, not hardcoded: each flavor closes over its table
// and configured replacement, read per call from State so a volatile hot-edit
// lands on the next dispatch. It must be pure and total on any string and
// returns the family's `{ text, count }` contract; `count === 0` keeps the
// block by identity and contributes nothing to the accumulator.
//
// The accumulator is the caller's mutable `{ value }` box, so a step batch
// sums the counts across every message before composing ONE ledger line. The
// block shape is STRUCTURAL (only the two fields this function reads), so each
// consumer's own ContentBlock union satisfies it without importing a shared
// LLM type here.
//
// Pure per call: no module-level state, no mutation of the input blocks - a
// changed block is a shallow copy with only `text` replaced, preserving the
// rest of the block verbatim.
type Block = { type?: unknown; text?: unknown };

/** The CCR spill marker's opening bytes - content carrying them is a CCR
 *  replacement and passes through untouched (the order-safety guard). */
const CCRMarker = "<<<CCR:";

export default <T extends Block>(
	Content: readonly T[],
	Transform: (Text: string) => { text: string; count: number },
	Count: { value: number },
): T[] => {
	let Changed = false;
	const Next = Content.map((Block) => {
		switch (true) {
			case Block?.type !== "text" || typeof Block?.text !== "string":
				return Block; // never tool-call/argument, reasoning or unknown blocks
			case (Block.text as string).includes(CCRMarker):
				return Block; // the CCR marker guard
		}
		const Result = Transform(Block.text as string);
		switch (true) {
			case Result.count === 0:
				return Block;
		}
		Changed = true;
		Count.value += Result.count;
		return { ...Block, text: Result.text };
	});
	// Unchanged -> the ORIGINAL array by identity.
	return Changed ? Next : (Content as unknown as T[]);
};
