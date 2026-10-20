// Completion - the completion-append carrier (I3 APPEND-SEAM + I4
// COMPLETION-ERGONOMICS; IMPLEMENTATION-DESIGN.md section 3.3 as amended).
//
// THE CARRIER (I3, verified): the completion block is a REGISTERED DYNAMIC
// CONTEXT (`ctx.systemPrompt.context`) whose text the plugin flips from the
// completed frame to the delivered text exactly once per delivery; the loop
// turns a present, changed non-empty context into ONE sourced user-role
// snapshot appended to model history (dsh-agent-loop RuntimeContextProjection:
// "only when present" and "only when the retained value differs" - verified
// first-hand 2026-10-20), and an absent context produces NO event. The
// withdrawal is absence - the delivered snapshot stays in history, which is
// the durable completion record.
//
// THE EMIT-AT-MOST-ONCE DISCIPLINE (I3 2.3): the provider returns the pending
// text while frames are undelivered; the plugin clears the slot on the LOGGED
// SNAPSHOT (the session event whose user message carries the context snapshot
// with source {kind: "runtime-context", form: "snapshot"}), never on provider
// read - an aborted attempt re-delivers on the next attempt. After delivery
// the provider returns the delivered text as its stable tail (NOT empty): the
// loop never emits the harness's "Current runtime context: none." cleared
// snapshot for our carrier, and the next settle opens a fresh batch.
//
// THE BATCHED FORM (I4): everything that settles between two deliveries
// merges into ONE pending text (one wrapper line + N frames + ONE hint line);
// the aggregation window is per turn (admission-to-admission); failures sort
// first; the total is capped at config completionCapBytes (default 4096) with
// oldest-first truncation that never removes a header/status and protects
// failure tails to >= 512 bytes.
//
// THE WRAPPER LINE (I3 2.5, byte-exact): a bare user-role snapshot reads as a
// user instruction, so the pending text is wrapped with one line above the
// frames:
//   [live] completion report (harness-appended; not a user request):
import type { DetachRecord, JobEvent, SessionEvent } from "../Interface/Events.js";
import type State from "../Interface/State.js";
import Clock from "./Clock.js";
import type { Log } from "./Render.js";

/** The context registration name (the SCHEME's seam evidence). */
export const CONTEXT_NAME = "live-containers-completion";

/** The wrapper line (I3 2.5, byte-exact). */
export const Wrapper = "[live] completion report (harness-appended; not a user request):";

/** The per-frame resume pointer (design section 4.2, byte-exact). */
export const FrameHint = (JobId: string): string =>
	`[live] job_output ${JobId} to read the full output.`;

/** The domain tokens the hint's domain noun recognizes (I4 2.3: cargo/npm/
 * pnpm/make/bash -> "the <token> steps"; unknown -> "the build steps"). */
const DOMAIN_TOKENS: readonly string[] = [
	"cargo",
	"npm",
	"pnpm",
	"yarn",
	"make",
	"bash",
	"go",
	"pip",
	"tsc",
	"next",
	"cmake",
];

/** The hint's domain phrase from the batch's first cmdHead (I4 2.3). */
const DomainNoun = (Frames: DetachRecord[]): string => {
	const First = Frames[0]?.cmdHead ?? "";
	const Token = First.trim().split(/\s+/)[0] ?? "";
	return DOMAIN_TOKENS.includes(Token) ? `the ${Token} steps` : "the build steps";
};

/** The elapsed seconds of one record (clock-driven; settled records use the
 * settle time stamped on the record). */
const Elapsed = (Agent: State, Record: DetachRecord): number => {
	const End = Record.settledAt ?? Clock(Agent);
	return Math.max(0, Math.round((End - Record.startedAt) / 1000));
};

/** The byte length of one string. */
const Bytes = (Text: string): number => Buffer.byteLength(Text, "utf8");

/** The status line + the failure extras of one frame (design section 4.2 +
 * I4 section 4.3, byte-exact). */
const StatusLines = (Record: DetachRecord): string[] => {
	switch (true) {
		case Record.status === "killed":
			return [
				"status: killed (cause: kill)",
				`kill reason: ${(Record.detail ?? "killed").length > 80 ? (Record.detail ?? "killed").slice(0, 80) : (Record.detail ?? "killed")}`,
			];
		case Record.status === "failed": {
			const Code = /exit code: (-?\d+)/.exec(Record.detail ?? "")?.[1];
			return [
				"status: error (cause: producer)",
				...(Code !== undefined ? [`exit: ${Code}`] : []),
			];
		}
		default:
			return [
				`status: ${Record.status ?? "completed"} (cause: ${Record.cause ?? "producer"})`,
			];
	}
};

/** The failure-variant tail is stderr-weighted: stderr first, then a
 * [stdout] section (I4 4.3); the success variant is stdout first with a
 * [stderr] section (the JobTail render does that). */
const FailureTail = (Record: DetachRecord): string => {
	const Out = Record.tail.Stdout;
	const Err = Record.tail.Stderr;
	let Text = Err;
	if (Out.length > 0) {
		if (Text.length > 0 && !Text.endsWith("\n")) {
			Text += "\n";
		}
		Text += `[stdout]\n${Out}`;
	}
	return Text;
};

/** One frame between the wrapper and the hint (design section 4.2 verbatim
 * plus the I4 failure extras). The tail is either the record's captured tail
 * ("full"), a shortened tail ("short"), or the elided marker ("elided"). */
export const ComposeFrame = (
	Agent: State,
	Record: DetachRecord,
	Tail: { mode: "full" } | { mode: "short"; text: string } | { mode: "elided" },
): string => {
	const Full =
		Tail.mode === "full"
			? Record.status === "failed"
				? FailureTail(Record)
				: Record.tail.Render()
			: "";
	const Text = Tail.mode === "short" ? Tail.text : Full;
	const Body =
		Tail.mode === "elided" ? Elided(Record.jobId) : Text.length === 0 ? "(no output)" : Text;
	const Lines = [
		`--- LIVE CONTAINER ${Record.jobId} completed ---`,
		...StatusLines(Record),
		`elapsed: ${Elapsed(Agent, Record)}s`,
		`output (tail up to 2 KiB):`,
		Body,
		`--- END LIVE CONTAINER ${Record.jobId} ---`,
		FrameHint(Record.jobId),
	];
	return Lines.join("\n");
};

/** The elided-tail marker (I4 1.3, byte-exact). */
const Elided = (JobId: string): string =>
	`output (tail elided; cap reached - job_output ${JobId} for the full output)`;

/** The truncation pass (I4 1.3): when the merged text would exceed the cap,
 * the OLDEST frames are truncated first - header/status/elapsed always kept,
 * the tail shortened to the remaining budget (minimum 256 bytes or the
 * elided marker), failures protected to >= 512 bytes of error tail before
 * any running frame's tail is shortened. Every truncation is ledgered. */
const Fit = (Agent: State, Frames: DetachRecord[], Append: Log): string[] => {
	const Cap = Agent.CompletionCapBytes;
	const Total = (Bodies: string[]): number =>
		Bytes([Wrapper, ...Bodies].join("\n\n")) + Bytes("\n" + RESERVE_HINT_BYTES);
	const Bodies = Frames.map((Record) => ComposeFrame(Agent, Record, { mode: "full" }));
	if (Total(Bodies) <= Cap) {
		return Bodies;
	}
	const Kept = [...Bodies];
	for (let Index = 0; Index < Frames.length; Index += 1) {
		if (Total(Kept) <= Cap) {
			break;
		}
		const Record = Frames[Index];
		if (Record === undefined) {
			continue;
		}
		const Failure = Record.status === "failed" || Record.status === "killed";
		const Floor = Failure ? 512 : 256;
		const Source = Failure ? Record.tail.Stderr : Record.tail.Stdout;
		let Size = Math.max(Floor, Bytes(Source));
		let Done = false;
		while (Size > Floor) {
			Size = Math.max(Floor, Math.floor(Size / 2));
			Kept[Index] = ComposeFrame(Agent, Record, { mode: "short", text: Source.slice(-Size) });
			if (Total(Kept) <= Cap) {
				Done = true;
				break;
			}
			if (Size <= Floor) {
				break;
			}
		}
		if (!Done) {
			// The elided form: header, status, elapsed, the cap-reached marker.
			Kept[Index] = ComposeFrame(Agent, Record, { mode: "elided" });
		}
		Append(`completion truncated ${Record.jobId} (${Bytes(Kept[Index] ?? "")} bytes)`);
	}
	return Kept;
};

/** The resume hint (I4 2.2, byte-exact, one line, <= 200 bytes). */
export const ResumeHint = (
	Agent: State,
	AgentId: string,
	Frames: DetachRecord[],
	TurnSet: number,
): string => {
	const Failed = Frames.find(
		(Record) => Record.status === "failed" || Record.status === "killed",
	);
	if (Failed !== undefined) {
		return `[live] next: ${Failed.jobId} failed (${Failed.cause ?? "kill"}) - read job_output ${Failed.jobId}, fix, and re-run the failed steps before continuing the remaining ones.`;
	}
	const Domain = DomainNoun(Frames);
	const Records = Agent.Detached.get(AgentId);
	let Live = 0;
	for (const Record of Records?.values() ?? []) {
		if (Record.status === undefined) {
			Live += 1;
		}
	}
	if (Live > 0) {
		const Last = Frames[Frames.length - 1]?.jobId ?? "";
		return `[live] next: ${Frames.length}/${TurnSet} done - review the output above, then continue ${Domain}; job_output ${Last} for details.`;
	}
	return `[live] next: all ${TurnSet} finished - review the outputs above, then continue ${Domain}.`;
};

/** The reserved hint budget the cap check includes (the one `[live] next: `
 * line; a hint never exceeds 200 bytes, so 200 is the safe reserve). */
const RESERVE_HINT_BYTES = 200;

/** The merged pending text (I4 section 3): one wrapper line, frames in
 * settle order with failures first, blank-line separated, ONE hint line
 * below the last frame with NO blank line before it. */
export const ComposePending = (
	Agent: State,
	AgentId: string,
	Frames: DetachRecord[],
	TurnSet: number,
	Append: Log,
): string => {
	const Sorted = [...Frames].sort((Left, Right) => {
		const LeftBad = Left.status === "failed" || Left.status === "killed";
		const RightBad = Right.status === "failed" || Right.status === "killed";
		if (LeftBad !== RightBad) {
			return LeftBad ? -1 : 1;
		}
		return (Left.settledAt ?? 0) - (Right.settledAt ?? 0);
	});
	const Bodies = Fit(Agent, Sorted, Append);
	// The last-line stack is intentional: the per-frame pointer is per-job,
	// the hint is per-batch - and there is NO blank line between the last
	// frame's job_output line and the hint (I4 section 3).
	return [Wrapper, ...Bodies].join("\n\n") + "\n" + ResumeHint(Agent, AgentId, Sorted, TurnSet);
};

/** The pending slot accessor. */
const Slot = (
	Agent: State,
	AgentId: string,
): { frames: DetachRecord[]; delivered: string; turnSet: number; rendered: boolean } => {
	const Existing = Agent.Pending.get(AgentId);
	if (Existing !== undefined) {
		return Existing;
	}
	const Fresh = { frames: [], delivered: "", turnSet: 0, rendered: false };
	Agent.Pending.set(AgentId, Fresh);
	return Fresh;
};

/** The detach hook: the turn-set counter for the k/n hint denominator (I4
 * R3: a job dispatched mid-turn-set after an earlier snapshot is counted in
 * the NEXT batch's n - the counts may look non-monotonic across turns). */
export const OnDetach = (Agent: State, AgentId: string): void => {
	const Current = Slot(Agent, AgentId);
	Current.turnSet += 1;
};

/** The settled subscription hook (the I3 2.2 delivery): build the frame from
 * the observed settled event and append it to the agent's pending slot. */
export const OnSettled = (Agent: State, Event: JobEvent, Append: Log): void => {
	if (Event.type !== "settled") {
		return;
	}
	const JobId = Event.job.id;
	const Owner = Event.job.owner;
	if (Owner === undefined) {
		return;
	}
	const Records = Agent.Detached.get(Owner);
	const Record = Records?.get(JobId);
	if (Record === undefined) {
		return;
	}
	// The skips (design section 3.6 steps 3+5).
	if (Event.cause === "teardown") {
		Records?.delete(JobId);
		Append(`owner gone ${JobId}`);
		return;
	}
	if (Event.awaited) {
		Records?.delete(JobId);
		Append(`completion skipped ${JobId} (awaited)`);
		return;
	}
	// The settled facts (the frame renders ONLY from the observed event).
	Record.status =
		Event.job.status === "killed"
			? "killed"
			: Event.job.status === "failed"
				? "failed"
				: "completed";
	Record.cause = Event.cause;
	Record.detail = Event.job.detail;
	Record.settledAt = Clock(Agent);
	Record.awaited = false;
	const Current = Slot(Agent, Owner);
	Current.frames.push(Record);
	Records?.delete(JobId);
};

/** The rendered pending text for one agent (the dynamic context's provider).
 * Frames pending: the merged batch; otherwise: the stable delivered tail
 * (never empty after a delivery - see the module header). */
export const Provider = (Agent: State, AgentId: string | undefined): string => {
	if (AgentId === undefined || AgentId.length === 0) {
		return "";
	}
	const Current = Agent.Pending.get(AgentId);
	if (Current === undefined) {
		return "";
	}
	if (Current.frames.length > 0) {
		return ComposePending(
			Agent,
			AgentId,
			Current.frames,
			Math.max(Current.turnSet, Current.frames.length),
			() => undefined,
		);
	}
	return Current.delivered;
};

/** The logged-snapshot observer (the I3 2.3 consume-on-logged-snapshot):
 * match the committed runtime-context snapshot whose text equals the agent's
 * current pending text, clear the batch, ledger the delivery + withdrawals. */
export const OnSessionEvent = (
	Agent: State,
	Subject: unknown,
	Event: SessionEvent,
	Append: Log,
): void => {
	if (Agent.On !== true || Event.type !== "user/message") {
		return;
	}
	const Data = Event.data as
		| {
				message?: {
					source?: { kind?: string; form?: string };
					content?: { type?: string; text?: string }[];
				};
		  }
		| undefined;
	const Source = Data?.message?.source;
	if (Source?.kind !== "runtime-context" || Source?.form !== "snapshot") {
		return;
	}
	const Text = Data?.message?.content?.[0]?.text;
	if (typeof Text !== "string" || Text.length === 0) {
		return;
	}
	for (const [AgentId, Current] of Agent.Pending) {
		if (Current.frames.length === 0) {
			continue;
		}
		const Pending = ComposePending(
			Agent,
			AgentId,
			Current.frames,
			Math.max(Current.turnSet, Current.frames.length),
			Append,
		);
		if (Pending !== Text) {
			continue;
		}
		// The delivery: the batch drains, the delivered text becomes the stable
		// tail, the turn-set resets for the next batch.
		Append(`completion rendered ${Bytes(Text)} bytes`);
		for (const Frame of Current.frames) {
			Append(`withdrawn ${Frame.jobId} (completed)`);
		}
		Current.delivered = Text;
		Current.frames = [];
		Current.turnSet = 0;
		Current.rendered = true;
		void Subject;
		return;
	}
};

/** The dynamic-context registration (I3 2.1): one global registration, the
 * provider attributes per agent through the assemble context's agent field
 * (assembleContextFor sets scope = agent - verified). The context order is
 * the plugin's own finite allocation (external contributions may use any
 * finite order - dsh-system-prompt README; the last repository context slot
 * is WEB_SURFACE 210, so 300 sorts after every repository context). */
export const Register = (
	Agent: State,
	SystemPrompt: {
		context(context: {
			name: string;
			order: number;
			required: boolean;
			text: string | ((context: { agent?: { id?: string } | undefined }) => string);
		}): () => void;
	},
): void => {
	SystemPrompt.context({
		name: CONTEXT_NAME,
		order: 300,
		required: false,
		text: (AssembleContext) => Provider(Agent, AssembleContext.agent?.id),
	});
};
