/**
 * @module FileRow
 *
 * One CostFileRow per FileId this session touched or allocated: the session's
 * money beside the file's lifetime money, the carry-in before this
 * conversation, and the change the conversation produced at the edit grain.
 *
 * @remarks
 *
 * The row is the FILES view. `before` is the lifetime total minus this
 * session's own share. The touch fields carry the kind counts, the stage set,
 * the verdict, the read-before-edit flag and the first and last touch times;
 * every count is a stored figure or zero, `lifetime` and `before` stay null
 * when no allocation ever priced the file, and `turn` stays null when the
 * session's last turn did not allocate it. The money rounds to six decimals.
 */
export default interface CostFileRow {
	/**
	 * The file's path as the ledger recorded it.
	 */
	path: string;
	/**
	 * The touches the session's calls recorded for the file.
	 */
	touches: number;
	/**
	 * The count of read touches.
	 */
	reads: number;
	/**
	 * The count of edit-kind touches.
	 */
	edits: number;
	/**
	 * The count of write-kind touches.
	 */
	writes: number;
	/**
	 * The count of search touches.
	 */
	searches: number;
	/**
	 * The lines the session's hunks added.
	 */
	added: number;
	/**
	 * The lines the session's hunks removed.
	 */
	removed: number;
	/**
	 * The bytes the session's hunks added.
	 */
	bytesAdded: number;
	/**
	 * The bytes the session's hunks removed.
	 */
	bytesRemoved: number;
	/**
	 * The session's direct money for the file.
	 */
	direct: number;
	/**
	 * The session's amortized money for the file.
	 */
	amortized: number;
	/**
	 * The direct and amortized money summed.
	 */
	total: number;
	/**
	 * The file's all-sessions lifetime money, null when never priced.
	 */
	lifetime: number | null;
	/**
	 * The carry-in: the lifetime total minus this session's share.
	 */
	before: number | null;
	/**
	 * The session's last turn's allocation to the file, null when none.
	 */
	turn: number | null;
	/**
	 * The stage set the session's touches passed through.
	 */
	stages: readonly string[];
	/**
	 * The session's verdict for the file, null when none is written.
	 */
	verdict: string | null;
	/**
	 * Whether the file was read before its first mutating touch.
	 */
	readBeforeEdit: boolean;
	/**
	 * The first touch's instant, null when none is stored.
	 */
	firstAt: number | null;
	/**
	 * The last touch's instant, null when none is stored.
	 */
	lastAt: number | null;
}
