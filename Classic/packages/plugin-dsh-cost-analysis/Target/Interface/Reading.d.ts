import type Metric from "./Metric.js";
/**
 * @module Reading
 *
 * One analysis result: the scope it was computed over (file, project, client,
 * model, or session), the key filter the readings were narrowed to (empty when
 * the whole scope is read), and the metric rows.
 */
export default interface Reading {
    readonly Scope: string;
    readonly Key: string;
    readonly Rows: readonly Metric[];
}
