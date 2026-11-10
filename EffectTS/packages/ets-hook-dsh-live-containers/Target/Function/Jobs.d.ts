/**
 * @module Jobs
 *
 * Re-dispatches a detached command as a governed background job and captures its tail.
 *
 * @remarks
 * The producer re-dispatch (G2, IMPLEMENTATION-DESIGN.md section 5.1): the command-runner
 * wrapper that replicates the bash tool's OWN background adapter (dsh-tool-bash
 * startJob/processJob/processSources) over the SAME governed path - ctx.shell.resolve +
 * ctx.shell.execute (sandbox + deadlines unmodified), ctx.shellEnv.collect(exec),
 * ctx.workingDirectory.ensure(agent, signal), ctx.get("sandboxPolicy")?.resolve({session}),
 * ctx.jobs.start(...).
 *
 * THE TAIL CAPTURE (section 5.1 step 3): the same observed streams feed the registry's
 * pull sources AND a bounded private tail (stdout + stderr, 2 KiB total) - the completion
 * composer's only legal render source, because the settled event carries no ring content
 * and a host plugin is not the job owner (readAt on an owned job fails authorization -
 * jobs-local expect()).
 *
 * The wrapper is command-runner-only BY CONSTRUCTION (Policy.ts's detachable set); the
 * non-detachable mutation family never reaches it.
 */
import type { JobSource, JobSpecification, ShellProcess, ShellSpecification } from "../Interface/Events.js";
import type State from "../Interface/State.js";
/**
 * The per-job private tail (bounded; the completion frame's output source).
 */
export declare class JobTail {
    Stdout: string;
    Stderr: string;
    /**
     * The 2 KiB total cap for the rendered tail (the I3 section 5 bound).
     */
    static readonly CapBytes = 2048;
    /**
     * The bytes of one string.
     */
    static Bytes: (Text: string) => number;
    /**
     * The head mode (the monitor path's additive mode; FILE-MONITOR design section 4.1):
     * the append keeps the FIRST cap bytes per channel, and the render cuts the combined
     * text to the cap from the END - the earliest bytes survive. A problem band's
     * diagnostic head is what tells the model which edit to revert (the detach path keeps
     * the newest-2KiB-per-channel capture, unchanged - the phase-2 assertions never
     * weaken).
     */
    private readonly Head;
    constructor(Head?: boolean);
    /**
     * Append one channel's chunk, keeping each channel's buffer bounded: the newest 2 KiB
     * per channel (detach mode) or the first 2 KiB per channel (head mode); the combined
     * render applies the total cap.
     */
    Append(Channel: "stdout" | "stderr", Text: string): void;
    /**
     * The rendered tail: stdout first, then one [stderr] section - the ringDelta channel
     * semantics. Detach mode cuts the total to 2 KiB from the front (oldest bytes drop
     * first, never the newest); head mode cuts from the end (the earliest bytes survive).
     */
    Render(): string;
}
/**
 * The executor's sandbox policy for one agent session (the standing policy the inline
 * call would have used - G2's "cwd/env/policy preserved").
 */
export declare const StandingPolicy: (Policy: {
    resolve(input: {
        session?: unknown;
    }): unknown;
} | undefined, Session: unknown) => {
    mode: string;
} | undefined;
/**
 * The resolveWorkdir semantics (dsh-tool-bash verbatim): relative -> joined under the
 * session cwd.
 */
export declare const ResolveWorkdir: (ModelWorkdir: string | undefined, SessionCwd: string | undefined) => string | undefined;
/**
 * The private tail feeding the registry's pull sources: one read, two sinks (the
 * registry's pump and our bounded tail). The process binds lazily - the spawn happens
 * inside the starter, after admission.
 */
export declare const Sources: (Process: () => ShellProcess | undefined, Tail: JobTail) => JobSource[];
/**
 * The producer adapter (processJob + processOutcome, dsh-tool-bash verbatim in shape):
 * the starter spawns the process with job-owned cancellation; the outcome maps
 * killed/completed + exit code + sandbox notes.
 */
export declare const Producer: (Execute: (spec: ShellSpecification) => Promise<ShellProcess>, Specification: ShellSpecification) => {
    run: JobSpecification["run"];
    Process: () => ShellProcess | undefined;
};
/**
 * Start one detached job for an agent session: resolve the spec at detach time (so the
 * model sees the same cwd/env/policy the inline call would have), start it with the exact
 * re-dispatch spec, and return the job id with the tail handle. Throws on admission or
 * start failure (the caller converts to pass-through - the fail-open rule).
 *
 * The monitor path (the second caller; FILE-MONITOR design section 4.1) passes
 * `kind: "monitor"`, a synthetic `label` (`monitor <setId> <path>`) and `head: true` (the
 * head-keep tail) - the same governed path, one wrapper, two callers. The detach path's
 * defaults are unchanged (kind "bash", the command as the label, the newest-bytes tail).
 */
export declare const Start: (Agent: State, AgentID: string, Args: {
    command: string;
    workdir?: string;
    timeoutMs?: number;
    kind?: string;
    label?: string;
    head?: boolean;
}, Exec: {
    callId: string;
    rootCallId: string;
    agent?: {
        id: string;
        session?: unknown;
    } | undefined;
}) => Promise<{
    jobId: string;
    tail: JobTail;
    spec: ShellSpecification;
}>;
/**
 * The label the marker shows: the first 80 bytes of the command, single line (newlines
 * replaced by " | ").
 */
export declare const CommandHead: (Command: string, Maximum?: number) => string;
/**
 * The standing frame's cmd line: the first 120 bytes.
 */
export declare const CommandLine: (Command: string, Maximum?: number) => string;
/**
 * The clock-stable start time string (HH:MM:SS) for the standing frame.
 */
export declare const StartedAt: (At: number) => string;
