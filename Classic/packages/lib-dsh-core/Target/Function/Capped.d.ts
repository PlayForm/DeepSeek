export default _default;
/**
 * @module Capped
 *
 * The eviction line: the byte-exact `capped <id> (max<Name> <cap>)` ledger line
 * a bounded module writes when its ring drops an entry.
 *
 * @remarks
 *
 * The line is a CONTRACT string shared by every bounded module: the id names
 * what was dropped (a path, a binding id, a batch id), the name names the
 * module's own bound (`Stamps`, `Bindings`, `Lines`, `Batches`, `Watch`) and the
 * cap is the bound that was in force at the drop. A wording change here changes
 * every module's eviction line at once, so it lives in one composer beside
 * `Activate` and `Suppress`.
 *
 * Pure: the module supplies the id and the name; the composer only joins them.
 */
declare function _default(Id: string, Name: string, Cap: number): string;
