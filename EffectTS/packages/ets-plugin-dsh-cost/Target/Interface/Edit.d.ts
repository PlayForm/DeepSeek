export default interface Hunk {
    readonly Ordinal: number;
    readonly LinesAdded: number;
    readonly LinesRemoved: number;
    readonly BytesAdded: number;
    readonly BytesRemoved: number;
    readonly At: number;
    readonly Basis?: string;
}
