// Digest - the SHA-256 of the joined intended contents (Function/Digest):
// the preview's digest, hex. The join is `\n`-separated in batch order;
// the same function verifies nothing by itself - the later step compares
// the digest of what was written against this one (W4.1 section 6,
// check 4: "verify the applied bytes equal the preview").
import { createHash } from "node:crypto";

export default (Contents: string[]): string =>
	createHash("sha256").update(Contents.join("\n")).digest("hex");
