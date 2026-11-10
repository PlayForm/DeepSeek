export default _default;
/**
 * @module Discover
 *
 * The nearest registry.json walking UP from Dir, stopping at node_modules boundaries and the
 * filesystem root; null when none.
 *
 * @remarks
 *
 * Identical across the trio (the registry filename is machinery, not module vocabulary - all three
 * modules discover the same registry.json).
 *
 * Exemption (documented): a plain-fs walk-up over auxiliary discovery files (registry.json
 * existence probes) - internal calculation, kept synchronous so the listener's g2 stage stays
 * await-free. The walk-up never reads the governed manifest.
 */
declare function _default(Dir: string): string | null;
