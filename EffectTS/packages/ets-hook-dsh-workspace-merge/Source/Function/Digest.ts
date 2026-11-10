import { createHash } from "node:crypto";

/**
 * @module Digest
 *
 * The SHA-256 of the joined intended contents: the preview's digest, hex.
 *
 * @remarks
 *
 * The join is `\n`-separated in batch order; the same function verifies
 * nothing by itself - the later step compares the digest of what was
 * written against this one (W4.1 section 6, check 4: "verify the applied
 * bytes equal the preview").
 */
export default (Contents: string[]): string =>
	createHash("sha256").update(Contents.join("\n")).digest("hex");
