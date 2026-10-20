// Retrieve - the CCR_RETRIEVE tool (`ccr_retrieve`): the plugin's ONE
// registered ToolDefinition, the DSH analog of Aphrodite's
// `aphrodite_retrieve(hash)` relay (R§3: the 13 relays become 1). The model
// calls it with the hash from a marker to restore the original bytes; the
// optional `range` applies a granular line slice (R:199-203: prefer granular,
// batch retrievals) to the joined text.
//
// The contract:
//   * the hash is matched EXACTLY - no prefix or fuzzy matching (the marker
//     contract's rule); the full 24-hex string must be supplied;
//   * an unknown or expired hash is a SELF-DESCRIBING error (the registry
//     turns a thrown body into a failure result): the message tells the
//     model the entry is gone and to re-run the original tool;
//   * success returns the canonical value `{ hash, type, size, text }` -
//     `text` is the original content's text blocks newline-joined (the
//     marker's `size` still counts the FULL serialized bytes, so a range
//     result is shorter); `render` projects the text verbatim, so the model
//     sees the original bytes, not an envelope;
//   * every hit refreshes the entry's lastAccessed (the LRU clock) and logs
//     the retrieval; every miss logs the miss with its reason.
//
// The registration is READONLY after registration (the skill's rule): the
// definition object is never mutated - this file only BUILDS it; the
// registration call lives in Function/Apply (the wire-up, after the
// post-execute listener). `exec.signal` is honored: the registry rejects a
// pre-aborted invocation before the body runs, and the body rechecks.
import { defineTool } from "@deepseek-ai/dsh-tools";

import type State from "../Interface/State.js";
import { Text as Joined } from "./Classify.js";

export default (State: State) => {
	// The restored text for one call: the joined original, or the requested
	// line slice of it (0-based `start`, `count` lines from there; out-of-range
	// bounds clamp silently - a retrieval never fails for asking past the end).
	const Restored = (Text: string, Range: { start?: number; count?: number } | undefined) => {
		switch (true) {
			case Range === undefined:
				return Text;
		}
		const Lines = Text.split("\n");
		const Start = Math.max(0, Math.min(Range.start ?? 0, Lines.length));
		const Count = Math.max(
			0,
			Math.min(Range.count ?? Lines.length - Start, Lines.length - Start),
		);
		return Lines.slice(Start, Start + Count).join("\n");
	};

	return defineTool({
		name: "ccr_retrieve",
		description:
			"Retrieve the ORIGINAL content of a compressed tool result by its CCR hash. Some tool output arrives replaced by a short preview plus a marker like <<<CCR:<24hex>|<type>|<size>>>; pass the marker's 24-hex hash to restore the full original text. The hash is matched exactly - no prefix or fuzzy matching. Optionally pass range { start, count } for a granular slice: start is the 0-based line index (default 0) and count the number of lines from there (default to the end). Unknown or expired hashes return an error telling you to re-run the original tool.",
		parameters: {
			hash: {
				type: "string",
				required: true,
				description:
					"The 24-hex hash from the CCR marker (matched exactly, no prefix matching).",
			},
			range: {
				type: "object",
				additionalProperties: false,
				properties: {
					start: {
						type: "integer",
						description: "0-based line index to start from (default 0).",
					},
					count: {
						type: "integer",
						description:
							"Number of lines to return from start (default to the end of the content).",
					},
				},
				description:
					"Optional granular line slice of the restored text: { start, count }. Prefer granular retrievals for very large entries.",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					hash: { type: "string", required: true },
					type: { type: "string", required: true },
					size: { type: "integer", required: true },
					text: { type: "string", required: true },
				},
			},
			render: (_args, value) => [
				{
					type: "text",
					text: value.text,
				},
			],
		},
		async execute(args, exec) {
			if (exec.signal.aborted) throw new Error("aborted before retrieve");
			const Lookup = State.Store.Get(args.hash);
			if ("found" in Lookup) {
				const Entry = Lookup.found;
				State.Factory.Append(State, `retrieved ${Entry.hash}`);
				return {
					hash: Entry.hash,
					type: Entry.type,
					size: Entry.size,
					text: Restored(Joined(Entry.content), args.range),
				};
			}
			switch (Lookup.gone) {
				case "expired": {
					State.Factory.Append(State, `retrieval miss ${args.hash} (expired)`);
					throw new Error(
						`CCR entry ${args.hash} has expired (its TTL elapsed) and is gone from the store. Re-run the original tool to regenerate the output; there is no prefix or fuzzy matching - the full 24-hex hash must be supplied.`,
					);
				}
				default: {
					State.Factory.Append(State, `retrieval miss ${args.hash} (unknown)`);
					throw new Error(
						`CCR entry ${args.hash} is not in the store (never stored, evicted by the budget, or lost in a restart without a journal). Re-run the original tool to regenerate the output; there is no prefix or fuzzy matching - the full 24-hex hash must be supplied.`,
					);
				}
			}
		},
	});
};
