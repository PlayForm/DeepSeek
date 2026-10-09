import type { State as Shared } from "@playform/plugin-dsh-factory";
import type PluginFactory from "@playform/plugin-dsh-factory";
export default interface State extends Shared {
    /** The injected @playform/plugin-dsh-factory service (the P2 UpdateKey
     *  helper and the ledger/journal delegates; assigned once in
     *  Function/Apply — the governor-family pattern). */
    Factory: PluginFactory;
    /** Cooldown between update-stage dispatches, per directory (epoch ms). */
    Wait: number;
    /** Circuit breaker: consecutive failures per directory before pause. */
    Limit: number;
    /** cargo binary (bare name or absolute path). */
    CargoBin: string;
    /** Global pin-policy.json (the keep-list of the full-version normalization
     *  directive); "" means discovery + built-in empty default. Merged into the
     *  factory-supplied union keep-list by the transform. */
    KeepFile: string;
    /** Strict chain pass: strip unknown deps in a governed workspace. */
    Strict: boolean;
    /** Update stage mode — "cargo" (the only implemented mode). */
    Mode: string;
    /** Directory → epoch ms of the last update-stage dispatch (cooldown). */
    Stamp: Map<string, number>;
    /** Directories with an update run in flight. */
    Set: Set<string>;
    /** Directory → consecutive update-stage failures (circuit breaker). */
    Count: Map<string, number>;
    /** The module's `Section` state field (the factory's Continue hands it to
     *  the transform as the `section` argument). The cargo module maps config
     *  key "sections", which the cargo config does not define — the field is
     *  inert here (the identified dependency tables come from Variable/Section
     *  plus the dynamic target walk, Function/Decode). */
    Section?: string[] | undefined;
    /** The module's `PinStyle` state field (mapped from config key "pinStyle",
     *  which the cargo config does not define — the chain pass's canonical form
     *  is policy-file-driven: `update-policy.json`'s `pinStyle`, "caret"
     *  fallback). Inert here; kept for the State-builder contract. */
    PinStyle?: string | undefined;
}
