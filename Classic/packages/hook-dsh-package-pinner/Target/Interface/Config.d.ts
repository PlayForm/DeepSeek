/**
 * @module Config
 *
 * The validated plugin-config shape the loader hands to `apply`.
 *
 * @remarks
 *
 * Cordis validates the exported Schemastery schema while the plugin loads and
 * fills every default (docs/user/develop/basic/config.md:45), so `apply`
 * receives a plain object of this shape (volatile fields arrive as cells and
 * are unwrapped by the factory's State builder). Since the family-form
 * conversion the schema is the STANDALONE `Compose(false, {...})` flat object
 * (Variable/Config): the three base fields (enabled/log/logFile) first, then
 * the fs/observed machinery knobs the shared block used to supply restated
 * with the same defaults (updateCooldownMs, mutationTools, policyFile,
 * exclude) and the pinner's own field `sections`. The pinner never reads
 * `updateCooldownMs` (it has no update stage) - the field is included for
 * family parity.
 *
 * `sections` stays a plain `string[]` (the schema field is
 * Schema.array(Schema.string())): the four documented values are the npm
 * dependency sections, but the schema keeps the open array type so a
 * deployment can pin a custom section name without a code edit.
 */
export default interface Config {
    /**
     * The master switch - a disabled pinner appends `disabled (enabled=false)`
     * to the ledger and registers nothing.
     */
    enabled: boolean;
    /**
     * Ledger enabled - write the durable log file.
     */
    log: boolean;
    /**
     * Ledger file (SEPARATE from the governor's).
     */
    logFile: string;
    /**
     * Cooldown between update-stage dispatches - the pinner never reads it
     * (no update stage); included for family parity.
     */
    updateCooldownMs: number;
    /**
     * Actor tool names whose fs/observed events trigger pinning.
     */
    mutationTools: string[];
    /**
     * Global pin-policy.json; empty means discovery + built-in default.
     */
    policyFile: string;
    /**
     * Excluded path segments (anywhere mode, exclusion-first).
     */
    exclude: string[];
    /**
     * Dependency sections the pinner may rewrite (each must hold an object).
     */
    sections: string[];
}
