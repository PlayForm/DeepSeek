export default interface Snapshot {
    version: 1;
    savedAt: number;
    patterns: import("./Pattern.js").default[];
}
