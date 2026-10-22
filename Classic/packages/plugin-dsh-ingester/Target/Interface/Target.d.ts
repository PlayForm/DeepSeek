export default interface Target {
    /** Absolute path of the target file. */
    path: string;
    /** The version token: the sha256 of the file's content at prepare time
     *  (the fence checked before applying). */
    version: string;
    /** Why the target is in the batch. */
    why: string;
}
