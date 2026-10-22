// Defaults - the hook's EMBEDDED PATTERN PACK (a Variable: one constant).
// The plan's pack-as-data contract (SEARCH-SUGGESTER-PLUGIN.md §8.2), the
// graph consumer's projection (§9.2): the target subgraph becomes a graph
// query, and the suggestion is the instantiated neighborhood rather than a
// flat list. The regexes are sources here and compiled once at apply
// (Function/Apply) - the hot path never compiles one.
//
// The intents, priority-ordered (lower wins):
//
//   Neighborhood - "what is connected to this file": a read of a TS source
//                  or a symbol-shaped grep -> the graph query's connected
//                  component (the definition, the callers, the tests, the
//                  doc block). Requires the workspace graph service; a
//                  static fallback set is used only when the graph returns
//                  an empty component (never when it is absent - see
//                  Function/Apply).
//   Sibling      - "which package owns/siblings this": a package-name grep
//                  -> the family roster and the sibling packages' docs.
import type Pack from "@Interface/Pack.js";

export default {
	pack: "graph",
	version: 1,
	intents: [
		{
			id: "Neighborhood",
			priority: 1,
			threshold: 0.6,
			signals: [
				{
					rule: "path-shape",
					pattern: 'Source/[^\\"]+\\.ts',
					weight: 0.4,
				},
				{
					rule: "symbol-shape",
					pattern: "const |export |function |class |interface ",
					weight: 0.5,
				},
				{
					rule: "glob-shape",
					pattern: "\\*\\*/\\*\\.ts",
					weight: 0.3,
				},
			],
			// The STATIC fallback set, used only when the graph service answers
			// with an empty component. The graph's entries are prepended ahead
			// of these in the note.
			targets: [
				{
					path: "Source/Interface/*.ts",
					reason: "the type shapes connected to the anchor",
					prior: 0.6,
				},
				{
					path: "Source/Function/*.ts",
					reason: "the sibling definitions in the same layer",
					prior: 0.6,
				},
				{
					path: "Source/Test/<Suite>/Test.ts",
					reason: "the suite that asserts the anchor",
					prior: 0.6,
				},
			],
			note: "the neighborhood is the connected component: definition, callers, tests, doc block.",
		},
		{
			id: "Sibling",
			priority: 2,
			threshold: 0.5,
			signals: [
				{
					rule: "usage-shape",
					pattern: "hook-dsh-|plugin-dsh-|@playform/",
					weight: 0.5,
				},
				{
					rule: "family-shape",
					pattern: "PLUGIN-FAMILY|inventory",
					weight: 0.3,
				},
			],
			targets: [
				{
					path: "Documentation/Plugins/PLUGIN-FAMILY.md",
					reason: "the family roster",
					prior: 1.0,
				},
				{
					path: "Documentation/Skill/plugin-system/references/inventory.md",
					reason: "the package inventory",
					prior: 1.0,
				},
				{
					path: "**/README.md",
					reason: "the sibling package's own README",
					prior: 0.6,
				},
			],
			note: "check the family roster before assuming a package exists or is wired.",
		},
	],
} satisfies Pack;
