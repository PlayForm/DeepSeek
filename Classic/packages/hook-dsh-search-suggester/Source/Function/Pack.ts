// Pack - the embedded SEARCH pack: the ten intent kinds of the plan (section
// 3.2, priority order: destructive first), their signal tables (section 3.8,
// rules R1-R11), their per-intent thresholds (section 2.4: the destructive
// intents Version/Path/Ledger at 0.85, the rest 0.75), and their candidate
// sets (section 3.6: the standard target list, each candidate with a prior
// and the one reason phrase the model reads - a candidate without a reason is
// not emitted).
//
// THE TWO-CONSUMER RULE (plan section 8.1): this pack is embedded in the
// search consumer until a second consumer proves the core extraction; it is
// DATA, the unit the learner writes into and the replay scores. The candidate
// paths are the repo's canonical locations; the digests are hints the
// generated index verifies (end-phase P2), never parsed at runtime.
import type { Intent } from "../Interface/Execution.js";

export default [
	{
		id: "Version",
		priority: 1,
		threshold: 0.85,
		signals: [
			{ rule: "R1 literal-shape", pattern: "\\b\\d+\\.\\d+\\.\\d+\\b", weight: 1.25 },
			{
				rule: "R1 literal-shape",
				pattern: "\\bversion\\b|\\brelease\\b|\\bbump\\b",
				weight: 0.75,
			},
			{ rule: "R2 manifest-shape", pattern: "(^|/)package\\.json$", weight: 1.0 },
		],
		targets: [
			{
				path: "package.json",
				kind: "manifest",
				prior: 1.0,
				digest: "version",
				reason: "the monorepo manifest",
			},
			{
				path: "Site/package.json",
				kind: "manifest",
				prior: 1.0,
				digest: "version",
				reason: "the site manifest",
			},
			{
				path: "Classic/packages/*/package.json",
				kind: "family",
				prior: 1.0,
				reason: "the Classic manifests",
			},
			{
				path: "EffectTS/packages/*/package.json",
				kind: "family",
				prior: 1.0,
				reason: "the EffectTS manifests",
			},
			{
				path: "*/Source/Function/Apply.ts",
				kind: "literal",
				prior: 1.0,
				digest: "const Version",
				reason: "the const Version",
			},
			{
				path: "Site/Source/Library/Content.ts",
				kind: "literal",
				prior: 1.0,
				digest: "Versions.Release",
				reason: "the site release constant",
			},
			{ path: "CHANGELOG.md", kind: "doc", prior: 1.0, reason: "the new section" },
			{
				path: "Documentation/Plugins/PLUGIN-FAMILY.md",
				kind: "doc",
				prior: 1.0,
				reason: "the roster versions",
			},
			{
				path: "Site/Source/pages/versions.astro",
				kind: "site",
				prior: 1.0,
				reason: "the versions page",
			},
			{
				path: ".github/workflows/NPM.yml",
				kind: "workflow",
				prior: 1.0,
				reason: "the publish trigger",
			},
		],
		familyGlobs: ["**/README.md", "**/CONTRIBUTING.md", "**/SCHEME.md"],
	},
	{
		id: "Path",
		priority: 2,
		threshold: 0.85,
		signals: [
			{
				rule: "R5 path-shape",
				pattern: "/Users/|/Volumes/|~/.dsh|Source/.*\\.ts",
				weight: 1.25,
			},
			{ rule: "R5 path-shape", pattern: "\\brename\\b|\\bmove\\b", weight: 0.75 },
		],
		targets: [
			{
				path: "Source/Variable/Config.ts",
				kind: "literal",
				prior: 1.0,
				digest: "logFile",
				reason: "the path's default",
			},
			{
				path: "cordis.patch.yml",
				kind: "config",
				prior: 1.0,
				digest: "logFile",
				reason: "the patch row value",
			},
			{ path: "README.md", kind: "doc", prior: 0.6, reason: "the prose naming the path" },
			{ path: "SCHEME.md", kind: "doc", prior: 0.6, reason: "the full table" },
		],
		familyGlobs: [],
	},
	{
		id: "Ledger",
		priority: 3,
		threshold: 0.85,
		signals: [
			{
				rule: "R4 ledger-shape",
				pattern: "logFile|\\.log\\b|journal|ledger|activated \\(",
				weight: 1.25,
			},
		],
		targets: [
			{
				path: "Source/Function/Apply.ts",
				kind: "literal",
				prior: 1.0,
				digest: "activated (",
				reason: "the activation line",
			},
			{
				path: "Source/Variable/Config.ts",
				kind: "literal",
				prior: 1.0,
				digest: "logFile",
				reason: "the logFile default",
			},
			{ path: "cordis.patch.yml", kind: "config", prior: 1.0, reason: "the patch row" },
			{ path: "Source/Test", kind: "folder", prior: 0.6, reason: "the byte-exact assertion" },
		],
		familyGlobs: ["**/README.md", "**/SCHEME.md"],
	},
	{
		id: "Config",
		priority: 4,
		threshold: 0.75,
		signals: [
			{
				rule: "R7 config-shape",
				pattern: "threshold|enabled|volatile|Schema\\.|cordis",
				weight: 1.25,
			},
		],
		targets: [
			{
				path: "Source/Variable/Config.ts",
				kind: "literal",
				prior: 1.0,
				digest: "Schema",
				reason: "the schema default",
			},
			{
				path: "Source/Interface/Config.ts",
				kind: "literal",
				prior: 1.0,
				reason: "the shape",
			},
			{
				path: "cordis.patch.yml",
				kind: "config",
				prior: 1.0,
				reason: "the row and the config block",
			},
			{ path: "README.md", kind: "doc", prior: 0.6, reason: "the Config section" },
			{ path: "SCHEME.md", kind: "doc", prior: 0.6, reason: "the full table" },
			{
				path: "Site/Source/Component/Configurator.astro",
				kind: "site",
				prior: 0.6,
				reason: "the site surface",
			},
			{
				path: "Source/Test/Config-And-Activation",
				kind: "folder",
				prior: 0.6,
				reason: "the byte-exact assertion",
			},
		],
		familyGlobs: [],
	},
	{
		id: "Dependency",
		priority: 5,
		threshold: 0.75,
		signals: [
			{
				rule: "R9 dep-shape",
				pattern: '"effect"|npm install|peerDependencies|pnpm',
				weight: 1.25,
			},
		],
		targets: [
			{
				path: "package.json",
				kind: "manifest",
				prior: 1.0,
				digest: "dependencies",
				reason: "the dependency block",
			},
			{ path: "pnpm-lock.yaml", kind: "manifest", prior: 1.0, reason: "the lockfile" },
			{
				path: "pnpm-workspace.yaml",
				kind: "manifest",
				prior: 1.0,
				reason: "the workspace roots",
			},
			{ path: "README.md", kind: "doc", prior: 0.6, reason: "the install line" },
			{
				path: "Site/Source/pages/setup.astro",
				kind: "site",
				prior: 0.6,
				reason: "the setup page",
			},
		],
		familyGlobs: [],
	},
	{
		id: "Test",
		priority: 6,
		threshold: 0.75,
		signals: [
			{
				rule: "R3 test-shape",
				pattern: "PASS|FAIL|error TS|assert|suite|checks run",
				weight: 1.25,
			},
		],
		targets: [
			{ path: "Source/Test", kind: "folder", prior: 1.0, reason: "the package's own suites" },
			{
				path: "Classic/smokes/Test",
				kind: "folder",
				prior: 1.0,
				reason: "the aggregate smokes",
			},
			{
				path: "Maintain/Run-Smokes.mjs",
				kind: "literal",
				prior: 1.0,
				reason: "the aggregate runner",
			},
			{ path: "Classic/smokes/README.md", kind: "doc", prior: 0.6, reason: "the counts" },
		],
		familyGlobs: ["**/Test.ts"],
	},
	{
		id: "Symbol",
		priority: 7,
		threshold: 0.75,
		signals: [
			{
				rule: "R6 symbol-shape",
				pattern: "const |export |function |class |interface |\\bId\\b",
				weight: 1.25,
			},
		],
		targets: [
			{
				path: "Source/Library.ts",
				kind: "literal",
				prior: 1.0,
				reason: "the entry, the only named exports",
			},
			{
				path: "Source/Function",
				kind: "folder",
				prior: 1.0,
				reason: "one definition per file",
			},
			{ path: "Source/Interface", kind: "folder", prior: 1.0, reason: "the types" },
			{ path: "Target", kind: "folder", prior: 0.3, reason: "the build mirror - never edit" },
			{ path: "Documentation/Skill", kind: "folder", prior: 0.6, reason: "the prose twin" },
		],
		familyGlobs: [],
	},
	{
		id: "Doc",
		priority: 8,
		threshold: 0.75,
		signals: [
			{
				rule: "R8 doc-shape",
				pattern: "^#|title:|status:|kind:|README|Documentation",
				weight: 1.25,
			},
		],
		targets: [
			{ path: "Documentation/INDEX.md", kind: "doc", prior: 1.0, reason: "the index" },
			{
				path: "Documentation",
				kind: "folder",
				prior: 1.0,
				reason: "the document's own frontmatter and body",
			},
			{
				path: "Documentation/ARCHIVE-STYLE.md",
				kind: "doc",
				prior: 0.6,
				reason: "the style",
			},
			{ path: "Site/Source/Content", kind: "site", prior: 0.6, reason: "the site content" },
			{ path: "README.md", kind: "doc", prior: 0.6, reason: "the package prose" },
		],
		familyGlobs: [],
	},
	{
		id: "Usage",
		priority: 9,
		threshold: 0.75,
		signals: [
			{
				rule: "R10 usage-shape",
				pattern: "hook-dsh-|plugin-dsh-|lib-dsh-|client-dsh-",
				weight: 1.25,
			},
		],
		targets: [
			{
				path: "Documentation/Plugins/PLUGIN-FAMILY.md",
				kind: "doc",
				prior: 1.0,
				reason: "the roster",
			},
			{
				path: "Site/Source/pages/plugins.astro",
				kind: "site",
				prior: 1.0,
				reason: "the site page",
			},
			{ path: "README.md", kind: "doc", prior: 0.6, reason: "the package prose" },
			{
				path: "Documentation/Skill/plugin-system/references/inventory.md",
				kind: "doc",
				prior: 0.6,
				reason: "the inventory",
			},
		],
		familyGlobs: [],
	},
	{
		id: "Owner",
		priority: 10,
		threshold: 0.75,
		signals: [
			{ rule: "R11 owner-shape", pattern: "Handoff|Brand|owner|CONTRIBUTING", weight: 1.25 },
		],
		targets: [
			{ path: "Documentation/Handoff", kind: "folder", prior: 1.0, reason: "the handoffs" },
			{
				path: "Documentation/Brand/BRANDING.md",
				kind: "doc",
				prior: 1.0,
				reason: "the brand",
			},
			{ path: ".github", kind: "folder", prior: 0.6, reason: "the workflows" },
			{ path: "CONTRIBUTING.md", kind: "doc", prior: 1.0, reason: "the contribution rules" },
		],
		familyGlobs: [],
	},
] satisfies Intent[];
