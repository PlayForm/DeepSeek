// Block - the THIN WRAPPER: the invisible hook's block-end normalizer, now
// delegated to the CORE's generic block-end normalizer with the transform
// INJECTED. The dispatch structure (TextBlock.text, ReasoningBlock.text +
// the runtime `thinking` defense, ToolCallBlock.arguments gated by the
// tool-args flag - three-way since the edit exemption and the per-call raw
// marker: a block whose `name` is "edit" passes through BY IDENTITY, and a
// raw-marked block passes through UNNORMALIZED with the marker stripped -
// everything else by identity) lives in @playform/ets-hook-dsh-core's
// Stream/Block; this file supplies only the flavor - a closure that applies
// the invisible hook's Invisible class and its configured replacement
// (default "" - REMOVAL) to one text segment - plus the per-call `Raw`
// marker flag forwarded by the per-chunk dispatch so the deltas AND the
// block agree.
//
// The behavior is the CLASS flavor of the family's dispatch (the dash
// template shape, with the Invisible class substituted for Dashes) - the
// invisible smoke is the arbiter.
import { Block as CoreBlock } from "@playform/ets-base-dsh";
import Replace from "./Replace.js";
import type { ContentBlock } from "@deepseek-ai/dsh-llm";

export default (
	Input: ContentBlock,
	Replacement: string,
	ToolArgs: boolean,
	Raw: boolean,
): { block: ContentBlock; count: number } =>
	CoreBlock(Input, (Text) => Replace(Text, Replacement), ToolArgs, Raw);
