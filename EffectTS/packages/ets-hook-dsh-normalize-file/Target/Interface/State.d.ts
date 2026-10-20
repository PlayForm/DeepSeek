import type { Scopes } from "./Config.js";
import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";
import type { Scope } from "effect";
export default interface State extends Shared {
    /** The dash replacement - the transform's only knob (config `replacement`). */
    Replacement: string;
    /** The granular scope gates (config `scopes`, volatile - refreshed in
     *  place by the factory's P10 volatile-update listener; only `files` is
     *  consumed by this flavor). */
    Scopes?: Scopes | undefined;
    /** The tool-results exemption list (config `toolResultsExempt`,
     *  volatile - same refresh path). */
    Exempt?: string[] | undefined;
    /** The one-shot step-batch overpass arm (set by the
     *  `normalize-overpass batch` command, consumed and cleared by the next
     *  incoming batch regardless of the `scopes.batch` value - Function/
     *  StepBatch). */
    Overpass?: boolean | undefined;
    /** The injected @playform/ets-plugin-dsh-factory service - the ledger
     *  (Factory.Append), the P5 journal (Factory.Journal) and the ONE shared
     *  write executor (Factory.Write) are consumed through it; assigned once in
     *  Function/Apply. */
    Factory: Factory;
    /** THE EFFECT DELTA (R6): the plugin's long-lived Effect `Scope` - the
     *  family's uniform fiber home, created in Function/Apply. Unused at
     *  runtime (the normalizer has no typed-effect stage); optional so States
     *  built outside apply stay valid. */
    Scope?: Scope.Closeable | undefined;
}
