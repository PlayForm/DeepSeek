/**
 * @module Config
 *
 * The resolved plain shape the schema produces after the volatile cells are
 * unwrapped (Interface/Configuration in the service API).
 *
 * @remarks
 *
 * The brief's section 4.5 frozen table plus ONE field the indexing trigger
 * needs (maxFiles - the workspace walk's bound, section 4.3's
 * `indexWorkspace`); no other hidden knobs.
 */
export default interface Configuration {
	/**
	 * The master switch - the plugin indexes and serves only when true.
	 */
	enabled: boolean;

	/**
	 * The KV storage-domain name.
	 */
	domain: string;

	/**
	 * The parsed languages the index accepts.
	 */
	languages: ("typescript" | "javascript" | "markdown")[];

	/**
	 * The include globs; an empty list includes everything.
	 */
	include: string[];

	/**
	 * The exclude globs matched against paths and directories.
	 */
	exclude: string[];

	/**
	 * The per-file size bound in bytes.
	 */
	maxFileBytes: number;

	/**
	 * The per-file node-count bound.
	 */
	maxNodesPerFile: number;

	/**
	 * The `indexWorkspace` walk bound: at most this many candidate files.
	 */
	maxFiles: number;

	/**
	 * The default result limit for find.
	 */
	limitDefault: number;

	/**
	 * The maximum result limit for find.
	 */
	limitMaximum: number;
}
