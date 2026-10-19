// Hash - the store key: SHA-256 (node:crypto) of the FULL serialized content
// bytes, truncated to the FIRST 24 hex characters (96 bits).
//
// The plan's decision (§3): BLAKE3 (Aphrodite's 40-hex digest) needs a
// wasm/native dependency - the family is zero-framework TypeScript and
// `node:crypto` is free; 24 hex is collision-safe at the LRU's practical
// entry counts and keeps markers short. The hash is lowercase hex and is
// matched EXACTLY on retrieval - no prefix or fuzzy matching (the marker
// contract's rule carries over).
//
// `update(string)` hashes the UTF-8 encoding of the serialized content -
// exactly the bytes `Buffer.byteLength(Serialized)` counts, so the hash and
// the size in the marker always describe the same bytes.
import { createHash } from "node:crypto";

export default (Serialized: string): string =>
	createHash("sha256").update(Serialized).digest("hex").slice(0, 24);
