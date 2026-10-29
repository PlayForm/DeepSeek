import * as FS from "node:fs";

const Manifest = JSON.parse(FS.readFileSync("Temporary/npm-bootstrap/MANIFEST.json", "utf8"));

/** The MANIFEST entry list (tolerate an array or a {packages} object). */
const Entries = Array.isArray(Manifest) ? Manifest : (Manifest.packages ?? Manifest.entries ?? []);

/** The twins to generate: every ets-* MANIFEST entry except the base, which
 *  has no Classic source by design. The tier vocabulary changed from
 *  `2-planned` / `3-candidates` to `2-placeholder`, so the selection is
 *  tier-independent now. */
const Twins = Entries.filter(
	(Entry) =>
		typeof Entry.name === "string" &&
		Entry.name.startsWith("@playform/ets-") &&
		Entry.name !== "@playform/ets-base-dsh",
);

export default Twins;
