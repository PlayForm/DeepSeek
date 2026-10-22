// Kinds - the shipped kind catalog (data, not code). The apply logic lives
// in Function/Operate and switches on the kind name; unknown kinds are
// rejected at prepare time.
import type KindSpec from "@Interface/KindSpec.js";

export const DEFAULT_KINDS: Record<string, KindSpec> = {
	// The version bump: every package.json's version field.
	"version-bump": { globs: ["**/package.json"], param: "version" },
	// The generic field set: an exact string field in a JSON file.
	"set-field": { globs: ["**/package.json"], param: "field" },
	// The generic literal replace: params.find -> params.replace, applied to
	// the intent's explicit targets only.
	replace: { globs: [], param: "find" },
};
