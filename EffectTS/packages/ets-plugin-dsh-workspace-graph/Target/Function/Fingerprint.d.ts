export default _default;
/**
 * @module Fingerprint
 *
 * The content-derived fingerprint: sha256 over the normalized text, the kind
 * and the name, in hex.
 *
 * @remarks
 *
 * The brief's section 4.1 formula: sha256(normalized text + "\n" + kind +
 * "\n" + name), where the normalized text is the node's span text with CRLF
 * converted to LF and trailing whitespace stripped per line. The stable id
 * survives edits; the fingerprint detects content change. A node without a
 * name hashes the empty name.
 */
declare function _default(Text: string, Kind: string, Name?: string): string;
