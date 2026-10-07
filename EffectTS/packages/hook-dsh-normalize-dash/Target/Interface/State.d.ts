import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
import type { Scope } from "effect";
export default interface State extends Shared {
    /** The dash replacement - the transform's only knob (config `replacement`). */
    Replacement: string;
    /** Normalize reasoning deltas and the assembled reasoning block too. */
    Reasoning: boolean;
    /** Normalize tool-call arguments too (config `normalizeToolArguments`;
     *  schema default OFF - this profile's patch yml enables it). */
    ToolArgs: boolean;
    /** The injected @playform/plugin-dsh-factory service - the ledger
     *  (Factory.Append) and the raw-write tool's Write/Govern are consumed
     *  through it; assigned once in Function/Apply. */
    Factory: Factory;
    /** THE EFFECT DELTA (R7c): the plugin's long-lived Effect `Scope` - the
     *  family's uniform fiber home, created in Function/Apply. Unused at
     *  runtime (the Stream pipeline runs with no services and no scope);
     *  optional so sim States built outside apply stay valid. */
    Scope?: Scope.Closeable | undefined;
}
