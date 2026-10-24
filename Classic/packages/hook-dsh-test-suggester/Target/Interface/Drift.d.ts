export default interface Drift {
    /** The repo-relative file the drift names (the README, the suite, the roster entry, the node). */
    file: string;
    /** The one-phrase reason the note carries. */
    reason: string;
    /** The PASS count the README claims (0 when it claims none). */
    expected: number;
    /** The PASS count the aggregate runner would run (0 when it runs nothing). */
    actual: number;
}
export interface Reconciliation {
    /** The package root, repo-relative (the note's `package=` segment). */
    package: string;
    /** The drifted files, sorted by path. */
    drifts: Drift[];
    /** The summed README counts over every counted folder. */
    expected: number;
    /** The summed README counts over the folders the aggregate runner will run. */
    actual: number;
    /** The graph's Test node count for the package (0 when the graph is absent or empty). */
    nodes: number;
}
