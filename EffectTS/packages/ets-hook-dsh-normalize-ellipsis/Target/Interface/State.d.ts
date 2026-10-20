import type { Scopes } from "./Config.js";
import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";
import type { Scope } from "effect";
export default interface State extends Shared {
    /** The ellipsis replacement - the transform's only knob (config `replacement`). */
    Replacement: string;
    /** Normalize reasoning deltas and the assembled reasoning block too. */
    Reasoning: boolean;
    /** Normalize tool-call arguments too (config `normalizeToolArguments`;
     *  schema default OFF - this profile's patch yml enables it). */
    ToolArgs: boolean;
    /** The granular scope gates (config `scopes`, volatile - refreshed in
     *  place by the factory's P10 volatile-update listener). */
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
     *  (Factory.Append) is consumed through it; assigned once in
     *  Function/Apply. */
    Factory: Factory;
    /** THE EFFECT DELTA (R7a): the plugin's long-lived Effect `Scope` - the
     *  family's uniform fiber home, created in Function/Apply. Unused at
     *  runtime (the Stream pipeline runs with no services and no scope);
     *  optional so sim States built outside apply stay valid. */
    Scope?: Scope.Closeable | undefined;
}
