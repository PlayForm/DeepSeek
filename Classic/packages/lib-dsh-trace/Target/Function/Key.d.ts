export default _default;
/**
 * @module Key
 *
 * The coalescing key of an envelope: the payload's path when it carries one,
 * else the event name.
 *
 * @remarks
 *
 * Every workspace trace carries a path. The detached loop (`Function/Loop`) and
 * the graph's per-path debounce key on exactly this value, so a coalesced pair
 * of stamps for one path produces ONE re-index.
 */
declare function _default(Envelope: {
    kind?: unknown;
    payload?: unknown;
}): string;
