import type Metric from "./Metric.js";
/**
 * One analysis result for one key.
 */
export default interface Reading {
    /**
     * The scope it was computed over (file, project, client, model, or
     * session).
     */
    readonly Scope: string;
    /**
     * The key (a file path, a session id, a project root).
     */
    readonly Key: string;
    /**
     * The metric rows of that key.
     */
    readonly Rows: readonly Metric[];
}
