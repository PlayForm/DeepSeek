import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
import type { Scopes } from "../Interface/Config.js";
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
    /** The injected @playform/plugin-dsh-factory service - the ledger
     *  (Factory.Append), the P5 journal (Factory.Journal) and the ONE shared
     *  write executor (Factory.Write) are consumed through it; assigned once in
     *  Function/Apply. */
    Factory: Factory;
}
