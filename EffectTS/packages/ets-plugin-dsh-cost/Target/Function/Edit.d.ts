type Hunk = {
    Ordinal: number;
    LinesAdded: number;
    LinesRemoved: number;
    BytesAdded: number;
    BytesRemoved: number;
    At: number;
};
export default _default;
declare function _default(Tool: string, Arguments: string, At: number): readonly Hunk[];
