/** One resolved shell execution spec (the ctx.shell.resolve product). */
export interface ShellSpecification {
    command: string;
    workdir?: string | undefined;
    timeoutMs?: number | undefined;
    dshEnv?: unknown;
    sandboxPolicy?: {
        mode: string;
    } | undefined;
    onExpiry?: "none" | "kill" | undefined;
    signal?: AbortSignal | undefined;
}
/** One non-consuming stream reader over a process's captured output. */
export interface StreamReader {
    readFrom(fromByte: number): {
        text: string;
        nextOffset: number;
        lossy: boolean;
        spillPath?: string;
    };
}
/** One settled or running process handle (the ctx.shell.execute product). */
export interface ShellProcess {
    status: "running" | "completed" | "killed";
    exitCode: number | null;
    signal: string | null;
    observed: {
        stdout: StreamReader;
        stderr: StreamReader;
    };
    done: Promise<{
        exitCode: number | null;
        signal: string | null;
    }>;
    kill(): boolean;
    result(): Promise<ShellResult>;
}
/** The foreground result projection of one finished shell run. */
export interface ShellResult {
    exitCode: number | null;
    signal: string | null;
    timedOut?: boolean | undefined;
    aborted?: boolean | undefined;
    timeoutMs?: number | undefined;
    stdout: {
        text: string;
        truncated: boolean;
        spillPath?: string;
    };
    stderr: {
        text: string;
        truncated: boolean;
        spillPath?: string;
    };
}
/** One shell execution handle (the awaited ctx.shell.execute product). */
export interface ShellExecution extends ShellProcess {
}
/** The shell capability seam (verified against dsh-shell/dsh-bash-local). */
export interface Shell {
    resolve(request: Partial<ShellSpecification>): ShellSpecification;
    execute(spec: ShellSpecification): Promise<ShellExecution>;
    sandboxMode?: string;
}
/** The trusted-environment collector (verified against dsh-tool-bash usage). */
export interface ShellEnv {
    collect(exec: {
        agent?: unknown;
        signal?: AbortSignal;
    }): unknown;
}
/** The working-directory seam (verified against dsh-tool-bash usage). */
export interface WorkingDirectory {
    ensure(agent: unknown, signal?: AbortSignal): Promise<string | undefined>;
}
/** One job output pull source (verified against dsh-jobs-local startPump). */
export interface JobSource {
    channel: "stdout" | "stderr";
    read(fromByte: number): {
        text: string;
        nextOffset: number;
        lossy: boolean;
        spillPath?: string;
    };
}
/** The producer-facing job spec (verified against dsh-jobs-local start()). */
export interface JobSpecification {
    kind: string;
    label: string;
    toolCall?: {
        callId: string;
        rootCallId: string;
    } | undefined;
    owner?: string | undefined;
    outputLimitBytes?: number | undefined;
    output?: JobSource[] | undefined;
    run(handle: {
        append(text: string, options?: unknown): void;
        updateProgress(line: string): void;
    }): {
        done: Promise<{
            status: "completed" | "killed" | "failed";
            detail?: string;
        }>;
        cancel(reason?: string): void;
    };
}
/** The read-only job projection (verified against dsh-jobs-local view()). */
export interface JobView {
    id: string;
    kind: string;
    label: string;
    owner?: string | undefined;
    outputLimitBytes?: number | undefined;
    status: "running" | "stopping" | "completed" | "killed" | "failed";
    progress?: string | undefined;
    detail?: string | undefined;
    startedAt: number;
    finishedAt?: number | undefined;
    output: {
        total: number;
        earliest: number;
        spillPaths?: string[];
    };
}
/** One jobs registry event (verified against dsh-jobs-local emit sites). */
export type JobEvent = {
    type: "registered" | "stopping" | "progress";
    job: JobView;
} | {
    type: "settled";
    job: JobView;
    cause: "producer" | "kill" | "teardown";
    awaited: boolean;
} | {
    type: "output";
    id: string;
    owner?: string | undefined;
    total: number;
};
/** The jobs capability seam (verified against dsh-jobs-local). */
export interface JobsRegistry {
    start(spec: JobSpecification): string;
    list(caller?: string): JobView[];
    get(id: string, caller?: string): JobView;
    read(id: string, caller?: string): {
        chunks: {
            channel: string;
            text: string;
            offset: number;
        }[];
        lossy: boolean;
    };
    readAt(id: string, from: number, caller?: string): {
        text: string;
        nextOffset: number;
        lossy: boolean;
    };
    kill(id: string, caller: string | undefined, reason?: string): string;
    wait(id: string, timeoutMs: number, caller?: string, signal?: AbortSignal): Promise<JobView>;
    remove(id: string, caller?: string): void;
    attachController(name: string): unknown;
    events: {
        subscribe(filter: {
            owner?: string;
        } | {
            owners: "all" | "scope";
        }, listener: (event: JobEvent) => void): unknown;
    };
}
/** One inbox splice record (verified against dsh-agent-loop's splice event). */
export interface InboxSplice {
    target: string;
    start: number;
    removedCount?: number;
    inserted: {
        source?: {
            kind?: string;
        };
        content?: {
            type?: string;
            text?: string;
        }[];
    }[];
    outcome?: unknown;
}
/** One session log event (the dsh-session `session/event` bus payload). */
export interface SessionEvent {
    seq: number;
    type: string;
    data: unknown;
    sourceEventSeqs?: number[];
}
/** The subagent activation request (verified against dsh-subagent). */
export interface ActivationRequest {
    parent: {
        id: string;
    };
    prompt: string;
    maxDepth?: number;
    agentOptions?: Record<string, unknown>;
    agentPreset?: string;
    outputSchema?: Record<string, unknown>;
    cwd?: string;
}
/** The subagent capability seam (verified against dsh-subagent README). */
export interface Subagent {
    startActivation(spec: {
        provider: string;
        label: string;
        request: ActivationRequest;
        signal?: AbortSignal;
        delivery: "parent" | "caller";
    }): {
        childId: string;
        messageId?: string;
        result: Promise<{
            output?: unknown;
            stopReason?: string;
        }>;
        dispose(): Promise<void>;
    };
}
/** The agents registry seam (verified against dsh-agent + dsh-tool-jobs). */
export interface AgentsRegistry {
    get(id: string): {
        id: string;
        status?: string;
    } | undefined;
}
/** The bounded private tail of one detached job (the Jobs.JobTail shape). */
export interface TailBuffer {
    Stdout: string;
    Stderr: string;
    Append(channel: "stdout" | "stderr", text: string): void;
    Render(): string;
}
/** One detached command's per-agent record (the completion + fleet source). */
export interface DetachRecord {
    /** The registry job id (`bash-<16 hex>`). */
    jobId: string;
    /** The owning agent's session id. */
    agentId: string;
    /** The tool that was transformed (always a command runner). */
    tool: string;
    /** The command's head bytes (single-line, first 80 bytes for the marker). */
    cmdHead: string;
    /** The command's first 120 bytes for the standing frame's cmd line. */
    cmdLine: string;
    /** The dedup key this job was started under. */
    dedupKey: string;
    /** The clock ms at detach. */
    startedAt: number;
    /** The live-timeout deadline in clock ms. */
    deadlineAt: number;
    /** The captured private tail (the completion frame's output source). */
    tail: TailBuffer;
    /** The settled facts once the L6 subscription observed them. */
    status?: "completed" | "killed" | "failed" | undefined;
    detail?: string | undefined;
    cause?: "producer" | "kill" | "teardown" | undefined;
    awaited?: boolean | undefined;
    /** The clock ms of the settlement observation (the elapsed calculation). */
    settledAt?: number | undefined;
    /** Whether the completion frame was already rendered (withdrawn after). */
    completedRendered?: boolean | undefined;
}
/** The per-exec tag the pre-execute arm leaves for the execute arm. */
export interface TagRecord {
    jobId: string;
    agentId: string;
    tool: string;
    cwd: string | undefined;
    timeoutMs: number;
    /** Whether the tag is a dedup hit (the already-running line, not a fresh marker). */
    dedup: boolean;
    /** The command the tag carries (the marker's cmd-head source). */
    command: string;
    /** The retry-loop counter at tag time (the extension's attempt number). */
    attempt: number;
}
/** The per-agent pending-completion slot (the I3/I4 dynamic-context carrier). */
export interface CompletionSlot {
    /** The undelivered frames, in settle order (failures sort first at render). */
    frames: DetachRecord[];
    /** The last delivered text - the provider's stable tail between batches. */
    delivered: string;
    /** Whether the batch was ever rendered (the ledger guard). */
    rendered: boolean;
    /** The turn-set denominator for the k/n hint (jobs detached since the last delivery). */
    turnSet: number;
}
/** One planted board's lease entry, per member (the I5 design). */
export interface LeaseEntry {
    /** The member's full window in parent turns (plant.leaseTurns at enroll). */
    turnWindow: number;
    /** Remaining parent turns of silence before expiry. */
    remaining: number;
    /** Whether the stale row has been declared (emitted once). */
    declared: boolean;
    /** The parent turn of the declaration (the prune's one-assembly gate). */
    declaredTurn: number;
    /** The clock ms of the last foldable report. */
    lastReportAt: number;
    /** Whether the member-stalled ledger line has been emitted (once per member). */
    stalledLedged: boolean;
}
/** One planted board member's row state. */
export interface BoardMember {
    agentId: string;
    status: "running" | "stalled" | "stale" | "done" | "failed";
    /** The latest report payload, capped (the row's text). */
    lastReport: string;
    lastReportAt: number | undefined;
    /** The settled summary (first line of the answer, capped). */
    summary: string | undefined;
    /** When the member's child job settled, in clock ms. */
    settledAt: number | undefined;
}
/** One planted board (the I5 lease + the D2 3.4 design). */
export interface BoardState {
    id: string;
    agentId: string;
    plantType: "agent-board" | "todo-fill" | "aggregate" | "custom" | "monitors";
    /** The template for the "custom" type (the rendered body). */
    template: string | undefined;
    expect: number;
    /** The member slots; length <= expect; overflow members are counted only. */
    members: BoardMember[];
    overflow: {
        agentId: string;
        summary: string;
    }[];
    /** The board's item slots: todo-fill numbers its items; the monitors
     * board's items are the monitored files (label = the path, state = the
     * outcome text - the todo-fill precedent widened for the wave-3 board). */
    items: {
        label: string;
        state: string;
        by: string | undefined;
        at: number | undefined;
    }[];
    /** The lease: reporters + windows (the I5 2.1 record). */
    lease: {
        reporters: Map<string, LeaseEntry>;
        state: "open" | "stale" | "closed";
    };
    openedAt: number;
    /** The clock ms after which empty slots drop and the board closes. */
    closeAt: number;
    closedAt: number | undefined;
    /** Whether the closing line rendered (withdraw after one request). */
    closeRendered: boolean;
    /** Whether the lost declaration rendered (restart honesty). */
    lostRendered: boolean;
    /** The suggested-state marker (the I6 5.5 dormant form). */
    suggested: string | undefined;
    /** The configured suggestion this board instantiates (the accept path). */
    suggestionId: string | undefined;
    /** The prune-failsafe's effect: members dropped from the expect count. */
    pruned: number;
    /** The clock ms of the previous assemble pass (the lease's turn gate). */
    lastTurnAt: number | undefined;
}
/** One stored suggestion (the I6 configured-block design). */
export interface Suggestion {
    id: string;
    agentId: string;
    templateId: string;
    fit: "yes" | "no" | "unknown";
    rationale: string;
    /** The clamped tokens (the stored configuration verbatim at accept). */
    tokens: {
        expectAgents?: number;
        steps?: string[];
    };
    createdTurn: number;
    /** Rendered once, then withdrawn (the one-assembly window). */
    renderedTurn: number | undefined;
    withdrawn: boolean;
    /** Whether the dormant block was planted (autoPlant). */
    planted: boolean;
}
/** The per-agent suggester bookkeeping (the rate bound + the one-per-turn gate). */
export interface SuggesterState {
    /** The clock ms of the qualifying turns that spawned a suggestion. */
    ticks: number[];
    /** The turn of the last spawned suggestion (the debounce). */
    lastTurn: number;
}
/** One check-set specification (the config `checksets` dict's values; design
 * section 3.2). A set with a `command` is executable; a set with a `link` is
 * a linked governance set - it renders the linked form and is never re-run. */
export interface CheckSetSpecification {
    /** The catalog glob this set applies to (the explicit-enrollment classification). */
    glob?: string;
    /** The command template (`{{path}}`, `{{basename}}`, `{{dir}}`); template
     * replace only, no eval. Absent for linked sets. */
    command?: string;
    /** A linked set renders the linked form and never re-runs (the R3 3.2 rule:
     * the governor/pinner's own verbs are not duplicated). */
    link?: "none" | "governance";
    /** Fast sets schedule per-edit with the debounce; slow sets never auto-run per-edit. */
    fast?: boolean;
    /** The slow schedule interval in ms (0 = never scheduled). */
    intervalMs?: number;
    /** The set's own deadline cap (<= the inline deadline; default from config). */
    timeoutMs?: number;
}
/** One watchlist entry (config `watchlist[]`; design section 3.2). */
export interface WatchlistEntry {
    glob: string;
    checks: string[];
}
/** One persisted monitor record (the storage domain's `checks` table row;
 * design section 1). */
export interface MonitorRecord {
    event: "monitor-enrolled" | "monitor-check" | "monitor-retired";
    path: string;
    agent: string;
    /** The raw fs/observed version token, verbatim. */
    version: string;
    /** The writer agent id ("-" when absent). */
    writer: string;
    /** "" for the enrolled/retired records. */
    checkSetId: string;
    /** The clock ms. */
    ranAt: number;
    /** null = no exit (infra/killed/denied/linked). */
    exit: number | null;
    /** "killed:<reason>" | "sandbox" | "producer:<detail>" | "linked" | null. */
    infra: string | null;
    /** The bounded tail (<= 2 KiB), embedded. */
    tail: string;
    provenance: "live" | "recovered";
}
/** One check result (design section 3.5). */
export interface CheckResult {
    setId: string;
    /** The registry id (the job_output hint). */
    jobId: string;
    /** The settle observation (clock ms). */
    ranAt: number;
    /** The version at dispatch (the raw fs/observed token, verbatim). */
    checkedVersion: string;
    /** The writer of the checked version. */
    writer: string;
    exit: number | null;
    infra: string | null;
    /** The bounded head-tail (<= 2 KiB). */
    tail: string;
    provenance: "live" | "recovered";
}
/** One enrolled file's monitor state (design section 3.5). Staleness is
 * DERIVED at render time - never stored. */
export interface MonitorEntry {
    /** The displayPath (the band label). */
    path: string;
    /** The targetKey (the state key). */
    pathKey: string;
    /** The owning session (agent id). */
    agentId: string;
    enrolledAt: number;
    /** The latest observed version token (verbatim). */
    lastVersion?: string | undefined;
    /** The latest observed writer ("-" when absent). */
    lastWriter?: string | undefined;
    /** The latest fs/observed touch. */
    lastObservedAt?: number | undefined;
    /** The pending debounce records, per checkSetId (never rendered). */
    pending: Map<string, {
        since: number;
    }>;
    /** The entry's check sets, fixed at enrollment (in enrollment order). */
    sets: string[];
    /** One result per check set, newest wins, in first-seen order. */
    checks: CheckResult[];
    /** Whether the retirement closing line has been marked (rendered once, then withdrawn). */
    closingRendered?: boolean | undefined;
}
/** One live monitor job's record (State.MonitorJobs; design section 2). The
 * settle fold, the board skip guard and the deadline scan read it. */
export interface MonitorJobRecord {
    agentId: string;
    path: string;
    pathKey: string;
    setId: string;
    /** The clock ms at dispatch (the deadline scan's start). */
    startedAt: number;
    /** The version the check runs against (captured at dispatch). */
    checkedVersion: string;
    /** The writer of the checked version (captured at dispatch). */
    writer: string;
    /** The private head-keep tail (the problem band's render source). */
    tail: TailBuffer;
}
