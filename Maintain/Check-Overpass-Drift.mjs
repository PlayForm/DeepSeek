// Check-Overpass-Drift - the drift guard for the overpass scaffolding (the
// plan's P1, FAMILY-ORGANISATION-ANALYSIS.md section 3.1): for each tree
// (Classic, EffectTS) and each cluster (Command, StepBatch, Overpass), hash
// the six stream flavors' `Source/Function/<cluster>.ts` with comments
// stripped and whitespace collapsed, and fail when a file's normalized hash
// differs from the baseline in Maintain/Overpass-Baseline.json. The seventh
// normalize flavor - normalize-file - contributes its StepBatch and Overpass
// arms as its OWN recorded hashes (never equality with the stream flavors);
// its Command is a unique files-sweep implementation and stays out of the
// guard.
//
// Why normalized hashes: the six flavors are supposed to differ ONLY in their
// transform table, their config defaults and their comments. A comment-only
// edit must not trip the guard, while any logic edit must. Stripping comments
// and collapsing whitespace gives exactly that: the normalized text of a
// flavor file is its token stream, not its formatting.
//
// The stripping is string-aware: `//` and `/*` inside a quoted string are
// CONTENT, not comments (the ledger lines and the usage strings contain
// them), so a naive regex would corrupt the hash. The scanner tracks single,
// double and template quotes and skips escaped characters. It treats a
// template literal as opaque (the files in scope contain no comment inside a
// `${...}` expression); a false negative is acceptable for a drift guard,
// a false positive is not.
//
// Usage:
//   node Maintain/Check-Overpass-Drift.mjs            check against the baseline
//   node Maintain/Check-Overpass-Drift.mjs --update   rewrite the baseline
//
// The baseline is a deliberate act: regenerate it ONLY after an intended
// change has passed its own behavioral gate (the dash canary is the M3
// example). An unintended drift must be fixed, never re-baselined.
import { createHash } from "node:crypto";
import FileSystem from "node:fs";
import Path from "node:path";
import { fileURLToPath } from "node:url";

const Root = Path.dirname(Path.dirname(fileURLToPath(import.meta.url)));
const BaselinePath = Path.join(Root, "Maintain", "Overpass-Baseline.json");
const Update = process.argv.includes("--update");

// The two release groups (never mixed in one dependency graph, but one guard
// covers both trees) and the three generic clusters this phase owns.
const Trees = ["Classic", "EffectTS"];
const Clusters = ["Command", "StepBatch", "Overpass"];

// The six stream flavors: the dash canary plus the five small flavors.
const Flavors = ["dash", "ellipsis", "fullwidth", "invisible", "quotes", "spaces"];

// The seventh normalize flavor: normalize-file. Only its two overpass arms
// are guarded (its Command is the unique files sweep). The guard records its
// own hashes; it never requires equality with the stream flavors - the file
// flavor's transform is the six-fold chain, not one table.
const FileFlavor = "file";

// The guarded flavors per cluster: Command stays the six stream flavors,
// StepBatch/Overpass add the file flavor.
const Guarded = (Cluster) => (Cluster === "Command" ? Flavors : [...Flavors, FileFlavor]);

// The package name per tree/flavor. The two release groups share the flavor
// suffix but never the prefix.
const PackageName = (Tree, Flavor) =>
	`${Tree === "Classic" ? "" : "ets-"}${Flavor === FileFlavor ? "plugin" : "hook"}-dsh-normalize-${Flavor}`;

// The relative file path the baseline records (POSIX separators, so a
// Windows checkout hashes the same key).
const FilePath = (Tree, Flavor, Cluster) =>
	`${Tree}/packages/${PackageName(Tree, Flavor)}/Source/Function/${Cluster}.ts`;

// Strip `//` and `/* ... *\/` comments while preserving string literals.
// Returns the source with comments removed and the original line structure
// kept (the whitespace pass collapses it afterwards).
const StripComments = (Source) => {
	const Out = [];
	let Index = 0;
	let Quote = "";
	while (Index < Source.length) {
		const Char = Source[Index];
		switch (true) {
			// Inside a quoted string: copy verbatim, honour escapes and the
			// matching quote only.
			case Quote !== "": {
				Out.push(Char);
				Index += 1;
				switch (true) {
					case Char === "\\":
						if (Index < Source.length) {
							Out.push(Source[Index]);
							Index += 1;
						}
						break;
					case Char === Quote:
						Quote = "";
						break;
				}
				break;
			}
			// Line comment: drop through the end of the line (the newline is
			// kept so the whitespace pass still separates the neighbours).
			case Char === "/" && Source[Index + 1] === "/": {
				while (Index < Source.length && Source[Index] !== "\n") {
					Index += 1;
				}
				break;
			}
			// Block comment: drop through the closing marker.
			case Char === "/" && Source[Index + 1] === "*": {
				Index += 2;
				while (
					Index < Source.length &&
					!(Source[Index] === "*" && Source[Index + 1] === "/")
				) {
					Index += 1;
				}
				Index += 2;
				break;
			}
			// The opening of a string or template literal.
			case Char === '"' || Char === "'" || Char === "`": {
				Quote = Char;
				Out.push(Char);
				Index += 1;
				break;
			}
			default: {
				Out.push(Char);
				Index += 1;
			}
		}
	}
	return Out.join("");
};

// The normalized text: BOM removed, comments stripped, every whitespace run
// collapsed to one space, ends trimmed. Formatting (line breaks, indentation,
// alignment) disappears; tokens, string contents and punctuation survive.
const Normalize = (Source) =>
	StripComments(Source.replace(/^\uFEFF/, ""))
		.replace(/\s+/g, " ")
		.trim();

// The recorded hash: SHA-256 over the normalized UTF-8 text, hex.
const Digest = (Text) => createHash("sha256").update(Text, "utf8").digest("hex");

// Read every guarded file and compute its normalized hash. A missing file is
// recorded with `null` so the check reports it as a failure instead of
// crashing.
const Collect = () => {
	const Entries = [];
	for (const Tree of Trees) {
		for (const Cluster of Clusters) {
			const Files = {};
			for (const Flavor of Guarded(Cluster)) {
				const Relative = FilePath(Tree, Flavor, Cluster);
				const Absolute = Path.join(Root, Relative);
				Files[Flavor] = {
					file: Relative,
					hash: FileSystem.existsSync(Absolute)
						? Digest(Normalize(FileSystem.readFileSync(Absolute, "utf8")))
						: null,
				};
			}
			Entries.push({ tree: Tree, cluster: Cluster, files: Files });
		}
	}
	return Entries;
};

const ReadBaseline = () => {
	switch (true) {
		case !FileSystem.existsSync(BaselinePath):
			return null;
	}
	return JSON.parse(FileSystem.readFileSync(BaselinePath, "utf8"));
};

const Entries = Collect();

// UPDATE: record the current normalized hashes, deliberately. The per-group
// PASS lines say what was recorded; the summary names the baseline file.
if (Update) {
	const Files = {};
	for (const Entry of Entries) {
		for (const Flavor of Guarded(Entry.cluster)) {
			Files[Entry.files[Flavor].file] = Entry.files[Flavor].hash;
		}
	}
	const Baseline = {
		version: 1,
		note: "Normalized hashes (comments stripped, whitespace collapsed) of the six stream flavors' Command/StepBatch/Overpass files plus normalize-file's StepBatch/Overpass arms (its Command is the unique files sweep and stays out). Regenerate only after an intended change passed its behavioral gate: node Maintain/Check-Overpass-Drift.mjs --update",
		files: Files,
	};
	FileSystem.writeFileSync(BaselinePath, `${JSON.stringify(Baseline, null, "\t")}\n`, "utf8");
	for (const Entry of Entries) {
		console.log(
			`PASS ${Entry.tree} / ${Entry.cluster} (${Object.keys(Entry.files).length} files recorded)`,
		);
	}
	console.log(
		`\nUPDATED ${Path.relative(Root, BaselinePath)} (${Object.keys(Files).length} hashes).`,
	);
	process.exit(0);
}

// CHECK: compare every guarded file with the baseline. Any missing baseline,
// missing file, missing entry or differing hash is drift.
const Baseline = ReadBaseline();
if (Baseline === null) {
	console.error(
		`FAIL - baseline ${Path.relative(Root, BaselinePath)} is missing; generate it with: node Maintain/Check-Overpass-Drift.mjs --update`,
	);
	process.exit(1);
}

let Failed = 0;
for (const Entry of Entries) {
	const Drift = [];
	const Missing = [];
	const New = [];
	for (const Flavor of Guarded(Entry.cluster)) {
		const Current = Entry.files[Flavor];
		const Expected = Baseline.files?.[Current.file];
		switch (true) {
			case Current.hash === null:
				Missing.push(Flavor);
				break;
			case Expected === undefined:
				New.push(Flavor);
				break;
			case Expected !== Current.hash:
				Drift.push(Flavor);
				break;
		}
	}
	const FailedHere = Drift.length + Missing.length + New.length;
	const GuardedCount = Object.keys(Entry.files).length;
	switch (true) {
		case FailedHere === 0:
			console.log(
				`PASS ${Entry.tree} / ${Entry.cluster} (${GuardedCount}/${GuardedCount} files match)`,
			);
			break;
		default: {
			Failed += 1;
			console.log(
				`FAIL ${Entry.tree} / ${Entry.cluster} - ${Drift.length} drift, ${Missing.length} missing, ${New.length} not in baseline`,
			);
			for (const Flavor of Drift) {
				console.log(
					`  drift: ${Entry.files[Flavor].file} (baseline ${Baseline.files[Entry.files[Flavor].file].slice(0, 12)}..., now ${Entry.files[Flavor].hash.slice(0, 12)}...)`,
				);
			}
			for (const Flavor of Missing) {
				console.log(`  missing: ${Entry.files[Flavor].file}`);
			}
			for (const Flavor of New) {
				console.log(`  not in baseline: ${Entry.files[Flavor].file}`);
			}
		}
	}
}

if (Failed > 0) {
	console.error(
		`\nFAIL - overpass drift detected in ${Failed} tree/cluster group(s); fix the logic or, after an intended behavioral gate, run node Maintain/Check-Overpass-Drift.mjs --update`,
	);
	process.exit(1);
}
const GuardedTotal = Entries.reduce((Total, Entry) => Total + Object.keys(Entry.files).length, 0);
console.log(`\nPASS - all ${GuardedTotal} normalized hashes match the baseline.`);
