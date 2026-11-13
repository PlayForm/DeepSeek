/**
 * @module Config
 *
 * The resolved plain Configuration shape that the schema produces after the volatile cells are
 * unwrapped (`Interface/Configuration` in the service API).
 *
 * @remarks
 *
 * The brief's section 4.5 frozen table plus ONE field the indexing trigger needs (`maxFiles` -
 * the workspace walk's bound, section 4.3's `indexWorkspace`) and the two universal volatile
 * ledger cells (`log`, `logFile`); no other hidden knobs.
 */
export default interface Configuration {
	/**
	 * Whether the plugin indexes at all; false skips every file with the `disabled` reason.
	 */
	enabled: boolean;

	/**
	 * Ledger enabled - write the durable log file.
	 */
	log: boolean;

	/**
	 * The durable ledger file; the empty string keeps the logger as the only surface.
	 */
	logFile: string;

	/**
	 * The storage domain name, a lowercase unit name.
	 */
	domain: string;

	/**
	 * The parsed languages the index accepts.
	 */
	languages: ("typescript" | "javascript" | "markdown")[];

	/**
	 * The include globs; an empty list includes every file.
	 */
	include: string[];

	/**
	 * The exclude globs, matched against both the file path and each directory path.
	 */
	exclude: string[];

	/**
	 * The largest file the index reads, in bytes.
	 */
	maxFileBytes: number;

	/**
	 * The node cap for one parsed file.
	 */
	maxNodesPerFile: number;

	/**
	 * The `indexWorkspace` walk bound: at most this many candidate files.
	 */
	maxFiles: number;

	/**
	 * The `find` limit when the query names none.
	 */
	limitDefault: number;

	/**
	 * The hard cap on any `find` limit.
	 */
	limitMaximum: number;
}
