// Chunk - the THIN WRAPPER: the quotes hook's per-chunk dispatch, now
// delegated to the CORE's generic per-chunk dispatch with the transform
// INJECTED. The dispatch structure (which chunk types, which fields, the
// identity passthroughs, the reasoning gate, the tool-args gate - three-way
// since the edit exemption and the per-call raw marker: a delta whose
// `name` is "edit" passes through BY IDENTITY, and a call whose arguments
// open with the `{"__normalize":false` marker passes through UNNORMALIZED
// with the marker stripped) lives in @playform/ets-hook-dsh-core's
// Stream/Chunk; this file supplies only the flavor - the quotes transform
// (the ReplaceMap over the Quotes map) - plus the two config values the
// generic signature needs (the reasoning gate and the tool-args gate) and
// the per-call `Raw` marker flag the stream wrapper (Function/Normalize)
// tracks by tool-call id. A MAP flavor has NO replacement knob: the
// substitution is the table itself.
//
// The behavior is byte-identical to a hand-rolled in-file implementation -
// the quotes smoke is the arbiter.
import { Chunk as CoreChunk } from "@playform/ets-dsh-hook";
import Replace from "./Replace.js";
import type { StreamChunk } from "@deepseek-ai/dsh-llm";

export default (
	Input: StreamChunk,
	Reasoning: boolean,
	ToolArgs: boolean,
	Raw: boolean,
): { chunk: StreamChunk; count: number } => CoreChunk(Input, Replace, Reasoning, ToolArgs, Raw);
