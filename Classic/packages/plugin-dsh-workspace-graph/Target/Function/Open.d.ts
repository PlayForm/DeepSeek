import type State from "../Interface/State.js";
export default _default;
/**
 * @module Open
 *
 * The optional storage-domain setup (the factory's `Function/Open` pattern).
 *
 * @remarks
 *
 * The setup probes the facility (`ctx.storage.domain`, else `ctx.storageDomain`), declares
 * the domain named `Config.domain` (version 1, per-record layout, the backup-and-skip
 * invalid-record policy) with the single `records` table, opens it, loads the stored records
 * into the in-memory mirror (a stored value failing `IsRecord` is skipped and counted, never
 * guessed), restores the meta revision when it is ahead, and ledgers the byte-exact
 * `domain <domain> opened (<records> records)` line.
 *
 * The whole setup is best-effort and detached: the entry fires it without awaiting but keeps
 * the promise on `State.Opened`, and the async writers await that promise first - so the
 * store assertions are deterministic without a sleep. An absent facility is a silent skip
 * (in-memory only); a present facility whose open fails is loud (one best-effort ledger
 * line).
 */
declare function _default(StateRef: State): Promise<void>;
