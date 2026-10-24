// Indexer - the pack's indexer section: the scope, the excluded segments,
// the indexed languages and the file bound. Every field is optional; a later
// wave's indexer consumes the section, the suggester family only carries it.
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
