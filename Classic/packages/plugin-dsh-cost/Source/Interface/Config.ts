// Config - the validated shape the schema produces (Variable/Config.ts): one
// readonly field per config field, the nested blocks as their own interfaces.
// The optional price rates stay optional (an absent rate is an unpriced
// bucket, charged at zero); every defaulted column is always present.
export default interface Config {
	readonly enabled: boolean;
	readonly databasePath: string;
	readonly currency: string;
	readonly client: string;
	readonly capture: Capture;
	readonly attribution: Attribution;
	readonly annotate: Annotate;
	readonly export: Export;
	readonly prices: readonly Price[];
	readonly log: boolean;
	readonly logFile: string;
}

interface Capture {
	readonly sessions: boolean;
	readonly subagents: boolean;
	readonly backfill: boolean;
}

interface Attribution {
	readonly direct: "bytes" | "equal";
	readonly amortized: "context" | "none";
}

interface Annotate {
	readonly enabled: boolean;
	readonly marker: string;
	readonly maxLines: number;
}

interface Export {
	readonly format: "csv" | "json" | "markdown";
	readonly directory: string;
}

interface Price {
	readonly provider: string;
	readonly model: string;
	readonly input: number;
	readonly output: number;
	readonly cacheRead?: number;
	readonly cacheWrite?: number;
	readonly reasoning?: number;
	readonly effectiveFrom: string;
	readonly currency: string;
}
