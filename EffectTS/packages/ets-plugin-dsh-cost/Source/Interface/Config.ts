// Config - the validated shape the schema produces (Variable/Config.ts): one
// readonly field per config field, the nested blocks as their own interfaces.
// The optional price rates stay optional (an absent rate is an unpriced
// bucket, charged at zero); every defaulted column is always present. The
// factor layer's arrays (section 17) carry the modifier rows and the
// time-of-day windows.
/**
 * @module Config
 *
 * The validated shape the schema produces (Variable/Config.ts): one
 * readonly field per config field, the nested blocks as their own
 * interfaces.
 *
 * @remarks
 * The optional price rates stay optional (an absent rate is an unpriced
 * bucket, charged at zero); every defaulted column is always present. The
 * factor layer's arrays (section 17) carry the modifier rows and the
 * time-of-day windows.
 */

/**
 * The cost plugin's resolved configuration.
 */
export default interface Config {
	/**
	 * The master switch.
	 */
	readonly enabled: boolean;

	/**
	 * The ledger's SQLite file path.
	 */
	readonly databasePath: string;

	/**
	 * The currency the ledger prices in.
	 */
	readonly currency: string;

	/**
	 * The client name the ledger bills to.
	 */
	readonly client: string;

	/**
	 * The capture gates.
	 */
	readonly capture: Capture;

	/**
	 * The attribution model's rules.
	 */
	readonly attribution: Attribution;

	/**
	 * The annotation writer's settings.
	 */
	readonly annotate: Annotate;

	/**
	 * The export settings.
	 */
	readonly export: Export;

	/**
	 * The configured price book.
	 */
	readonly prices: readonly Price[];

	/**
	 * The factor layer's modifier rows (section 17).
	 */
	readonly modifiers: readonly Modifier[];

	/**
	 * The factor layer's time-of-day windows (section 17).
	 */
	readonly priceWindows: readonly PriceWindow[];

	/**
	 * Ledger enabled - write the durable log file.
	 */
	readonly log: boolean;

	/**
	 * The durable ledger file (one log per module).
	 */
	readonly logFile: string;
}

/**
 * The capture gates.
 */
interface Capture {
	/**
	 * Capture every session's events.
	 */
	readonly sessions: boolean;

	/**
	 * Additionally capture subagent-originated sessions.
	 */
	readonly subagents: boolean;

	/**
	 * Run the backfill walk on mount.
	 */
	readonly backfill: boolean;
}

/**
 * The attribution model's rules.
 */
interface Attribution {
	/**
	 * The direct half's weighting rule.
	 */
	readonly direct: "bytes" | "equal";

	/**
	 * The amortized half's weighting rule.
	 */
	readonly amortized: "context" | "none";
}

/**
 * The annotation writer's settings.
 */
interface Annotate {
	/**
	 * The annotation gate (off by default).
	 */
	readonly enabled: boolean;

	/**
	 * The marker delimiters the block is woven between.
	 */
	readonly marker: string;

	/**
	 * The block's content-line bound.
	 */
	readonly maxLines: number;
}

/**
 * The export settings.
 */
interface Export {
	/**
	 * The default export format.
	 */
	readonly format: "csv" | "json" | "markdown";

	/**
	 * The default export directory.
	 */
	readonly directory: string;
}

/**
 * One configured price row.
 */
interface Price {
	/**
	 * The provider the row prices.
	 */
	readonly provider: string;

	/**
	 * The model the row prices.
	 */
	readonly model: string;

	/**
	 * The input rate per million tokens.
	 */
	readonly input: number;

	/**
	 * The output rate per million tokens.
	 */
	readonly output: number;

	/**
	 * The cache-read rate per million tokens (absent is unpriced).
	 */
	readonly cacheRead?: number;

	/**
	 * The cache-write rate per million tokens (absent is unpriced).
	 */
	readonly cacheWrite?: number;

	/**
	 * The reasoning rate per million tokens (absent is unpriced).
	 */
	readonly reasoning?: number;

	/**
	 * The date the row applies from.
	 */
	readonly effectiveFrom: string;

	/**
	 * The row's currency.
	 */
	readonly currency: string;
}

/**
 * One modifier row of the factor layer (section 17.2): an effective-dated
 * multiplier for one pricing mode, optionally scoped to one model - a
 * model-specific row beats a provider-wide one of the same kind.
 */
interface Modifier {
	/**
	 * The provider the modifier applies to.
	 */
	readonly provider: string;

	/**
	 * The model the modifier is scoped to (absent is provider-wide).
	 */
	readonly model?: string;

	/**
	 * The pricing mode the modifier applies in.
	 */
	readonly kind: string;

	/**
	 * The mode's value (the rule's own declaration).
	 */
	readonly value: string;

	/**
	 * The multiplier the rule applies.
	 */
	readonly multiplier: number;

	/**
	 * The date the rule applies from.
	 */
	readonly effectiveFrom: string;

	/**
	 * The date the rule applies until (absent stays open).
	 */
	readonly effectiveTo?: string;
}

/**
 * One time-of-day window: the label a price row's Window column resolves
 * against and the UTC hours it covers.
 */
interface PriceWindow {
	/**
	 * The label the window is resolved by.
	 */
	readonly label: string;

	/**
	 * The window's first UTC hour.
	 */
	readonly startUtcHour: number;

	/**
	 * The window's end UTC hour (may wrap past 24).
	 */
	readonly endUtcHour: number;
}
