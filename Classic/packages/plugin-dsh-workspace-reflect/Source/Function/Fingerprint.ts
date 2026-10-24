// Fingerprint - the content-derived fingerprint a reflective Replace verifies
// before it rewrites a span (Function/Fingerprint). The formula is the
// workspace graph's frozen one (its SCHEME section 4):
//
//   sha256(normalized span text + "\n" + kind + "\n" + name) in hex
//
// where the normalized text is the span's text with CRLF/CR -> LF and trailing
// whitespace stripped per line. A node without a name (a Block) hashes the
// empty name. The graph computes it at index time; the reflect computes it
// from the CURRENT text, so a span that moved or changed under the operation
// no longer matches and the write is refused - the stale-target fence, the
// span-level twin of the version fence.
import { createHash } from "node:crypto";

/** CRLF/CR -> LF, trailing whitespace stripped per line (the graph's Normalize). */
const Normalize = (Text: string): string =>
	Text.replace(/\r\n?/g, "\n")
		.split("\n")
		.map((Line) => Line.replace(/[ \t]+$/g, ""))
		.join("\n");

export default (Text: string, Kind: string, Name = ""): string =>
	createHash("sha256")
		.update(`${Normalize(Text)}\n${Kind}\n${Name}`)
		.digest("hex");
