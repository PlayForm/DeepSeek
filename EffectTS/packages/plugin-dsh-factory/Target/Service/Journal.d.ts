import { Context, Effect, Layer } from "effect";
import type State from "../Interface/State.js";
export declare const EVENTS: readonly ["activated", "governed", "dispatched", "update-failed", "excluded", "normalized"];
export declare const DOMAIN: {
    readonly name: "package_governance";
    readonly version: 2;
    readonly layout: "per-record";
    readonly compatibleVersions: readonly [1];
    readonly invalidRecords: "backup-and-skip";
};
export interface Host {
    SharedJournal?: (Event: string, Path: string, Detail: string, At?: number) => void;
    PendingJournal?: {
        event: string;
        path: string;
        detail: string;
        at: number;
    }[] | undefined;
}
declare const Journal_base: Context.ServiceClass<Journal, "dsh.factory.Journal", {
    /** The P5 storage writer (best-effort): one typed lifecycle record,
     *  routed through the three stages above, never failing. */
    record(State: State, Event: string, Path: string, Detail: string, At?: number): Effect.Effect<void>;
}>;
export declare class Journal extends Journal_base {
}
export declare const layer: (Factory: Host) => Layer.Layer<Journal>;
export {};
