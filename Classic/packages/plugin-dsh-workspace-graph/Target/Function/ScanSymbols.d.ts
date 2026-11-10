import type { Span } from "../Interface/Node.js";
/**
 * @module ScanSymbols
 *
 * The v0 TypeScript and JavaScript declaration scanner (no compiler API).
 *
 * @remarks
 *
 * A symbol match is one declaration line: optional export, default, declare, abstract or
 * async modifiers, then one of the tracked keywords (function, class, interface, type, enum,
 * const, let, var), then the name - exported and non-exported alike. Nested names are NOT
 * resolved in v0: the qualified name is the declaration name.
 *
 * A symbol's span runs from its declaration line to its closing brace (brace counting; a
 * declaration without a brace ends at its statement line), and when the closing brace sits on
 * a later line the body span (one Block per symbol body) runs from the line after the
 * brace-open to the closing brace line.
 *
 * Comment lines are skipped; braces inside strings are counted naively (the v0 honesty limit
 * - a string containing an unbalanced brace can skew a span).
 */
export interface SymbolMatch {
    name: string;
    keyword: string;
    span: Span;
    body?: Span;
}
export default _default;
declare function _default(Lines: string[]): SymbolMatch[];
