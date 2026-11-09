export default _default;
/**
 * @module Textual
 *
 * The FALLBACK rename engine: the scope-honest whole-word rewrite the plugin
 * shipped before the AST targeting.
 *
 * @remarks
 * The engine is a word-boundary regex (never a substring replace), applied to
 * the block's line range. It runs when the semantics service is absent,
 * refused, or its plan has no edit inside the scope.
 *
 * The engine returns the new text, never a mutation: the caller owns the
 * version fence (`Function/Publish`) and the module's own ledger line.
 * `undefined` is "no occurrences in scope" - the caller's byte-exact refusal.
 */
declare function _default(Lines: string[], From: number, To: number, Old: string, New: string): string | undefined;
