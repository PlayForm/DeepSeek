// Scan - the derivation's marker probe (D4): which of the documented repo
// markers exist under the resolved root? A BOUNDED probe, never a recursive
// walk: the markers ARE the convention table (the doc graph, the package
// layout, the site), so the scan is a fixed set of `existsSync` calls and the
// learner stays deterministic and cheap.
//
// The marker set is the union of three sources, and the derived families draw
// their companions ONLY from it (a companion absent here is never proposed):
//
//   * the doc graph - Documentation/INDEX.md, Documentation/ARCHIVE-STYLE.md,
//     Documentation/Plans, Documentation/Guides, Documentation/Skill,
//     Documentation/Handoff, Documentation (the folder), the skill references
//     and the plugin roster;
//   * the package layout - package.json, README.md, SCHEME.md,
//     CONTRIBUTING.md, cordis.patch.yml, Source/Library.ts and the four
//     Source/ folders;
//   * the site - Site/Source/Content, Site/Source/pages,
//     Site/Source/Component, Site/Source/Library and its Content.ts.
//
// Directories are probed like files: `existsSync` answers both, and a folder
// companion is a legitimate target (the built-in pack carries folder targets).
import { existsSync } from "node:fs";
import { join } from "node:path";

/** The documented markers, in derivation order (the probe is order-free). */
const Markers = [
	// The doc graph.
	"Documentation",
	"Documentation/INDEX.md",
	"Documentation/ARCHIVE-STYLE.md",
	"Documentation/Plans",
	"Documentation/Plans/POC-LEDGER.md",
	"Documentation/Guides",
	"Documentation/Skill",
	"Documentation/Skill/session-orientation/references/repository-map.md",
	"Documentation/Skill/plugin-development/references",
	"Documentation/Handoff",
	"Documentation/Plugins/PLUGIN-FAMILY.md",
	// The package layout.
	"package.json",
	"README.md",
	"SCHEME.md",
	"CONTRIBUTING.md",
	"cordis.patch.yml",
	"Source/Library.ts",
	"Source/Function",
	"Source/Variable",
	"Source/Interface",
	"Source/Test",
	// The site.
	"Site/Source/Content",
	"Site/Source/pages",
	"Site/Source/pages/plugins.astro",
	"Site/Source/Component",
	"Site/Source/Library",
	"Site/Source/Library/Content.ts",
];

export default (Root: string): Set<string> =>
	new Set(Markers.filter((Marker) => existsSync(join(Root, Marker))));
