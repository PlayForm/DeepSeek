/**
 * @module NormalizeFile
 *
 * The adapter for plugin-dsh-normalize-file, the file-content normalizer of
 * the normalize family (order 20, between the stream flavors and the tool
 * coach).
 *
 * @remarks
 *
 * Same reference pattern: the child slot, the settings namespace, the static
 * activation posture, and the D5 trace names. Its schema keeps the family's
 * volatile cells (logFile, replacement, the scopes object,
 * toolResultsExempt) and adds no plain semantic gate: every field the form
 * derives is volatile.
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
