import type { PreToolDecision, ToolDispatchExecution, ToolExecution, ToolExecutionResult } from "@deepseek-ai/dsh-tools";
import type { Log } from "./Render.js";
import type State from "../Interface/State.js";
/** The inline marker (design section 4.1, byte-exact):
 * `[live] <job-id> running: <cmd-head> - output pending; proceed reasoning.` */
export declare const Marker: (JobID: string, CmdHead: string) => string;
/** The dedup variant's second line (design section 4.1, byte-exact). */
export declare const AlreadyLine: (JobID: string) => string;
/** The retry-loop extension's line (design section 6 scenario 5, byte-exact). */
export declare const RetryLine: (JobID: string, Attempt: number) => string;
/** The AWAIT-MARKER detection (I2 section 2): the FIRST-KEY test on the
 * arguments - `{"__await":true` - exactly like the normalize family's
 * first-key marker; no whitespace variants, no JSON re-parse. The parsed-
 * arguments path checks the literal FIRST key with the value exactly true
 * (insertion order); `{"__await":false` is NOT a marker. */
export declare const AwaitMarker: (Exec: ToolExecution) => boolean;
/** The escalation detection: the call carries sandbox_permissions (an
 * escalation request runs through the bash tool's own approval flow). */
export declare const IsEscalation: (Exec: ToolExecution) => boolean;
/** L2 - tools/pre-execute (waterfall): next() FIRST, then decide. A pass-through
 * branch returns the downstream decision unchanged; a transform branch starts
 * the job, tags the exec, records the per-agent record, and returns the
 * downstream decision (allow) - the interception happens at the execute arm. */
export declare const PreExecute: (Agent: State, Exec: ToolExecution, Next: () => Promise<PreToolDecision>, Append: Log) => Promise<PreToolDecision>;
/** L3 - tools/execute (waterfall): next() is NOT called when the tag is
 * present - the fabricated result REPLACES the dispatch (the cordis waterfall
 * veto), validated and rendered through the bash tool's own output contract.
 * The tag lives for exactly one pipeline pass. */
export declare const Execute: (Agent: State, Exec: ToolDispatchExecution, Next: () => Promise<ToolExecutionResult>, Append: Log) => Promise<ToolExecutionResult>;
/** The post-execute hook: record the inline command's duration for the
 * same-prefix history (the wave-2 observer; a detached call never reaches
 * post-execute because its body never ran - the transform's veto). */
export declare const PostExecute: (Agent: State, Exec: {
    callId: string;
    name: string;
    arguments: unknown;
    agent?: {
        id?: string;
    } | undefined;
}) => void;
/** The start-time stamp for the duration observer (bounded: a long-lived
 * process without settlements cannot grow the map unboundedly). */
export declare const StampStart: (Agent: State, CallID: string) => void;
