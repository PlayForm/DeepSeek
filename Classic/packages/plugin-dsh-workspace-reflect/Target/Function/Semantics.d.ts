/**
 * @module Semantics
 *
 * The optional workspace-semantics service probe for the rename op.
 *
 * @remarks
 * The rename's scope-resolved plan comes from the semantics service (its
 * `rename(path, span, to)`), which may itself deepen the answer through the
 * harness LSP seam. THE SERVICE IS PROBED, NEVER INJECTED (`ctx.get`) - the
 * loader contract's `inject` stays ["pluginFactory", "fs"] - and the
 * registered name is `workspaceSemantics`; the plan's short alias `semantics`
 * is accepted too. An absent service (or one without a rename method) is
 * `undefined`: the textual whole-word engine stays in charge.
 */
import type SemanticsHandle from "../Interface/Semantics.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State): SemanticsHandle | undefined;
