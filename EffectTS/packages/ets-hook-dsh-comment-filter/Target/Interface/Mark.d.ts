export default interface Mark {
    /** The open block comment's closing token while inside one. */
    Block?: string | undefined;
    /** The open Python triple-quoted string's delimiter. */
    Triple?: string | undefined;
    /** True while inside a backtick template literal. */
    Backtick?: boolean | undefined;
    /** True while inside a Ruby =begin/=end block. */
    Ruby?: boolean | undefined;
}
