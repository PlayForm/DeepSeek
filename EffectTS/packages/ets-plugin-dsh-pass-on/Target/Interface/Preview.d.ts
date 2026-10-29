export default interface Preview {
    /** Absolute path of the target file. */
    path: string;
    /** The bounded before text (the matched lines). */
    before: string;
    /** The bounded after text (the same lines, transformed). */
    after: string;
}
