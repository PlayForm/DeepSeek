/**
 * @module Signature
 *
 * Describes the DEFAULT repo signature: the marker path whose presence
 * identifies this monorepo's workspace.
 *
 * @remarks
 * A pack may declare its own `signature` (the gate reads the pack's list
 * first); this default is the honest fallback, and it is the one marker the
 * pre-pack workspace gate used.
 */
declare const _default: string[];
export default _default;
