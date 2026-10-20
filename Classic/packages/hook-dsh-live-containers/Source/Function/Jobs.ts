// Jobs - the producer re-dispatch (G2, IMPLEMENTATION-DESIGN.md section 5.1):
// the command-runner wrapper that replicates the bash tool's OWN background
// adapter (dsh-tool-bash startJob/processJob/processSources) over the SAME
// governed path - ctx.shell.resolve + ctx.shell.execute (sandbox + deadlines
// unmodified), ctx.shellEnv.collect(exec), ctx.workingDirectory.ensure(agent,
// signal), ctx.get("sandboxPolicy")?.resolve({session}), ctx.jobs.start(...).
//
// THE TAIL CAPTURE (section 5.1 step 3): the same observed streams feed the
// registry's pull sources AND a bounded private tail (stdout + stderr, 2 KiB
// total) - the completion composer's only legal render source, because the
// settled event carries no ring content and a host plugin is not the job owner
// (readAt on an owned job fails authorization - jobs-local expect()).
//
// The wrapper is command-runner-only BY CONSTRUCTION (Policy.ts's detachable
// set); the non-detachable mutation family never reaches it.
import type { JobSource, JobSpec, ShellProcess, ShellSpec } from "@Interface/Events.js";
import type State from "@Interface/State.js";

/** The per-job private tail (bounded; the completion frame's output source). */
export class JobTail {
	Stdout = "";
	Stderr = "";

	/** The 2 KiB total cap for the rendered tail (the I3 section 5 bound). */
	static readonly CapBytes = 2048;

	/** The bytes of one string. */
	static Bytes = (Text: string): number => Buffer.byteLength(Text, "utf8");

	/** The head mode (the monitor path's additive mode; FILE-MONITOR design
	 * section 4.1): the append keeps the FIRST cap bytes per channel, and the
	 * render cuts the combined text to the cap from the END - the earliest
	 * bytes survive. A problem band's diagnostic head is what tells the model
	 * which edit to revert (the detach path keeps the newest-2KiB-per-channel
	 * capture, unchanged - the phase-2 assertions never weaken). */
	private readonly Head: boolean;

	constructor(Head = false) {
		this.Head = Head;
	}

	/** Append one channel's chunk, keeping each channel's buffer bounded: the
	 * newest 2 KiB per channel (detach mode) or the first 2 KiB per channel
	 * (head mode); the combined render applies the total cap. */
	Append(Channel: "stdout" | "stderr", Text: string): void {
		if (Channel === "stdout") {
			this.Stdout = this.Head
				? this.Stdout.length < JobTail.CapBytes
					? (this.Stdout + Text).slice(0, JobTail.CapBytes)
					: this.Stdout
				: (this.Stdout + Text).slice(-JobTail.CapBytes);
			return;
		}
		this.Stderr = this.Head
			? this.Stderr.length < JobTail.CapBytes
				? (this.Stderr + Text).slice(0, JobTail.CapBytes)
				: this.Stderr
			: (this.Stderr + Text).slice(-JobTail.CapBytes);
	}

	/** The rendered tail: stdout first, then one [stderr] section - the
	 * ringDelta channel semantics. Detach mode cuts the total to 2 KiB from
	 * the front (oldest bytes drop first, never the newest); head mode cuts
	 * from the end (the earliest bytes survive). */
	Render(): string {
		let Out = this.Stdout;
		const Err = this.Stderr;
		if (Err.length > 0) {
			if (Out.length > 0 && !Out.endsWith("\n")) {
				Out += "\n";
			}
			Out += `[stderr]\n${Err}`;
		}
		let Cut = Out;
		if (this.Head) {
			while (JobTail.Bytes(Cut) > JobTail.CapBytes && Cut.length > 0) {
				Cut = Cut.slice(0, -1);
			}
			return Cut;
		}
		while (JobTail.Bytes(Cut) > JobTail.CapBytes && Cut.length > 0) {
			Cut = Cut.slice(1);
		}
		return Cut;
	}
}

/** The executor's sandbox policy for one agent session (the standing policy
 * the inline call would have used - G2's "cwd/env/policy preserved"). */
export const StandingPolicy = (
	Policy: { resolve(input: { session?: unknown }): unknown } | undefined,
	Session: unknown,
): { mode: string } | undefined => {
	if (Policy === undefined) {
		return undefined;
	}
	try {
		const Resolved = Policy.resolve(Session === undefined ? {} : { session: Session });
		return Resolved === undefined ? undefined : (Resolved as { mode: string });
	} catch {
		return undefined;
	}
};

/** The resolveWorkdir semantics (dsh-tool-bash verbatim): relative -> joined
 * under the session cwd. */
export const ResolveWorkdir = (
	ModelWorkdir: string | undefined,
	SessionCwd: string | undefined,
): string | undefined => {
	if (ModelWorkdir === undefined) {
		return SessionCwd;
	}
	if (SessionCwd !== undefined && !ModelWorkdir.startsWith("/")) {
		return `${SessionCwd}/${ModelWorkdir}`;
	}
	return ModelWorkdir;
};

/** The private tail feeding the registry's pull sources: one read, two sinks
 * (the registry's pump and our bounded tail). The process binds lazily - the
 * spawn happens inside the starter, after admission. */
export const Sources = (Process: () => ShellProcess | undefined, Tail: JobTail): JobSource[] => {
	const Source = (Channel: "stdout" | "stderr"): JobSource => ({
		channel: Channel,
		read: (FromByte: number) => {
			const Live = Process();
			if (Live === undefined) {
				return { text: "", nextOffset: FromByte, lossy: false };
			}
			const Read = Live.observed[Channel].readFrom(FromByte);
			if (Read.text.length > 0) {
				Tail.Append(Channel, Read.text);
			}
			return Read;
		},
	});
	return [Source("stdout"), Source("stderr")];
};

/** The producer adapter (processJob + processOutcome, dsh-tool-bash verbatim
 * in shape): the starter spawns the process with job-owned cancellation; the
 * outcome maps killed/completed + exit code + sandbox notes. */
export const Producer = (
	Execute: (spec: ShellSpec) => Promise<ShellProcess>,
	Spec: ShellSpec,
): { run: JobSpec["run"]; Process: () => ShellProcess | undefined } => {
	let Process: ShellProcess | undefined;
	const Cancel = new AbortController();
	const Outcome = (
		Started: ShellProcess,
	): { status: "completed" | "killed"; detail?: string } => {
		switch (Started.status) {
			case "killed":
				return {
					status: "killed",
					detail:
						Started.signal !== null
							? `signal: ${Started.signal}`
							: "killed before exit",
				};
			default:
				return { status: "completed", detail: `exit code: ${Started.exitCode ?? 0}` };
		}
	};
	return {
		Process: () => Process,
		run: () => {
			const Settle = (async (): Promise<{
				status: "completed" | "killed";
				detail?: string;
			}> => {
				try {
					const Started = await Execute({ ...Spec, signal: Cancel.signal });
					Process = Started;
					if (Cancel.signal.aborted) {
						Started.kill();
					}
					await Started.done;
					return Outcome(Started);
				} catch (Err) {
					return {
						status: "killed",
						detail: Err instanceof Error ? Err.message : String(Err),
					};
				}
			})();
			return {
				done: Settle,
				cancel: (Reason: string) => {
					if (Cancel.signal.aborted) {
						return;
					}
					Cancel.abort(new Error(Reason ?? "killed"));
					Process?.kill();
				},
			};
		},
	};
};

/** Start one detached job for an agent session: resolve the spec at detach
 * time (so the model sees the same cwd/env/policy the inline call would have),
 * start it with the exact re-dispatch spec, and return the job id with the
 * tail handle. Throws on admission or start failure (the caller converts to
 * pass-through - the fail-open rule).
 *
 * The monitor path (the second caller; FILE-MONITOR design section 4.1) passes
 * `kind: "monitor"`, a synthetic `label` (`monitor <setId> <path>`) and
 * `head: true` (the head-keep tail) - the same governed path, one wrapper,
 * two callers. The detach path's defaults are unchanged (kind "bash", the
 * command as the label, the newest-bytes tail). */
export const Start = async (
	Agent: State,
	AgentID: string,
	Args: {
		command: string;
		workdir?: string;
		timeoutMs?: number;
		kind?: string;
		label?: string;
		head?: boolean;
	},
	Exec: {
		callId: string;
		rootCallId: string;
		agent?: { id: string; session?: unknown } | undefined;
	},
): Promise<{ jobId: string; tail: JobTail; spec: ShellSpec }> => {
	const Wave = Agent.Wave;
	if (Wave?.Jobs === undefined || Wave?.Shell === undefined) {
		throw new Error("jobs or shell unavailable");
	}
	const Session = Exec.agent?.session;
	const Cwd =
		Exec.agent === undefined
			? undefined
			: await (Wave.WorkingDirectory?.ensure(Exec.agent) ?? Promise.resolve(undefined));
	const Workdir = ResolveWorkdir(Args.workdir, Cwd);
	const DSHEnv =
		Wave.ShellEnv === undefined ? undefined : Wave.ShellEnv.collect({ agent: Exec.agent });
	const Policy = StandingPolicy(Wave.SandboxPolicy, Session);
	const Spec = Wave.Shell.resolve({
		command: Args.command,
		...(Workdir !== undefined ? { workdir: Workdir } : {}),
		...(Args.timeoutMs !== undefined ? { timeoutMs: Args.timeoutMs } : {}),
		dshEnv: DSHEnv,
		...(Policy !== undefined ? { sandboxPolicy: Policy } : {}),
		onExpiry: "none",
	});
	const Tail = new JobTail(Args.head === true);
	const Adapter = Producer((WithSignal) => Wave.Shell!.execute(WithSignal), Spec);
	const JobID = Wave.Jobs.start({
		kind: Args.kind ?? "bash",
		label: Args.label ?? (Args.command.length > 80 ? Args.command.slice(0, 80) : Args.command),
		toolCall: { callId: Exec.callId, rootCallId: Exec.rootCallId },
		...(Exec.agent !== undefined ? { owner: AgentID } : {}),
		outputLimitBytes: 2048,
		output: Sources(Adapter.Process, Tail),
		run: Adapter.run,
	});
	return { jobId: JobID, tail: Tail, spec: Spec };
};

/** The label the marker shows: the first 80 bytes of the command, single line
 * (newlines replaced by " | "). */
export const CommandHead = (Command: string, Max = 80): string => {
	const Single = Command.replace(/\r?\n/g, " | ");
	return Single.length > Max ? Single.slice(0, Max) : Single;
};

/** The standing frame's cmd line: the first 120 bytes. */
export const CommandLine = (Command: string, Max = 120): string => {
	const Single = Command.replace(/\r?\n/g, " | ");
	return Single.length > Max ? Single.slice(0, Max) : Single;
};

/** The clock-stable start time string (HH:MM:SS) for the standing frame. */
export const StartedAt = (At: number): string => {
	try {
		return new Intl.DateTimeFormat("en-GB", {
			timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		}).format(new Date(At));
	} catch {
		return new Date(At).toISOString().slice(11, 19);
	}
};
