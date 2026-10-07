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
export default _default;
declare function _default<T extends BlockShape>(Input: T, Replace: (Text: string) => {
    text: string;
    count: number;
}, ToolArgs?: boolean, Raw?: boolean): {
    block: T;
    count: number;
};
