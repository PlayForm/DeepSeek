// Block - the THIN WRAPPER: the quotes hook's block-end normalizer, now
// delegated to the CORE's generic block-end normalizer with the transform
// INJECTED. The dispatch structure (TextBlock.text, ReasoningBlock.text +
// the runtime `thinking` defense, ToolCallBlock.arguments gated by the
// tool-args flag - three-way since the edit exemption and the per-call raw
// marker: a block whose `name` is "edit" passes through BY IDENTITY, and a
// raw-marked block passes through UNNORMALIZED with the marker stripped -
// everything else by identity) lives in @playform/hook-dsh-core's
// Stream/Block; this file supplies only the flavor - the quotes transform
// (the ReplaceMap over the Quotes map) - plus the per-call `Raw` marker
// flag forwarded by the per-chunk dispatch so the deltas AND the block
// agree. A MAP flavor has NO replacement knob: the substitution is the
// table itself.
//
// The behavior is byte-identical to a hand-rolled in-file implementation -
// the quotes smoke is the arbiter.
import { Block as CoreBlock } from "@playform/hook-dsh-core";
import Replace from "./Replace.js";
import type { ContentBlock } from "@deepseek-ai/dsh-llm";

export default (
	Input: ContentBlock,
	ToolArgs: boolean,
	Raw: boolean,
): { block: ContentBlock; count: number } => CoreBlock(Input, Replace, ToolArgs, Raw);
