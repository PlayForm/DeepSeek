// Telemetry - the signals the session log already carries
// (Documentation/Plans/COST-TRACK-PLUGIN.md section 17.4): one session's
// records walked in order for the retry count (the assistant/attempt events
// between a step/start and the assistant/message, one when none), the
// step-to-message latency, the first stream record's time0 (the perceived
// first-token latency), the tokens-per-second rate (the message's own output
// tokens over the latency), the last request/context's contextWindow, the
// utilization (the call's surface tokens over that window, both known) and
// the first failure code (a tool/result.error.code, else the turn/end reason
// kind). Unknown shapes are skipped and the walk never throws.
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

export default (Records: readonly unknown[], SurfaceTokens: number): Measured => {
	let Attempts = 0;
	let Started = false;
	let StepStart: number | null = null;
	let LatencyMs: number | null = null;
	let FirstTokenMs: number | null = null;
	let StreamSearched = false;
	let OutputTokens: number | null = null;
	let ContextWindow: number | null = null;
	let ErrorCode: string | null = null;
	for (const Event of Records) {
		try {
			const Record = Event as { type?: unknown; data?: unknown; time?: unknown };
			if (Record === null || typeof Record !== "object") {
				continue;
			}
			const Data = (Record.data ?? {}) as Record<string, unknown>;
			const Type = typeof Record.type === "string" ? Record.type : "";
			switch (true) {
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
				case Type === "request/context": {
					const Window = Number(Data["contextWindow"]);
					if (Number.isFinite(Window) && Window > 0) {
						ContextWindow = Window;
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
		ContextWindow !== null && ContextWindow > 0 && Number.isFinite(SurfaceTokens)
			? SurfaceTokens / ContextWindow
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
