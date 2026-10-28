import type { Log } from "./Render.js";
import type { CheckSetSpecification, MonitorEntry } from "../Interface/Events.js";
import type State from "../Interface/State.js";
/** The structural fs/observed types (the factory's Wire signature, verified
 * against @deepseek-ai/dsh-fs; kept minimal - only the fields this module
 * reads). */
export type FsTarget = {
    displayPath?: unknown;
    targetKey?: unknown;
} | undefined;
export type FSObservation = {
    kind?: unknown;
    version?: unknown;
} | undefined;
/** The checkpoint phases: "event" runs the debounce dispatch and the
 * deadline scan; "assemble" adds the slow schedule and the retirement scan. */
export type Phase = "event" | "assemble";
/** Enroll (or refresh) one file in an agent's monitor set. Returns the entry. */
export declare const Enroll: (State: State, AgentID: string, Path: string, PathKey: string, Writer: string, Sets: string[], Version: string, Append: Log) => MonitorEntry;
/** L11 - the fs/observed observer (registered through the factory's Wire on
 * the ROOT context, so every write the harness emits is heard). Pure
 * observer, fail-open, NEVER throws into the dispatch. */
export declare const OnObserved: (State: State, Target: FsTarget, Observation: FSObservation, Actor: object | undefined, Append: Log) => void;
/** Dispatch one check job through the SHIPPED G2 wrapper (the R3 brief
 * point 6's "one wrapper, two callers" is literal - NO second execution
 * path). Returns the job id, or undefined when the start failed (the
 * fail-open envelope: the pending record stays dropped, the band keeps its
 * last-known result and renders STALE at the next request). The dispatch
 * RESERVES one admission slot for the in-flight start (the async gap would
 * otherwise let every pending set pass the admission check at once). */
export declare const Dispatch: (State: State, AgentID: string, Entry: MonitorEntry, SetID: string, Specification: CheckSetSpecification, Append: Log) => Promise<string | undefined>;
/** The checkpoint scan (called at every checkpoint, fail-open): the deadline
 * scan at every phase; the debounce dispatch at every phase; the slow
 * schedule and the retirement scan at the assemble phase only. */
export declare const Scan: (State: State, Append: Log, Phase: Phase) => void;
/** The L6 settle fold (runs BEFORE Board.OnSettled - the monitors claim
 * their jobs first). Only the plugin's own registry is folded; the record
 * is deleted after the fold. */
export declare const OnSettled: (State: State, Event: unknown, Append: Log) => void;
/** The standing-section contribution for one agent: ONE part - the whole
 * monitors stanza (header + summary band first + the band frames, the
 * overflow collapsed lines and the retirement closing lines). Returns []
 * when nothing renders (the section body is then byte-identical with the
 * wave-2 behavior). */
export declare const SectionParts: (State: State, AgentID: string, Separator: string, Append: Log) => string[];
