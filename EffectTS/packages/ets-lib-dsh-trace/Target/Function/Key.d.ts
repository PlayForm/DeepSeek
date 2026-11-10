export default _default;
/**
 * @module Key
 *
 * Reads the coalescing key of an envelope: the payload's path when it carries
 * one (every workspace trace does), else the event name.
 *
 * @remarks
 *
 * The detached loop (`Function/Loop`) and the graph's per-path debounce key on
 * exactly this value, so a coalesced pair of stamps for one path produces ONE
 * re-index.
 */
declare function _default(Envelope: {
    kind?: unknown;
    payload?: unknown;
}): string;
