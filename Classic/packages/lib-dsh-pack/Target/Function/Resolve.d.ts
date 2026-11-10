import type Options from "../Interface/Options.js";
import type Pack from "../Interface/Pack.js";
export default _default;
/**
 * @module Resolve
 *
 * The layered resolution (D2), the heart of the library.
 *
 * @remarks
 *
 * 1. Read the repo layer (`<root>/.dsh/pack.yml`) to discover a declared
 *    `slug` (the user layer is keyed by it).
 * 2. Read the user layer (`<home>/.dsh/playform/workspaces/<slug>.yml`).
 * 3. No layer at all -> the BUILT-IN pack (this monorepo's default), or
 *    `undefined` when `builtin: false` opts out of the fallback.
 * 4. Resolve the union of both layers' `extends:` chains as the BASE
 *    (cycle-guarded; the named bases live in the user layer).
 * 5. Merge: the base packs first (deepest first), then the user layer, then
 *    the repo layer - so the repo overrides the user, and both override their
 *    bases.
 *
 * The merge rules live in `Function/Merge`; the parser decision in
 * `Function/Parse`. The result is a normalized `Pack` (`Function/Normalize`).
 */
declare function _default(Root: string, Options?: Options): Pack | undefined;
