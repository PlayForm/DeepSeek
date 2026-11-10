export default _default;
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
declare function _default(Contents: string[]): string;
