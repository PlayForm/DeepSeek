/**
 * @module Register
 *
 * The adapter registry: one adapter entry per registration key it owns.
 *
 * @remarks
 * A registration key is the lowercased dotted EXTENSION, or the exact BASENAME
 * for a file adapter (package.json). The adapters are the any-file seam
 * (ANY-FILE-ADAPTERS: think adapters, think graphs) - the default TypeScript
 * adapter registers at apply; callers add more through the service's adapt() or
 * the config `adapters` names. Re-registering a key REPLACES the adapter (the
 * last registration wins) with one ledger line; the count in the line is the
 * registry size (extensions plus file names).
 */
import type Adapter from "../Interface/Adapter.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Adapter: Adapter): void;
