import type { Log } from "@Function/Render.js";
import type { DetachRecord, JobEvent, SessionEvent } from "@Interface/Events.js";
import type State from "@Interface/State.js";
/** The context registration name (the SCHEME's seam evidence). */
export declare const CONTEXT_NAME = "live-containers-completion";
/** The wrapper line (I3 2.5, byte-exact). */
export declare const Wrapper = "[live] completion report (harness-appended; not a user request):";
/** The per-frame resume pointer (design section 4.2, byte-exact). */
export declare const FrameHint: (JobId: string) => string;
/** One frame between the wrapper and the hint (design section 4.2 verbatim
 * plus the I4 failure extras). The tail is either the record's captured tail
 * ("full"), a shortened tail ("short"), or the elided marker ("elided"). */
export declare const ComposeFrame: (Agent: State, Record: DetachRecord, Tail: {
    mode: "full";
} | {
    mode: "short";
    text: string;
} | {
    mode: "elided";
}) => string;
/** The resume hint (I4 2.2, byte-exact, one line, <= 200 bytes). */
export declare const ResumeHint: (Agent: State, AgentId: string, Frames: DetachRecord[], TurnSet: number) => string;
/** The merged pending text (I4 section 3): one wrapper line, frames in
 * settle order with failures first, blank-line separated, ONE hint line
 * below the last frame with NO blank line before it. */
export declare const ComposePending: (Agent: State, AgentId: string, Frames: DetachRecord[], TurnSet: number, Append: Log) => string;
/** The detach hook: the turn-set counter for the k/n hint denominator (I4
 * R3: a job dispatched mid-turn-set after an earlier snapshot is counted in
 * the NEXT batch's n - the counts may look non-monotonic across turns). */
export declare const OnDetach: (Agent: State, AgentId: string) => void;
/** The settled subscription hook (the I3 2.2 delivery): build the frame from
 * the observed settled event and append it to the agent's pending slot. */
export declare const OnSettled: (Agent: State, Event: JobEvent, Append: Log) => void;
/** The rendered pending text for one agent (the dynamic context's provider).
 * Frames pending: the merged batch; otherwise: the stable delivered tail
 * (never empty after a delivery - see the module header). */
export declare const Provider: (Agent: State, AgentId: string | undefined) => string;
/** The logged-snapshot observer (the I3 2.3 consume-on-logged-snapshot):
 * match the committed runtime-context snapshot whose text equals the agent's
 * current pending text, clear the batch, ledger the delivery + withdrawals. */
export declare const OnSessionEvent: (Agent: State, Subject: unknown, Event: SessionEvent, Append: Log) => void;
/** The dynamic-context registration (I3 2.1): one global registration, the
 * provider attributes per agent through the assemble context's agent field
 * (assembleContextFor sets scope = agent - verified). The context order is
 * the plugin's own finite allocation (external contributions may use any
 * finite order - dsh-system-prompt README; the last repository context slot
 * is WEB_SURFACE 210, so 300 sorts after every repository context). */
export declare const Register: (Agent: State, SystemPrompt: {
    context(context: {
        name: string;
        order: number;
        required: boolean;
        text: string | ((context: {
            agent?: {
                id?: string;
            } | undefined;
        }) => string);
    }): () => void;
}) => void;
