type Block = {
    type?: unknown;
    text?: unknown;
};
export default _default;
declare function _default<T extends Block>(Content: readonly T[], Transform: (Text: string) => {
    text: string;
    count: number;
}, Count: {
    value: number;
}): T[];
