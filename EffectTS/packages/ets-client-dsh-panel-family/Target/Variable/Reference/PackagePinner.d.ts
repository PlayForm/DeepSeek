/**
 * @module PackagePinner
 *
 * The adapter for hook-dsh-package-pinner, the second of the three governors
 * (order 55).
 *
 * @remarks
 *
 * Same reference pattern: the child slot, the settings namespace, the static
 * activation posture, and the D5 trace names. Its schema is the factory's
 * shared block (the volatile cells plus the plain policyFile/exclude)
 * followed by its own `sections` field (the dependency sections the pinner
 * may rewrite, a plain array).
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
