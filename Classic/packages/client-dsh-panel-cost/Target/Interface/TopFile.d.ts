/**
 * @module TopFile
 *
 * One entry of the summary's top files.
 *
 * @remarks
 *
 * The shape is the Design.md section 9.8 one: the file's allocated money for the session and the
 * number of the session's calls that allocated it, ordered descending by total then ascending by
 * path.
 */
export default interface CostTopFile {
    /**
     * The file's full path.
     */
    path: string;
    /**
     * The direct money the calls allocated to the file.
     */
    direct: number;
    /**
     * The amortized money the calls allocated to the file.
     */
    amortized: number;
    /**
     * The sum of the direct and amortized money.
     */
    total: number;
    /**
     * How many of the session's calls allocated money to the file.
     */
    calls: number;
}
