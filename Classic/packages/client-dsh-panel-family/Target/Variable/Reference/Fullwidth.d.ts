/**
 * @module Fullwidth
 *
 * The adapter for `hook-dsh-normalize-fullwidth`, the last of the five remaining normalize
 * flavors (order 15).
 *
 * @remarks
 *
 * Same reference pattern: the child slot, the settings namespace, the static activation posture,
 * and the D5 trace names. Like the quotes flavor it is a MAP flavor: no `replacement` field exists
 * (the substitution is the core's Fullwidth table), so the form's tunables are the volatile
 * `log`/`scopes` cells and the two plain semantic gates.
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
