import type { Context } from "@deepseek-ai/cordis";
import type { FsObservation, FsStat, FsTarget, FsVersion, FsWriteOutcome } from "./Fs.js";
/** The subset of the factory's shared per-apply State the batch tool needs:
 *  Context (fs/logger/emit), Module (the ledger prefix), Ledger, Stash (the
 *  idempotence gate), Seams. A module's own state extends this shape. */
export interface FactoryState {
    Context: Context;
    Module: string;
    Ledger: string;
    Stash: Map<string, FsVersion>;
    Seams: Map<string, unknown>;
    [key: string]: unknown;
}
/** The State builder's setup object (the factory's Interface/Options). */
export interface FactorySetup {
    module: string;
    fields?: Record<string, string>;
}
/** The write executor's option bundle (the factory's Function/Write Over):
 *  the batch tool uses an explicit `replaceIfVersion` intent (waterfall
 *  skipped), the standing sandbox posture, the WRAPPED actor (govern marker),
 *  the Stash pre-registration and the root fs/observed emit. */
export interface FactoryWriteOver {
    intent?: {
        kind: "replaceIfVersion";
        version: FsVersion;
    } | {
        waterfall: true;
    };
    signal?: AbortSignal | undefined;
    policy?: "standing" | "p4" | unknown;
    actor?: object | undefined;
    observe?: boolean;
    stash?: boolean;
    transform?: (content: string) => string;
}
/** The direct-govern step shape a governance module registers (unused by the
 *  batch tool itself - it CALLS Govern, it registers no steps). */
export interface FactoryGovernStep {
    name: string;
    run: (Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
}
/** The factory service contract, as the batch edit tool consumes it. */
export default interface FactoryService {
    /** The ledger: logger + appendFileSync, never throws. */
    Append(State: FactoryState, Message: string): void;
    /** The State builder: cell unwrap + shared fields + module extras. */
    State<Extra extends object = Record<string, unknown>>(Context: Context, Config: unknown, Setup: FactorySetup): FactoryState & Extra;
    /** The fs/observed registration on the ROOT context (the module supplies
     *  its own synchronous observer). */
    Wire(Context: Context, State: FactoryState, Observe: (Target: FsTarget, Observation: FsObservation, Actor: object | undefined) => void): void;
    /** The ONE shared write executor: intent/policy/observe/stash/transform. */
    Write(State: FactoryState, Target: FsTarget, Content: string, Over?: FactoryWriteOver): Promise<FsWriteOutcome>;
    /** The direct-govern entry: run the registered steps for the target's
     *  basename (selection true = all), sequential fold, never throws. */
    Govern(Target: FsTarget, Selection: boolean | string | string[], Actor: object | undefined, Version: FsVersion): Promise<void>;
    /** Register a direct-govern step for one basename (the modules call this
     *  at apply; the batch tool registers none but the type stays honest). */
    RegisterGovern(Basename: string, Name: string, Run: FactoryGovernStep["run"]): void;
}
/** The stat/read seam of the loading context's fs backend (subsystems/
 *  filesystem.md): the machine stats before writing (the fresh-version
 *  guard) and reads the held content through readText. */
export interface FactoryFs {
    stat(Target: FsTarget, Signal?: AbortSignal): Promise<FsStat | null>;
    readText(Target: FsTarget, Signal?: AbortSignal): Promise<string>;
    resolve(Path: string, Options?: {
        signal?: AbortSignal;
    }): Promise<FsTarget>;
    [key: string]: unknown;
}
