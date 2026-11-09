/**
 * @module Signature
 *
 * The DEFAULT repo signature: the marker path whose presence identifies this
 * monorepo's workspace.
 *
 * @remarks
 * A pack may declare its own `signature`, and the gate reads the pack's list
 * first. This default is the honest fallback, and it is the one marker the
 * pre-pack workspace gate used.
 */
/** The default signature list: the monorepo's own marker path. */
declare const _default: string[];
export default _default;
