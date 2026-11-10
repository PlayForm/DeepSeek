export default _default;
/**
 * @module Activate
 *
 * The activation-line composer that renders the `activated (...)` proof line
 * every plugin's Apply stage emits to the ledger.
 *
 * @remarks
 *
 * The exact template is `activated (k1=v1, k2=v2, ...)`. Nine Apply.ts sites
 * hand-compose this template (the six stream normalizers and the governance
 * trio - governor, pinner, cargo): the same `activated (` prefix, the `k=v`
 * pair join with `, ` and the `)` suffix, six field-list variants of one shape.
 * The string mechanics live here; the field values stay module-side - the
 * module passes its own list of `[key, value]` pairs and the composer only
 * joins them.
 *
 * - A pair whose value is `undefined` is skipped (the absent-field rule: the
 *   replacement-less quotes/fullwidth variants simply omit the `replacement=`
 *   pair from their lists).
 * - An empty key renders the value as a bare segment (the governance trio's
 *   leading flavor word - `anywhere mode`, `pinner`, `cargo flavor`) instead
 *   of a `k=v` pair.
 * - An empty-string value is a present field (the invisible flavor's
 *   `replacement=` removal marker) - only `undefined` means absent.
 *
 * The composer is pure and byte-identical: no prefix, no timestamp, no module
 * name - the `<module>:` prefix is the factory's Append/Journal layer, not
 * this template's.
 */
declare function _default(Fields: readonly (readonly [string, string | undefined])[]): string;
