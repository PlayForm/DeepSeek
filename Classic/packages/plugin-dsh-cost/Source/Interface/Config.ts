/**
 * @module Config
 *
 * The validated shape the schema produces: one readonly field per config
 * field, the nested blocks as their own interfaces.
 *
 * @remarks
 * The shape follows `Variable/Config.ts`. The optional price rates stay
 * optional (an absent rate is an unpriced bucket, charged at zero); every
 * defaulted column is always present. The factor layer's arrays (section 17)
 * carry the modifier rows and the time-of-day windows.
 */
export default interface Config {
	/**
	 * Whether the plugin captures and prices anything at all.
	 */
	readonly enabled: boolean;
	/**
	 * The ledger database path, tilde-expanded at its open site.
	 */
	readonly databasePath: string;
	/**
	 * The fallback currency of a row that names none.
	 */
	readonly currency: string;
	/**
	 * The client the session's project is billed to.
	 */
	readonly client: string;
	/**
	 * The capture gates.
	 */
	readonly capture: Capture;
	/**
	 * The attribution policy pair.
	 */
	readonly attribution: Attribution;
	/**
	 * The annotation writer's gate and rendering shape.
	 */
	readonly annotate: Annotate;
	/**
	 * The export format and destination.
	 */
	readonly export: Export;
	/**
	 * The configured price book's rows.
	 */
	readonly prices: readonly Price[];
	/**
	 * The factor layer's modifier rows.
	 */
	readonly modifiers: readonly Modifier[];
	/**
	 * The time-of-day windows a price row's Window column resolves against.
	 */
	readonly priceWindows: readonly PriceWindow[];
	/**
	 * Whether the plugin logs its lines.
	 */
	readonly log: boolean;
	/**
	 * The log file path.
	 */
	readonly logFile: string;
}

/**
 * The capture gates: every session, subagent sessions only with their own
 * gate, and the backfill walk.
 */
interface Capture {
	readonly sessions: boolean;
	readonly subagents: boolean;
	readonly backfill: boolean;
}

/**
 * The attribution policy pair: the direct half's rule and the amortized
 * half's rule.
 */
interface Attribution {
	readonly direct: "bytes" | "equal";
	readonly amortized: "context" | "none";
}

/**
 * The annotation writer's gate, marker and line budget.
 */
interface Annotate {
	readonly enabled: boolean;
	readonly marker: string;
	readonly maxLines: number;
}

/**
 * The export format and destination directory.
 */
interface Export {
	readonly format: "csv" | "json" | "markdown";
	readonly directory: string;
}

/**
 * One configured price row: the rates per million tokens and the effective
 * date it applies from.
 */
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
