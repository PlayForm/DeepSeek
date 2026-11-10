/**
 * @module Target
 *
 * One resolved target of a proposal: the path, its version, and why it is in
 * the batch.
 *
 * @remarks
 * Plan section 3. The version is the content snapshot token.
 */
export default interface Target {
    /**
     * Absolute path of the target file.
     */
    path: string;
    /**
     * The version token: the sha256 of the file's content at prepare time
     * (the fence the ingester checks before applying).
     */
    version: string;
    /**
     * Why the target is in the batch (the kind's reason).
     */
    why: string;
}
