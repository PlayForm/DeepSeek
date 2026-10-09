import type { StreamChunk } from "@deepseek-ai/dsh-llm";
export default _default;
declare function _default(Input: StreamChunk, Replacement: string, Reasoning: boolean, ToolArgs: boolean, Raw: boolean): {
    chunk: StreamChunk;
    count: number;
};
