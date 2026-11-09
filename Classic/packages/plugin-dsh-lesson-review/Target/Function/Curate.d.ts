/**
 * @module Curate
 *
 * The deterministic lifecycle pass: the ALWAYS-ON half of the Hermes curator, with the LLM consolidation pass left opt-in and out of this module.
 *
 * @remarks
 * It runs on the usage store alone and costs no tokens, which is why it is
 * the default posture: a corpus that only ever grows is a corpus nobody
 * loads, and pruning it needs no model's opinion.
 *
 * THE FOUR PROTECTIONS, each one a lesson from the original:
 *
 * 1. PINNED entries never move (the user said so).
 * 2. ONLY `createdBy: "agent"` entries move. A hand-written skill, a
 *    foreground lesson, and a record that predates the flag are all
 *    permanently out of the lifecycle's jurisdiction - telemetry cannot
 *    establish authorship, so the policy flag decides, not a heuristic.
 * 3. ZERO-USE entries get a grace floor: never archived before they are
 *    `neverUsedGraceDays` old. Zero uses is absence of evidence, not proof
 *    the skill is disposable.
 * 4. ARCHIVE, never delete. The move is a rename into `.archive/`, which is
 *    its own undo (`Restore`).
 *
 * The inactivity clock is `lastUsedAt`, falling back to `createdAt` for a
 * record that has never been used - so an entry cannot be immortal by being
 * ignored.
 */
import type Configuration from "@Interface/Config.js";
import type Entry from "@Interface/Entry.js";
/**
 * What one pass moved.
 */
export interface Curation {
    /**
     * Entries that went `active -> stale`.
     */
    stale: string[];
    /**
     * Entries that were archived (a rename into the archive root).
     */
    archived: string[];
}
/**
 * The idle age of one entry, in days.
 */
export declare const Idle: (Entry_: Entry, Now: number) => number;
export default _default;
declare function _default(Entries: readonly Entry[], Knobs: Configuration, Now: number): Curation;
