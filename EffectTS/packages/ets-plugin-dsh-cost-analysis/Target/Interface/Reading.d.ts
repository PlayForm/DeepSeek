import type Metric from "./Metric.js";
/**
 * @module Reading
 *
 * One analysis result: the scope it was computed over (file, project,
 * client, model, or session), the key filter the readings were narrowed to
 * (empty when the whole scope is read), and the metric rows.
 */
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
