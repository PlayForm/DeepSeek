// Pack - one workspace pack: the marker paths that identify the repo, the
// families keyed by the domain-qualified id, the indexer scope, the policy
// allowlist, the learning settings, and the `extends` chain. EVERY section is
// optional: a pack may declare only its signature, only its families, or
// only a learning policy. A missing pack means the built-in pack (this
// monorepo) and, outside its signature, silence.
//
// A pack file is read from two layers (D2):
//   <home>/.dsh/playform/workspaces/<repo-slug>.yml   the user layer, read first
//   <repo>/.dsh/pack.yml                              the repo layer, overrides
// and may `extends:` another user-layer pack (the base is merged underneath).
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
