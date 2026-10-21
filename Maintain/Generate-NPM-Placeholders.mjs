#!/usr/bin/env node
//===============================================================================
// Generate-NPM-Placeholders.mjs - the empty-first-publish bootstrap generator.
//===============================================================================
//
// WHY THIS EXISTS
//   A trusted publisher binds only to a package that ALREADY exists on the
//   registry. Every new @playform name therefore needs ONE permanent 0.0.0
//   placeholder publish (Documentation/Plans/TRUSTED-PUBLISHER.md section 1)
//   before .github/workflows/NPM.yml can publish the real version over OIDC.
//   0.0.0 is deliberately BELOW the real 0.1.0, so the real release never
//   collides with the placeholder. A published version is IMMUTABLE.
//
// Usage:
//   node Maintain/Generate-NPM-Placeholders.mjs             # dry run: print the plan
//   node Maintain/Generate-NPM-Placeholders.mjs --write     # write Temporary/npm-bootstrap/
//   node Maintain/Generate-NPM-Placeholders.mjs --registry  # also query npm for each name
//   node Maintain/Generate-NPM-Placeholders.mjs --write --registry
//
// Output (Temporary/ is gitignored - /Temporary/ in .gitignore):
//   Temporary/npm-bootstrap/1-missing/<name>/package.json
//   Temporary/npm-bootstrap/2-planned/<name>/package.json
//   Temporary/npm-bootstrap/3-candidates/<name>/package.json
//   Temporary/npm-bootstrap/MANIFEST.json   the machine-readable list
//   Temporary/npm-bootstrap/README.md       the runbook for the manual publish
//   Temporary/npm-bootstrap/Publish.sh      the tiered publish loop
//
// THE TIERS
//   1-missing     In this repository, absent from the registry. REQUIRED now:
//                 NPM.yml cannot publish these six until the names exist.
//   2-planned     Named as a package in Documentation/Plans (decided names).
//                 Includes the mechanically derived ETS twins of the Classic
//                 planned names (the family contract: every Classic member has
//                 an ets- twin).
//   3-candidates  Open names / open archetypes - a plan proposes two forms and
//                 has not decided. Do NOT publish these before the decision:
//                 a placeholder name is permanent and squats the alternative.
//
// The registry column (--registry) is a report only; it never gates the write.
//===============================================================================
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const Root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
	encoding: "utf8",
}).trim();
const Out = join(Root, "Temporary", "npm-bootstrap");
const Version = "0.0.0";
const Scope = "@playform/";
const Description =
	"Placeholder publication (the real package ships from github.com/PlayForm/DeepSeek).";

// ---------------------------------------------------------------------------
// The package table - the single source of truth for this bootstrap.
// Provenance is the document that names the package; never invent a name.
// ---------------------------------------------------------------------------

// The six names that exist in this repository and are ABSENT from the
// registry (Documentation/Plans/RELEASE-0.1.0.md section 2, "The six new
// names"). Their real 0.1.0 manifests are already in the workspace.
const Missing = [
	["hook-dsh-ccr", "Classic", "Documentation/Plans/RELEASE-0.1.0.md"],
	["hook-dsh-live-containers", "Classic", "Documentation/Plans/RELEASE-0.1.0.md"],
	["hook-dsh-tool-coach", "Classic", "Documentation/Plans/RELEASE-0.1.0.md"],
	["ets-hook-dsh-ccr", "EffectTS", "Documentation/Plans/RELEASE-0.1.0.md"],
	["ets-hook-dsh-live-containers", "EffectTS", "Documentation/Plans/RELEASE-0.1.0.md"],
	["ets-hook-dsh-tool-coach", "EffectTS", "Documentation/Plans/RELEASE-0.1.0.md"],
];

// Decided planned names. [name, twin?, provenance]. twin=true means the ETS
// twin is derived mechanically (plugin-dsh-X -> ets-plugin-dsh-X,
// hook-dsh-X -> ets-hook-dsh-X); twin=false means the twin form is NOT
// established by any document, so the Classic name ships alone and the twin
// is listed as a candidate instead.
const Planned = [
	// The workspace family - Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md
	// "The family map" and "The naming by role".
	["plugin-dsh-workspace", true, "Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md"],
	[
		"hook-dsh-workspace-observe",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"plugin-dsh-workspace-semantics",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"hook-dsh-workspace-operate",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"hook-dsh-workspace-govern",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"plugin-dsh-workspace-authority",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"hook-dsh-workspace-journal",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"hook-dsh-workspace-merge",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"hook-dsh-workspace-monitor",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"plugin-dsh-workspace-context",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"hook-dsh-workspace-approve",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"hook-dsh-workspace-audit",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"plugin-dsh-workspace-evidence",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"plugin-dsh-workspace-graph",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"plugin-dsh-workspace-reflect",
		true,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	// The client half and the shared library - named in the same family map,
	// but no document fixes an ets- form for a client-/lib- package.
	[
		"client-dsh-workspace-live",
		false,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	[
		"lib-dsh-workspace-live",
		false,
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md",
	],
	// The orchestration family - Documentation/Plugins/ORCHESTRATION-PLUGINS.md
	// plus one plan per member.
	["plugin-dsh-route", true, "Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md"],
	["plugin-dsh-queue", true, "Documentation/Plans/SUBAGENT-QUEUE-PLUGIN.md"],
	["plugin-dsh-feedback", true, "Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md"],
	["plugin-dsh-batchstate", true, "Documentation/Plans/BATCH-STATE-PLUGIN.md"],
	[
		"plugin-dsh-batch-edit",
		true,
		"Documentation/Plans/Batch-Edit-Tool/PACKAGE-AND-GOVERNANCE.md",
	],
	["plugin-dsh-gitguard", true, "Documentation/Plugins/ORCHESTRATION-PLUGINS.md"],
	// The suggester family - Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md
	// "The package name" and the family table; PATTERN-GRAPH-PLUGIN.md repeats it.
	["hook-dsh-search-suggester", true, "Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md"],
	["hook-dsh-edit-suggester", true, "Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md"],
	["hook-dsh-doc-suggester", true, "Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md"],
	["hook-dsh-test-suggester", true, "Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md"],
	["hook-dsh-graph-suggester", true, "Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md"],
	["hook-dsh-replay-suggester", true, "Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md"],
	["hook-dsh-convention-suggester", true, "Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md"],
	// The UI family's central package - Documentation/Plans/UI-Family/BRIEF.md
	// ("THE DECISION: the central package is @playform/client-dsh-panel-family")
	// and PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md for the companion host package.
	// These two carry no plugin-/hook- prefix, so no twin rule applies.
	["client-dsh-panel-family", false, "Documentation/Plans/UI-Family/BRIEF.md"],
	[
		"client-dsh-panel-family-host",
		false,
		"Documentation/Plans/UI-Family/PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md",
	],
];

// Names a plan leaves open. Publishing one of these would permanently squat a
// name the plan may reject - keep them out of the default publish path.
const Candidates = [
	[
		"plugin-dsh-pattern",
		"Classic",
		"Documentation/Plans/PATTERN-GRAPH-PLUGIN.md (the chosen service)",
	],
	[
		"plugin-dsh-pass-on",
		"Classic",
		"Documentation/Plans/PASS-ON-AND-INGESTER.md (name + archetype open)",
	],
	[
		"plugin-dsh-ingester",
		"Classic",
		"Documentation/Plans/PASS-ON-AND-INGESTER.md (name + archetype open)",
	],
	["hook-dsh-batch-decision", "Classic", "Documentation/Plans/PASS-ON-AND-INGESTER.md (open)"],
	[
		"hook-dsh-batch-edit",
		"Classic",
		"Documentation/Plans/Batch-Edit-Tool/RANKED-SUGGESTIONS.md (rejected in favour of plugin-dsh-batch-edit)",
	],
	[
		"ets-client-dsh-workspace-live",
		"EffectTS",
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md (twin form not established)",
	],
	[
		"ets-lib-dsh-workspace-live",
		"EffectTS",
		"Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md (twin form not established)",
	],
];

// ---------------------------------------------------------------------------
// The derivation + the plan
// ---------------------------------------------------------------------------

const Twin = (Name) =>
	Name.startsWith("plugin-dsh-")
		? `ets-${Name}`
		: Name.startsWith("hook-dsh-")
			? `ets-${Name}`
			: undefined;

const Rows = [];

for (const [Name, Tree, Provenance] of Missing)
	Rows.push({ Name: Scope + Name, Version, Tier: "1-missing", Tree, Provenance });

for (const [Name, HasTwin, Provenance] of Planned) {
	Rows.push({
		Name: Scope + Name,
		Version,
		Tier: "2-planned",
		Tree: "Classic",
		Provenance,
	});
	if (!HasTwin) continue;
	const Derived = Twin(Name);
	Rows.push({
		Name: Scope + Derived,
		Version,
		Tier: "2-planned",
		Tree: "EffectTS",
		Provenance: `${Provenance} (the ets- twin, derived)`,
	});
}

for (const [Name, Tree, Provenance] of Candidates)
	Rows.push({
		Name: Scope + Name,
		Version,
		Tier: "3-candidates",
		Tree,
		Provenance,
	});

// A duplicate name would mean two directories for one registry entry.
const Seen = new Set();
for (const Row of Rows) {
	if (Seen.has(Row.Name)) {
		console.error(`Duplicate name in the table: ${Row.Name}`);
		process.exit(1);
	}
	Seen.add(Row.Name);
}

// ---------------------------------------------------------------------------
// The optional registry probe - report only, never a gate
// ---------------------------------------------------------------------------

const ProbeRegistry = process.argv.includes("--registry");
if (ProbeRegistry) {
	console.log("Querying the registry for every name (a slow, one-shot probe)...");
	for (const Row of Rows) {
		try {
			const Out = execFileSync("npm", ["view", Row.Name, "version"], {
				encoding: "utf8",
				stdio: ["ignore", "pipe", "ignore"],
			}).trim();
			Row.Registry = Out || "unknown";
		} catch {
			Row.Registry = "MISSING";
		}
		console.log(`  ${Row.Name} -> ${Row.Registry}`);
	}
}

// ---------------------------------------------------------------------------
// The report
// ---------------------------------------------------------------------------

const ByTier = (Tier) => Rows.filter((Row) => Row.Tier === Tier);
for (const Tier of ["1-missing", "2-planned", "3-candidates"]) {
	const Members = ByTier(Tier);
	console.log(`\n${Tier} (${Members.length})`);
	for (const Row of Members)
		console.log(`  ${Row.Name}${Row.Registry ? ` -> ${Row.Registry}` : ""}  [${Row.Tree}]`);
}
console.log(`\nTotal: ${Rows.length} placeholder name(s).`);

// ---------------------------------------------------------------------------
// The write
// ---------------------------------------------------------------------------

const Write = process.argv.includes("--write");
if (!Write) {
	console.log("\nDry run - nothing written. Re-run with --write to emit the tree.");
	process.exit(0);
}

const Manifest = (Row) => ({
	name: Row.Name,
	version: Row.Version,
	description: Description,
	license: "CC0-1.0",
	repository: {
		type: "git",
		url: "git+https://github.com/PlayForm/DeepSeek.git",
	},
	publishConfig: { access: "public" },
});

for (const Row of Rows) {
	const Dir = join(Out, Row.Tier, Row.Name.slice(Scope.length));
	mkdirSync(Dir, { recursive: true });
	writeFileSync(join(Dir, "package.json"), `${JSON.stringify(Manifest(Row), null, "\t")}\n`);
}

writeFileSync(
	join(Out, "MANIFEST.json"),
	`${JSON.stringify(
		Rows.map((Row) => ({
			name: Row.Name,
			version: Row.Version,
			tier: Row.Tier,
			tree: Row.Tree,
			provenance: Row.Provenance,
			...(Row.Registry ? { registry: Row.Registry } : {}),
		})),
		null,
		"\t",
	)}\n`,
);

writeFileSync(
	join(Out, "README.md"),
	`# The 0.0.0 empty-first-publish bootstrap

Generated by \`Maintain/Generate-NPM-Placeholders.mjs\`.
The rule it serves: a trusted publisher binds only to a package that already
exists on the registry, so every new \`@playform\` name needs ONE permanent
\`0.0.0\` placeholder publish before \`.github/workflows/NPM.yml\` can publish the
real version over OIDC (\`Documentation/Plans/TRUSTED-PUBLISHER.md\`).

A published version is IMMUTABLE. \`0.0.0\` sits deliberately below the real
\`0.1.0\`, so the two never collide. The placeholder carries a minimal manifest
and no code - it is never meant to be installed.

## The tiers

| Tier           | Count | What it is                                                                                     |
| -------------- | ----- | ---------------------------------------------------------------------------------------------- |
| \`1-missing\`    | ${ByTier("1-missing").length.toString().padStart(5)} | In this repository, absent from the registry. Required before the next NPM.yml run.             |
| \`2-planned\`    | ${ByTier("2-planned").length.toString().padStart(5)} | Named as a package in \`Documentation/Plans\`. Includes the derived \`ets-\` twins of the Classic names. |
| \`3-candidates\` | ${ByTier("3-candidates").length.toString().padStart(5)} | Open names / open archetypes. Do NOT publish before the plan decides.                           |

## The publish (the user's token, the user's command)

\`\`\`bash
npm login                       # publish rights on the @playform scope
cd Temporary/npm-bootstrap
./Publish.sh 1-missing          # REQUIRED - the six names NPM.yml needs
./Publish.sh 2-planned          # the planned family (Classic + ets twins)
./Publish.sh 1-missing --dry-run  # print the loop without publishing
\`\`\`

\`3-candidates\` is never published by \`all\`: publishing one form would squat the
name the plan may reject. Publish a candidate only after the name is decided.

## The trusted-publisher binding (per package, after the placeholders exist)

npm web UI -> the package page -> Settings -> Publishing access -> connect a
source repository:

| Field             | Value        |
| ----------------- | ------------ |
| GitHub account    | \`PlayForm\`   |
| Repository        | \`DeepSeek\`   |
| Workflow filename | \`NPM.yml\`    |
| Environment       | \`Release\`    |

The \`Release\` environment must exist in the repository settings too.
The workflow file must be on the default branch for npm's check to resolve it.

## The caveats

- \`npm unpublish\` works only within 72h and is not a plan. Treat every publish
  as permanent.
- The local placeholder publishes carry NO provenance - provenance needs the
  GitHub OIDC context of a workflow run.
- A name already on the registry fails the publish harmlessly; skip it.
`,
);

writeFileSync(
	join(Out, "Publish.sh"),
	`#!/usr/bin/env bash
# =============================================================================
# Publish.sh - publish the 0.0.0 placeholders for one tier.
# Generated by Maintain/Generate-NPM-Placeholders.mjs.
#
# Usage:
#   ./Publish.sh 1-missing            # the six names NPM.yml needs first
#   ./Publish.sh 2-planned            # the planned family (Classic + ets twins)
#   ./Publish.sh 1-missing --dry-run  # print, do not publish
#   ./Publish.sh all                  # 1-missing + 2-planned (NEVER 3-candidates)
#
# Requires: npm login (publish rights on the @playform scope).
# A published version is IMMUTABLE - 0.0.0 can never be republished.
# =============================================================================
set -euo pipefail

Tier="\${1:-}"
Mode="\${2:-}"

case "$Tier" in
	1-missing|2-planned|3-candidates) Tiers=("$Tier") ;;
	all) Tiers=("1-missing" "2-planned") ;;
	*)
		echo "usage: $0 {1-missing|2-planned|3-candidates|all} [--dry-run]" >&2
		exit 2
		;;
esac

cd "$(dirname "$0")"

for T in "\${Tiers[@]}"; do
	for Dir in "$T"/*/; do
		[ -f "\${Dir}package.json" ] || continue
		Name="$(node -p "require('./\${Dir}package.json').name")"
		Version="$(node -p "require('./\${Dir}package.json').version")"
		Published="$(npm view "$Name@$Version" version 2>/dev/null || true)"
		if [ -n "$Published" ]; then
			echo "SKIP   $Name@$Version (already on the registry)"
			continue
		fi
		if [ "$Mode" = "--dry-run" ]; then
			echo "DRY    (cd $Dir && npm publish --access public)   # $Name@$Version"
			continue
		fi
		echo "PUBLISH $Name@$Version"
		(cd "$Dir" && npm publish --access public) || echo "FAILED $Name@$Version - continue"
	done
done
`,
);

console.log(`\nWrote ${Rows.length} placeholder manifest(s) to ${Out}`);
console.log(`  ${join(Out, "MANIFEST.json")}`);
console.log(`  ${join(Out, "README.md")}`);
console.log(`  ${join(Out, "Publish.sh")}`);
