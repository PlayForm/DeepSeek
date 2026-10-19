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
