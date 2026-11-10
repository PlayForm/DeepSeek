/**
 * @module Telemetry
 *
 * The signals the session log already carries: one session's records walked in
 * order for the retry count, the step-to-message latency, the first-token
 * latency, the tokens-per-second rate, the utilization and the first failure
 * code.
 *
 * @remarks
 *
 * The walk follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 17.4. The
 * retry count counts the assistant/attempt events between a step/start and the
 * assistant/message (one when none); the first stream record's time0 is the
 * perceived first-token latency; the tokens-per-second rate is the message's
 * own output tokens over the latency; the utilization is the call's surface
 * tokens over the context window, both known; and the first failure code is a
 * tool/result.error.code, else the turn/end reason kind.
 *
 * The context window and the surface are the harness token meter's figures, not
 * a request/context record the walk re-derives (Reuse-Host.md:27, 64;
 * token-meter/README.md:36-49): `contextPressure(session)` carries the newest
 * provider-reported `contextWindow`, and `measure(session).surfaceTokens` is
 * the surface used when the caller passes none. The meter is projection-backed
 * and replay-stable, so the window is the provider's own number. It claims
 * nothing else: latency, attempts, first-token time and the error code stay
 * derived here, and a figure the meter does not report stays null rather than
 * guessed.
 *
 * Unknown shapes are skipped and the walk never throws.
 */
type Measured = {
	Attempts: number;
	LatencyMs: number | null;
	FirstTokenMs: number | null;
	TokensPerSecond: number | null;
	ContextWindow: number | null;
	Utilization: number | null;
	ErrorCode: string | null;
};

// One record's timestamp: the data field first, the record's own flat field
// as the fallback (the drain reads the header that way).
const Timed = (Record: { time?: unknown }, Data: Record<string, unknown>): number | null => {
	const Time = Number(Data["time"] ?? Record.time);
	return Number.isFinite(Time) ? Time : null;
};

// The turn/end reason kind: a plain reason string is the kind itself, a
// reason object carries it under kind.
const ReasonOf = (Data: Record<string, unknown>): string | null => {
	const Reason = Data["reason"];
	switch (true) {
		case typeof Reason === "string" && Reason.length > 0:
			return Reason;
		case Reason !== null && typeof Reason === "object": {
			const Kind = (Reason as Record<string, unknown>)["kind"];
			return typeof Kind === "string" && Kind.length > 0 ? Kind : null;
		}
		default:
			return null;
	}
};

// The structural token-meter surface this walk reads - the harness service's
// own shape (@deepseek-ai/dsh-token-meter, token-meter/README.md:36-49):
// `measure(session)` returns `{ totalTokens, surfaceTokens, nodes }` and
// `contextPressure(session)` returns the newest provider-reported prompt size
// with the route capacity. Structural on purpose: the service is already in
// the inject list (Source/Library.ts), so the call is `ctx.tokenMeter` and
// this module needs no @deepseek-ai/dsh-token-meter import.
type TokenMeter = {
	measure: (Session: unknown) => {
		totalTokens: number;
		surfaceTokens: number;
		nodes: readonly unknown[];
	};
	contextPressure: (Session: unknown) => {
		contextWindow?: number;
		pressureTokens?: number;
		projectedTokens?: number;
	};
};

// The meter's context window: ONE read before the walk, and the only source
// of the figure now that the request/context arm is gone. A meter that is
// absent, or that throws on a subject it does not recognize (the backfill
// hands it a synthesized session, not a live one), leaves the window null.
const WindowOf = (Meter: TokenMeter, Session: unknown): number | null => {
	try {
		const Window = Meter.contextPressure(Session)?.contextWindow;
		return typeof Window === "number" && Window > 0 ? Window : null;
	} catch {
		return null;
	}
};

// The meter's own surface total, read only when the caller passes no surface
// (NaN): the drain always passes its replay figure, and a caller without one
// keeps the utilization instead of losing it.
const SurfaceOf = (Meter: TokenMeter, Session: unknown): number => {
	try {
		const Surface = Number(Meter.measure(Session)?.surfaceTokens);
		return Number.isFinite(Surface) ? Surface : Number.NaN;
	} catch {
		return Number.NaN;
	}
};

export default (
	Meter: TokenMeter,
	Session: unknown,
	Records: readonly unknown[],
	SurfaceTokens: number,
): Measured => {
	let Attempts = 0;
	let Started = false;
	let StepStart: number | null = null;
	let LatencyMs: number | null = null;
	let FirstTokenMs: number | null = null;
	let StreamSearched = false;
	let OutputTokens: number | null = null;
	let ErrorCode: string | null = null;

	// The two meter reads, once, before the walk: the window is the
	// provider's own figure and the surface is the caller's unless it passed
	// none (NaN).
	let ContextWindow = WindowOf(Meter, Session);
	const Surface = Number.isFinite(SurfaceTokens) ? SurfaceTokens : SurfaceOf(Meter, Session);
	for (const Event of Records) {
		try {
			const Record = Event as { type?: unknown; data?: unknown; time?: unknown };
			if (Record === null || typeof Record !== "object") {
				continue;
			}
			const Data = (Record.data ?? {}) as Record<string, unknown>;
			const Type = typeof Record.type === "string" ? Record.type : "";
			switch (true) {
				// The walk's own window read is the FALLBACK, not the source:
				// a caller without a live session handle (the drain replays
				// records) cannot ask the meter, and the log still carries the
				// provider's request/context figure.
				case Type === "request/context": {
					switch (true) {
						case ContextWindow !== null:
							break;
						default: {
							const Window = Number(Data["contextWindow"]);
							ContextWindow = Number.isFinite(Window) && Window > 0 ? Window : null;
							break;
						}
					}
					break;
				}
				case Type === "step/start": {
					Attempts = 0;
					Started = true;
					StepStart = Timed(Record, Data);
					break;
				}
				case Type === "assistant/attempt" && Started: {
					Attempts += 1;
					break;
				}
				case Type === "assistant/message": {
					const Time = Timed(Record, Data);
					if (Started && StepStart !== null && Time !== null) {
						LatencyMs = Math.max(0, Math.round(Time - StepStart));
					}
					Attempts = Attempts > 0 ? Attempts : 1;
					const Usage = Data["usage"];
					const Output = Number(
						Usage !== null && typeof Usage === "object"
							? (Usage as Record<string, unknown>)["outputTokens"]
							: Number.NaN,
					);
					if (Number.isFinite(Output)) {
						OutputTokens = Output;
					}
					break;
				}
				case Type === "tool/result" && ErrorCode === null: {
					const Failure = Data["error"];
					const Code =
						Failure !== null && typeof Failure === "object"
							? (Failure as Record<string, unknown>)["code"]
							: undefined;
					if (typeof Code === "string" && Code.length > 0) {
						ErrorCode = Code;
					}
					break;
				}
				case Type === "turn/end" && ErrorCode === null: {
					ErrorCode = ReasonOf(Data);
					break;
				}
				default:
			}
			// The first stream record's first token: read once, from the first
			// record that carries a stream array at all (an empty stream or an
			// absent time0 leaves the latency null, never guessed).
			if (!StreamSearched) {
				const Stream = Data["stream"];
				if (Array.isArray(Stream)) {
					StreamSearched = true;
					const First = Stream[0] as { time0?: unknown } | undefined;
					const Token = Number(First?.["time0"]);
					if (Number.isFinite(Token)) {
						FirstTokenMs = Math.max(0, Math.round(Token));
					}
				}
			}
		} catch {
			/* one malformed record never breaks the walk */
		}
	}
	const Utilization =
		ContextWindow !== null && ContextWindow > 0 && Number.isFinite(Surface)
			? Surface / ContextWindow
			: null;
	const TokensPerSecond =
		LatencyMs !== null && LatencyMs > 0 && OutputTokens !== null
			? OutputTokens / (LatencyMs / 1000)
			: null;
	return {
		Attempts: Attempts > 0 ? Attempts : 1,
		LatencyMs,
		FirstTokenMs,
		TokensPerSecond,
		ContextWindow,
		Utilization,
		ErrorCode,
	};
};
