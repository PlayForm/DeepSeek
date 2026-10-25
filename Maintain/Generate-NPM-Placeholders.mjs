#!/usr/bin/env node
//===============================================================================
// Generate-NPM-Placeholders.mjs - the derived 0.0.0 empty-first-publish scaffold.
//===============================================================================
//
// A trusted publisher binds only to a package that already exists on the npm
// registry, so every new @playform name needs ONE permanent 0.0.0 placeholder
// publish before .github/workflows/NPM.yml can publish the real version over
// OIDC (Documentation/Plans/TRUSTED-PUBLISHER.md).
//
// The scaffold is DERIVED, never hand-maintained: every package under
// Classic/packages and EffectTS/packages is read from its own package.json and
// classified against the registry, so a package added to a tree appears here on
// the next run.
//
//   1-missing      absent from the registry - needs the 0.0.0 placeholder
//   2-placeholder  on the registry, but the repo version is not published yet
//   3-published    the repo version is already on the registry
//
// Usage:
//   node Maintain/Generate-NPM-Placeholders.mjs             # probe, print, write nothing
//   node Maintain/Generate-NPM-Placeholders.mjs --write     # probe and write the scaffold
//   node Maintain/Generate-NPM-Placeholders.mjs --offline   # inventory only, no probe
//===============================================================================
import { execFileSync } from "node:child_process";
import {
	chmodSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

const Root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
	encoding: "utf8",
}).trim();
const Out = join(Root, "Temporary", "npm-bootstrap");
const Trees = ["Classic", "EffectTS"];
const Tiers = ["1-missing", "2-placeholder", "3-published"];
const LegacyTiers = ["2-planned", "3-candidates"];
const PlaceholderVersion = "0.0.0";
const Description =
	"Placeholder publication (the real package ships from github.com/PlayForm/DeepSeek).";

const Offline = process.argv.includes("--offline");
const Write = process.argv.includes("--write");

const readPackages = (Tree) => {
	const Base = join(Root, Tree, "packages");
	return readdirSync(Base)
		.filter((Dir) => existsSync(join(Base, Dir, "package.json")))
		.map((Dir) => {
			const Manifest = JSON.parse(readFileSync(join(Base, Dir, "package.json"), "utf8"));
			return {
				Tree,
				Dir,
				Path: join(Base, Dir),
				Name: Manifest.name,
				Version: Manifest.version,
			};
		});
};

const Packages = Trees.flatMap((Tree) => readPackages(Tree)).sort((Left, Right) =>
	Left.Name.localeCompare(Right.Name),
);

if (Offline && Write) {
	console.error("--offline cannot classify the tiers; drop --write or drop --offline.");
	process.exit(1);
}

if (Offline) {
	console.log(`${Packages.length} package(s) in the workspace (the registry was not probed).`);
	for (const Package of Packages) {
		console.log(`  ${Package.Name}  [${Package.Tree}]  ${Package.Version}`);
	}
	process.exit(0);
}

const fetchDocument = async (Name) => {
	const Url = `https://registry.npmjs.org/${encodeURIComponent(Name)}`;
	for (let Attempt = 0; Attempt < 3; Attempt += 1) {
		if (Attempt > 0) {
			await new Promise((Resolve) => {
				setTimeout(Resolve, 1000 * Attempt);
			});
		}
		try {
			const Response = await fetch(Url, {
				headers: { accept: "application/json" },
			});
			if (Response.status === 404) {
				return null;
			}
			if (!Response.ok) {
				throw new Error(`HTTP ${Response.status} for ${Name}`);
			}
			return await Response.json();
		} catch (Error) {
			if (Attempt === 2) {
				throw new Error(`Failed to fetch ${Name} from the registry`, {
					cause: Error,
				});
			}
		}
	}
	throw new Error(`Failed to fetch ${Name} from the registry`);
};

const probe = async (Packages) => {
	const Documents = new Map();
	const Queue = [...Packages];
	await Promise.all(
		Array.from({ length: 8 }, async () => {
			while (Queue.length > 0) {
				const Package = Queue.shift();
				Documents.set(Package.Name, await fetchDocument(Package.Name));
			}
		}),
	);
	return Documents;
};

const classify = (Package, Document) => {
	switch (true) {
		case Document === null:
			return "1-missing";
		case Boolean(Document.versions?.[Package.Version]):
			return "3-published";
		default:
			return "2-placeholder";
	}
};

const Documents = await probe(Packages);

const Rows = Packages.map((Package) => {
	const Document = Documents.get(Package.Name);
	return {
		...Package,
		Tier: classify(Package, Document),
		Versions: Document === null ? [] : Object.keys(Document.versions ?? {}),
		Latest: Document === null ? null : (Document["dist-tags"]?.latest ?? null),
	};
});

const count = (Tier) => Rows.filter((Row) => Row.Tier === Tier).length;
const members = (Tier) => Rows.filter((Row) => Row.Tier === Tier);

Rows.sort(
	(Left, Right) =>
		Tiers.indexOf(Left.Tier) - Tiers.indexOf(Right.Tier) || Left.Name.localeCompare(Right.Name),
);

console.log(`${Rows.length} package(s) across ${Trees.join(" + ")}.\n`);
for (const Tier of Tiers) {
	console.log(`${Tier} (${count(Tier)})`);
	if (Tier !== "1-missing") continue;
	for (const Row of members(Tier)) {
		console.log(`  ${Row.Name}  [${Row.Tree}]  repo=${Row.Version}  latest=${Row.Latest}`);
	}
}

if (!Write) {
	console.log("\nDry run - nothing written. Re-run with --write to emit the scaffold.");
	process.exit(0);
}

for (const Tier of [...Tiers, ...LegacyTiers]) {
	rmSync(join(Out, Tier), { recursive: true, force: true });
}

for (const Row of members("1-missing")) {
	const Directory = join(Out, "1-missing", Row.Dir);
	mkdirSync(Directory, { recursive: true });
	writeFileSync(
		join(Directory, "package.json"),
		`${JSON.stringify(
			{
				name: Row.Name,
				version: PlaceholderVersion,
				description: Description,
				license: "CC0-1.0",
				repository: {
					type: "git",
					url: "git+https://github.com/PlayForm/DeepSeek.git",
				},
				publishConfig: { access: "public" },
			},
			null,
			"\t",
		)}\n`,
	);
}

writeFileSync(
	join(Out, "MANIFEST.json"),
	`${JSON.stringify(
		Rows.map((Row) => ({
			name: Row.Name,
			version: Row.Version,
			tier: Row.Tier,
			tree: Row.Tree,
			dir: Row.Dir,
			registry: {
				versions: Row.Versions,
				latest: Row.Latest,
			},
		})),
		null,
		"\t",
	)}\n`,
);

const Today = new Date().toISOString().slice(0, 10);

writeFileSync(
	join(Out, "README.md"),
	`# The 0.0.0 empty-first-publish scaffold

Generated by \`Maintain/Generate-NPM-Placeholders.mjs\` from the two release
trees: every package under \`Classic/packages\` and \`EffectTS/packages\`, read
from its own \`package.json\`. The scaffold is derived - add a package and the
next run sees it.

The rule it serves: a trusted publisher binds only to a package that already
exists on the registry, so every new \`@playform\` name needs ONE permanent
\`0.0.0\` placeholder publish before \`.github/workflows/NPM.yml\` can publish the
real version over OIDC (\`Documentation/Plans/TRUSTED-PUBLISHER.md\`).

## The tiers (probed ${Today})

- \`1-missing\` (${count("1-missing")}) - absent from the registry; needs the \`0.0.0\` placeholder.
- \`2-placeholder\` (${count("2-placeholder")}) - a placeholder only; the repo version is unpublished.
- \`3-published\` (${count("3-published")}) - the repo version is already on the registry.

## The publish (the user's token, the user's command)

\`\`\`bash
npm login # publish rights on the @playform scope
cd Temporary/npm-bootstrap
./Publish.sh --dry-run # print the loop, publish nothing
./Publish.sh # publish the missing 0.0.0 placeholders
\`\`\`

## The trusted-publisher binding (per package, after the placeholders exist)

npm 12 binds from the CLI, so the whole family is one loop rather than a web UI
pass over every package page:

\`\`\`bash
node -p "require('./MANIFEST.json').map((Row) => Row.name).join('\\n')" |
	while read -r Name; do
		npm trust github "$Name" --file NPM.yml --repo PlayForm/DeepSeek --env Release --allow-publish -y
	done
\`\`\`

\`npm trust list <package>\` verifies one binding. The \`Release\` environment must
exist in the repository settings, and \`NPM.yml\` must be on the default branch.

## The caveats

- \`npm unpublish\` works only within 72h and is not a plan. Treat every publish
  as permanent.
- The local placeholder publishes carry NO provenance - provenance needs the
  GitHub OIDC context of a workflow run.
- A name already on the registry fails the publish harmlessly; \`Publish.sh\`
  skips it.
`,
);

writeFileSync(
	join(Out, "Publish.sh"),
	`#!/usr/bin/env bash
# =============================================================================
# Publish.sh - publish the 0.0.0 placeholders for the 1-missing tier.
# Generated by Maintain/Generate-NPM-Placeholders.mjs - do not edit.
#
# Usage:
#   ./Publish.sh            # publish every missing 0.0.0 placeholder
#   ./Publish.sh --dry-run  # print the loop, publish nothing
#
# Requires: npm login (publish rights on the @playform scope).
# A published version is IMMUTABLE - 0.0.0 can never be republished.
# =============================================================================
set -euo pipefail

Mode="\${1:-}"
Base="$(dirname "$0")/1-missing"

if [ ! -d "$Base" ]; then
	echo "No 1-missing placeholders - every name exists on the registry."
	exit 0
fi

cd "$Base"

for Dir in */; do
	[ -f "\${Dir}package.json" ] || continue
	Name="$(node -p "require('./\${Dir}package.json').name")"
	Version="$(node -p "require('./\${Dir}package.json').version")"
	Published="$(npm view "$Name@$Version" version 2> /dev/null || true)"
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
`,
);

chmodSync(join(Out, "Publish.sh"), 0o755);

console.log(`\nWrote the scaffold to ${Out}`);
console.log(`  ${join(Out, "MANIFEST.json")}`);
console.log(`  ${join(Out, "README.md")}`);
console.log(`  ${join(Out, "Publish.sh")}`);
console.log(`  ${join(Out, "1-missing")} (${count("1-missing")} placeholder manifest(s))`);
