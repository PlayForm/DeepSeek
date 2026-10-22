// Options - the schema's runtime shape (Variable/Config.ts produces it).
export default interface Options {
	enabled: boolean;
	logFile: string;
	maxBlockBytes: number;
	maxChain: number;
	maxSessions: number;
	summaryTerms: number;
}
