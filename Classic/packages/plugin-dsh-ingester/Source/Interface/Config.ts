// Config - the schema's runtime shape (Variable/Config.ts produces it).
export default interface Config {
	enabled: boolean;
	/** The durable journal (one log per module). */
	logFile: string;
	/** Maximum targets in one apply run. */
	maxTargets: number;
	/** Stop at the first conflict instead of continuing. */
	stopOnConflict: boolean;
}
