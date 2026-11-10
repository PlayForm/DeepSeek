/**
 * @module CargoGovernor
 *
 * The adapter for hook-dsh-cargo-governor, the third of the three governors
 * (order 60), the Rust-side twin of the package governor.
 *
 * @remarks
 *
 * Same reference pattern: the child slot, the settings namespace, the static
 * activation posture, and the D5 trace names. Its schema is the factory's
 * shared block (the volatile log/logFile/updateCooldownMs/mutationTools
 * cells plus the plain policyFile/exclude) followed by its own fields
 * (strict, maxUpdateFailures, cargoBin, keepFile, updateMode).
 */
declare const _default: {
    id: string;
    bundle: string;
    namespace: string;
    title: string;
    order: number;
    slot: "playform.panel.section";
    activation: "enabled";
    traceKinds: readonly ["observe/stamp", "graph/indexed", "graph/invalidated"];
};
export default _default;
