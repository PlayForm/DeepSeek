// Maintain/Icon/Feature.mjs - the section 6 reader: one package directory in,
// one feature vector out. It reads only the package's own files (package.json,
// Source/Library.ts, the other Source .ts files, CHANGELOG.md) and derives the
// identity (package, kind, tree, twin, version, domain, bundle), the source
// behaviour (functions, injections, events, tools, seams, services) and the
// changelog shape (versions, entries, digest). See
// Documentation/Brand/ICON-GRAMMAR.md sections 6 to 8.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const Trees = ["Classic", "EffectTS"];
const KindPrefixes = ["hook", "plugin", "client", "lib"];

const sha256Of = (Bytes) => createHash("sha256").update(Bytes).digest("hex");

const stripPrefix = (Name, Prefix) =>
	Name.startsWith(`${Prefix}-`) ? Name.slice(Prefix.length + 1) : Name;

// The source comments carry code samples (Context.on(...), { prepend: true }),
// so every counting pass strips full-line comment lines - and the continuation
// lines of block comments - before it counts.
const codeOf = (Text) =>
	Text.split("\n")
		.filter((Line) => {
			const Trimmed = Line.trim();
			return (
				Trimmed !== "" &&
				!Trimmed.startsWith("//") &&
				!Trimmed.startsWith("/*") &&
				!Trimmed.startsWith("*")
			);
		})
		.join("\n");

/** The kind of a package directory; the kindless base library counts as lib. */
export const kindOf = (dirName) => {
	const Base = stripPrefix(dirName, "ets");
	for (const Kind of KindPrefixes) {
		if (Base.startsWith(`${Kind}-`)) {
			return Kind;
		}
	}
	return "lib";
};

/** The tree a package directory lives in, found by looking at the trees. */
export const treeOf = (root, dir) => {
	for (const Tree of Trees) {
		if (existsSync(join(root, Tree, "packages", dir, "package.json"))) {
			return Tree;
		}
	}
	throw new Error(`Package directory not found in either tree: ${dir}`);
};

/** The scoped package name of the same package in the other tree, or null:
 ** Classic adds the "ets-" tree prefix after the scope, EffectTS removes it. */
export const twinOf = (name, tree) => {
	const Slash = name.lastIndexOf("/");
	if (Slash < 0) {
		return null;
	}
	const Scope = name.slice(0, Slash);
	const Local = name.slice(Slash + 1);
	switch (true) {
		case tree === "Classic":
			return `${Scope}/ets-${Local}`;
		case tree === "EffectTS" && Local.startsWith("ets-"):
			return `${Scope}/${Local.slice("ets-".length)}`;
		default:
			return null;
	}
};

// "hook-dsh-normalize-dash" -> "normalize-dash", "ets-base-dsh" -> "base": the
// optional tree prefix, the kind prefix and the leading "dsh-" marker are
// removed (for the kindless base library the trailing one is).
const domainOf = (dirName) => {
	let Name = stripPrefix(dirName, "ets");
	for (const Kind of KindPrefixes) {
		Name = stripPrefix(Name, Kind);
	}
	switch (true) {
		case Name.startsWith("dsh-"):
			return Name.slice("dsh-".length);
		case Name.endsWith("-dsh"):
			return Name.slice(0, Name.length - "-dsh".length);
		default:
			return Name;
	}
};

// Every .ts file under Source, except the Source/Test directory.
const sourceFiles = (base) => {
	const Files = [];
	const Walk = (Path) => {
		for (const Entry of readdirSync(Path, { withFileTypes: true })) {
			if (Entry.isDirectory()) {
				if (Entry.name !== "Test") {
					Walk(join(Path, Entry.name));
				}
			} else if (Entry.name.endsWith(".ts")) {
				Files.push(join(Path, Entry.name));
			}
		}
	};
	Walk(base);
	return Files;
};

// The index of the closing quote of the string literal that opens at Start, or
// the last index of the text when it never closes.
const skipString = (Text, Start) => {
	const Quote = Text[Start];
	for (let Index = Start + 1; Index < Text.length; Index += 1) {
		if (Text[Index] === "\\") {
			Index += 1;
			continue;
		}
		if (Text[Index] === Quote) {
			return Index;
		}
	}
	return Text.length - 1;
};

// The text between the balanced brackets that open at Start, string literals
// skipped, or null when the brackets never balance.
const balancedBodyOf = (Text, Start) => {
	let Depth = 0;
	for (let Index = Start; Index < Text.length; Index += 1) {
		const Char = Text[Index];
		if (Char === '"' || Char === "'" || Char === "`") {
			Index = skipString(Text, Index);
			continue;
		}
		if (Char === "[") {
			Depth += 1;
		}
		if (Char === "]") {
			Depth -= 1;
			if (Depth === 0) {
				return Text.slice(Start + 1, Index);
			}
		}
	}
	return null;
};

// The length of the inject array in Library.ts, however it is declared:
// `export const inject = [...]` (also spread over lines), `static inject =
// [...]`, or the typed `static inject: string[] = []`. 0 when absent.
const injectionsOf = (Library) => {
	const Declared = Library.match(/\binject\s*(?::\s*[\w[\]\s]+)?=(?!=)\s*(\[|$)/);
	if (Declared === null) {
		return 0;
	}
	const Start = Declared.index + Declared[0].length - 1;
	if (Library[Start] !== "[") {
		return 0;
	}
	const Body = balancedBodyOf(Library, Start);
	if (Body === null) {
		return 0;
	}
	return (Body.match(/(["'`])(?:\\.|[\s\S])*?\1/g) ?? []).length;
};

const eventsOf = (Source) => (Source.match(/\.on\s*\(\s*(["'`])/g) ?? []).length;
const toolsOf = (Source) => (Source.match(/\bdefineTool\s*\(/g) ?? []).length;

// The order markers: object keys "prepend:" / "append:" that are not switch
// cases (`case "append":`), not quoted keys and not method bodies
// (`append: (State, Message) =>` is a service method, not a seam).
const seamsOf = (Source) =>
	(Source.match(/(?<![\w"'])(?:prepend|append)\s*:\s*(?!\()/g) ?? []).length;

// The service registrations: ctx.provide and ctx.reflect.provide. The
// Effect-TS runtime plumbing (Scope.provide, Effect.provide) is not a service
// registration and does not count.
const servicesOf = (Source) => {
	let Count = 0;
	for (const Match of Source.matchAll(/([\w$.]+)\.provide\s*\(/g)) {
		const Receiver = Match[1].split(".").pop();
		if (Receiver !== "Scope" && Receiver !== "Effect") {
			Count += 1;
		}
	}
	return Count;
};

/** The full feature vector of one package directory under root. */
export const featuresOf = (root, dir) => {
	const tree = treeOf(root, dir);
	const Base = join(root, tree, "packages", dir);
	const Manifest = JSON.parse(readFileSync(join(Base, "package.json"), "utf8"));

	// The twin only counts when the twin package really exists in the other
	// tree: "ets-base-dsh" has no kindless Classic twin, so its twin is null.
	const Raw = twinOf(Manifest.name, tree);
	const Other = tree === "Classic" ? "EffectTS" : "Classic";
	const twin =
		Raw !== null &&
		existsSync(join(root, Other, "packages", Raw.slice(Raw.lastIndexOf("/") + 1)))
			? Raw
			: null;

	const FunctionDir = join(Base, "Source", "Function");
	const functions = existsSync(FunctionDir)
		? readdirSync(FunctionDir).filter((Name) => Name.endsWith(".ts")).length
		: 0;

	const SourceDir = join(Base, "Source");
	const Source = existsSync(SourceDir)
		? codeOf(
				sourceFiles(SourceDir)
					.map((File) => readFileSync(File, "utf8"))
					.join("\n"),
			)
		: "";

	const ChangelogPath = join(Base, "CHANGELOG.md");
	const ChangelogText = existsSync(ChangelogPath) ? readFileSync(ChangelogPath, "utf8") : "";

	const features = {
		functions,
		injections: injectionsOf(codeOf(readFileSync(join(Base, "Source", "Library.ts"), "utf8"))),
		events: eventsOf(Source),
		tools: toolsOf(Source),
		seams: seamsOf(Source),
		services: servicesOf(Source),
		changelogVersions: (ChangelogText.match(/^## /gm) ?? []).length,
		changelogEntries: (ChangelogText.match(/^- /gm) ?? []).length,
	};

	return {
		package: Manifest.name,
		dir,
		kind: kindOf(dir),
		tree,
		twin,
		version: Manifest.version,
		domain: domainOf(dir),
		bundle: Boolean(Manifest.dsh?.bundle),
		features,
		changelogDigest: sha256Of(existsSync(ChangelogPath) ? readFileSync(ChangelogPath) : ""),
	};
};
