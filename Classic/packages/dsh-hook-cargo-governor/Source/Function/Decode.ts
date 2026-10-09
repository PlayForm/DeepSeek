// Decode — parse a Cargo.toml string and IDENTIFY the dependency tables
// (parsing-only: the rewrite is Function/Pin's surgical line manipulation on
// the raw text). Null on any failure or on a non-table root — an unreadable
// or non-TOML manifest maps to null instead of a throw (the caller logs the
// "observed non-JSON/TOML Cargo.toml … — skipped" line).
//
// Identified shapes (Cargo.toml semantics):
//   * the static tables from Variable/Section: [dependencies],
//     [dev-dependencies], [build-dependencies], and [workspace.dependencies]
//     (the SHARED dep table — a Cargo.toml can define versions THERE instead
//     of in [dependencies]; the module handles both);
//   * every [target.<target>.dependencies] table and its dev/build variants
//     (the dynamic target-specific shape, e.g.
//     [target.'cfg(windows)'.dependencies] and
//     [target.'cfg(unix)'.dev-dependencies]).
//
// Entry values are passed through untouched: a string (the version
// requirement — bare string = Cargo's implicit caret), a table with a
// `version` key, an inherited table ({ workspace: true }, parsed from both
// `dep.workspace = true` and `dep = { workspace = true }`), or a path/git
// entry (no version key). Classification is the chain pass's job
// (Function/Satisfy); identification only records what exists.
//
// Pure internal calculation — one of the standing exemptions.
import ParseToml from "./ParseToml.js";
import Section from "@Variable/Section.js";
import type Manifest from "@Interface/Manifest.js";

export default (Text: unknown): Manifest | null => {
	const Data = ParseToml(Text);
	switch (true) {
		case !Data || typeof Data !== "object":
			return null;
	}
	const Sections: Manifest["sections"] = [];
	const IsTable = (Value: unknown): Value is Record<string, unknown> =>
		!!Value && typeof Value === "object" && !Array.isArray(Value);
	for (const Name of Section) {
		let Node: unknown = Data;
		for (const Part of Name.split(".")) {
			Node = IsTable(Node) ? Node[Part] : null;
		}
		switch (true) {
			case IsTable(Node):
				Sections.push({ path: Name, deps: Node as Record<string, unknown> });
				break;
		}
	}
	// The dynamic target tables: [target.<target>.dependencies] and its
	// dev/build variants ([target.'cfg(...)'.dev-dependencies] etc.). The raw
	// header's quoted segments ('cfg(windows)') are unquoted by the TOML
	// parser, so the normalized path is "target.<target>.<kind>" — exactly the
	// form Function/Pin reconstructs from the raw header lines.
	const Targets = Data["target"];
	switch (true) {
		case IsTable(Targets):
			for (const [Name, Value] of Object.entries(Targets as Record<string, unknown>)) {
				switch (true) {
					case !IsTable(Value):
						continue;
				}
				for (const Kind of ["dependencies", "dev-dependencies", "build-dependencies"]) {
					const Deps = (Value as Record<string, unknown>)[Kind];
					switch (true) {
						case IsTable(Deps):
							Sections.push({
								path: `target.${Name}.${Kind}`,
								deps: Deps as Record<string, unknown>,
							});
							break;
					}
				}
			}
			break;
	}
	return { sections: Sections };
};
