import type KindSpec from "@Interface/KindSpec.js";

/**
 * @module Kinds
 *
 * The shipped kind catalog (data, not code).
 *
 * @remarks
 *
 * The apply logic lives in Function/Operate and switches on the kind name;
 * unknown kinds are rejected at prepare time.
 */
/**
 * The shipped kind catalog, keyed by kind name.
 */
export const DEFAULT_KINDS: Record<string, KindSpec> = {
	// The version bump: every package.json's version field.
	"version-bump": { globs: ["**/package.json"], param: "version" },
	// The generic field set: an exact string field in a JSON file.
	"set-field": { globs: ["**/package.json"], param: "field" },
	// The generic literal replace: params.find -> params.replace, applied to
	// the intent's explicit targets only.
	replace: { globs: [], param: "find" },
};
