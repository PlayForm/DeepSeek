// Config - the validated shape the schema produces (Variable/Config.ts): one
// readonly field per config field, the nested blocks as their own interfaces.
// The optional price rates stay optional (an absent rate is an unpriced
// bucket, charged at zero); every defaulted column is always present. The
// factor layer's arrays (section 17) carry the modifier rows and the
// time-of-day windows.
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
	readonly modifiers: readonly Modifier[];
	readonly priceWindows: readonly PriceWindow[];
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

// One modifier row of the factor layer (section 17.2): an effective-dated
// multiplier for one pricing mode, optionally scoped to one model - a
// model-specific row beats a provider-wide one of the same kind.
interface Modifier {
	readonly provider: string;
	readonly model?: string;
	readonly kind: string;
	readonly value: string;
	readonly multiplier: number;
	readonly effectiveFrom: string;
	readonly effectiveTo?: string;
}

// One time-of-day window: the label a price row's Window column resolves
// against and the UTC hours it covers.
interface PriceWindow {
	readonly label: string;
	readonly startUtcHour: number;
	readonly endUtcHour: number;
}
