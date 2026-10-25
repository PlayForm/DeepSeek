#!/usr/bin/env node
//===============================================================================
// Publish-Packages.mjs - publish every unpublished workspace package, in
// dependency order.
//===============================================================================
//
// The order is DERIVED from the workspace's own dependency graph: a package
// publishes only after every workspace package it depends on, so the registry
// never receives a tarball whose @playform dependency is missing.
//
// A version already on the registry is SKIPPED - a published version is
// immutable, so a re-run is safe. A package whose dependency failed to publish
// is BLOCKED, never published against a missing dependency.
//
// Usage:
//   node Maintain/Publish-Packages.mjs                  # publish, in order
//   node Maintain/Publish-Packages.mjs --dry-run        # print the plan only
//   node Maintain/Publish-Packages.mjs --layer 2        # one layer only
//   node Maintain/Publish-Packages.mjs --no-provenance  # a local run (no OIDC)
//===============================================================================
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const Root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
	encoding: "utf8",
}).trim();
const Trees = ["Classic", "EffectTS"];
const Scope = "@playform/";

const DryRun = process.argv.includes("--dry-run");
const NoProvenance = process.argv.includes("--no-provenance");
const LayerArgument = process.argv.indexOf("--layer");
const OnlyLayer =
	LayerArgument === -1 ? null : Number.parseInt(process.argv[LayerArgument + 1], 10);

const Flags = NoProvenance
	? ["--access", "public", "--ignore-scripts"]
	: ["--provenance", "--access", "public", "--ignore-scripts"];

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
				Deps: Object.keys(Manifest.dependencies ?? {}).filter((Name) =>
					Name.startsWith(Scope),
				),
			};
		});
};

const Packages = Trees.flatMap((Tree) => readPackages(Tree)).sort((Left, Right) =>
	Left.Name.localeCompare(Right.Name),
);
const Workspace = new Map(Packages.map((Package) => [Package.Name, Package]));

const Depth = new Map();
const Visiting = new Set();
const Cycles = [];

const depth = (Package, Stack) => {
	if (Depth.has(Package.Name)) {
		return Depth.get(Package.Name);
	}
	if (Visiting.has(Package.Name)) {
		Cycles.push([...Stack, Package.Name].join(" -> "));
		return 0;
	}
	Visiting.add(Package.Name);
	let Result = 0;
	for (const Name of Package.Deps) {
		const Dependency = Workspace.get(Name);
		if (Dependency !== undefined) {
			Result = Math.max(Result, depth(Dependency, [...Stack, Package.Name]) + 1);
		}
	}
	Visiting.delete(Package.Name);
	Depth.set(Package.Name, Result);
	return Result;
};

for (const Package of Packages) {
	depth(Package, []);
}

if (Cycles.length > 0) {
	console.error(`Dependency cycle(s) in the workspace: ${Cycles.join("; ")}`);
	process.exit(1);
}

const Layers = [];
for (const Package of Packages) {
	const Index = Depth.get(Package.Name);
	(Layers[Index] ??= []).push(Package);
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

const Documents = await probe(Packages);

const Failed = new Set();
const Blocked = new Set();
let Published = 0;
let Skipped = 0;

for (const [Index, Layer] of Layers.entries()) {
	if (OnlyLayer !== null && OnlyLayer !== Index) {
		continue;
	}
	console.log(`\nL${Index} - ${Layer.length} package(s)`);
	for (const Package of Layer) {
		const Unpublished = Package.Deps.find((Name) => Failed.has(Name) || Blocked.has(Name));
		if (Unpublished !== undefined) {
			Blocked.add(Package.Name);
			console.log(
				`BLOCK  ${Package.Name}@${Package.Version} (${Unpublished} is unpublished)`,
			);
			continue;
		}
		if (Documents.get(Package.Name)?.versions?.[Package.Version] !== undefined) {
			Skipped += 1;
			console.log(`SKIP   ${Package.Name}@${Package.Version} (already on the registry)`);
			continue;
		}
		if (DryRun) {
			console.log(`DRY    ${Package.Name}@${Package.Version}`);
			continue;
		}
		console.log(`PUBLISH ${Package.Name}@${Package.Version}`);
		try {
			execFileSync("npm", ["publish", ...Flags], {
				cwd: Package.Path,
				stdio: "inherit",
			});
			Published += 1;
		} catch {
			Failed.add(Package.Name);
			console.error(`FAILED ${Package.Name}@${Package.Version}`);
		}
	}
}

console.log(
	`\n${Published} published, ${Skipped} skipped, ${Blocked.size} blocked, ${Failed.size} failed.`,
);

if (Failed.size > 0 || Blocked.size > 0) {
	process.exit(1);
}
