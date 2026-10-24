// Builtin - the BUILT-IN pack for this monorepo: the union of the six
// suggesters' former embedded packs, extracted here so the family has ONE
// source of truth. The families are keyed by the domain-qualified id
// (`doc/Plan`, `edit/Version`, `search/Version`, ...), so the six domains
// share the map without colliding on the ids they reuse; a family's `id`
// stays unqualified because it is the ledger's name.
//
// The values are byte-for-byte the packs the six suggesters shipped:
//   doc      - the seven documentation-task families;
//   edit     - the seven modification families;
//   search   - the ten search intents (with their family globs);
//   convention - the four convention intents (with their caveats);
//   test     - the two test intents (with their caveats);
//   replay   - the one replay intent (with its caveat).
// Every target carries a kind ("" where the domain has no kinds), a prior
// and the one reason phrase; every family carries a note ("" where the
// domain has none) and familyGlobs ([] where the domain has none). The
// suggester packages project their own domain with Families(Builtin, domain),
// so the default behaviour is byte-identical to the embedded era.
import type Pack from "../Interface/Pack.js";

const Builtin: Pack = {
	slug: "deepseek",
	signature: ["Documentation/ARCHIVE-STYLE.md"],
	families: {
		"doc/Plan": {
			id: "Plan",
			priority: 1,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "plan", pattern: "Documentation/Plans/.*\\.md$", weight: 2.5 }],
			targets: [
				{
					path: "Documentation/INDEX.md",
					kind: "index",
					prior: 1.0,
					reason: "the index row",
				},
				{
					path: "Documentation/Plans/POC-LEDGER.md",
					kind: "doc",
					prior: 0.6,
					reason: "the live matrix",
				},
				{
					path: "Documentation/ARCHIVE-STYLE.md",
					kind: "style",
					prior: 0.6,
					reason: "the frontmatter and style rules",
				},
			],
		},
		"doc/Guide": {
			id: "Guide",
			priority: 2,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "guide", pattern: "Documentation/Guides/.*\\.md$", weight: 2.5 }],
			targets: [
				{
					path: "Documentation/INDEX.md",
					kind: "index",
					prior: 1.0,
					reason: "the index row",
				},
				{
					path: "Documentation/ARCHIVE-STYLE.md",
					kind: "style",
					prior: 0.6,
					reason: "the style",
				},
				{
					path: "Site/Source/Content",
					kind: "site",
					prior: 0.6,
					reason: "the site mirror",
				},
			],
		},
		"doc/Skill": {
			id: "Skill",
			priority: 3,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "skill", pattern: "Documentation/Skill/.*\\.md$", weight: 2.5 }],
			targets: [
				{
					path: "Documentation/INDEX.md",
					kind: "index",
					prior: 1.0,
					reason: "the index row",
				},
				{
					path: "Documentation/Skill/session-orientation/references/repository-map.md",
					kind: "doc",
					prior: 0.6,
					reason: "the routing table",
				},
				{
					path: "Documentation/Skill/plugin-development/references",
					kind: "folder",
					prior: 0.6,
					reason: "the plugin references",
				},
			],
		},
		"doc/PluginDoc": {
			id: "PluginDoc",
			priority: 4,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "plugins", pattern: "Documentation/Plugins/.*\\.md$", weight: 2.5 }],
			targets: [
				{
					path: "Documentation/Plugins/PLUGIN-FAMILY.md",
					kind: "doc",
					prior: 1.0,
					reason: "the family roster",
				},
				{
					path: "Documentation/INDEX.md",
					kind: "index",
					prior: 1.0,
					reason: "the index row",
				},
				{
					path: "Site/Source/pages/plugins.astro",
					kind: "site",
					prior: 0.6,
					reason: "the site page",
				},
			],
		},
		"doc/Index": {
			id: "Index",
			priority: 5,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "index", pattern: "(^|/)Documentation/INDEX\\.md$", weight: 2.5 }],
			targets: [
				{
					path: "Documentation/ARCHIVE-STYLE.md",
					kind: "style",
					prior: 1.0,
					reason: "the row format",
				},
				{
					path: "Documentation/Handoff",
					kind: "folder",
					prior: 0.6,
					reason: "the handoffs that cite it",
				},
			],
		},
		"doc/Site": {
			id: "Site",
			priority: 6,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "site", pattern: "Site/Source/(Content|pages)/.*$", weight: 2.5 }],
			targets: [
				{
					path: "Documentation",
					kind: "folder",
					prior: 0.6,
					reason: "the source of truth",
				},
				{
					path: "Site/Source/Library/Content.ts",
					kind: "site",
					prior: 0.6,
					reason: "the figures and constants",
				},
			],
		},
		"doc/PackageProse": {
			id: "PackageProse",
			priority: 7,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [
				{
					rule: "package-prose",
					pattern: "(^|/)(README|SCHEME|CONTRIBUTING)\\.md$",
					weight: 2.5,
				},
			],
			targets: [
				{
					path: "package.json",
					kind: "manifest",
					prior: 0.6,
					reason: "the description",
				},
				{
					path: "Documentation/Plugins/PLUGIN-FAMILY.md",
					kind: "doc",
					prior: 0.6,
					reason: "the family roster",
				},
				{
					path: "Site/Source/pages/plugins.astro",
					kind: "site",
					prior: 0.6,
					reason: "the site page",
				},
			],
		},
		"edit/Version": {
			id: "Version",
			priority: 1,
			threshold: 0.85,
			note: "",
			familyGlobs: [],
			signals: [
				{ rule: "manifest", pattern: "(^|/)package\\.json$", weight: 2.5 },
				{ rule: "version-core", pattern: "Source/Function/Apply\\.ts$", weight: 2.5 },
			],
			targets: [
				{
					path: "package.json",
					kind: "manifest",
					prior: 1.0,
					reason: "the root manifest",
				},
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
				{
					path: "CHANGELOG.md",
					kind: "doc",
					prior: 1.0,
					reason: "the new section",
				},
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
		"edit/Config": {
			id: "Config",
			priority: 2,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [
				{ rule: "schema-default", pattern: "Source/Variable/Config\\.ts$", weight: 2.5 },
				{ rule: "schema-shape", pattern: "Source/Interface/Config\\.ts$", weight: 2.5 },
				{ rule: "patch-row", pattern: "cordis\\.patch\\.yml$", weight: 2.5 },
			],
			targets: [
				{ path: "README.md", kind: "doc", prior: 1.0, reason: "the Config section" },
				{ path: "SCHEME.md", kind: "doc", prior: 1.0, reason: "the full table" },
				{
					path: "cordis.patch.yml",
					kind: "config",
					prior: 1.0,
					reason: "the row value",
				},
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
		"edit/Symbol": {
			id: "Symbol",
			priority: 3,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
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
				{
					path: "README.md",
					kind: "doc",
					prior: 0.6,
					reason: "the prose that names it",
				},
				{
					path: "Documentation/Skill",
					kind: "folder",
					prior: 0.6,
					reason: "the prose twin",
				},
			],
		},
		"edit/Test": {
			id: "Test",
			priority: 4,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [
				{ rule: "suite-leaf", pattern: "Source/Test/[^/]+/Test\\.ts$", weight: 2.5 },
				{ rule: "smoke-leaf", pattern: "smokes/.*Test\\.ts$", weight: 2.5 },
			],
			targets: [
				{
					path: "README.md",
					kind: "doc",
					prior: 1.0,
					reason: "the badge and the counts",
				},
				{
					path: "Maintain/Run-Smokes.mjs",
					kind: "literal",
					prior: 1.0,
					reason: "the aggregate roster",
				},
				{ path: "SCHEME.md", kind: "doc", prior: 0.6, reason: "the status line" },
			],
		},
		"edit/Doc": {
			id: "Doc",
			priority: 5,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "documentation", pattern: "Documentation/.*\\.md$", weight: 2.5 }],
			targets: [
				{
					path: "Documentation/INDEX.md",
					kind: "doc",
					prior: 1.0,
					reason: "the index row",
				},
				{
					path: "Documentation/ARCHIVE-STYLE.md",
					kind: "doc",
					prior: 0.6,
					reason: "the style",
				},
				{
					path: "Site/Source/Content",
					kind: "site",
					prior: 0.6,
					reason: "the site mirror",
				},
			],
		},
		"edit/Prose": {
			id: "Prose",
			priority: 6,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
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
		"edit/Workflow": {
			id: "Workflow",
			priority: 7,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "github", pattern: "\\.github/.*\\.yml$", weight: 2.5 }],
			targets: [
				{
					path: "Documentation/Plugins/PLUGIN-FAMILY.md",
					kind: "doc",
					prior: 0.6,
					reason: "the release notes",
				},
				{
					path: "README.md",
					kind: "doc",
					prior: 0.6,
					reason: "the CI section",
				},
			],
		},
		"search/Version": {
			id: "Version",
			priority: 1,
			threshold: 0.85,
			note: "",
			familyGlobs: ["**/README.md", "**/CONTRIBUTING.md", "**/SCHEME.md"],
			signals: [
				{
					rule: "R1 literal-shape",
					pattern: "\\b\\d+\\.\\d+\\.\\d+\\b",
					weight: 1.25,
				},
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
				{
					path: "CHANGELOG.md",
					kind: "doc",
					prior: 1.0,
					reason: "the new section",
				},
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
		},
		"search/Path": {
			id: "Path",
			priority: 2,
			threshold: 0.85,
			note: "",
			familyGlobs: [],
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
				{
					path: "README.md",
					kind: "doc",
					prior: 0.6,
					reason: "the prose naming the path",
				},
				{ path: "SCHEME.md", kind: "doc", prior: 0.6, reason: "the full table" },
			],
		},
		"search/Ledger": {
			id: "Ledger",
			priority: 3,
			threshold: 0.85,
			note: "",
			familyGlobs: ["**/README.md", "**/SCHEME.md"],
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
				{
					path: "cordis.patch.yml",
					kind: "config",
					prior: 1.0,
					reason: "the patch row",
				},
				{
					path: "Source/Test",
					kind: "folder",
					prior: 0.6,
					reason: "the byte-exact assertion",
				},
			],
		},
		"search/Config": {
			id: "Config",
			priority: 4,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
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
				{
					path: "README.md",
					kind: "doc",
					prior: 0.6,
					reason: "the Config section",
				},
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
		},
		"search/Dependency": {
			id: "Dependency",
			priority: 5,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
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
				{
					path: "pnpm-lock.yaml",
					kind: "manifest",
					prior: 1.0,
					reason: "the lockfile",
				},
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
		},
		"search/Test": {
			id: "Test",
			priority: 6,
			threshold: 0.75,
			note: "",
			familyGlobs: ["**/Test.ts"],
			signals: [
				{
					rule: "R3 test-shape",
					pattern: "PASS|FAIL|error TS|assert|suite|checks run",
					weight: 1.25,
				},
			],
			targets: [
				{
					path: "Source/Test",
					kind: "folder",
					prior: 1.0,
					reason: "the package's own suites",
				},
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
				{
					path: "Classic/smokes/README.md",
					kind: "doc",
					prior: 0.6,
					reason: "the counts",
				},
			],
		},
		"search/Symbol": {
			id: "Symbol",
			priority: 7,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
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
				{
					path: "Source/Interface",
					kind: "folder",
					prior: 1.0,
					reason: "the types",
				},
				{
					path: "Target",
					kind: "folder",
					prior: 0.3,
					reason: "the build mirror - never edit",
				},
				{
					path: "Documentation/Skill",
					kind: "folder",
					prior: 0.6,
					reason: "the prose twin",
				},
			],
		},
		"search/Doc": {
			id: "Doc",
			priority: 8,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [
				{
					rule: "R8 doc-shape",
					pattern: "^#|title:|status:|kind:|README|Documentation",
					weight: 1.25,
				},
			],
			targets: [
				{
					path: "Documentation/INDEX.md",
					kind: "doc",
					prior: 1.0,
					reason: "the index",
				},
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
				{
					path: "Site/Source/Content",
					kind: "site",
					prior: 0.6,
					reason: "the site content",
				},
				{
					path: "README.md",
					kind: "doc",
					prior: 0.6,
					reason: "the package prose",
				},
			],
		},
		"search/Usage": {
			id: "Usage",
			priority: 9,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
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
				{
					path: "README.md",
					kind: "doc",
					prior: 0.6,
					reason: "the package prose",
				},
				{
					path: "Documentation/Skill/plugin-system/references/inventory.md",
					kind: "doc",
					prior: 0.6,
					reason: "the inventory",
				},
			],
		},
		"search/Owner": {
			id: "Owner",
			priority: 10,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [
				{
					rule: "R11 owner-shape",
					pattern: "Handoff|Brand|owner|CONTRIBUTING",
					weight: 1.25,
				},
			],
			targets: [
				{
					path: "Documentation/Handoff",
					kind: "folder",
					prior: 1.0,
					reason: "the handoffs",
				},
				{
					path: "Documentation/Brand/BRANDING.md",
					kind: "doc",
					prior: 1.0,
					reason: "the brand",
				},
				{
					path: ".github",
					kind: "folder",
					prior: 0.6,
					reason: "the workflows",
				},
				{
					path: "CONTRIBUTING.md",
					kind: "doc",
					prior: 1.0,
					reason: "the contribution rules",
				},
			],
		},
		"convention/Layout": {
			id: "Layout",
			priority: 1,
			threshold: 0.75,
			note: "one definition per file; nameless default exports; the entry stays wiring-only.",
			familyGlobs: [],
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
					kind: "",
					reason: "the entry: wiring only - name, apply, Config, inject",
					prior: 1.0,
				},
				{
					path: "Source/Function/<Name>.ts",
					kind: "",
					reason: "one definition per file, nameless default export",
					prior: 1.0,
				},
				{
					path: "README.md",
					kind: "",
					reason: "the package's own README, updated with the change",
					prior: 0.6,
				},
				{
					path: "SCHEME.md",
					kind: "",
					reason: "the scheme table, which must match the schema",
					prior: 0.6,
				},
			],
		},
		"convention/Naming": {
			id: "Naming",
			priority: 2,
			threshold: 0.75,
			note: "full-word PascalCase names; no abbreviations; genuine acronyms stay.",
			familyGlobs: [],
			signals: [
				{ rule: "source-shape", pattern: "\\.ts", weight: 2.0 },
				{
					rule: "identifier-shape",
					pattern: "const |export |interface |type ",
					weight: 1.5,
				},
			],
			targets: [
				{
					path: "Source/Function/*.ts",
					kind: "",
					reason: "PascalCase, one word, action-oriented, present tense, singular",
					prior: 1.0,
				},
				{
					path: "Source/Interface/*.ts",
					kind: "",
					reason: "the type shapes, PascalCase full words (Config/State/Factory exempt)",
					prior: 0.6,
				},
				{
					path: "Source/Variable/*.ts",
					kind: "",
					reason: "the built-once constants (Config schema, defaults, packs)",
					prior: 0.6,
				},
			],
		},
		"convention/Docs": {
			id: "Docs",
			priority: 3,
			threshold: 0.75,
			note: "a package ships README + SCHEME; the config table must match the schema.",
			familyGlobs: [],
			signals: [
				{ rule: "pkg-shape", pattern: "packages/[a-z-]+/", weight: 2.0 },
				{ rule: "source-shape", pattern: "Source/", weight: 1.5 },
			],
			targets: [
				{
					path: "README.md",
					kind: "",
					reason: "the package must ship its README",
					prior: 1.0,
				},
				{
					path: "SCHEME.md",
					kind: "",
					reason: "the full scheme: config fields, surfaces, ledger strings",
					prior: 1.0,
				},
				{
					path: "cordis.patch.yml",
					kind: "",
					reason: "the bundle patch row and its config block",
					prior: 0.6,
				},
			],
		},
		"convention/Ledger": {
			id: "Ledger",
			priority: 4,
			threshold: 0.85,
			note: "ledger strings are module-owned and byte-stable; the four identity places must agree.",
			familyGlobs: [],
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
					kind: "",
					reason: "the activation line - the module's own string, byte-stable",
					prior: 1.0,
				},
				{
					path: "Source/Variable/Config.ts",
					kind: "",
					reason: "the logFile default - the fourth identity place",
					prior: 1.0,
				},
				{
					path: "cordis.patch.yml",
					kind: "",
					reason: "the patch row's config block, which must agree with the schema",
					prior: 0.6,
				},
				{
					path: "Source/Test/<Suite>/Test.ts",
					kind: "",
					reason: "the byte-exact ledger assertion (end-phase smoke)",
					prior: 0.6,
				},
			],
		},
		"test/Suite": {
			id: "Suite",
			priority: 1,
			threshold: 0.6,
			note: "one suite per folder: Test.ts asserts, README.md carries the count; Target/ is never edited.",
			familyGlobs: [],
			signals: [
				{
					rule: "test-shape",
					pattern: "PASS|FAIL|error TS|assert|suite|checks run",
					weight: 0.5,
				},
				{
					rule: "path-shape",
					pattern: "Source/Test/|smokes/Test/|Test\\.ts",
					weight: 0.4,
				},
				{
					rule: "loop-shape",
					pattern: "Run-Smokes|selfcheck",
					weight: 0.3,
				},
			],
			targets: [
				{
					path: "Source/Test/<Suite>/Test.ts",
					kind: "",
					reason: "the assertion body - the suite that proves it",
					prior: 1.0,
				},
				{
					path: "Source/Test/<Suite>/README.md",
					kind: "",
					reason: "the expected count and the coverage notes",
					prior: 1.0,
				},
				{
					path: "Maintain/Run-Smokes.mjs",
					kind: "",
					reason: "the aggregate runner - how the suites are invoked",
					prior: 0.6,
				},
				{
					path: "README.md",
					kind: "",
					reason: "the badge count, which must match the suite",
					prior: 0.6,
				},
			],
		},
		"test/Counts": {
			id: "Counts",
			priority: 2,
			threshold: 0.5,
			note: "the counts must agree across README, SCHEME and the site, or the release fails.",
			familyGlobs: [],
			signals: [
				{
					rule: "count-shape",
					pattern: "\\b[0-9]+ PASS\\b|expected count|PASS count|suite count",
					weight: 0.5,
				},
				{
					rule: "doc-shape",
					pattern: "badge|smoke report|totals",
					weight: 0.3,
				},
			],
			targets: [
				{
					path: "README.md",
					kind: "",
					reason: "the per-package badge count",
					prior: 1.0,
				},
				{
					path: "SCHEME.md",
					kind: "",
					reason: "the full scheme table with the counts",
					prior: 0.6,
				},
				{
					path: "Site/Source/Library/Content.ts",
					kind: "",
					reason: "the site content counts, which must agree",
					prior: 0.6,
				},
			],
		},
		"replay/Repeat": {
			id: "Repeat",
			priority: 1,
			threshold: 0.75,
			note: "the recall is the answer; without a record the hook abstains.",
			familyGlobs: [],
			signals: [
				{
					rule: "search-shape",
					pattern: "grep|glob|read|bash|edit|write",
					weight: 0.5,
				},
				{
					rule: "literal-shape",
					pattern: '"[^"]+\\.(?:ts|tsx|js|mjs|md|json)"',
					weight: 0.4,
				},
				{
					rule: "context-shape",
					pattern: "pattern|file_path|command",
					weight: 0.3,
				},
			],
			targets: [],
		},
	},
};

export default Builtin;
