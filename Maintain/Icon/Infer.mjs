// Infer.mjs - the inference pass: read a package's code and recover its
// SEMANTICS as named tokens, with provenance.
//
// The tokens are not counts. Each one carries the construct's own name, so the
// transliteration can place the same gate in the same spot on every build and the
// ledger can say which file produced it:
//
//   gate        .on("tools/post-execute")          -> the gate's own path
//   tool        registerTool("...")                 -> the tool's name
//   service     ctx.provide("trace")                -> the service's name
//   injection   inject = ["pluginFactory", ...]     -> the injected service
//   seam        prepend / append markers            -> the seam count
//   ledger      module-owned ledger strings         -> the string
//   refusal     "refuse"/"skip"/"blocked" strings   -> the string
//   transform   the normalize flavor / update stage -> the flavor
//   stream      "stream" in the source              -> the stream name
//   state       "storage"/"state" in the source     -> the domain
//   trace       "trace"/"span" in the source        -> the span name
//
// The manifest is what the icon transliterates; the provenance is what makes the
// reading auditable.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const read = (Path) => {
	try {
		return readFileSync(Path, "utf8");
	} catch {
		return "";
	}
};

const walk = (Directory, Limit = 300) => {
	const Files = [];
	const visit = (Current) => {
		if (Files.length >= Limit) {
			return;
		}
		let Entries = [];
		try {
			Entries = readdirSync(Current, { withFileTypes: true });
		} catch {
			return;
		}
		for (const Entry of Entries) {
			if (Entry.name === "Test" || Entry.name === "node_modules" || Entry.name === "Target") {
				continue;
			}
			const Path = join(Current, Entry.name);
			if (Entry.isDirectory()) {
				visit(Path);
			} else if (Entry.name.endsWith(".ts")) {
				Files.push(Path);
			}
		}
	};
	visit(Directory);
	return Files;
};

const unique = (Values) => [
	...new Set(Values.filter((Value) => typeof Value === "string" && Value.trim() !== "")),
];

const matches = (Text, Pattern, Group = 1) =>
	unique([...Text.matchAll(Pattern)].map((Match) => Match[Group]));

/** A module-owned ledger string: lower-case words joined by a colon, no import. */
const ledgerOf = (Text) =>
	matches(Text, /["'`]([a-z][a-z0-9-]*(?::[a-z][a-z0-9-]*){1,3}[^"'`\n]{0,50})["'`]/g).filter(
		(Value) => !Value.startsWith("node:") && !Value.includes("@playform/") && Value.length > 5,
	);

/** The semantic manifest of one package. */
export const inferTokens = (Root, Directory) => {
	const Base = join(Root, "Classic", "packages", Directory);
	const BaseETS = join(Root, "EffectTS", "packages", Directory);
	const Path = existsSync(Base) ? Base : BaseETS;
	const Files = walk(join(Path, "Source"));
	const Source = Files.map((File) => read(File)).join("\n");
	const Library = read(join(Path, "Source", "Library.ts"));
	const Changelog = read(join(Path, "CHANGELOG.md"));
	const Scheme = read(join(Path, "SCHEME.md"));
	const Domain = Directory.replace(/^ets-/, "").replace(/^(hook|plugin|client|lib)-dsh-/, "");

	const Inject = Library.match(/inject\s*=\s*\[([\s\S]*?)\]/)?.[1] ?? "";
	const Injections = unique(
		[...Inject.matchAll(/["'`]([^"'`]+)["'`]/g)].map((Match) => Match[1]),
	);
	const Gates = matches(Source, /\.on\(\s*["'`]([^"'`]+)["'`]/g);
	const Tools = matches(Source, /(?:registerTool|defineTool)\(\s*["'`]([^"'`]+)["'`]/g);
	const Services = matches(Source, /ctx\.provide\(\s*["'`]([^"'`]+)["'`]/g);
	const Seams = matches(Source, /(?:prepend|append)\s*:\s*true/g);
	const Ledger = ledgerOf(Source);
	const Refusals = unique(
		[
			...Source.matchAll(
				/["'`]([^"'`\n]{0,80}(?:refus|skip|blocked|denied|escape|waive)[^"'`\n]{0,80})["'`]/gi,
			),
		].map((Match) => Match[1]),
	);
	const Streams =
		/stream/i.test(Source) || /stream/i.test(Scheme)
			? unique(
					[...Source.matchAll(/["'`]([a-z-]*stream[a-z-]*)["'`]/gi)].map(
						(Match) => Match[1],
					),
				)
			: [];
	const States = /storage|persist|state/i.test(Source) ? [Domain] : [];
	const Traces = /trace|span/i.test(Source) ? [Domain] : [];
	const Transforms = /normalize/.test(Domain)
		? [Domain.replace(/^normalize-/, "")]
		: /update/.test(Source)
			? [Domain]
			: [];

	const Tokens = {
		gate: Gates,
		tool: Tools,
		service: Services,
		injection: Injections,
		seam:
			Seams.length > 0
				? Array.from({ length: Seams.length }, (_, Index) => `seam-${Index + 1}`)
				: [],
		ledger: Ledger,
		refusal: Refusals,
		transform: Transforms,
		stream: Streams,
		state: States,
		trace: Traces,
	};

	const Provenance = {
		files: Files.length,
		sources: Files.map((File) => File.slice(Path.length + 1)),
		hasChangelog: Changelog !== "",
		hasScheme: Scheme !== "",
	};

	return { package: Directory, domain: Domain, tokens: Tokens, provenance: Provenance };
};

/** The token counts, for the ledger and the icon's density. */
export const tokenCounts = (Manifest) =>
	Object.fromEntries(
		Object.entries(Manifest.tokens).map(([Key, Values]) => [Key, Values.length]),
	);
