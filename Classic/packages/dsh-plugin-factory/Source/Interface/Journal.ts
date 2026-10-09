// Journal — one typed storage record for a governance module's lifecycle
// event (the optional `storageDomain` seam, P5). One record is appended per
// lifecycle event: `activated` (the plugin came up), `excluded` (a write was
// skipped by the exclusion list), `governed` (the chain pass rewrote the
// manifest), `dispatched` (the update stage started), `update-failed` (the
// update stage settled with a non-zero code). `detail` carries the natural
// payload of each event (the activated summary, the fresh version token, the
// update mode, the exit code) — never a full duplicate of the ledger line:
// the human ledger stays the complete record, the storage journal is the
// structured one. The zod enum in Function/Open fixes the v1 event set;
// a module that needs a new event name requires a new domain version.
export default interface Journal {
	/** Lifecycle event name (the enum fixed in Function/Open's zod schema). */
	event: string;
	/** File path (or update-stage directory) the event belongs to; "" for `activated`. */
	path: string;
	/** Event payload (version token, mode, exit code, summary). */
	detail: string;
	/** Epoch ms when the event happened (preserved through the pre-open queue). */
	at: number;
}
