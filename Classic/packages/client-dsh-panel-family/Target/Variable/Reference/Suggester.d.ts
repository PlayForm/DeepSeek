/**
 * @module Suggester
 *
 * The reference adapter for the suggester family, represented by
 * `hook-dsh-convention-suggester` (the pack learner after the completion spec's re-spec).
 *
 * @remarks
 *
 * Its schema is fully volatile, so its form writes ride the revision-fenced settings mutate, and
 * the D5 trace feeds its live tail.
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
