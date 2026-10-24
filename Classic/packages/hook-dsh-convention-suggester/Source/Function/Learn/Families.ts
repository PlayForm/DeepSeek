// Families - the derivation's family table (D4): the doc-graph families and
// the package-layout families whose COMPANIONS ACTUALLY EXIST under the
// resolved root. A family is proposed only when its trigger marker exists AND
// at least one of its companions was found; a companion is never named unless
// the scan found it, so the proposal can never point at a path the repo does
// not carry.
//
// The shapes mirror the built-in pack's own rows (the same signal weights,
// thresholds, reasons and caveats), so an installed proposal behaves like the
// built-in pack on the repo it was learned from - the derivation replaces the
// hardcoded companion lists, not the algebra:
//
//   doc/Plan         Documentation/Plans/          -> the index, the ledger, the style
//   doc/Guide        Documentation/Guides/         -> the index, the style, the site mirror
//   doc/Skill        Documentation/Skill/          -> the index, the skill's references
//   doc/Index        Documentation/INDEX.md        -> the style, the handoffs
//   doc/Site         Site/Source/(Content|pages)/  -> the doc source, the site folders
//   doc/PackageProse (README|SCHEME|CONTRIBUTING)  -> the manifest, the roster, the site page
//   convention/Layout the Source/ folders          -> the entry, the leaves, the prose
//   convention/Naming the Source/ folders          -> the three leaf folders
//   convention/Docs  the package prose + patch     -> README, SCHEME, the patch, the manifest
//
// The built-in families the derivation does NOT propose are the ones outside
// its three marker groups or pinned to package-specific literals: doc/PluginDoc,
// the whole edit, search, test and replay domains, and convention/Ledger. A
// generic repo's proposal must not name paths it cannot verify, and those rows
// are about the plugin family's own layout rather than a repo marker.
import type { Family, Target } from "@playform/lib-dsh-pack";

/** One companion when the marker was found, nothing otherwise. */
const Companion = (
	Found: Set<string>,
	Path: string,
	Kind: string,
	Prior: number,
	Reason: string,
): Target[] => (Found.has(Path) ? [{ path: Path, kind: Kind, prior: Prior, reason: Reason }] : []);

export default (Found: Set<string>): Record<string, Family> => {
	const Result: Record<string, Family> = {};

	/** Add a family only when at least one of its companions exists. */
	const Add = (Key: string, Row: Family): void => {
		if (Row.targets.length > 0) {
			Result[Key] = Row;
		}
	};

	if (Found.has("Documentation/Plans")) {
		Add("doc/Plan", {
			id: "Plan",
			priority: 1,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "plan", pattern: "Documentation/Plans/.*\\.md$", weight: 2.5 }],
			targets: [
				...Companion(Found, "Documentation/INDEX.md", "index", 1.0, "the index row"),
				...Companion(
					Found,
					"Documentation/Plans/POC-LEDGER.md",
					"doc",
					0.6,
					"the live matrix",
				),
				...Companion(
					Found,
					"Documentation/ARCHIVE-STYLE.md",
					"style",
					0.6,
					"the frontmatter and style rules",
				),
			],
		});
	}

	if (Found.has("Documentation/Guides")) {
		Add("doc/Guide", {
			id: "Guide",
			priority: 2,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "guide", pattern: "Documentation/Guides/.*\\.md$", weight: 2.5 }],
			targets: [
				...Companion(Found, "Documentation/INDEX.md", "index", 1.0, "the index row"),
				...Companion(Found, "Documentation/ARCHIVE-STYLE.md", "style", 0.6, "the style"),
				...Companion(Found, "Site/Source/Content", "site", 0.6, "the site mirror"),
			],
		});
	}

	if (Found.has("Documentation/Skill")) {
		Add("doc/Skill", {
			id: "Skill",
			priority: 3,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "skill", pattern: "Documentation/Skill/.*\\.md$", weight: 2.5 }],
			targets: [
				...Companion(Found, "Documentation/INDEX.md", "index", 1.0, "the index row"),
				...Companion(
					Found,
					"Documentation/Skill",
					"folder",
					0.6,
					"the skill's own references",
				),
				...Companion(
					Found,
					"Documentation/Skill/session-orientation/references/repository-map.md",
					"doc",
					0.6,
					"the routing table",
				),
				...Companion(
					Found,
					"Documentation/Skill/plugin-development/references",
					"folder",
					0.6,
					"the plugin references",
				),
			],
		});
	}

	if (Found.has("Documentation/INDEX.md")) {
		Add("doc/Index", {
			id: "Index",
			priority: 5,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "index", pattern: "(^|/)Documentation/INDEX\\.md$", weight: 2.5 }],
			targets: [
				...Companion(
					Found,
					"Documentation/ARCHIVE-STYLE.md",
					"style",
					1.0,
					"the row format",
				),
				...Companion(
					Found,
					"Documentation/Handoff",
					"folder",
					0.6,
					"the handoffs that cite it",
				),
			],
		});
	}

	if (Found.has("Site/Source/Content") || Found.has("Site/Source/pages")) {
		Add("doc/Site", {
			id: "Site",
			priority: 6,
			threshold: 0.75,
			note: "",
			familyGlobs: [],
			signals: [{ rule: "site", pattern: "Site/Source/(Content|pages)/.*$", weight: 2.5 }],
			targets: [
				...Companion(Found, "Documentation", "folder", 0.6, "the source of truth"),
				...Companion(Found, "Site/Source/Content", "site", 0.6, "the site content"),
				...Companion(Found, "Site/Source/pages", "site", 0.6, "the site pages"),
				...Companion(Found, "Site/Source/Component", "site", 0.6, "the components"),
				...Companion(Found, "Site/Source/Library", "site", 0.6, "the site library"),
				...Companion(
					Found,
					"Site/Source/Library/Content.ts",
					"site",
					0.6,
					"the figures and constants",
				),
			],
		});
	}

	if (Found.has("README.md") || Found.has("SCHEME.md") || Found.has("CONTRIBUTING.md")) {
		Add("doc/PackageProse", {
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
				...Companion(Found, "package.json", "manifest", 0.6, "the description"),
				...Companion(Found, "README.md", "doc", 0.6, "the package prose"),
				...Companion(Found, "SCHEME.md", "doc", 0.6, "the full scheme"),
				...Companion(Found, "CONTRIBUTING.md", "doc", 0.6, "the contribution rules"),
				...Companion(
					Found,
					"Documentation/Plugins/PLUGIN-FAMILY.md",
					"doc",
					0.6,
					"the family roster",
				),
				...Companion(
					Found,
					"Site/Source/pages/plugins.astro",
					"site",
					0.6,
					"the site page",
				),
			],
		});
	}

	if (
		Found.has("Source/Function") ||
		Found.has("Source/Interface") ||
		Found.has("Source/Variable") ||
		Found.has("Source/Test") ||
		Found.has("Source/Library.ts")
	) {
		Add("convention/Layout", {
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
				{ rule: "entry-shape", pattern: "Source/Library\\.ts", weight: 1.5 },
				{ rule: "test-shape", pattern: "Source/Test/.*Test\\.ts", weight: 1.5 },
			],
			targets: [
				...Companion(
					Found,
					"Source/Library.ts",
					"",
					1.0,
					"the entry: wiring only - name, apply, Config, inject",
				),
				...Companion(
					Found,
					"Source/Function",
					"",
					1.0,
					"one definition per file, nameless default export",
				),
				...Companion(Found, "Source/Interface", "", 0.6, "the type shapes"),
				...Companion(Found, "Source/Variable", "", 0.6, "the built-once constants"),
				...Companion(Found, "Source/Test", "", 0.6, "the assertion that owns the behavior"),
				...Companion(
					Found,
					"README.md",
					"",
					0.6,
					"the package's own README, updated with the change",
				),
				...Companion(
					Found,
					"SCHEME.md",
					"",
					0.6,
					"the scheme table, which must match the schema",
				),
			],
		});
	}

	if (
		Found.has("Source/Function") ||
		Found.has("Source/Interface") ||
		Found.has("Source/Variable")
	) {
		Add("convention/Naming", {
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
				...Companion(
					Found,
					"Source/Function",
					"",
					1.0,
					"PascalCase, one word, action-oriented, present tense, singular",
				),
				...Companion(
					Found,
					"Source/Interface",
					"",
					0.6,
					"the type shapes, PascalCase full words (Config/State/Factory exempt)",
				),
				...Companion(
					Found,
					"Source/Variable",
					"",
					0.6,
					"the built-once constants (Config schema, defaults, packs)",
				),
			],
		});
	}

	if (
		Found.has("README.md") ||
		Found.has("SCHEME.md") ||
		Found.has("cordis.patch.yml") ||
		Found.has("package.json")
	) {
		Add("convention/Docs", {
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
				...Companion(Found, "README.md", "", 1.0, "the package must ship its README"),
				...Companion(
					Found,
					"SCHEME.md",
					"",
					1.0,
					"the full scheme: config fields, surfaces, ledger strings",
				),
				...Companion(
					Found,
					"cordis.patch.yml",
					"",
					0.6,
					"the bundle patch row and its config block",
				),
				...Companion(Found, "package.json", "", 0.6, "the manifest the prose describes"),
			],
		});
	}

	return Result;
};
