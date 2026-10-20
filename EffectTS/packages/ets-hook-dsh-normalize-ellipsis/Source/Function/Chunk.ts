// Chunk - the THIN WRAPPER: the ellipsis hook's per-chunk dispatch, now
// delegated to the CORE's generic per-chunk dispatch with the transform
// INJECTED. The dispatch structure (which chunk types, which fields, the
// identity passthroughs, the reasoning gate, the tool-args gate - three-way
// since the edit exemption and the per-call raw marker: a delta whose
// `name` is "edit" passes through BY IDENTITY, and a call whose arguments
// open with the `{"__normalize":false` marker passes through UNNORMALIZED
// with the marker stripped) lives in @playform/ets-base-dsh's
// Stream/Chunk; this file supplies only the flavor - a closure that applies
// the ellipsis hook's Ellipsis class and its configured replacement to one
// text segment - plus the three config values the generic signature needs
// (the replacement, the reasoning gate and the tool-args gate) and the
// per-call `Raw` marker flag the stream wrapper (Function/Normalize)
// tracks by tool-call id.
//
// The behavior is byte-identical to a hand-rolled in-file implementation -
// the ellipsis smoke is the arbiter.
import type { StreamChunk } from "@deepseek-ai/dsh-llm";
import { Chunk as CoreChunk } from "@playform/ets-base-dsh";

import Replace from "./Replace.js";

export default (
	Input: StreamChunk,
	Replacement: string,
	Reasoning: boolean,
	ToolArgs: boolean,
	Raw: boolean,
	// The conversation scope gate (default ON = the previous behavior):
	// forwarded to the core dispatch, which passes text-delta text and
	// text/reasoning blocks through by identity while it is off.
	Conversation = true,
): { chunk: StreamChunk; count: number } =>
	CoreChunk(Input, (Text) => Replace(Text, Replacement), Reasoning, ToolArgs, Raw, Conversation);
