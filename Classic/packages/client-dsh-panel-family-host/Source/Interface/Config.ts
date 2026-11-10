/**
 * @module Config
 *
 * The validated shape of the host package's tunables: the Schemastery schema in
 * `Variable/Config.ts` produces this object.
 */
export default interface Config {
	/**
	 * The endpoint ships disabled: the idle posture matches the family's other rows and the
	 * profile wiring pass enables it.
	 */
	enabled: boolean;

	/**
	 * The log root: every family ledger lives here as `<namespace>.log`.
	 */
	logRoot: string;

	/**
	 * The cap on any single `tail()` request, in lines.
	 */
	maxLines: number;

	/**
	 * The ccr log path for `stats()`.
	 */
	ccrLog: string;
}
