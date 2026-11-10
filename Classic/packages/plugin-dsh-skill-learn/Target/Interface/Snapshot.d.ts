/**
 * @module Snapshot
 *
 * One whole-tree snapshot manifest.
 *
 * @remarks
 *
 * A snapshot names content instead of copying it: every file's bytes already live in the
 * blob store, so a snapshot of an unchanged corpus costs one small JSON file, and a
 * rotation can drop a manifest without losing a byte that a retained ledger row still
 * references. The manifest is therefore the unit a restore and a rotation reason about,
 * and the blob sweep is what reconciles the two.
 *
 * The file entry is its own type rather than the ledger's, because the two are separate
 * on-disk formats with separate rotations: sharing one type would let a change to a
 * ledger row silently rewrite the manifest schema that a restore depends on.
 */
/**
 * One file a manifest names.
 */
export interface SnapshotFile {
    /**
     * The absolute path the bytes belong to.
     */
    readonly path: string;
    /**
     * The content address of the bytes in the blob store.
     */
    readonly sha256: string;
}
/**
 * The manifest as it is written to `<snapshotRoot>/<id>.json`.
 */
export interface SnapshotManifest {
    /**
     * `<YYYY-MM-DD>T<HH-MM-SSZ>`, with `-01` and `-02` appended on a same-second collision.
     */
    readonly id: string;
    /**
     * Why the snapshot was taken, which is how a rotation knows not to prune the one being restored.
     */
    readonly reason: string;
    /**
     * ISO-8601 UTC, the moment the capture started.
     */
    readonly createdAt: string;
    /**
     * Every file the corpus held, at capture time.
     */
    readonly files: readonly SnapshotFile[];
    /**
     * How many of those files were `SKILL.md` files, so a manifest states its own shape.
     */
    readonly skillFiles: number;
    /**
     * The total bytes the manifest names, so a rotation can report what it holds.
     */
    readonly bytes: number;
}
