/**
 * @module Capture
 *
 * The synchronous event recorder (Documentation/Plans/COST-TRACK-PLUGIN.md
 * section 1): the session/event listener's only duty.
 *
 * @remarks
 * Push stores one event in its session's queue when the capture gates allow
 * (capture.sessions for every session; capture.subagents additionally
 * required once the session's origin is known to be "subagent", learned
 * from the session header record or the session subject) and never throws,
 * never awaits and never touches I/O. The queue is acknowledged only AFTER
 * the flush commits (E1, A2 section 1.3): Peek returns a session's pending
 * batch without removing it, Acknowledge removes exactly the acknowledged
 * prefix, and Take - the whole-batch form the backfill walk still uses -
 * stays beside them. Size reports the queued count, and the per-session
 * bound keeps a queue whose drain keeps failing from growing without limit.
 */
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Config: Config): {
    Push(Session: unknown, Event: unknown): void;
    Take(SessionId: string): readonly unknown[];
    Peek(SessionId: string): readonly unknown[];
    Acknowledge(SessionId: string, Count: number): number;
    Size(): number;
};
