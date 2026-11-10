/**
 * @module Normalize
 *
 * The reference adapter for the normalize family (the pattern the five
 * remaining flavors and plugin-dsh-normalize-file copy).
 *
 * @remarks
 *
 * It declares the child slot its manifest registers into (the v4.1 model),
 * the settings namespace its config form reads, its static activation
 * posture, and the D5 trace names it follows. The adapter itself holds no
 * React and no host import: Function/Adapter.ts wires the manifest into the
 * registry and the slot, and Function/Section.ts renders it.
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
