import type { FsObservation, FsTarget } from "@Interface/Fs.js";
import type { MachineRecord, OpLine, ProcessCell, SearchSpec } from "@Interface/Process.js";
import type State from "@Interface/State.js";
/** The agent id of an exec (the planted-board keying; "(unowned)" is the
 *  module-global fallback the counters use). */
export declare const AgentOf: (Exec: unknown) => string;
/** The (possibly created) per-agent machine map. */
export declare const ScopeOf: (State: State, Agent: string) => Map<string, MachineRecord>;
/** Every machine in the registry (the observer scans all agents - the
 *  fs/observed event carries no agent id). */
export declare const AllMachines: (State: State) => MachineRecord[];
/** Parse the named searches: `name=pattern` (literal) or
 *  `name=re:/pattern/flags` (a simple regex, the v1 scope). */
export declare const ParseSearches: (Entries: string[] | undefined) => Map<string, SearchSpec>;
/** Parse one op line of the transition table: the machine grammar
 *  `file=<selector> search=<name> op=<MODE> [with=<text>] [mode=first|all|<count>]`.
 *  `with` takes the REST of the line (the replacement may contain spaces). */
export declare const ParseOp: (Line: string) => OpLine;
/** Parse the whole transition table with the configured cap. */
export declare const ParseOps: (Lines: string[] | undefined, Cap: number) => OpLine[];
/** Expand one pattern: an exact path returns itself (checked by the caller's
 *  resolve); a glob walks from its base directory. */
export declare const ExpandGlob: (Pattern: string) => string[];
/** Resolve the file list into held process cells: an exact path resolves
 *  through the fs backend's stat (the version read); a glob expands first.
 *  Misses are LISTED, never guessed. Returns the cells and the misses. */
export declare const Hold: (State: State, Patterns: string[] | undefined, Signal: AbortSignal | undefined) => Promise<{
    cells: ProcessCell[];
    misses: string[];
}>;
/** Add already-held cells to a machine, deduplicating on path, and log the
 *  contract insertion lines. */
export declare const Adopt: (Machine: MachineRecord, Cells: ProcessCell[]) => void;
/** Open a machine: build the record from the agent's prepared schema,
 *  validate fail-loud, adopt the cells, log the contract lines. */
export declare const Open: (_State: State, ID: string, Scope: string, Searches: Map<string, SearchSpec>, Ops: OpLine[], MachinePersistent: boolean, Cells: ProcessCell[], Misses: string[], Append: (Message: string) => void) => MachineRecord;
/** Insert into an open machine mid-life (the lease stays). */
export declare const Insert: (Machine: MachineRecord, Cells: ProcessCell[], Misses: string[], Append: (Message: string) => void) => void;
/** Drop files from an open machine. */
export declare const Remove: (Machine: MachineRecord, Paths: string[], Append: (Message: string) => void) => void;
/** Close a machine: settle-first - running cells halt with the interrupted
 *  reason (nothing silently dropped), the machine is marked closed. */
export declare const Close: (Machine: MachineRecord, Append: (Message: string) => void) => void;
/** The fs/observed observer (registered through the factory's Wire on the
 *  ROOT context): SYNCHRONOUS, side-effect-only. An external touch of a held
 *  file whose version moved flips the cell to halted("stale") and logs the
 *  contract line; our own writes (the `govern` actor marker) and our own
 *  Stash idempotence re-emits are skipped. */
export declare const OnObserved: (State: State, Target: FsTarget, Observation: FsObservation, Actor: object | undefined, Append: (Message: string) => void) => void;
/** A new machine id (`mach-<n>`; deterministic counter, never a clock). */
export declare const NextID: (State: State) => string;
