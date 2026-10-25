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
import { dirname, join } from "node:path";

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

/** The package directory in whichever tree owns it. */
const packagePathOf = (Root, Directory) => {
	const Classic = join(Root, "Classic", "packages", Directory);
	return existsSync(Classic) ? Classic : join(Root, "EffectTS", "packages", Directory);
};

/** The semantic manifest of one package. */
export const inferTokens = (Root, Directory) => {
	const Path = packagePathOf(Root, Directory);
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

const countFact = (Count, Singular, Plural) => `${Count} ${Count === 1 ? Singular : Plural}`;

const functionsOf = (Sources) =>
	Sources.filter((Source) => /^Source\/Function\/[^/]+\.ts$/.test(Source)).length;

/** File-to-file import edges inside one package. */
const edgesOf = (Path, Files) => {
	const Present = new Set(Files);
	const Edges = new Set();
	for (const File of Files) {
		for (const Match of read(File).matchAll(/from\s+["'](\.\.?\/[^"']+)["']/g)) {
			const Target = join(dirname(File), Match[1]).replace(/\.js$/, ".ts");
			if (Present.has(Target)) {
				Edges.add(`${File.slice(Path.length + 1)} -> ${Target.slice(Path.length + 1)}`);
			}
		}
	}
	return [...Edges].sort();
};

/** The structural reading of one package: files, edges, totals, and named tokens. */
export const structureOf = (Root, Directory) => {
	const Path = packagePathOf(Root, Directory);
	const Manifest = inferTokens(Root, Directory);
	const Tokens = Manifest.tokens;
	const Sources = Manifest.provenance.sources;
	return {
		directory: Directory,
		files: Sources,
		edges: edgesOf(Path, walk(join(Path, "Source"))),
		totals: {
			events: Tokens.gate.length,
			services: Tokens.service.length,
			injections: Tokens.injection.length,
			refusals: Tokens.refusal.length,
			tools: Tokens.tool.length,
			functions: functionsOf(Sources),
		},
		tokens: Tokens,
	};
};

const roleOf = (Structure, Entry, Domain) => {
	const { totals, tokens } = Structure;
	const Storeish = /store|pack|ccr|cache|journal|ledger|replay|history|persist|state/.test(
		Domain,
	);
	const Routerish = /route|workspace|merge|split|fanout|schedule|batch|dispatch/.test(Domain);
	const Transformerish =
		/normalize|transform|update|edit|format|compress|convert|encode|rewrite|suggest|doc/.test(
			Domain,
		);
	const Governorish = /govern|audit|pin|convention|check|guard|policy|factory|rule/.test(Domain);
	const Analyzerish = /trace|analys|analyze|diagnos|inspect|report|graph/.test(Domain);
	const Rendererish = /panel|view|render|icon|design|style|visual/.test(Domain);

	switch (Entry.kind) {
		case "client":
			return { role: "renderer", observed: Rendererish };
		case "hook":
			switch (true) {
				case Storeish:
					return { role: "store", observed: tokens.state.length > 0 };
				case Routerish:
					return { role: "router", observed: totals.injections >= 3 };
				case Transformerish:
					return { role: "transformer", observed: tokens.transform.length > 0 };
				case Governorish:
					return { role: "governor", observed: totals.refusals >= 2 };
				case Analyzerish:
					return { role: "analyzer", observed: false };
				default:
					return { role: "interceptor", observed: totals.events > 0 };
			}
		case "plugin":
			switch (true) {
				case Governorish:
					return { role: "governor", observed: totals.refusals >= 2 };
				case Routerish:
					return { role: "router", observed: totals.injections >= 3 };
				case Storeish:
					return { role: "store", observed: tokens.state.length > 0 };
				case Rendererish:
					return { role: "renderer", observed: true };
				case Transformerish:
					return { role: "transformer", observed: tokens.transform.length > 0 };
				default:
					return {
						role: "orchestrator",
						observed: Entry.bundle === true || totals.tools > 0 || totals.services >= 2,
					};
			}
		case "lib":
			switch (true) {
				case Analyzerish:
					return { role: "analyzer", observed: false };
				case Storeish:
					return { role: "store", observed: tokens.state.length > 0 };
				case Transformerish:
					return { role: "transformer", observed: tokens.transform.length > 0 };
				default:
					return { role: "analyzer", observed: false };
			}
		default:
			return { role: "analyzer", observed: false };
	}
};

const flowOf = (Role) => {
	switch (Role) {
		case "interceptor":
		case "governor":
			return "inbound";
		case "transformer":
		case "renderer":
			return "outbound";
		case "router":
		case "orchestrator":
			return "bidirectional";
		default:
			return "internal";
	}
};

const weightOf = (Functions) => {
	switch (true) {
		case Functions <= 2:
			return 0;
		case Functions <= 5:
			return 1;
		case Functions <= 10:
			return 2;
		case Functions <= 20:
			return 3;
		default:
			return 4;
	}
};

const factsOf = (Structure, Entry) => {
	const { totals, tokens } = Structure;
	const Facts = [];
	if (totals.events > 0) {
		Facts.push(countFact(totals.events, "event gate", "event gates"));
	}
	if (totals.services > 0) {
		Facts.push(countFact(totals.services, "provided service", "provided services"));
	}
	if (totals.injections > 0) {
		Facts.push(countFact(totals.injections, "injected service", "injected services"));
	}
	if (totals.refusals > 0) {
		Facts.push(countFact(totals.refusals, "refusal string", "refusal strings"));
	}
	if (totals.tools > 0) {
		Facts.push(countFact(totals.tools, "tool", "tools"));
	}
	if (tokens.state.length > 0) {
		Facts.push("state tokens");
	}
	if (tokens.transform.length > 0) {
		Facts.push("transform tokens");
	}
	if (tokens.stream.length > 0) {
		Facts.push("stream tokens");
	}
	if (Entry.kind !== undefined) {
		Facts.push(`kind ${Entry.kind}`);
	}
	if (Entry.domain !== undefined) {
		Facts.push(`domain ${Entry.domain}`);
	}
	if (Entry.bundle === true) {
		Facts.push("bundle");
	}
	Facts.push(countFact(totals.functions, "function", "functions"));
	return Facts;
};

/** The functional profile of one package: its role, flow, and structural weight. */
export const profileOf = (Structure, Entry) => {
	const { totals, tokens } = Structure;
	const Domain = Entry.domain;
	const Role = roleOf(Structure, Entry, Domain);
	return {
		role: Role.role,
		flow: flowOf(Role.role),
		stateful: tokens.state.length > 0 || Role.role === "store",
		streaming: tokens.stream.length > 0 || /stream|pipe|flow/.test(Domain),
		branching: Math.min(4, totals.events + totals.services),
		containment: Math.min(
			4,
			totals.injections + (totals.services > 0 ? 1 : 0) + (Entry.bundle ? 1 : 0),
		),
		weight: weightOf(totals.functions),
		evidence: unique(factsOf(Structure, Entry)).slice(0, 6),
		confidence: Role.observed ? "observed" : "inferred",
	};
};
