/**
 * @module Cost
 *
 * The adapter for `plugin-dsh-cost`, the cost ledger (order 80, right after ccr).
 *
 * @remarks
 *
 * Same reference pattern: the child slot, the settings namespace, the static activation posture,
 * and the D5 trace names. The section's status and the config form come from the plugin's
 * `Variable/Config.ts` schema; the dedicated table lives in the Cost tab.
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
