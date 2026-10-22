// One-shot generator: the ETS twins of the PLANNED Classic packages.
// The precedent: Maintain/generate-ets-live-containers.mjs - the mirror under
// the identity substitutions ONLY, the output diff-verified afterwards.
//
// THE LAW: the ETS twin keeps the CLASSIC module identity (the ledger strings
// and the `name` export stay byte-identical); what changes is the npm package
// identity and the ETS dependency names. The generator walks the MANIFEST's
// ets-* entries (tier 2-planned + 3-candidates), finds the Classic source by
// stripping the ets- prefix, and mirrors the tree.
//
// Run once from the monorepo root AFTER the Classic smoke pass has landed the
// Test trees (the twins carry the parity smokes). Never hand-edit Target/.
import * as FS from "node:fs";
import * as Path from "node:path";

const Manifest = JSON.parse(FS.readFileSync("Temporary/npm-bootstrap/MANIFEST.json", "utf8"));

/** The MANIFEST entry list (tolerate an array or a {packages} object). */
const Entries = Array.isArray(Manifest) ? Manifest : (Manifest.packages ?? Manifest.entries ?? []);

/** The twins to generate: the ets-* entries in the planned/candidate tiers. */
const Twins = Entries.filter(
	(Entry) =>
		typeof Entry.name === "string" &&
		Entry.name.startsWith("@playform/ets-") &&
		["2-planned", "3-candidates"].includes(Entry.tier),
);

/** The text substitutions: the ETS dependency names only. The bare tokens
 * cover the relative-path imports (e.g. "../../plugin-dsh-factory/Target/
 * Library.js" in the Test harnesses) exactly as the live-containers
 * generator does; the quoted forms cover the sibling package names. */
const Substitute = (Text) =>
	Text.replaceAll("lib-dsh-core", "ets-base-dsh")
		.replaceAll("plugin-dsh-factory", "ets-plugin-dsh-factory")
		.replaceAll('"@playform/plugin-dsh-', '"@playform/ets-plugin-dsh-')
		.replaceAll('"@playform/hook-dsh-', '"@playform/ets-hook-dsh-')
		.replaceAll('"@playform/client-dsh-', '"@playform/ets-client-dsh-')
		.replaceAll('"@playform/lib-dsh-', '"@playform/ets-lib-dsh-');

/** The relative paths mirrored from the Classic package to the ETS twin. */
const Files = ["package.json", "tsconfig.json", "cordis.patch.yml", "README.md", "SCHEME.md"];

/** Every file under a directory, recursively, relative to it. */
const Walk = (Root, Prefix = "") =>
	FS.readdirSync(Path.join(Root, Prefix), { withFileTypes: true }).flatMap((Dirent) => {
		const Relative = Path.join(Prefix, Dirent.name);
		return Dirent.isDirectory() ? Walk(Root, Relative) : [Relative];
	});

let Generated = 0;
const Missing = [];

for (const Twin of Twins) {
	const TwinName = Twin.name.replace("@playform/", "");
	const ClassicName = TwinName.replace(/^ets-/, "");
	const From = Path.join("Classic/packages", ClassicName);
	const To = Path.join("EffectTS/packages", TwinName);

	if (!FS.existsSync(From)) {
		Missing.push(`${Twin.name} <- ${From}`);
		continue;
	}

	const Paths = [
		...Files.filter((File) => FS.existsSync(Path.join(From, File))),
		...Walk(From, "Configuration"),
		...Walk(From, "Source"),
	];

	for (const File of Paths) {
		const Source = Path.join(From, File);
		const Target = Path.join(To, File);
		FS.mkdirSync(Path.dirname(Target), { recursive: true });
		FS.writeFileSync(Target, Substitute(FS.readFileSync(Source, "utf8")));
		Generated += 1;
	}
}

console.log("generated", Generated, "files across", Twins.length, "twins");
if (Missing.length > 0) {
	console.log("MISSING CLASSIC SOURCES:");
	for (const Line of Missing) {
		console.log(" ", Line);
	}
}
