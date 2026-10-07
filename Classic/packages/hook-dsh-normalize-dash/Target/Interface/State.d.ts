import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
export default interface State extends Shared {
    /** The dash replacement — the transform's only knob (config `replacement`). */
    Replacement: string;
    /** Normalize reasoning deltas and the assembled reasoning block too. */
    Reasoning: boolean;
    /** Normalize tool-call arguments too (config `normalizeToolArguments`;
     *  schema default OFF — this profile's patch yml enables it). */
    ToolArgs: boolean;
    /** The injected @playform/plugin-dsh-factory service — the ledger
     *  (Factory.Append) is consumed through it; assigned once in
     *  Function/Apply. */
    Factory: Factory;
}
