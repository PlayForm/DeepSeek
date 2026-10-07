import type { ContentBlock } from "@deepseek-ai/dsh-llm";
export default _default;
declare function _default(Input: ContentBlock, Replacement: string, ToolArgs: boolean, Raw: boolean): {
    block: ContentBlock;
    count: number;
};
