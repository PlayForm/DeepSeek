// Defaults - the hook's former EMBEDDED PATTERN PACK (a Variable: one
// constant), kept as the domain's RETIRED reference table.
//
// RETIRED FROM THE HOT PATH: nothing imports this module any more. The
// candidates come from the workspace graph query
// (`ctx.workspaceGraph.neighborhood(anchor, limit)`), synthesized into the
// `Neighborhood` and `Sibling` intents per call by Function/Apply, and the
// literal target sets below are NEVER a fallback source: an empty component
// abstains `abstained no-companions` instead of naming a path, and an absent
// or throwing service abstains `abstained graph-unavailable`. The file stays
// because the pack is still the documented shape of a suggester domain
// (SEARCH-SUGGESTER-PLUGIN.md §8.2); this package no longer projects it into
// the hot path.
//
// The intents, priority-ordered (lower wins) as they were:
//
//   Neighborhood - "what is connected to this file": a read of a TS source
//                  or a symbol-shaped grep -> the graph query's connected
//                  component (the definition, the callers, the tests, the
//                  doc block).
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
			// The retired literal target set: never consulted, never a fallback.
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
			// The retired literal target set: never consulted, never a fallback.
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
