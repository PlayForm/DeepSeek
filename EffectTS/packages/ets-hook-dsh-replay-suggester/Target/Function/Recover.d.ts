import type State from "../Interface/State.js";
export default _default;
/**
 * @module Recover
 *
 * The JSON FALLBACK recovery (Function/Recover): read the well-known snapshot
 * ONCE on mount and repopulate the mirror (Function/Restore).
 *
 * @remarks
 *
 * THE SPLIT (the completion spec's storage migration, the pattern/batchstate
 * precedent): the PRIMARY tier is the storage-domain KV domain
 * (Function/Storage); this file is the DEGRADED tier, engaged ONLY when the
 * harness provides no storage facility (Function/Apply's probe) or when the
 * domain's open fails. The file is the hook's OWN store, read with plain
 * node:fs - the documented exemption the ledger carries (and the seeded
 * history reader already uses): ctx.fs is the governed surface for the
 * WORKSPACE's files, not for the plugin's own local memory.
 *
 * A missing or corrupt file starts the store EMPTY - never guessed.
 */
declare function _default(State: State): void;
