// Detach - the two-arm transform (G1, IMPLEMENTATION-DESIGN.md section 3.2;
// Requirements/01 section 12). The pre-execute arm decides + starts the job +
// tags the exec object; the execute arm, seeing the tag, returns the
// fabricated canonical-value result WITHOUT calling next() - the bash body
// never runs, and the pipeline renders a SUCCESSFUL (isError: false) tool
// result whose text is exactly the marker.
//
// THE EFFECTIVE-GATE ORDER (I2 section 3, binding):
//   non-detachable -> await marker -> dedup -> escalation -> policy guards
// A marked call to a non-detachable tool is IGNORED with the I2 4.1 ledger
// line (never refused); the marker check sits after the class rule and before
// dedup/escalation/policy; Policy.Decide runs only for unmarked calls.
//
// THE FAIL-OPEN RULE (I1 12.2.2, HARD): every branch wrapped; on ANY internal
// error the just-started job is killed (`marker-failed`), the tag is removed,
// the ledger records `transform failed <tool> -> inline`, and the call runs
// inline exactly as if the plugin were not mounted. The listener NEVER denies.
import type {
	PreToolDecision,
	ToolDispatchExecution,
	ToolExecution,
	ToolExecutionResult,
} from "@deepseek-ai/dsh-tools";
import Clock from "@Function/Clock.js";
import * as Jobs from "@Function/Jobs.js";
import * as Policy from "@Function/Policy.js";
import type { Log } from "@Function/Render.js";
import type { DetachRecord, ShellSpec, TagRecord } from "@Interface/Events.js";
import type State from "@Interface/State.js";

/** The inline marker (design section 4.1, byte-exact):
 * `[live] <job-id> running: <cmd-head> - output pending; proceed reasoning.` */
export const Marker = (JobId: string, CmdHead: string): string =>
	`[live] ${JobId} running: ${CmdHead} - output pending; proceed reasoning.`;

/** The dedup variant's second line (design section 4.1, byte-exact). */
export const AlreadyLine = (JobId: string): string =>
	`[live] already running as ${JobId}; job_output ${JobId} to check.`;

/** The retry-loop extension's line (design section 6 scenario 5, byte-exact). */
export const RetryLine = (JobId: string, Attempt: number): string =>
	`[live] already running as ${JobId} (${Attempt}rd attempt) - use job_output.`;

/** The AWAIT-MARKER detection (I2 section 2): the FIRST-KEY test on the
 * arguments - `{"__await":true` - exactly like the normalize family's
 * first-key marker; no whitespace variants, no JSON re-parse. The parsed-
 * arguments path checks the literal FIRST key with the value exactly true
 * (insertion order); `{"__await":false` is NOT a marker. */
export const AwaitMarker = (Exec: ToolExecution): boolean => {
	const Args = Exec.arguments;
	if (typeof Args === "string") {
		return Args.startsWith('{"__await":true');
	}
	if (Args !== null && typeof Args === "object" && !Array.isArray(Args)) {
		const Record = Args as Record<string, unknown>;
		const Keys = Object.keys(Record);
		return Keys.length > 0 && Keys[0] === "__await" && Record["__await"] === true;
	}
	return false;
};

/** The escalation detection: the call carries sandbox_permissions (an
 * escalation request runs through the bash tool's own approval flow). */
export const IsEscalation = (Exec: ToolExecution): boolean => {
	const Args = (Exec.arguments ?? null) as Record<string, unknown> | null;
	if (Args === null || typeof Args !== "object") {
		return false;
	}
	return typeof Args["sandbox_permissions"] === "string";
};

/** The command argument of a command-runner call. */
const CommandOf = (Exec: ToolExecution): string => {
	const Args = (Exec.arguments ?? {}) as Record<string, unknown>;
	const Value = Args["command"];
	return typeof Value === "string" ? Value : "";
};

/** Extract the timeout the fabricated result reports (the call's own
 * timeoutMs, or the configured liveTimeoutMs). */
const TimeoutOf = (Exec: ToolExecution, Fallback: number): number => {
	const Args = (Exec.arguments ?? {}) as Record<string, unknown>;
	const Value = Args["timeoutMs"];
	return typeof Value === "number" && Number.isFinite(Value) && Value > 0 ? Value : Fallback;
};

/** The per-agent turn number the meta-budget keys on (the assemble-pass count
 * is the admission count; zero before the first assemble). */
const TurnOf = (Agent: State, AgentId: string): number => Agent.TurnCounts.get(AgentId) ?? 0;

/** The fail-open unwind for the two arms: kill the half-started job, untag,
 * drop the record, ledger both lines. Never throws. `StartedJobId` is the
 * just-started job of the failing pass (the half-detached guard: a failure
 * between start and tag still kills the job). */
const Unwind = (
	Agent: State,
	Exec: ToolExecution,
	Append: Log,
	StartedJobId: string | undefined,
	AgentId: string | undefined,
): void => {
	try {
		const Tag = Agent.Tagged.get(Exec);
		if (Tag !== undefined) {
			try {
				Agent.Wave?.Jobs?.kill(Tag.jobId, Tag.agentId, "marker-failed");
			} catch {
				/* the kill is best-effort */
			}
			Agent.Tagged.delete(Exec);
			const Records = Agent.Detached.get(Tag.agentId);
			Records?.delete(Tag.jobId);
			Append(`marker failed ${Tag.jobId} -> inline`);
		} else if (StartedJobId !== undefined) {
			try {
				Agent.Wave?.Jobs?.kill(StartedJobId, AgentId, "marker-failed");
			} catch {
				/* the kill is best-effort */
			}
			Append(`marker failed ${StartedJobId} -> inline`);
		}
		Append(`transform failed ${Exec.name} -> inline`);
	} catch {
		/* even the ledger is best-effort here */
	}
};

/** L2 - tools/pre-execute (waterfall): next() FIRST, then decide. A pass-through
 * branch returns the downstream decision unchanged; a transform branch starts
 * the job, tags the exec, records the per-agent record, and returns the
 * downstream decision (allow) - the interception happens at the execute arm. */
export const PreExecute = async (
	Agent: State,
	Exec: ToolExecution,
	Next: () => Promise<PreToolDecision>,
	Append: Log,
): Promise<PreToolDecision> => {
	// next() FIRST: the downstream listeners settle before any decision.
	const Downstream = await Next();
	// The job started by this pass, if any (the half-detached guard: a failure
	// between start and tag still kills the job).
	let StartedJobId: string | undefined;
	const Tool = Exec.name;
	const AgentId = Exec.agent?.id ?? "";
	const AgentIdKey = AgentId.length > 0 ? AgentId : "(unowned)";
	try {
		if (!Agent.On || Agent.Detach.mode === "off") {
			return Downstream;
		}
		// The class rule (I2 section 3: checked FIRST; I1 12.1 HARD).
		if (Policy.IsNonDetachable(Tool)) {
			if (AwaitMarker(Exec)) {
				Append(`await marker ignored (tool not detachable) ${Tool}`);
			}
			return Downstream;
		}
		if (!Policy.IsDetachableTool(Tool, Agent.Detach)) {
			if (AwaitMarker(Exec)) {
				Append(`await marker ignored (tool not detachable) ${Tool}`);
			}
			return Downstream;
		}
		const Command = CommandOf(Exec);
		if (Command.length === 0) {
			return Downstream;
		}
		// The inline duration observer's start stamp (the pass-through calls
		// record their duration at post-execute; a transformed call's stamp is
		// dropped - its body never runs).
		if (AgentId.length > 0) {
			StampStart(Agent, Exec.callId);
		}
		// The await marker (I2 section 3): the model's explicit inline opt-out,
		// after the class rule and before dedup/escalation/policy. The marker
		// key is never stripped - it rides in the logged arguments.
		if (AwaitMarker(Exec)) {
			Append(`await marker -> inline ${Tool}`);
			return Downstream;
		}
		// The dedup key's workdir is resolved the same way the transform
		// resolves it (design section 5.2: (agent, normalized command, resolved
		// workdir) - a different-dir same-command call dedups apart).
		let Workdir: string | undefined;
		try {
			const Cwd =
				Exec.agent === undefined || Agent.Wave?.WorkingDirectory === undefined
					? undefined
					: await Agent.Wave.WorkingDirectory.ensure(Exec.agent);
			Workdir = Jobs.ResolveWorkdir(
				(Exec.arguments as Record<string, unknown> | undefined)?.["workdir"] as
					string | undefined,
				Cwd,
			);
		} catch {
			Workdir = undefined;
		}
		// The dedup gate: a still-live job for the same key returns the SAME
		// marker via the execute arm's tag, referencing the same job id.
		if (Agent.Detach.dedup) {
			const Key = Policy.DedupKey(AgentIdKey, Command, Workdir);
			const Records = Agent.Detached.get(AgentIdKey);
			let Duplicate: string | undefined;
			for (const Record of Records?.values() ?? []) {
				if (Record.status === undefined && Record.dedupKey === Key) {
					Duplicate = Record.jobId;
					break;
				}
			}
			if (Duplicate !== undefined) {
				const PerAgent = Agent.DedupCounts.get(AgentIdKey) ?? new Map<string, number>();
				const Count = (PerAgent.get(Policy.CommandPrefix(Command)) ?? 0) + 1;
				PerAgent.set(Policy.CommandPrefix(Command), Count);
				Agent.DedupCounts.set(AgentIdKey, PerAgent);
				const Tag: TagRecord = {
					jobId: Duplicate,
					agentId: AgentIdKey,
					tool: Tool,
					cwd: undefined,
					timeoutMs: TimeoutOf(Exec, Agent.Detach.liveTimeoutMs),
					dedup: true,
					command: Command,
					attempt: Count,
				};
				Agent.Tagged.set(Exec, Tag);
				Append(`dedup ${Tool} -> ${Duplicate}`);
				return Downstream;
			}
		}
		// The escalation gate: the approval flow stays with the bash tool's own
		// execute; the transform never re-implements approval.
		if (IsEscalation(Exec)) {
			Append(`escalation -> inline ${Tool}`);
			return Downstream;
		}
		// The policy guards (capacity, meta-budget, min-latency, interactive,
		// mode logic) - every guard is a pass-through + ledger, never a deny.
		const Decision = Policy.Decide(Agent, AgentIdKey, Tool, Command, TurnOf(Agent, AgentIdKey));
		if (!Decision.detach) {
			if (Decision.ledger !== "failed") {
				Append(Decision.ledger);
			}
			return Downstream;
		}
		// THE TRANSFORM: start the job with the exact re-dispatch spec (cwd/env/
		// policy preserved - G2), record the pair, and tag the exec.
		let Started: { jobId: string; tail: DetachRecord["tail"]; spec: ShellSpec };
		try {
			Started = await Jobs.Start(
				Agent,
				AgentIdKey,
				{ command: Command },
				{
					callId: Exec.callId,
					rootCallId: Exec.rootCallId,
					agent: Exec.agent as { id: string; session?: unknown } | undefined,
				},
			);
		} catch (Error) {
			Append(`start failed ${Tool} -> inline`);
			void Error;
			return Downstream;
		}
		StartedJobId = Started.jobId;
		const At = Clock(Agent);
		const Record: DetachRecord = {
			jobId: Started.jobId,
			agentId: AgentIdKey,
			tool: Tool,
			cmdHead: Jobs.CommandHead(Command),
			cmdLine: Jobs.CommandLine(Command),
			dedupKey: Policy.DedupKey(AgentIdKey, Command, Workdir),
			startedAt: At,
			deadlineAt: At + Agent.Detach.liveTimeoutMs,
			tail: Started.tail,
		};
		const Records = Agent.Detached.get(AgentIdKey) ?? new Map<string, DetachRecord>();
		Records.set(Started.jobId, Record);
		Agent.Detached.set(AgentIdKey, Records);
		Agent.CallStarts.delete(Exec.callId);
		const Tag: TagRecord = {
			jobId: Started.jobId,
			agentId: AgentIdKey,
			tool: Tool,
			cwd: Started.spec.workdir,
			timeoutMs: TimeoutOf(Exec, Agent.Detach.liveTimeoutMs),
			dedup: false,
			command: Command,
			attempt: 0,
		};
		Agent.Tagged.set(Exec, Tag);
		Append(`detached ${Tool} -> ${Started.jobId}`);
		// The meta-budget: the transform is an automatic modification (counted
		// only when the failsafe layer is on - it is the failsafe's budget).
		if (Agent.Failsafes === "on") {
			Policy.SpendBudget(Agent, AgentIdKey, TurnOf(Agent, AgentIdKey));
		}
		return Downstream;
	} catch (Error) {
		// Fail-open (I1 12.2.2): kill any half-started job, untag, ledger, pass
		// through - the call runs inline exactly as if the plugin were unmounted.
		Unwind(Agent, Exec, Append, StartedJobId, AgentIdKey);
		void Error;
		return Downstream;
	}
};

/** L3 - tools/execute (waterfall): next() is NOT called when the tag is
 * present - the fabricated result REPLACES the dispatch (the cordis waterfall
 * veto), validated and rendered through the bash tool's own output contract.
 * The tag lives for exactly one pipeline pass. */
export const Execute = async (
	Agent: State,
	Exec: ToolDispatchExecution,
	Next: () => Promise<ToolExecutionResult>,
	Append: Log,
): Promise<ToolExecutionResult> => {
	try {
		if (!Agent.On) {
			return await Next();
		}
		const Tag = Agent.Tagged.get(Exec);
		if (Tag === undefined) {
			return await Next();
		}
		// The tag lives for exactly one pass (a replayed dispatch cannot be
		// swallowed twice).
		Agent.Tagged.delete(Exec);
		// The marker text: the fresh marker for a transform, the already-running
		// line for a dedup hit (the retry-loop extension when the count is high).
		let Text: string;
		if (Tag.dedup) {
			Text = `${Marker(Tag.jobId, Jobs.CommandHead(Tag.command))}\n${AlreadyLine(Tag.jobId)}`;
			if (Tag.attempt >= Agent.Detach.retryFailsafeCount && Agent.Failsafes === "on") {
				Append(`failsafe retry-loop ${Policy.CommandPrefix(Tag.command)}`);
				Text = `${Text}\n${RetryLine(Tag.jobId, Agent.Detach.retryFailsafeCount)}`;
			}
		} else {
			const Record = Agent.Detached.get(Tag.agentId)?.get(Tag.jobId);
			Text = Marker(Tag.jobId, Record?.cmdHead ?? Jobs.CommandHead(Tag.command));
		}
		// THE FABRICATED RESULT: the canonical-value shape the registry
		// normalizes through the bash tool's own output schema and render -
		// exitCode 0, no markers, so the model sees EXACTLY the marker bytes as
		// a SUCCESSFUL tool result (isError: false).
		return {
			isError: false,
			value: {
				kind: "foreground",
				cwd: Tag.cwd,
				exitCode: 0,
				signal: null,
				timedOut: false,
				aborted: false,
				timeoutMs: Tag.timeoutMs,
				stdout: { text: Text, truncated: false },
				stderr: { text: "", truncated: false },
			},
		} as unknown as ToolExecutionResult;
	} catch (Error) {
		// Fail-open: kill the tagged job, untag, ledger, run the REAL dispatch.
		Unwind(Agent, Exec, Append, undefined, undefined);
		void Error;
		return await Next();
	}
};

/** The post-execute hook: record the inline command's duration for the
 * same-prefix history (the wave-2 observer; a detached call never reaches
 * post-execute because its body never ran - the transform's veto). */
export const PostExecute = (
	Agent: State,
	Exec: { callId: string; name: string; arguments: unknown; agent?: { id?: string } | undefined },
): void => {
	if (!Agent.On || Agent.Detach.mode === "off") {
		return;
	}
	if (Exec.agent?.id === undefined) {
		return;
	}
	const Command = CommandOf(Exec as ToolExecution);
	if (Command.length === 0) {
		return;
	}
	const Started = Agent.CallStarts.get(Exec.callId);
	if (Started === undefined) {
		return;
	}
	Agent.CallStarts.delete(Exec.callId);
	Policy.RecordDuration(Agent, Exec.agent.id, Command, Math.max(0, Clock(Agent) - Started));
};

/** The start-time stamp for the duration observer (bounded: a long-lived
 * process without settlements cannot grow the map unboundedly). */
export const StampStart = (Agent: State, CallId: string): void => {
	if (Agent.CallStarts.size > 256) {
		Agent.CallStarts.clear();
	}
	Agent.CallStarts.set(CallId, Clock(Agent));
};
