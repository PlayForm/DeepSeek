import type { State as Shared } from "@playform/plugin-dsh-factory";
import type { Scope } from "effect";
export default interface State extends Shared {
    /** Dependency sections the pinner may rewrite (config `sections`). */
    Section: string[];
    /** THE EFFECT DELTA (R4): the plugin's long-lived Effect `Scope` — the
     *  family's uniform fiber home, created in Function/Apply. Unused at
     *  runtime (the pinner has no typed-effect stage); optional so sim States
     *  built outside apply stay valid. */
    Scope?: Scope.Closeable | undefined;
}
