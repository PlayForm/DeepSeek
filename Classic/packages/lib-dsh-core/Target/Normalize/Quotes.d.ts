/**
 * @module Quotes
 *
 * The curly-quote to straight-quote map: the four typographic single-quote code points and
 * the four double-quote code points, mapped to their ASCII counterparts.
 *
 * @remarks
 *
 * The curly families arrive from smart-quote processors and code editors; the straight forms
 * are the unambiguous literals every parser, shell and diff understands:
 *
 *   U+2018  left single quotation mark   ->  '  (U+0027 apostrophe)
 *   U+2019  right single quotation mark  ->  '
 *   U+201A  single low-9 quotation mark  ->  '
 *   U+201B  single high-reversed-9       ->  '
 *   U+201C  left double quotation mark   ->  "  (U+0022 straight double)
 *   U+201D  right double quotation mark  ->  "
 *   U+201E  double low-9 quotation mark  ->  "
 *   U+201F  double high-reversed-9       ->  "
 *
 * Consumed by the char->char MAP replacer (ReplaceMap): one character in, the straight
 * counterpart out, the count = the replaced characters.
 */
declare const _default: {
    "‘": string;
    "’": string;
    "‚": string;
    "‛": string;
    "“": string;
    "”": string;
    "„": string;
    "‟": string;
};
export default _default;
