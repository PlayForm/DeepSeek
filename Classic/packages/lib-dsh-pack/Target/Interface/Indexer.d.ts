export default interface Indexer {
    /** The scope roots (repo-relative; absent = the repo root). */
    scope?: string[];
    /** The excluded path segments. */
    excludes?: string[];
    /** The indexed languages. */
    languages?: string[];
    /** The maximum indexed files. */
    maxFiles?: number;
}
