type Block = {
    type?: unknown;
    text?: unknown;
};
declare const _default: <T extends Block>(Content: readonly T[], Transform: (Text: string) => {
    text: string;
    count: number;
}, Count: {
    value: number;
}) => T[];
export default _default;
