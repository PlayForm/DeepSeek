// Events - the STRUCTURAL event payloads the machine consumes and the
// session-resolved types it needs (the family's one-field narrowing law: the
// event contract keeps actors opaque; every narrowing is a cast at the use
// site). The PoC rule binds: no imports from the packages that declare the
// canonical types (dsh-tools / dsh-system-prompt / dsh-agent) - the
// end-phase wires them.

/** The tool execution context the defineTool pipeline provides (the actor
 *  the batch's writes carry; `agent.session` is what the sandbox policy
 *  resolves against). */
export interface ToolExec {
	signal?: AbortSignal;
	agent?: { id?: string; session?: unknown };
	callId?: string;
	rootCallId?: string;
	[key: string]: unknown;
}

/** The tools/pre-execute waterfall's exec view (the advisory bash
 *  intercept): the tool name and the command text, narrowed structurally. */
export interface PreExecuteEvent {
	name?: string;
	tool?: string;
	args?: Record<string, unknown>;
	agent?: { id?: string; session?: unknown };
	[key: string]: unknown;
}

/** The tools/pre-execute decision the downstream pipeline expects; the
 *  intercept is ADVISORY in v1: it always passes the downstream decision
 *  through unchanged (never denies). */
export interface PreExecuteDecision {
	kind?: "allow" | "deny" | string;
	[key: string]: unknown;
}

/** The agent/pre-step payload (the turn boundary - the deadline scan and
 *  the settle fold): the messages, narrowed structurally. */
export interface PreStepEvent {
	agent?: { id?: string };
	messages?: { source?: { kind?: string } }[];
	[key: string]: unknown;
}

/** The jobs hub's start specification (the background-branch handle; the
 *  live containers' G2 wrapper precedent). The batch tool only ever starts
 *  `batch-edit-continue` jobs. */
export interface JobStartSpec {
	kind: string;
	label: string;
	owner?: string | undefined;
	run: () => Promise<{ status: string; detail: string }>;
	[key: string]: unknown;
}

/** The jobs hub seam, probed at use time (the optional-service rule): an
 *  absent hub is a graceful degradation to the halted state. */
export interface JobsHub {
	start(Specification: JobStartSpec): string;
	[key: string]: unknown;
}
