#!/usr/bin/env node
//===============================================================================
// Generate-Marketplace.mjs - the static DSH plugin-market index generator.
//===============================================================================
//
// Builds the format-1 plugin market index from the two release trees
// (Classic/packages and EffectTS/packages) plus the npm registry, validates it
// with @deepseek-ai/dsh-plugin-market-index, and writes the SAME bytes to
// <root>/marketplace.json and <root>/Site/Public/marketplace.json.
//
// Usage:
//   node Maintain/Generate-Marketplace.mjs           # generate and write
//   node Maintain/Generate-Marketplace.mjs --check   # verify both files; never writes
//===============================================================================
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { parseMarketIndex } from "@deepseek-ai/dsh-plugin-market-index";

const IndexUrl = "https://deepseek.playform.cloud/marketplace.json";
const RepositoryUrl = "https://github.com/PlayForm/DeepSeek";
const Placeholders = new Set(["0.0.0", "0.0.0-stage"]);
const KindPrefixes = ["plugin", "hook", "client", "lib"];
const Kinds = { lib: "library" };

const Root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
	encoding: "utf8",
}).trim();

// The pin is the last commit that touched the package's directory, not HEAD:
// a commit that only touches the market index, the docs or the site leaves
// every pin valid, so `--check` stays meaningful between releases. A package
// with no history yet (added but not committed) falls back to HEAD.
const HeadCommit = execFileSync("git", ["rev-parse", "HEAD"], {
	encoding: "utf8",
	cwd: Root,
}).trim();
const HeadTime = Number.parseInt(
	execFileSync("git", ["show", "-s", "--format=%ct", "HEAD"], {
		encoding: "utf8",
		cwd: Root,
	}).trim(),
	10,
);

const pinOf = (Path) => {
	const Line = execFileSync("git", ["log", "-1", "--format=%H %ct", "--", Path], {
		encoding: "utf8",
		cwd: Root,
	}).trim();
	const [Commit, Time] = Line === "" ? [HeadCommit, String(HeadTime)] : Line.split(" ");
	return { Commit, Time: Number.parseInt(Time, 10) };
};

const readPackages = (Tree) => {
	const Base = join(Root, Tree, "packages");
	return readdirSync(Base)
		.filter((Dir) => existsSync(join(Base, Dir, "package.json")))
		.map((Dir) => {
			const Manifest = JSON.parse(readFileSync(join(Base, Dir, "package.json"), "utf8"));
			return {
				Tree,
				Dir,
				Name: Manifest.name,
				Version: Manifest.version,
				Description: Manifest.description ?? "",
				Bundle: Boolean(Manifest.dsh?.bundle),
				Deps: Object.keys(Manifest.dependencies ?? {}),
				Engines: Manifest.engines?.dsh,
			};
		});
};

const Packages = [...readPackages("Classic"), ...readPackages("EffectTS")];

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

const registry = new Map();
{
	const Queue = [...Packages];
	const Workers = Array.from({ length: 8 }, async () => {
		while (Queue.length > 0) {
			const Package = Queue.shift();
			registry.set(Package.Name, await fetchDocument(Package.Name));
		}
	});
	await Promise.all(Workers);
}

const stripPrefix = (Text, Prefixes) => {
	let Result = Text;
	for (const Prefix of Prefixes) {
		if (Result.startsWith(`${Prefix}-`)) {
			Result = Result.slice(Prefix.length + 1);
			break;
		}
	}
	return Result;
};

const titleOf = (Tree, Dir) => {
	let Title = stripPrefix(Dir, ["ets"]);
	Title = stripPrefix(Title, KindPrefixes);
	Title = Title.split("-")
		.filter((Word) => Word !== "dsh")
		.map((Word) => Word.charAt(0).toUpperCase() + Word.slice(1).toLowerCase())
		.join(" ");
	if (Tree === "EffectTS") {
		Title += " (Effect-TS)";
	}
	return Title;
};

const describe = (Text) => {
	if (Text.length <= 240) {
		return Text;
	}
	const Cut = Text.slice(0, 240);
	const Space = Cut.lastIndexOf(" ");
	return `${Space > 0 ? Cut.slice(0, Space) : Cut}...`;
};

const kindOf = (Dir) => {
	const Base = stripPrefix(Dir, ["ets"]);
	const Kind = stripPrefix(Base, KindPrefixes);
	const Prefix = Base === Kind ? null : Base.slice(0, Base.length - Kind.length - 1);
	return Prefix ? (Kinds[Prefix] ?? Prefix) : "library";
};

const keywordsOf = (Tree, Dir) => {
	const Words = stripPrefix(Dir, ["ets"]).split("-");
	const Kind = Words[0];
	const Keywords = Words.filter((Word) => Word !== Kind && Word !== "ets" && Word !== "dsh");
	return [...Keywords, Tree.toLowerCase()];
};

let NpmVersions = 0;
let GitVersions = 0;

const Plugins = Packages.map((Package) => {
	const Document = registry.get(Package.Name);
	const Engines = Package.Engines === undefined ? {} : { dsh: Package.Engines };
	const Versions = [];

	if (Document !== null) {
		for (const Version of Object.keys(Document.versions)) {
			if (Placeholders.has(Version)) {
				continue;
			}
			Versions.push({
				version: Version,
				publishTimestamp: Math.floor(Date.parse(Document.time[Version]) / 1000),
				source: { type: "npm" },
				engines: Engines,
			});
			NpmVersions += 1;
		}
	}

	const Published = new Set(Versions.map((Entry) => Entry.version));
	if (!Published.has(Package.Version)) {
		const Pin = pinOf(`${Package.Tree}/packages/${Package.Dir}`);
		Versions.push({
			version: Package.Version,
			publishTimestamp: Pin.Time,
			source: {
				type: "git",
				url: RepositoryUrl,
				commit: Pin.Commit,
				path: `${Package.Tree}/packages/${Package.Dir}`,
			},
			engines: Engines,
		});
		GitVersions += 1;
	}

	const Labels = [Package.Tree.toLowerCase()];
	if (Versions.some((Entry) => Entry.source.type === "npm")) {
		Labels.push("npm");
	}
	if (Versions.some((Entry) => Entry.source.type === "git")) {
		Labels.push("source");
	}

	return {
		name: Package.Name,
		title: { en: titleOf(Package.Tree, Package.Dir) },
		...(Package.Description.trim() === ""
			? {}
			: { description: { en: describe(Package.Description) } }),
		author: "PlayForm",
		repository: {
			url: RepositoryUrl,
			directory: `${Package.Tree}/packages/${Package.Dir}`,
		},
		metadata: {
			category: kindOf(Package.Dir),
			keywords: keywordsOf(Package.Tree, Package.Dir),
			labels: Labels,
			sortKeys: {},
		},
		versions: Versions,
	};
});

const Titles = {
	plugin: "Plugin",
	hook: "Hook",
	client: "Client",
	library: "Library",
};
const LabelTitles = {
	classic: "Classic",
	effectts: "Effect-TS",
	npm: "npm",
	source: "Source",
};

const Index = {
	format: 1,
	title: { en: "DSH Family @ PlayForm" },
	description: {
		en: `The PlayForm DeepSeek Harness plugin family: ${Plugins.length} packages across the Classic TypeScript and Effect-TS trees.`,
	},
	metadata: {
		categories: Object.fromEntries(
			Object.entries(Titles).map(([Id, Title]) => [Id, { title: { en: Title } }]),
		),
		labels: Object.fromEntries(
			Object.entries(LabelTitles).map(([Id, Title]) => [Id, { title: { en: Title } }]),
		),
		sortKeys: {},
	},
	plugins: Plugins.sort((A, B) => A.name.localeCompare(B.name)),
};

parseMarketIndex(Index, IndexUrl);

const Bytes = `${JSON.stringify(Index, null, "\t")}\n`;
const Outputs = [join(Root, "marketplace.json")];
if (existsSync(join(Root, "Site", "Public"))) {
	Outputs.push(join(Root, "Site", "Public", "marketplace.json"));
} else {
	console.log(
		"Site/Public is absent - writing the root index only (the site tree is a separate repository).",
	);
}

if (process.argv.includes("--check")) {
	let Stale = false;
	for (const Output of Outputs) {
		let Current;
		try {
			Current = readFileSync(Output, "utf8");
		} catch {
			console.log(`STALE: ${Output} is missing`);
			Stale = true;
			continue;
		}
		if (Current !== Bytes) {
			console.log(`STALE: ${Output} differs from the generated index`);
			Stale = true;
		}
	}
	if (Stale) {
		process.exit(1);
	}
	console.log("marketplace.json is up to date");
} else {
	for (const Output of Outputs) {
		writeFileSync(Output, Bytes);
	}
	console.log(
		`Wrote ${Plugins.length} plugins (${NpmVersions} npm versions, ${GitVersions} git versions) to:`,
	);
	for (const Output of Outputs) {
		console.log(`  ${Output}`);
	}
}
