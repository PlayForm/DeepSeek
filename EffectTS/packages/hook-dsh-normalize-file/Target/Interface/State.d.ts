import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
import type { Scope } from "effect";
export default interface State extends Shared {
    /** The dash replacement - the transform's only knob (config `replacement`). */
    Replacement: string;
    /** The injected @playform/plugin-dsh-factory service - the ledger
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
