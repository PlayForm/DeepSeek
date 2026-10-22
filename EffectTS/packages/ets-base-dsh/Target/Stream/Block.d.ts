type BlockShape = {
    type: "text";
    text: string;
} | {
    type: "reasoning";
    text?: string | undefined;
} | {
    type: "tool-call";
    name?: string;
    arguments?: string;
} | {
    type: string;
};
declare const _default: <T extends BlockShape>(Input: T, Replace: (Text: string) => {
    text: string;
    count: number;
}, ToolArgs?: boolean, Raw?: boolean, Conversation?: boolean) => {
    block: T;
    count: number;
};
export default _default;
