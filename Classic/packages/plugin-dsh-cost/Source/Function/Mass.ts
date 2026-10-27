// Mass - the surface replay (Documentation/Plans/COST-TRACK-PLUGIN.md
// section 2.2): the model-visible surface of one session up to, not
// including, the call being priced. Each surface message (system, user,
// assistant, tool result) is priced by the estimator into Surface, and each
// tool result's tokens are carried to the files its originating tool/call
// targeted - resolved from the same walk, so a file's context mass is the
// share of the context it occupied and the per-path masses never exceed the
// surface they came from. The walk sees the whole session stream (the
// tool/call records between the surface messages are the callId map's
// source, and the session header carries the cwd the arguments resolve
// against); unknown shapes are skipped and the walk never throws. A
// user/message that attached a file is not detectable in the current log
// shape and contributes to no path.
import Touch from "./Touch.js";

export default (Estimate: (Message: unknown) => number) =>
	(
		Events: readonly unknown[],
	): {
		Surface: number;
		PerPath: Map<string, number>;
	} => {
		let Surface = 0;
		const PerPath = new Map<string, number>();
		const CallPaths = new Map<string, string[]>();
		let Cwd = process.cwd();
		for (const Event of Events) {
			try {
				const Record = Event as { type?: unknown; data?: unknown };
				if (Record === null || typeof Record !== "object") {
					continue;
				}
				const Data = (Record.data ?? {}) as Record<string, unknown>;
				switch (true) {
					case Record.type === "session": {
						// the session header is FLAT (its fields sit on the record
						// itself, not under data); a data-level cwd is the fallback
						const Header = Record as { cwd?: unknown };
						const Home = Data["cwd"] ?? Header.cwd;
						if (typeof Home === "string" && Home.length > 0) {
							Cwd = Home;
						}
						break;
					}
					case Record.type === "tool/call": {
						const CallId = Data["callId"];
						if (typeof CallId !== "string" || CallId.length === 0) {
							break;
						}
						const Name = Data["name"];
						const Arguments = Data["arguments"];
						const Touched = Touch(
							typeof Name === "string" ? Name : "",
							typeof Arguments === "string" ? Arguments : "",
							Cwd,
						);
						if (Touched.length > 0) {
							CallPaths.set(
								CallId,
								Touched.map((Row) => Row.Path),
							);
						}
						break;
					}
					case Record.type === "system/message" ||
						Record.type === "user/message" ||
						Record.type === "assistant/message" ||
						Record.type === "tool/result": {
						const Message = Data["message"] ?? Data;
						const Tokens = Priced(Estimate, Message);
						Surface += Tokens;
						if (Record.type !== "tool/result") {
							break;
						}
						const Tool = Message as
							{ source?: { callId?: unknown }; toolCallId?: unknown } | undefined;
						const Origin = Tool?.source?.callId;
						const Alternative = Tool?.toolCallId;
						const CallId =
							typeof Origin === "string" && Origin.length > 0
								? Origin
								: typeof Alternative === "string"
									? Alternative
									: "";
						const Paths = CallId.length === 0 ? [] : (CallPaths.get(CallId) ?? []);
						for (const Path of Paths) {
							PerPath.set(Path, (PerPath.get(Path) ?? 0) + Tokens);
						}
						break;
					}
					default:
				}
			} catch {
				/* one malformed event never breaks the walk */
			}
		}
		return { Surface, PerPath };
	};

// One message priced by the estimator: a failed, non-finite or non-positive
// estimate prices the message at zero rather than breaking the walk.
const Priced = (Estimate: (Message: unknown) => number, Message: unknown): number => {
	if (Message === null || typeof Message !== "object") {
		return 0;
	}
	try {
		const Tokens = Number(Estimate(Message));
		return Number.isFinite(Tokens) && Tokens > 0 ? Tokens : 0;
	} catch {
		return 0;
	}
};
