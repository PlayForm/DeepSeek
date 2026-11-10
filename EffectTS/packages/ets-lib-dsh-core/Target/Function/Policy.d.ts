export default _default;
/**
 * @module Policy
 *
 * The UPDATE-POLICY LOADER mechanics (pure, harness-free).
 *
 * @remarks
 *
 * Read the policy file (a plain fs read - an auxiliary configuration file,
 * part of the registry/policy discovery exemption) when given and readable;
 * any failure falls back to the module's BUILT-IN DEFAULT with the family's
 * byte-identical diagnostic lines (module-prefixed by the module's Append):
 *   `update: unreadable policy at <file> - using built-in default`
 *   `update: no policy at <file> - using built-in default`
 *   `update: using built-in default policy`
 * The module supplies its defaults (the engine input - reject lists, dep
 * groups, targets, verifyCommand - NEVER install implicitly) and the
 * `Quiet` form (used by a module BEFORE its update stage, when it needs a
 * policy field to drive the chain pass - the diagnostics belong to the
 * update job). The file may be read twice per cycle; both reads are
 * best-effort.
 */
declare function _default<T>(Append: (Message: string) => void, File: string, Defaults: T, Quiet?: boolean): T;
