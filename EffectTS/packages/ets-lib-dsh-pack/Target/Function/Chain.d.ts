/**
 * @module Chain
 *
 * Resolves an `extends:` chain into its base packs, deepest base first.
 *
 * @remarks
 * A named pack is looked up in the USER layer
 * (`<home>/.dsh/playform/workspaces/<name>.yml`) - the base-workspace pack the
 * D2 deep-link override inherits. A missing name is skipped (a stale link must
 * not silence a repo), and a name already visited in the chain is skipped too
 * (the cycle guard; the pack is merged once).
 */
import type Pack from "../Interface/Pack.js";
export default _default;
declare function _default(Names: string[], Home: string, Seen: Set<string>): Pack[];
