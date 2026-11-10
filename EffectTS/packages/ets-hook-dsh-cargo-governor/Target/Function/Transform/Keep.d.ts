import type State from "../../Interface/State.js";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
export default _default;
/**
 * @module Keep
 *
 * The module's own global keep-file source (config `keepFile`), merged into
 * the factory-supplied union keep-list by the transform.
 *
 * @remarks
 *
 * The factory keep discovery reads State.Policy as its global field, which
 * for THIS module is the UPDATE policy, so the keepFile union is the
 * module's own concern - with the exact pre-refactor semantics: an
 * unreadable source logs `unreadable pin-policy.json at ... - using
 * built-in default` and contributes nothing. The keep-list wins over
 * full-version NORMALIZATION, never over the chain.
 */
declare function _default(Factory: PluginFactory, State: State, Keep: string[]): string[];
