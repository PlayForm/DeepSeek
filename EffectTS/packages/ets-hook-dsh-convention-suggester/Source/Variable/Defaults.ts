// Defaults - the hook's EMBEDDED PATTERN PACK (a Variable: one constant).
// The plan's pack-as-data contract (SEARCH-SUGGESTER-PLUGIN.md §8.2), the
// convention consumer's projection (§9.4): the repo's conventions become
// patterns, and the suggester names them BEFORE the model violates them.
// The arbiter is the smoke suite that asserts the convention. The regexes
// are sources here and compiled once at apply (Function/Apply) - the hot
// path never compiles one.
//
// The intents, priority-ordered (lower wins). The trigger is a
// write/edit/raw-write call; the probe carries the target path, so the
// signals are path shapes:
//
//   Layout  - a write under Source/{Function,Interface,Variable} or the
//             entry -> the entry stays wiring-only, the README/SCHEME pair.
//   Naming  - a write of a TypeScript source -> the PascalCase one-word
//             naming table.
//   Docs    - a write inside a package -> the README + SCHEME pair the
//             package must ship.
//   Ledger  - a write of Apply.ts / Config.ts -> the module-owned
//             byte-stable strings and the four identity places.
import type Pack from "../Interface/Pack.js";

export default {
	pack: "convention",
	version: 1,
	intents: [
		{
			id: "Layout",
			priority: 1,
			threshold: 0.75,
			signals: [
				{
					rule: "layout-shape",
					pattern: "Source/(Function|Interface|Variable)/",
					weight: 2.0,
				},
				{
					rule: "entry-shape",
					pattern: "Source/Library\\.ts",
					weight: 1.5,
				},
				{
					rule: "test-shape",
					pattern: "Source/Test/.*Test\\.ts",
					weight: 1.5,
				},
			],
			targets: [
				{
					path: "Source/Library.ts",
					reason: "the entry: wiring only - name, apply, Config, inject",
					prior: 1.0,
				},
				{
					path: "Source/Function/<Name>.ts",
					reason: "one definition per file, nameless default export",
					prior: 1.0,
				},
				{
					path: "README.md",
					reason: "the package's own README, updated with the change",
					prior: 0.6,
				},
				{
					path: "SCHEME.md",
					reason: "the scheme table, which must match the schema",
					prior: 0.6,
				},
			],
			note: "one definition per file; nameless default exports; the entry stays wiring-only.",
		},
		{
			id: "Naming",
			priority: 2,
			threshold: 0.75,
			signals: [
				{
					rule: "source-shape",
					pattern: "\\.ts",
					weight: 2.0,
				},
				{
					rule: "identifier-shape",
					pattern: "const |export |interface |type ",
					weight: 1.5,
				},
			],
			targets: [
				{
					path: "Source/Function/*.ts",
					reason: "PascalCase, one word, action-oriented, present tense, singular",
					prior: 1.0,
				},
				{
					path: "Source/Interface/*.ts",
					reason: "the type shapes, PascalCase full words (Config/State/Factory exempt)",
					prior: 0.6,
				},
				{
					path: "Source/Variable/*.ts",
					reason: "the built-once constants (Config schema, defaults, packs)",
					prior: 0.6,
				},
			],
			note: "full-word PascalCase names; no abbreviations; genuine acronyms stay.",
		},
		{
			id: "Docs",
			priority: 3,
			threshold: 0.75,
			signals: [
				{
					rule: "pkg-shape",
					pattern: "packages/[a-z-]+/",
					weight: 2.0,
				},
				{
					rule: "source-shape",
					pattern: "Source/",
					weight: 1.5,
				},
			],
			targets: [
				{
					path: "README.md",
					reason: "the package must ship its README",
					prior: 1.0,
				},
				{
					path: "SCHEME.md",
					reason: "the full scheme: config fields, surfaces, ledger strings",
					prior: 1.0,
				},
				{
					path: "cordis.patch.yml",
					reason: "the bundle patch row and its config block",
					prior: 0.6,
				},
			],
			note: "a package ships README + SCHEME; the config table must match the schema.",
		},
		{
			id: "Ledger",
			priority: 4,
			threshold: 0.85,
			signals: [
				{
					rule: "ledger-shape",
					pattern: "Source/Function/Apply\\.ts|Source/Variable/Config\\.ts",
					weight: 2.5,
				},
				{
					rule: "identity-shape",
					pattern: "activated \\(|logFile|module:",
					weight: 1.5,
				},
			],
			targets: [
				{
					path: "Source/Function/Apply.ts",
					reason: "the activation line - the module's own string, byte-stable",
					prior: 1.0,
				},
				{
					path: "Source/Variable/Config.ts",
					reason: "the logFile default - the fourth identity place",
					prior: 1.0,
				},
				{
					path: "cordis.patch.yml",
					reason: "the patch row's config block, which must agree with the schema",
					prior: 0.6,
				},
				{
					path: "Source/Test/<Suite>/Test.ts",
					reason: "the byte-exact ledger assertion (end-phase smoke)",
					prior: 0.6,
				},
			],
			note: "ledger strings are module-owned and byte-stable; the four identity places must agree.",
		},
	],
} satisfies Pack;
