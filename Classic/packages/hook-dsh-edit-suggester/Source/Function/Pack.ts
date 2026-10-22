// Pack - the embedded CONVENTION pack: the modification families and their
// standard companion sets. The plan's evidence (SEARCH-SUGGESTER-PLUGIN.md
// section 1.4): the edit is where the discovery happens - the model edited
// its way to the target sets it never thought to open. The repo's convention
// is that a file rarely stands alone: the version lives in 36 manifests, 6
// Apply.ts, the CHANGELOG and the prose; a Config.ts edit must land in the
// README's Config section, SCHEME.md, the patch row, and the byte-exact
// test. Each family row carries its path rules (signals) and the companion
// set (targets, each with a prior and the one reason phrase) - the edit
// suggester names the companions, never the transform itself (the transform
// is the model's; the search consumer's refusal of the Transform node holds
// here too).
//
// THE TWO-CONSUMER RULE: this pack is embedded until the core pattern
// service is extracted (after the search consumer and this one exist); it is
// DATA, the unit a new domain copies.
import type { Family } from "../Interface/Execution.js";

export default [
	{
		id: "Version",
		priority: 1,
		threshold: 0.85,
		signals: [
			{ rule: "manifest", pattern: "(^|/)package\\.json$", weight: 2.5 },
			{ rule: "version-core", pattern: "Source/Function/Apply\\.ts$", weight: 2.5 },
		],
		targets: [
			{ path: "package.json", kind: "manifest", prior: 1.0, reason: "the root manifest" },
			{
				path: "Site/package.json",
				kind: "manifest",
				prior: 1.0,
				reason: "the site manifest",
			},
			{
				path: "*/package.json",
				kind: "family",
				prior: 1.0,
				reason: "every sibling manifest",
			},
			{
				path: "*/Source/Function/Apply.ts",
				kind: "family",
				prior: 1.0,
				reason: "the const Version",
			},
			{
				path: "Site/Source/Library/Content.ts",
				kind: "literal",
				prior: 1.0,
				reason: "the site release constant",
			},
			{ path: "CHANGELOG.md", kind: "doc", prior: 1.0, reason: "the new section" },
			{
				path: "Documentation/Plugins/PLUGIN-FAMILY.md",
				kind: "doc",
				prior: 0.6,
				reason: "the roster versions",
			},
			{
				path: ".github/workflows/NPM.yml",
				kind: "workflow",
				prior: 0.6,
				reason: "the publish trigger",
			},
		],
	},
	{
		id: "Config",
		priority: 2,
		threshold: 0.75,
		signals: [
			{ rule: "schema-default", pattern: "Source/Variable/Config\\.ts$", weight: 2.5 },
			{ rule: "schema-shape", pattern: "Source/Interface/Config\\.ts$", weight: 2.5 },
			{ rule: "patch-row", pattern: "cordis\\.patch\\.yml$", weight: 2.5 },
		],
		targets: [
			{ path: "README.md", kind: "doc", prior: 1.0, reason: "the Config section" },
			{ path: "SCHEME.md", kind: "doc", prior: 1.0, reason: "the full table" },
			{ path: "cordis.patch.yml", kind: "config", prior: 1.0, reason: "the row value" },
			{
				path: "Source/Test/Config-And-Activation/Test.ts",
				kind: "test",
				prior: 1.0,
				reason: "the byte-exact assertion",
			},
			{
				path: "Site/Source/Component/Configurator.astro",
				kind: "site",
				prior: 0.6,
				reason: "the site surface",
			},
		],
	},
	{
		id: "Symbol",
		priority: 3,
		threshold: 0.75,
		signals: [
			{ rule: "function-leaf", pattern: "Source/Function/[^/]+\\.ts$", weight: 2.5 },
			{ rule: "interface-leaf", pattern: "Source/Interface/[^/]+\\.ts$", weight: 2.5 },
			{ rule: "variable-leaf", pattern: "Source/Variable/[^/]+\\.ts$", weight: 2.5 },
		],
		targets: [
			{
				path: "Source/Test",
				kind: "folder",
				prior: 1.0,
				reason: "the assertion that owns the behavior",
			},
			{ path: "README.md", kind: "doc", prior: 0.6, reason: "the prose that names it" },
			{ path: "Documentation/Skill", kind: "folder", prior: 0.6, reason: "the prose twin" },
		],
	},
	{
		id: "Test",
		priority: 4,
		threshold: 0.75,
		signals: [
			{ rule: "suite-leaf", pattern: "Source/Test/[^/]+/Test\\.ts$", weight: 2.5 },
			{ rule: "smoke-leaf", pattern: "smokes/.*Test\\.ts$", weight: 2.5 },
		],
		targets: [
			{ path: "README.md", kind: "doc", prior: 1.0, reason: "the badge and the counts" },
			{
				path: "Maintain/Run-Smokes.mjs",
				kind: "literal",
				prior: 1.0,
				reason: "the aggregate roster",
			},
			{ path: "SCHEME.md", kind: "doc", prior: 0.6, reason: "the status line" },
		],
	},
	{
		id: "Doc",
		priority: 5,
		threshold: 0.75,
		signals: [{ rule: "documentation", pattern: "Documentation/.*\\.md$", weight: 2.5 }],
		targets: [
			{ path: "Documentation/INDEX.md", kind: "doc", prior: 1.0, reason: "the index row" },
			{
				path: "Documentation/ARCHIVE-STYLE.md",
				kind: "doc",
				prior: 0.6,
				reason: "the style",
			},
			{ path: "Site/Source/Content", kind: "site", prior: 0.6, reason: "the site mirror" },
		],
	},
	{
		id: "Prose",
		priority: 6,
		threshold: 0.75,
		signals: [
			{
				rule: "package-prose",
				pattern: "(^|/)(README|SCHEME|CONTRIBUTING)\\.md$",
				weight: 2.5,
			},
			{ rule: "changelog", pattern: "(^|/)CHANGELOG\\.md$", weight: 2.5 },
		],
		targets: [
			{
				path: "package.json",
				kind: "manifest",
				prior: 0.6,
				reason: "the description and the version",
			},
			{
				path: "Site/Source/pages",
				kind: "site",
				prior: 0.6,
				reason: "the site pages quoting it",
			},
		],
	},
	{
		id: "Workflow",
		priority: 7,
		threshold: 0.75,
		signals: [{ rule: "github", pattern: "\\.github/.*\\.yml$", weight: 2.5 }],
		targets: [
			{
				path: "Documentation/Plugins/PLUGIN-FAMILY.md",
				kind: "doc",
				prior: 0.6,
				reason: "the release notes",
			},
			{ path: "README.md", kind: "doc", prior: 0.6, reason: "the CI section" },
		],
	},
] satisfies Family[];
