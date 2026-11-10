/**
 * @module TopFile
 *
 * One entry of the summary's top files: the file's allocated money for the
 * session and the number of the session's calls that allocated it.
 *
 * @remarks
 *
 * The entry follows Design.md section 9.8. The list is ordered descending by
 * total then ascending by path.
 */
export default interface CostTopFile {
    /**
     * The file's path as the ledger recorded it.
     */
    path: string;
    /**
     * The session's direct money for the file.
     */
    direct: number;
    /**
     * The session's amortized money for the file.
     */
    amortized: number;
    /**
     * The direct and amortized money summed.
     */
    total: number;
    /**
     * The session's calls that allocated to the file.
     */
    calls: number;
}
