declare const _default: {
    format(Hash: string, Type: string, Size: number): string;
    parse(Line: string): {
        hash: string;
        type: string;
        size: number;
    } | null;
};
export default _default;
