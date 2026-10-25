import * as FS from "node:fs";

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

export default Twins;
