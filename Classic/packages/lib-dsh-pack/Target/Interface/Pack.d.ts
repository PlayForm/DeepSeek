import type Family from "./Family.js";
import type Indexer from "./Indexer.js";
import type Learning from "./Learning.js";
import type Policy from "./Policy.js";
export default interface Pack {
    /** The repo slug override (absent = the repo root's basename, lowercased). */
    slug?: string;
    /** The marker paths that identify the repo (absent = the built-in marker). */
    signature?: string[];
    /** The families, keyed by `<domain>/<family-id>`. */
    families?: Record<string, Family>;
    /** The indexer scope/excludes/languages/maxFiles. */
    indexer?: Indexer;
    /** The per-action allowlist. */
    policy?: Policy;
    /** The learning settings. */
    learning?: Learning;
    /** The base pack name(s) to merge underneath this one (cycle-guarded). */
    extends?: string | string[];
}
