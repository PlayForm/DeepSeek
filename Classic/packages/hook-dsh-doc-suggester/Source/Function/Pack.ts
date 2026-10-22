// Pack - the embedded CONVENTION pack for the documentation tree: the
// doc-task families and their companion sets (the plan's Doc intent,
// SEARCH-SUGGESTER-PLUGIN.md sections 3.6 and 8: "the doc task -> the plans,
// guides, site"). The repo's convention is that a documentation task rarely
// touches one file: a plan edit must keep the INDEX row and the frontmatter
// statuses/registry/index block coherent; a skill must keep its references;
// a content change must keep the site mirror. Each family row carries its
// path rules (signals) and the companion set (targets, each with a prior and
// the one reason phrase). The note names the companions, never the transform.
import type { Family } from "../Interface/Execution.js";

export default [
	{
		id: "Plan",
		priority: 1,
		threshold: 0.75,
		signals: [{ rule: "plan", pattern: "Documentation/Plans/.*\\.md$", weight: 2.5 }],
		targets: [
			{ path: "Documentation/INDEX.md", kind: "index", prior: 1.0, reason: "the index row" },
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
	{
		id: "Guide",
		priority: 2,
		threshold: 0.75,
		signals: [{ rule: "guide", pattern: "Documentation/Guides/.*\\.md$", weight: 2.5 }],
		targets: [
			{ path: "Documentation/INDEX.md", kind: "index", prior: 1.0, reason: "the index row" },
			{
				path: "Documentation/ARCHIVE-STYLE.md",
				kind: "style",
				prior: 0.6,
				reason: "the style",
			},
			{ path: "Site/Source/Content", kind: "site", prior: 0.6, reason: "the site mirror" },
		],
	},
	{
		id: "Skill",
		priority: 3,
		threshold: 0.75,
		signals: [{ rule: "skill", pattern: "Documentation/Skill/.*\\.md$", weight: 2.5 }],
		targets: [
			{ path: "Documentation/INDEX.md", kind: "index", prior: 1.0, reason: "the index row" },
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
	{
		id: "PluginDoc",
		priority: 4,
		threshold: 0.75,
		signals: [{ rule: "plugins", pattern: "Documentation/Plugins/.*\\.md$", weight: 2.5 }],
		targets: [
			{
				path: "Documentation/Plugins/PLUGIN-FAMILY.md",
				kind: "doc",
				prior: 1.0,
				reason: "the family roster",
			},
			{ path: "Documentation/INDEX.md", kind: "index", prior: 1.0, reason: "the index row" },
			{
				path: "Site/Source/pages/plugins.astro",
				kind: "site",
				prior: 0.6,
				reason: "the site page",
			},
		],
	},
	{
		id: "Index",
		priority: 5,
		threshold: 0.75,
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
	{
		id: "Site",
		priority: 6,
		threshold: 0.75,
		signals: [{ rule: "site", pattern: "Site/Source/(Content|pages)/.*$", weight: 2.5 }],
		targets: [
			{ path: "Documentation", kind: "folder", prior: 0.6, reason: "the source of truth" },
			{
				path: "Site/Source/Library/Content.ts",
				kind: "site",
				prior: 0.6,
				reason: "the figures and constants",
			},
		],
	},
	{
		id: "PackageProse",
		priority: 7,
		threshold: 0.75,
		signals: [
			{
				rule: "package-prose",
				pattern: "(^|/)(README|SCHEME|CONTRIBUTING)\\.md$",
				weight: 2.5,
			},
		],
		targets: [
			{ path: "package.json", kind: "manifest", prior: 0.6, reason: "the description" },
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
] satisfies Family[];
