export default _default;
declare function _default(Seen: Map<string, {
    version: string;
    at: number;
}>, Path: string, Version: string, Now: () => number, Span?: number, Cap?: number): boolean;
