/**
 * @module PackageGovernor
 *
 * The adapter for `hook-dsh-package-governor`, the first of the three governors (order 50).
 *
 * @remarks
 *
 * Same reference pattern: the child slot, the settings namespace, the static activation posture,
 * and the D5 trace names.
 *
 * Its schema is the factory's shared block (the volatile `log`/`logFile`/`updateCooldownMs`/
 * `mutationTools` cells plus the plain `policyFile`/`exclude`) followed by its own fields
 * (`strict`, `maxUpdateFailures`, `updateMode`, `ncuBin`): the volatile cells ride the
 * revision-fenced mutate, the rest ride the plain bridge.
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
