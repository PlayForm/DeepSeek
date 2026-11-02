export interface SnapshotFile {
    /** The absolute path the bytes belong to. */
    readonly path: string;
    /** The content address of the bytes in the blob store. */
    readonly sha256: string;
}
export interface SnapshotManifest {
    /** `<YYYY-MM-DD>T<HH-MM-SSZ>`, with `-01` and `-02` appended on a same-second collision. */
    readonly id: string;
    /** Why the snapshot was taken, which is how a rotation knows not to prune the one being restored. */
    readonly reason: string;
    /** ISO-8601 UTC, the moment the capture started. */
    readonly createdAt: string;
    /** Every file the corpus held, at capture time. */
    readonly files: readonly SnapshotFile[];
    /** How many of those files were `SKILL.md` files, so a manifest states its own shape. */
    readonly skillFiles: number;
    /** The total bytes the manifest names, so a rotation can report what it holds. */
    readonly bytes: number;
}
