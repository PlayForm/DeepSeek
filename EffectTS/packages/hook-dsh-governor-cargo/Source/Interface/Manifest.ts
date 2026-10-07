// Manifest — one parsed Cargo.toml AS THE CARGO MODULE SEES IT: not the raw
// smol-toml value (the rewrite is surgical line-level string manipulation on
// the raw text — a TOML stringify would destroy comments and formatting), but
// the IDENTIFICATION the parse is used for (Function/Decode): the dependency
// tables and their entries. Only these tables are ever touched; every other
// section is the author's own (the refusal guard fires if the module's own
// logic would change one).
//
// A `path = "…"` or `git = "…"` entry (no version key) and an inherited entry
// (`workspace = true`, parsed from both `dep.workspace = true` and
// `dep = { workspace = true }`) are identified but never rewritten here —
// the version lives elsewhere (the workspace table for inherited entries,
// nowhere locally for path/git entries).
export default interface Manifest {
	/** The identified dependency tables. */
	sections: Array<{
		/** Normalized dotted section path as it appears in the raw text, with
		 *  quoted segments unquoted: "dependencies", "dev-dependencies",
		 *  "build-dependencies", "workspace.dependencies",
		 *  "target.cfg(windows).dependencies". */
		path: string;
		/** Dep name → the parsed entry value: a string (the version requirement)
		 *  or a table ({ version: "…", features: [...] } | { workspace: true } |
		 *  { path: "…" } | { git: "…", rev: "…" } | …). */
		deps: Record<string, unknown>;
	}>;
}
