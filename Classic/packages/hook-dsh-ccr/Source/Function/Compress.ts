// Compress - the GATE: the pure decision of whether one tool result gets
// compressed, stored-only (auto-expand), or passed through (plan §2). Given
// the tool name, the failure flag and the result's content blocks it returns
// a verdict the Apply stage turns into ledger lines and (for `replace`) the
// preview + marker decision:
//
//   1. empty content            → pass (Aphrodite skips empty);
//   2. exempt tool              → pass (execution-critical mutators and their
//                                 own echo, the plugin's own retrieval tool,
//                                 another agent's brief, a user gate);
//   3. a failure, and           → pass (failures pass through unchanged
//      compressFailures is off     unless compressFailures - the error ×8
//                                 tier is the only beneficiary);
//   4. name not in targets      → pass (the allow-list: nothing outside the
//                                 terminal/search/fetch family is touched);
//   5. size at or under the     → pass (the byte gate: thresholdBytes times
//      type's multiplier           the classified type's multiplier - errors
//                                 compress late at ×8, grep/paths/web early
//                                 at ×2, the rest at parity);
//   6. over the gate            → store the entry, then either
//                                 a. `store`  - auto-expand is on and the size
//                                    is at or under autoExpandLimitBytes: the
//                                    FULL original content returns, no marker
//                                    reaches the model, the entry is still
//                                    retrievable; or
//                                 b. `replace` - the preview + marker content.
//
// The store work (deep-copy, insert, eviction sweep) happens here because the
// eviction and TTL lines are inseparable from the decision; the ledger STRINGS
// stay module-side in Apply. The content basis is the caller's: post-execute
// hands the content a downstream listener may have already enriched
// (`decision.content ?? result.content`, the spill-policy precedent) - the
// store keeps what the model would have seen.
import Classify from "./Classify.js";
import Hash from "./Hash.js";
import Preview from "./Preview.js";
import type { Eviction } from "./Store.js";
import type State from "@Interface/State.js";
import type { ContentBlock } from "@deepseek-ai/dsh-llm";

// The verdict: pass, store-only (auto-expand), or replace (preview + marker).
export type Verdict =
	| { action: "pass" }
	| { action: "store"; type: string; size: number; hash: string; evicted: Eviction[] }
	| {
			action: "replace";
			type: string;
			size: number;
			hash: string;
			preview: string;
			evicted: Eviction[];
	  };

export default (State: State, Name: string, IsError: boolean, Content: ContentBlock[]): Verdict => {
	// 1. Empty content - nothing to compress, nothing to retrieve.
	if (Content.length === 0) return { action: "pass" };
	// 2. The exemption list - byte-identical pass-through, always.
	if (State.Exempt.includes(Name)) return { action: "pass" };
	// 3. Failures pass through unless compressFailures.
	if (IsError && !State.Failures) return { action: "pass" };
	// 4. The target allow-list.
	if (!State.Targets.includes(Name)) return { action: "pass" };
	// The classified type (an error result classifies as `error`, the ×8 tier).
	const Type = Classify(Name, IsError, Content);
	// 5. The byte gate: thresholdBytes × the type's multiplier; over it, compress.
	const Serialized = JSON.stringify(Content);
	const Size = Buffer.byteLength(Serialized, "utf8");
	const Multipliers = State.Multipliers ?? ({} as State["Multipliers"]);
	const Multiplier = Multipliers[Type as keyof typeof Multipliers] ?? Multipliers.default ?? 1;
	if (!(Size > State.Threshold * Multiplier)) return { action: "pass" };
	// 6. Store: the hash of the FULL serialized bytes, the deep-copied content
	// (the result object is read-only and caller-owned), the TTL stamp, and the
	// live budget (volatile: read at every insert).
	const Hash24 = Hash(Serialized);
	State.Store.BudgetBytes = State.Budget;
	const Evicted = State.Store.Put({
		hash: Hash24,
		type: Type,
		size: Size,
		content: JSON.parse(Serialized) as ContentBlock[],
		createdAt: Date.now(),
		ttlAt: Date.now() + State.Ttl * 1000,
		lastAccessed: Date.now(),
	});
	// The auto-expand branch: store + full content, no marker.
	if (State.AutoExpand && Size <= State.AutoExpandLimit) {
		return { action: "store", type: Type, size: Size, hash: Hash24, evicted: Evicted };
	}
	// The replacement: preview line + marker.
	return {
		action: "replace",
		type: Type,
		size: Size,
		hash: Hash24,
		preview: Preview(Type, Content, State.PreviewMax),
		evicted: Evicted,
	};
};
