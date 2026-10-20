import type { Log } from "@Function/Render.js";
import type { BoardState, JobEvent } from "@Interface/Events.js";
import type State from "@Interface/State.js";
/** The boards of one agent. */
export declare const For: (Agent: State, AgentID: string) => Map<string, BoardState>;
/** Open one board (the live_plant path). The ledger order: plant opened
 * first, then the enrollments (I5: enrollment opens the lease entries). */
export declare const Open: (Agent: State, AgentID: string, ID: string, PlantType: BoardState["plantType"], Expect: number, MemberIDs: string[] | undefined, Template: string | undefined, Append: Log) => BoardState;
/** Enroll one member with the FULL lease window (I5 5.3: a late enrollee
 * gets the full window; the board's open time does not eat the grace). */
export declare const Enroll: (Agent: State, Board: BoardState, AgentID: string, Append: Log) => boolean;
/** Fold one explicit report (the L7 pickup; the grammar is checked by the
 * caller): `[live-report] <plantId> <agentId> <status> <payload>`. Idempotent
 * per (plantId, agentId, turn): a second report resets the same lease entry
 * and shows the newest payload (I5 5.1); the coalescing window (I5 6.1)
 * allows one lease reset per reportRateMs. */
export declare const Report: (Agent: State, Board: BoardState, AgentID: string, Status: string, Payload: string, Append: Log) => void;
/** The L6 settle hook: a child job's settlement flips the member's row (the
 * board truth source, carriers 1-2). Jobs owned by member sessions only. */
export declare const OnSettled: (Agent: State, Event: JobEvent, Append: Log) => void;
/** The parent-turn hook (the lease decrement, I5 2.2): one assemble pass = one
 * parent turn. A member whose last report predates the PREVIOUS assemble pass
 * had no foldable report in the last turn window and decrements; any report
 * folded since resets to the full window. The declaration renders in the SAME
 * assembly's frame (the decrement runs before render). */
export declare const OnTurn: (Agent: State, AgentID: string, Append: Log) => void;
/** The stale declaration row (I5 3.1, byte-exact). */
export declare const StaleRow: (AgentID: string, Turns: number) => string;
/** The failsafe hook (I5 4.1): the declaration IS the trigger - on prune,
 * drop the member from the expect count (only after the stale row rendered
 * at least one assembly, I5 4.2). The prune is the lease's only automatic
 * modification and counts against failsafesPerTurn (I5 4.3). */
export declare const FailsafeStall: (Agent: State, AgentID: string, Append: Log) => void;
/** The agent-board frame (D2 4.4 + I5, byte-exact). */
export declare const Frame: (Agent: State, Board: BoardState, Separator: string) => string;
/** The closing line (I5 7.2, byte-exact variants). */
export declare const ClosingLine: (Board: BoardState, Seconds: number) => string;
/** The standing-section contribution for one agent, as SEPARATE frames (the
 * collapse pass needs per-frame granularity). Returns [] when nothing renders. */
export declare const SectionParts: (Agent: State, AgentID: string, Separator: string, Append: Log) => string[];
/** The standing-section contribution for one agent (the wave-2 body): the
 * header caveat + fleet line, the live-job frames, the board frames. Returns
 * "" when nothing renders (the phase-1 section is then byte-identical). */
export declare const SectionBody: (Agent: State, AgentID: string, Separator: string, Append: Log) => string;
/** The deadline scan: the live-timeout kill (J7) and the hang failsafe (F1).
 * Called at every assemble pass and on every jobs event - the checkpoint
 * design (no real timers; the next event is the bound). */
export declare const ScanDeadlines: (Agent: State, Append: Log) => void;
