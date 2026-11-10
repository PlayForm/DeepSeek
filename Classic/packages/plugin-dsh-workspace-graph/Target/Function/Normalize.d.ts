export default _default;
/**
 * @module Normalize
 *
 * The text normalization that feeds every fingerprint.
 *
 * @remarks
 *
 * CRLF and CR become LF, and trailing whitespace is stripped per line (the brief's section
 * 4.1 fingerprint formula's "normalized text").
 */
declare function _default(Text: string): string;
