// Chunk - the THIN WRAPPER: the spaces hook's per-chunk dispatch, now
// delegated to the CORE's generic per-chunk dispatch with the transform
// INJECTED. The dispatch structure (which chunk types, which fields, the
// identity passthroughs, the reasoning gate, the tool-args gate - three-way
// since the edit exemption and the per-call raw marker: a delta whose
// `name` is "edit" passes through BY IDENTITY, and a call whose arguments
// open with the `{"__normalize":false` marker passes through UNNORMALIZED
// with the marker stripped) lives in @playform/ets-hook-dsh-core's
// Stream/Chunk; this file supplies only the flavor - a closure that applies
// the spaces hook's Spaces class and its configured replacement to one text
// segment - plus the three config values the generic signature needs (the
// replacement, the reasoning gate and the tool-args gate) and the per-call
// `Raw` marker flag the stream wrapper (Function/Normalize) tracks by
// tool-call id.
//
// The behavior is byte-identical to a hand-rolled in-file implementation -
// the spaces smoke is the arbiter.
import { Chunk as CoreChunk } from "@playform/ets-dsh-hook";
import Replace from "./Replace.js";
import type { StreamChunk } from "@deepseek-ai/dsh-llm";

export default (
	Input: StreamChunk,
	Replacement: string,
	Reasoning: boolean,
	ToolArgs: boolean,
	Raw: boolean,
): { chunk: StreamChunk; count: number } =>
	CoreChunk(Input, (Text) => Replace(Text, Replacement), Reasoning, ToolArgs, Raw);
