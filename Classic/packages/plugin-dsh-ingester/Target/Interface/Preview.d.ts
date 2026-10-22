export default interface Preview {
    /** Absolute path of the target file. */
    path: string;
    /** The bounded before text. */
    before: string;
    /** The bounded after text. */
    after: string;
}
