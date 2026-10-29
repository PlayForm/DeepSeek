import type Metric from "./Metric.js";
export default interface Reading {
    readonly Scope: string;
    readonly Key: string;
    readonly Rows: readonly Metric[];
}
