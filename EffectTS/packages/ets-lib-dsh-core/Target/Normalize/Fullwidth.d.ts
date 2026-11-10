/**
 * @module Fullwidth
 *
 * The full-width to half-width MAP: the entire FULLWIDTH FORMS range
 * U+FF01-U+FF5E mapped to its ASCII counterparts U+0021-U+007E.
 *
 * @remarks
 * This is the standard fullwidth-to-halfwidth mapping
 * (String.fromCharCode(0xFF01 + i) -> String.fromCharCode(0x21 + i) for i
 * in 0..93, expanded to a LITERAL object below: no runtime computation, the
 * table is data, not logic). Full-width punctuation, digits and letters
 * arrive from CJK input methods; the half-width forms are the unambiguous
 * ASCII that every parser, shell and diff understands.
 *
 * Consumed by the char->char MAP replacer (ReplaceMap): one character in,
 * the half-width counterpart out, the count = the replaced characters.
 */
declare const _default: {
    "！": string;
    "＂": string;
    "＃": string;
    "＄": string;
    "％": string;
    "＆": string;
    "＇": string;
    "（": string;
    "）": string;
    "＊": string;
    "＋": string;
    "，": string;
    "－": string;
    "．": string;
    "／": string;
    "０": string;
    "１": string;
    "２": string;
    "３": string;
    "４": string;
    "５": string;
    "６": string;
    "７": string;
    "８": string;
    "９": string;
    "：": string;
    "；": string;
    "＜": string;
    "＝": string;
    "＞": string;
    "？": string;
    "＠": string;
    Ａ: string;
    Ｂ: string;
    Ｃ: string;
    Ｄ: string;
    Ｅ: string;
    Ｆ: string;
    Ｇ: string;
    Ｈ: string;
    Ｉ: string;
    Ｊ: string;
    Ｋ: string;
    Ｌ: string;
    Ｍ: string;
    Ｎ: string;
    Ｏ: string;
    Ｐ: string;
    Ｑ: string;
    Ｒ: string;
    Ｓ: string;
    Ｔ: string;
    Ｕ: string;
    Ｖ: string;
    Ｗ: string;
    Ｘ: string;
    Ｙ: string;
    Ｚ: string;
    "［": string;
    "＼": string;
    "］": string;
    "＾": string;
    "＿": string;
    "｀": string;
    ａ: string;
    ｂ: string;
    ｃ: string;
    ｄ: string;
    ｅ: string;
    ｆ: string;
    ｇ: string;
    ｈ: string;
    ｉ: string;
    ｊ: string;
    ｋ: string;
    ｌ: string;
    ｍ: string;
    ｎ: string;
    ｏ: string;
    ｐ: string;
    ｑ: string;
    ｒ: string;
    ｓ: string;
    ｔ: string;
    ｕ: string;
    ｖ: string;
    ｗ: string;
    ｘ: string;
    ｙ: string;
    ｚ: string;
    "｛": string;
    "｜": string;
    "｝": string;
    "～": string;
};
export default _default;
