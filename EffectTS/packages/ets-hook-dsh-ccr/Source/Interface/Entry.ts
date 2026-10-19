// Entry - one CCR store record: the original content of ONE compressed tool
// result, keyed by its hash. The shape the LRU keeps, the JSONL journal
// serializes (payload base64) and the retrieval tool restores.
//
//   hash         - the sha256-24 key of the FULL serialized content bytes
//                  (Function/Hash; lowercase hex, no prefix or fuzzy matching);
//   type         - the classifier verdict (Function/Classify: terminal, grep,
//                  paths, file, json, web, default - or error for failures);
//   size         - the byte length of the serialized content (the gate's
//                  input, the marker's third field, the LRU's accounting unit);
//   content      - the ORIGINAL content blocks, deep-copied at store time (the
//                  result object handed to post-execute is read-only and
//                  caller-owned - the store must own its own copy);
//   createdAt    - the insert instant (epoch ms);
//   ttlAt        - createdAt + ttlSeconds*1000, the eviction deadline (Get
//                  drops an entry at or past it);
//   lastAccessed - refreshed on every successful retrieval; the LRU victim is
//                  the smallest value (Function/Store).
//
// The journal record is the projection { hash, type, size, ttlAt, payload }
// - payload is the base64 of the content's JSON serialization; createdAt /
// lastAccessed are memory-only (a reload restarts the LRU clock).
import type { ContentBlock } from "@deepseek-ai/dsh-llm";

export default interface Entry {
	/** The sha256-24 key of the full serialized content bytes. */
	hash: string;
	/** The classifier verdict (the 7 tool types, or error for failures). */
	type: string;
	/** Byte length of the serialized content (the gate input, the marker field). */
	size: number;
	/** The ORIGINAL content blocks, deep-copied at store time. */
	content: ContentBlock[];
	/** Insert instant (epoch ms). */
	createdAt: number;
	/** Eviction deadline: createdAt + ttlSeconds * 1000. */
	ttlAt: number;
	/** Refreshed on every successful retrieval; the LRU eviction order. */
	lastAccessed: number;
}
